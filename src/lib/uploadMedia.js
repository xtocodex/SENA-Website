import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ACCEPTED_RATIOS = {
  '1:1': { ratio: 1.0, label: { image: 'Banner AD', video: 'Banner AD Video' } },
  '9:16': { ratio: 0.5625, label: { image: 'Interstitial AD', video: 'Interstitial AD Video' } },
  '16:9': { ratio: 1.7778, label: { image: 'Rewards AD', video: 'Rewards AD Video' } },
};

const TOLERANCE = 0.02;

function isWithinTolerance(value, target) {
  return Math.abs(value - target) / target <= TOLERANCE;
}

export async function validateAspectRatio(file) {
  return new Promise((resolve) => {
    const isImage = file.type.startsWith('image/');
    const labelKey = isImage ? 'image' : 'video';

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const ratio = img.naturalWidth / img.naturalHeight;

        for (const [ratioKey, config] of Object.entries(ACCEPTED_RATIOS)) {
          if (isWithinTolerance(ratio, config.ratio)) {
            resolve({
              valid: true,
              ratio,
              ratioLabel: config.label[labelKey],
            });
            return;
          }
        }

        resolve({
          valid: false,
          error: 'Invalid aspect ratio. Only 1:1, 9:16, and 16:9 are accepted.',
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({ valid: false, error: 'Failed to load image' });
      };
      img.src = URL.createObjectURL(file);
    } else {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const ratio = video.videoWidth / video.videoHeight;

        for (const [ratioKey, config] of Object.entries(ACCEPTED_RATIOS)) {
          if (isWithinTolerance(ratio, config.ratio)) {
            resolve({
              valid: true,
              ratio,
              ratioLabel: config.label[labelKey],
            });
            return;
          }
        }

        resolve({
          valid: false,
          error: 'Invalid aspect ratio. Only 1:1, 9:16, and 16:9 are accepted.',
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve({ valid: false, error: 'Failed to load video' });
      };
      video.src = URL.createObjectURL(file);
    }
  });
}

export async function uploadMedia(file, brandId, mediaType) {
  try {
    const validation = await validateAspectRatio(file);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const isImage = mediaType === 'image';
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File too large. Max size is 10MB for images / 50MB for videos.',
      };
    }

    const timestamp = Date.now();
    const storagePath = `brandMedia/${brandId}/${mediaType}s/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, 'brandMedia', brandId, `${mediaType}s`), {
      fileName: file.name,
      url: downloadURL,
      ratio: validation.ratio,
      ratioLabel: validation.ratioLabel,
      type: mediaType,
      size: file.size,
      storagePath,
      uploadedAt: serverTimestamp(),
    });

    return {
      success: true,
      url: downloadURL,
      ratio: validation.ratio,
      ratioLabel: validation.ratioLabel,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}