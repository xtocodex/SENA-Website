import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB per sample image
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;  // 25 MB per sample video

export async function getBrandRequest(uid) {
  const snap = await getDoc(doc(db, 'brand_requests', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getApprovedBrand(uid) {
  const snap = await getDoc(doc(db, 'brands', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== 'approved') return null;
  return { id: snap.id, ...data };
}

export function subscribeBrandStatus(uid, cb) {
  const unsubReq = onSnapshot(doc(db, 'brand_requests', uid), (reqSnap) => {
    const unsubBrand = onSnapshot(doc(db, 'brands', uid), (brandSnap) => {
      cb({
        request: reqSnap.exists() ? { id: reqSnap.id, ...reqSnap.data() } : null,
        brand:   brandSnap.exists() ? { id: brandSnap.id, ...brandSnap.data() } : null,
      });
    });
    return unsubBrand;
  });
  return unsubReq;
}

export async function uploadBrandSample(uid, file, kind) {
  const isImage = kind === 'image';
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (file.size > maxSize) {
    throw new Error(`File too large. Max ${isImage ? '5 MB' : '25 MB'}.`);
  }
  const folder = isImage ? 'images' : 'videos';
  const timestamp = Date.now();
  const storagePath = `brandRequests/${uid}/samples/${folder}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, storagePath };
}

export async function submitBrandRequest(uid, payload) {
  await setDoc(doc(db, 'brand_requests', uid), {
    uid,
    ...payload,
    status: 'pending',
    feedback: '',
    reviewedAt: null,
    reviewedBy: null,
    reviewedById: null,
    createdAt: serverTimestamp(),
  });
}

export async function resubmitBrandRequest(uid, payload) {
  await setDoc(doc(db, 'brand_requests', uid), {
    uid,
    ...payload,
    status: 'pending',
    feedback: '',
    reviewedAt: null,
    reviewedBy: null,
    reviewedById: null,
    createdAt: serverTimestamp(),
  });
}
