import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit as fbLimit, onSnapshot } from 'firebase/firestore';

// SENA MINI data layer — game-owned namespace in the shared Firebase project.
// The game writes player docs to `SENA Mini/players/data/{gameAuthUid}`; the
// website only READS here (rules: any signed-in user may read; writes require
// auth.uid == docId, which a website session never matches).
//
// IMPORTANT: every area in the namespace uses a subcollection literally named
// `data` — never use collectionGroup('data') queries, they would span players,
// chats and invites at once. Always address the full path.
const PLAYERS = collection(db, 'SENA Mini', 'players', 'data');

// Timestamps in the game schema are heterogeneous (ISO strings with 7-digit
// fractions, epoch-ms numbers, Firestore Timestamps). Normalize to Date|null.
export function toDate(v) {
  if (v == null) return null;
  if (typeof v?.toDate === 'function') return v.toDate();
  if (typeof v === 'number') return new Date(v);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const withId = (d) => ({ id: d.id, ...d.data() });

// Most-recently-active first; lastLogin is an ISO string, so string compare
// is chronological. Used to break ties when one email has multiple docs.
const byLastLogin = (a, b) => String(b.lastLogin || '').localeCompare(String(a.lastLogin || ''));

// Real-time subscription to the signed-in user's SENA MINI game record,
// joined by Google email. Both the game and the website authenticate the same
// email via Google, so a plain match is a verified link (no OTP needed —
// unlike the MAX `players` collection). Guests with empty emails can't link.
export function subscribeMiniPlayer(email, cb) {
  if (!email) {
    cb(null);
    return () => {};
  }
  const wanted = email.toLowerCase();
  // The game stores the raw Google email (no emailLower yet), so query the
  // exact value and fall back to a client-side case-insensitive check.
  const q = query(PLAYERS, where('email', '==', email));
  return onSnapshot(
    q,
    (snap) => {
      const matches = snap.docs
        .map(withId)
        .filter((p) => (p.email || '').toLowerCase() === wanted)
        .sort(byLastLogin);
      cb(matches[0] || null);
    },
    () => cb(null),
  );
}

// Top players by wins for the MINI leaderboard. Docs without a `stats` map
// (players who never finished a match) are skipped by Firestore's orderBy.
//
// Test docs (`isTestDoc: true`, contract §3.4) are excluded — otherwise our own
// fixture outranks every real player. The filter is CLIENT-SIDE on purpose:
// `where('isTestDoc','!=',true)` would look equivalent but silently drops every
// doc that lacks the field — i.e. all real players — because Firestore's `!=`
// does not match missing fields. We over-fetch a little and trim after.
export function subscribeMiniLeaderboard(cb, { max = 20 } = {}) {
  const q = query(PLAYERS, orderBy('stats.wins', 'desc'), fbLimit(max + 5));
  return onSnapshot(
    q,
    (snap) => cb(
      snap.docs
        .map(withId)
        .filter((p) => p.isTestDoc !== true)
        .slice(0, max),
    ),
    () => cb([]),
  );
}

// Recent matches for one player, newest first. Schema (locked contract v1.0):
// { mode, timestamp (ISO string), kills, placement, totalPlayers, damage,
//   healed, mapName, survivalSeconds }
export function subscribeMatchHistory(playerId, cb, { max = 10 } = {}) {
  if (!playerId) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, 'SENA Mini', 'players', 'data', playerId, 'matchHistory'),
    orderBy('timestamp', 'desc'),
    fbLimit(max),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map(withId)),
    () => cb([]),
  );
}
