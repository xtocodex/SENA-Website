const { db } = require('../firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'players';

function formatTimestamps(data) {
  if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
  if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
  return data;
}

async function createPlayer(data) {
  const { playerId, ...rest } = data;
  const docRef = db.collection(COLLECTION).doc(playerId);
  // create() refuses to overwrite an existing document — a duplicate
  // playerId throws ALREADY_EXISTS (code 6) instead of clobbering data.
  await docRef.create({
    ...rest,
    createdAt: FieldValue.serverTimestamp(),
  });
  const snap = await docRef.get();
  return { playerId, ...formatTimestamps(snap.data()) };
}

async function getPlayer(playerId) {
  const snap = await db.collection(COLLECTION).doc(playerId).get();
  if (!snap.exists) throw new Error('Player not found');
  return { playerId, ...formatTimestamps(snap.data()) };
}

async function updatePlayer(playerId, data) {
  const docRef = db.collection(COLLECTION).doc(playerId);
  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await docRef.get();
  return { playerId, ...formatTimestamps(snap.data()) };
}

async function deletePlayer(playerId) {
  await db.collection(COLLECTION).doc(playerId).delete();
  return { deleted: playerId };
}

async function listPlayers() {
  const snapshot = await db.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({ playerId: doc.id, ...formatTimestamps(doc.data()) }));
}

module.exports = {
  createPlayer,
  getPlayer,
  updatePlayer,
  deletePlayer,
  listPlayers,
};
