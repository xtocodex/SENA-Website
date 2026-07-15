import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

// Canonical game-version doc (publicly readable per deployed rules). The
// parent doc `SENA Mini/gameVersion` also carries a copy of these fields, but
// only this nested path is covered by the rules — always read here.
const VERSION_DOC = doc(db, 'SENA Mini', 'gameVersion', 'data', 'versionInfo');

// Live subscription to { latestVersion_Publishing, latestVersion_Testing, patchNotes }.
export function subscribeGameVersion(cb) {
  return onSnapshot(
    VERSION_DOC,
    (snap) => cb(snap.exists() ? snap.data() : null),
    () => cb(null),
  );
}
