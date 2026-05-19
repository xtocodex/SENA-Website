const { db } = require('../firebaseAdmin');
const { FieldValue } = require('firebase-admin/firestore');

const COLLECTION = 'missions';

function formatDoc(doc) {
  const data = doc.data();
  return {
    id:          data.id,
    description: data.description,
    rewards:     data.rewards,
  };
}

async function generateMissionId(type) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('type', '==', type)
    .get();
  return `${type}_${String(snapshot.size + 1).padStart(3, '0')}`;
}

async function getDailyMissions() {
  const snapshot = await db
    .collection(COLLECTION)
    .where('type', '==', 'daily')
    .where('active', '==', true)
    .get();
  return { missions: snapshot.docs.map(formatDoc) };
}

async function getWeeklyMissions() {
  const snapshot = await db
    .collection(COLLECTION)
    .where('type', '==', 'weekly')
    .where('active', '==', true)
    .get();
  return { missions: snapshot.docs.map(formatDoc) };
}

async function createMission(data) {
  const id = await generateMissionId(data.type);
  const docRef = await db.collection(COLLECTION).add({
    ...data,
    id,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { docId: docRef.id, id };
}

async function updateMission(docId, data) {
  await db.collection(COLLECTION).doc(docId).update(data);
}

async function deleteMission(docId) {
  await db.collection(COLLECTION).doc(docId).delete();
}

module.exports = {
  getDailyMissions,
  getWeeklyMissions,
  createMission,
  updateMission,
  deleteMission,
};
