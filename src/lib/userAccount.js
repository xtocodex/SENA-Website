import { db } from '@/lib/firebase';
import {
  doc, collection, getDoc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';

const COLLECTION = 'users';

// Default mock stats — placeholders until the real game-player link lands.
export const DEFAULT_STATS = {
  matchesPlayed: 0,
  matchesWon: 0,
  adViews: 0,
  adWatchTime: 0,
};

// Create the user doc on first Google sign-in if it doesn't exist yet.
// Returns the (existing or freshly created) profile.
export async function ensureUserDoc(firebaseUser) {
  const ref = doc(db, COLLECTION, firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  await setDoc(ref, {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email || 'Player',
    photoURL: firebaseUser.photoURL || '',
    role: 'user',
    coins: 0,
    stats: { ...DEFAULT_STATS },
    optionalData: '',
    createdAt: serverTimestamp(),
  });
  const fresh = await getDoc(ref);
  return { id: fresh.id, ...fresh.data() };
}

export function subscribeUser(uid, cb) {
  return onSnapshot(
    doc(db, COLLECTION, uid),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    () => cb(null),
  );
}

export function subscribeUsers(cb) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => cb([]),
  );
}

// Dev-only: manually settle a user's mock coins / stats (v1, until game link exists).
export async function updateUser(uid, patch) {
  await updateDoc(doc(db, COLLECTION, uid), { ...patch, updatedAt: serverTimestamp() });
}
