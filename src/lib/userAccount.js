import { db } from '@/lib/firebase';
import {
  doc, collection, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';

const COLLECTION = 'users';

// Create the website profile doc on first Google sign-in if it doesn't exist.
// Coins and game stats are NOT stored here — they live on the verified game
// player doc and are read live via lib/playerAccount.js. This doc is profile only.
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
