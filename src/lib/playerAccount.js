import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const COLLECTION = 'players';

// Real-time subscription to the signed-in player's VERIFIED game record.
// This is the website↔game join: the game API stamps an OTP-verified `email`
// onto players/{playerId}; here we look that record up by the logged-in email.
//
// `email` is lowercased to match the API-normalized stored value (and the
// security rule). Returns the most-recently-updated verified doc, or null when
// the player hasn't linked/verified a game account yet.
export function subscribeVerifiedPlayer(email, cb) {
  if (!email) {
    cb(null);
    return () => {};
  }
  const q = query(collection(db, COLLECTION), where('email', '==', email.toLowerCase()));
  return onSnapshot(
    q,
    (snap) => {
      const verified = snap.docs
        .map((d) => ({ playerId: d.id, ...d.data() }))
        .filter((p) => p.emailVerified === true) // exclude legacy email-but-unverified docs
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      cb(verified[0] || null);
    },
    () => cb(null),
  );
}
