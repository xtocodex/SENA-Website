import { db } from '@/lib/firebase';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';

const REWARD_BRANDS = 'reward_brands';
const COUPON_REQUESTS = 'coupon_requests';

// =============================================================================
// Reward brands (Dev-curated coupon catalog)
// =============================================================================

export function subscribeRewardBrands(cb) {
  const q = query(collection(db, REWARD_BRANDS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([]),
  );
}

// Active-only view for the user-facing Rewards grid. Filtered client-side so no
// composite index is required.
export function subscribeActiveRewardBrands(cb) {
  const q = query(collection(db, REWARD_BRANDS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((b) => b.active !== false),
    ),
    () => cb([]),
  );
}

export async function createRewardBrand(data) {
  await addDoc(collection(db, REWARD_BRANDS), {
    ...data,
    active: data.active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRewardBrand(id, data) {
  await updateDoc(doc(db, REWARD_BRANDS, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRewardBrand(id) {
  await deleteDoc(doc(db, REWARD_BRANDS, id));
}

// =============================================================================
// Coupon requests (user redemptions handled by Dev)
// =============================================================================

// User's own request history. Filtered by userId only (no composite index),
// sorted client-side by createdAt desc.
export function subscribeUserRequests(uid, cb) {
  const q = query(collection(db, COUPON_REQUESTS), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      cb(rows);
    },
    () => cb([]),
  );
}

export function subscribeAllCouponRequests(cb) {
  const q = query(collection(db, COUPON_REQUESTS), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([]),
  );
}

// v1: track-only — no coin debit happens here. The UI guards coins >= cost and
// Dev settles coins manually via the Players panel.
export async function createCouponRequest(user, brand, denomination, quantity) {
  const coinCost = (denomination.coinCost || 0) * quantity;
  await addDoc(collection(db, COUPON_REQUESTS), {
    userId: user.id || user.uid,
    userName: user.name || '',
    userEmail: user.email || '',
    brandId: brand.id,
    brandName: brand.name,
    denomination: denomination.value,
    coinCost,
    quantity,
    status: 'pending',
    message: '',
    createdAt: serverTimestamp(),
    processedBy: null,
    processedById: null,
    processedAt: null,
  });
}

export async function approveCouponRequest(req, message, reviewer) {
  await updateDoc(doc(db, COUPON_REQUESTS, req.id), {
    status: 'approved',
    message: message || '',
    processedBy: reviewer?.name || reviewer?.email || 'Dev',
    processedById: reviewer?.id || null,
    processedAt: serverTimestamp(),
  });
  // Keep the brand's available counter believable. Coin settlement is manual (v1).
  if (req.brandId) {
    await updateDoc(doc(db, REWARD_BRANDS, req.brandId), {
      availableCoupons: increment(-(req.quantity || 1)),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }
}

export async function rejectCouponRequest(req, message, reviewer) {
  await updateDoc(doc(db, COUPON_REQUESTS, req.id), {
    status: 'rejected',
    message: message || '',
    processedBy: reviewer?.name || reviewer?.email || 'Dev',
    processedById: reviewer?.id || null,
    processedAt: serverTimestamp(),
  });
}
