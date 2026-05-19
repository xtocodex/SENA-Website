const { db } = require('../firebaseAdmin');

const COLLECTION = 'appVersions';
const DOC_ID     = 'config';

async function getAppVersion() {
  const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
  if (!snap.exists) {
    return { android_version: null, ios_version: null };
  }
  const data = snap.data();
  return {
    android_version: data.android_version ?? null,
    ios_version:     data.ios_version     ?? null,
  };
}

module.exports = { getAppVersion };
