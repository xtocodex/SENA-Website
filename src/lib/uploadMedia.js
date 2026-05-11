import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ACCEPTED_RATIOS = {
  '1:1':  { ratio: 1.0    },
  '9:16': { ratio: 0.5625 },
  '16:9': { ratio: 1.7778 },
};

const TOLERANCE = 0.02;
const THUMB_MAX_DIM = 400;
const THUMB_QUALITY = 0.7;

function isWithinTolerance(value, target) {
  return Math.abs(value - target) / target <= TOLERANCE;
}

export async function validateAspectRatio(file) {
  return new Promise((resolve) => {
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const ratio = img.naturalWidth / img.naturalHeight;
        for (const [label, config] of Object.entries(ACCEPTED_RATIOS)) {
          if (isWithinTolerance(ratio, config.ratio)) {
            resolve({ valid: true, ratio, ratioLabel: label });
            return;
          }
        }
        resolve({ valid: false, error: 'Invalid aspect ratio. Only 1:1, 9:16, and 16:9 are accepted.' });
      };
      img.onerror = () => { URL.revokeObjectURL(img.src); resolve({ valid: false, error: 'Failed to load image' }); };
      img.src = URL.createObjectURL(file);
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const ratio = video.videoWidth / video.videoHeight;
        for (const [label, config] of Object.entries(ACCEPTED_RATIOS)) {
          if (isWithinTolerance(ratio, config.ratio)) {
            resolve({ valid: true, ratio, ratioLabel: label });
            return;
          }
        }
        resolve({ valid: false, error: 'Invalid aspect ratio. Only 1:1, 9:16, and 16:9 are accepted.' });
      };
      video.onerror = () => { URL.revokeObjectURL(video.src); resolve({ valid: false, error: 'Failed to load video' }); };
      video.src = URL.createObjectURL(file);
    }
  });
}

async function generateThumbnail(file, mediaType) {
  return new Promise((resolve) => {
    const canvas  = document.createElement('canvas');
    const ctx     = canvas.getContext('2d');

    const drawAndExport = (source, w, h) => {
      const scale    = Math.min(THUMB_MAX_DIM / w, THUMB_MAX_DIM / h, 1);
      canvas.width   = Math.round(w * scale);
      canvas.height  = Math.round(h * scale);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', THUMB_QUALITY);
    };

    if (mediaType === 'image') {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        drawAndExport(img, img.naturalWidth, img.naturalHeight);
      };
      img.onerror = () => { URL.revokeObjectURL(img.src); resolve(null); };
      img.src = URL.createObjectURL(file);
    } else {
      const video = document.createElement('video');
      video.onloadeddata = () => { video.currentTime = 0.5; };
      video.onseeked = () => {
        URL.revokeObjectURL(video.src);
        drawAndExport(video, video.videoWidth, video.videoHeight);
      };
      video.onerror = () => { URL.revokeObjectURL(video.src); resolve(null); };
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.load();
    }
  });
}

export async function uploadMedia(file, brandId, mediaType) {
  try {
    const validation = await validateAspectRatio(file);
    if (!validation.valid) return { success: false, error: validation.error };

    const isImage = mediaType === 'image';
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File too large. Max size is 10MB for images / 50MB for videos.' };
    }

    const timestamp   = Date.now();
    const storagePath = `brandMedia/${brandId}/${mediaType}s/${timestamp}_${file.name}`;
    const storageRef  = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    let thumbnailUrl = null;
    try {
      const thumbBlob = await generateThumbnail(file, mediaType);
      if (thumbBlob) {
        const thumbPath = `brandMedia/${brandId}/thumbnails/${timestamp}_${file.name}.jpg`;
        const thumbRef  = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumbBlob);
        thumbnailUrl = await getDownloadURL(thumbRef);
      }
    } catch {
      // thumbnail is best-effort — gallery falls back to full url
    }

    await addDoc(collection(db, 'brandMedia', brandId, `${mediaType}s`), {
      fileName:     file.name,
      url:          downloadURL,
      thumbnailUrl,
      ratio:        validation.ratio,
      ratioLabel:   validation.ratioLabel,
      type:         mediaType,
      size:         file.size,
      storagePath,
      uploadedAt:   serverTimestamp(),
    });

    return { success: true, url: downloadURL };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
