# API Issues & Refinement Backlog

Issues identified in the **`sena-missions-api`** Express server (now a separate repo:
[`xtocodex/sena-missions-api`](https://github.com/xtocodex/sena-missions-api)) for future fixes.

> Paths below are relative to the `sena-missions-api` repo root. This backlog lives here
> for historical reasons; consider moving it into that repo alongside the code it describes.

All issues below were re-verified against the current code.

---

## Bugs

### 1. Mission ID race condition
**File:** `sena-missions-api/services/missionService.js:15-21`

`generateMissionId` counts existing documents of a given type and uses `size + 1` to form the ID. Concurrent `POST /missions` requests will read the same count and produce duplicate IDs.

**Fix:** Use a Firestore transaction or switch to UUID-based IDs (same pattern as players).

---

### 2. Caller-supplied `id` silently ignored on POST /missions
**File:** `sena-missions-api/routes/missions.js:29-46` + `sena-missions-api/services/missionService.js:41-49`

The route validates and accepts `id` from the request body, but `createMission` internally calls `generateMissionId` and overwrites it. The client gets back a different `id` than what it sent, with no indication.

**Fix:** Either remove `id` from the required body fields and document that it's auto-generated, or honor the caller-supplied `id` and skip generation.

---

### 3. No pagination on `GET /players`
**File:** `sena-missions-api/services/playerService.js:46-49`

`listPlayers` calls `db.collection('players').get()` which loads every document in one shot. Will degrade in latency and memory usage as the player collection grows.

**Fix:** Add cursor-based pagination using Firestore `startAfter` + a `limit` query param.

---

### 4. No input validation on `PUT /missions/:docId` and `PATCH /players/:id`
**Files:** `sena-missions-api/routes/missions.js:49-57`, `sena-missions-api/routes/players.js:53-61`

Both routes pass `req.body` directly to Firestore `update()` with no schema check. A caller can overwrite arbitrary fields, accidentally null out required ones, or inject unexpected keys.

**Fix:** Validate/whitelist fields before calling the service layer.

---

### 5. Crash on missing `FIREBASE_PRIVATE_KEY` env var
**File:** `sena-missions-api/firebaseAdmin.js:10`

`process.env.FIREBASE_PRIVATE_KEY.replace(...)` throws `TypeError: Cannot read properties of undefined` if the env var is absent, crashing the process at startup with no descriptive message.

**Fix:** Add a startup env-var check that fails fast with a clear error listing missing variables.

---

## Security / Reliability

### 6. CORS is fully open
**File:** `sena-missions-api/index.js:11`

`app.use(cors())` allows requests from any origin. Acceptable for a game client API but should be locked to known origins if any browser-facing endpoints are added.

**Fix:** Pass an `origin` allowlist to the `cors()` config.

---

### 7. No rate limiting on public endpoints
**Files:** `sena-missions-api/routes/missions.js:7-26`, `sena-missions-api/routes/versionRoutes.js:6-14`

`GET /missions/daily`, `GET /missions/weekly`, and `GET /app-version` require no authentication and have no rate limiting, making them trivially abusable.

**Fix:** Add `express-rate-limit` middleware on public routes.

---

## Missing Functionality

### 8. No write endpoint for app version
**File:** `sena-missions-api/routes/versionRoutes.js`

App version (`android_version`, `ios_version`) can only be updated by writing directly to Firestore. There is no `PUT /app-version` endpoint, forcing manual DB edits for every release.

**Fix:** Add an authenticated `PUT /app-version` route backed by a `setAppVersion` service method.

---

### 9. No 404 handling for missing missions
**File:** `sena-missions-api/routes/missions.js`

`GET /missions/daily` and `GET /missions/weekly` return an empty `{ missions: [] }` which is valid, but there is no `GET /missions/:docId` endpoint at all. The players router handles 404 correctly; missions does not follow the same pattern.

**Fix:** Add a `GET /missions/:docId` route with explicit 404 handling (consistent with players).

---

### 10. No `updatedAt` timestamp on mission updates
**File:** `sena-missions-api/services/missionService.js:51-53`

`updateMission` calls `doc.update(data)` without injecting a server timestamp. Players correctly set `updatedAt` on every patch, but missions have no audit trail for writes.

**Fix:** Spread `FieldValue.serverTimestamp()` into `updatedAt` inside `updateMission`.
