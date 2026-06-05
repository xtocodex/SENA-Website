# Players API — Code Reference

A walkthrough of the **server-side implementation** of the Players API, for anyone integrating against it or maintaining it. The runtime behaviour is documented separately in [players-api.md](players-api.md).

The players feature is split into two layers:

| Layer | File | Responsibility |
|---|---|---|
| HTTP routes | `api/routes/players.js` | Request parsing, validation, status codes |
| Data service | `api/services/playerService.js` | All Firestore reads/writes |

Routes never touch Firestore directly — they only call the service. To swap the database later, only `playerService.js` changes.

The router is mounted at `/players` in `api/index.js`:

```js
const playersRouter = require('./routes/players');
app.use('/players', playersRouter);
```

Every route is guarded by the `requireApiKey` middleware (`api/middleware/auth.js`), which checks the `x-api-key` header against `process.env.API_KEY` and returns `401` on mismatch.

---

## Routes — `api/routes/players.js`

### `GET /players`

```js
router.get('/', requireApiKey, async (req, res) => {
  try {
    const players = await playerService.listPlayers();
    res.json(players);
  } catch (err) {
    console.error('GET /players error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});
```

Returns the full list from `listPlayers()`. Any failure → `500`.

### `GET /players/:id`

```js
router.get('/:id', requireApiKey, async (req, res) => {
  try {
    const player = await playerService.getPlayer(req.params.id);
    res.json(player);
  } catch (err) {
    if (err.message === 'Player not found') {
      return res.status(404).json({ error: 'Player not found' });
    }
    console.error('GET /players/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});
```

The service throws `Error('Player not found')` when the document doesn't exist; the route maps that to `404`. Everything else → `500`.

### `POST /players`

```js
router.post('/', requireApiKey, async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId || typeof playerId !== 'string' || !playerId.trim()) {
      return res.status(400).json({ error: 'playerId is required' });
    }
    if (playerId.includes('/') || playerId === '.' || playerId === '..' || /^__.*__$/.test(playerId)) {
      return res.status(400).json({ error: 'playerId contains invalid characters' });
    }
    const player = await playerService.createPlayer(req.body);
    res.status(201).json(player);
  } catch (err) {
    if (err.code === 6 /* ALREADY_EXISTS */) {
      return res.status(409).json({ error: 'A player with this playerId already exists' });
    }
    console.error('POST /players error:', err);
    res.status(500).json({ error: 'Failed to create player' });
  }
});
```

Validation, in order:

1. `playerId` must be a non-empty string → else `400 "playerId is required"`.
2. `playerId` must be a safe Firestore document id — no `/`, not `.`/`..`, not `__*__` → else `400 "playerId contains invalid characters"`.

On success → `201` with the created player. Firestore's `ALREADY_EXISTS` (gRPC code `6`) is mapped to `409` so a duplicate id never clobbers an existing record.

### `PATCH /players/:id`

```js
router.patch('/:id', requireApiKey, async (req, res) => {
  try {
    const player = await playerService.updatePlayer(req.params.id, req.body);
    res.json(player);
  } catch (err) {
    console.error('PATCH /players/:id error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});
```

Passes the whole body through to `updatePlayer`. The merge semantics (only provided fields change) come from Firestore's `update()`.

### `DELETE /players/:id`

```js
router.delete('/:id', requireApiKey, async (req, res) => {
  try {
    const result = await playerService.deletePlayer(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('DELETE /players/:id error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});
```

Returns `{ deleted: <id> }` from the service.

---

## Service — `api/services/playerService.js`

Backed by the Firestore `players` collection. The document id **is** the `playerId`.

```js
const COLLECTION = 'players';
```

### Timestamp formatting

```js
function formatTimestamps(data) {
  if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
  if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
  return data;
}
```

Converts Firestore `Timestamp` objects into ISO 8601 strings so the API always returns plain strings, not Firestore internals.

### `createPlayer(data)`

```js
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
```

- Strips `playerId` from the stored body (it's the doc id, not a field).
- Uses `.create()` (not `.set()`) so a duplicate id throws `ALREADY_EXISTS` instead of overwriting → the route turns that into `409`.
- `createdAt` is a server timestamp.

### `getPlayer(playerId)`

```js
async function getPlayer(playerId) {
  const snap = await db.collection(COLLECTION).doc(playerId).get();
  if (!snap.exists) throw new Error('Player not found');
  return { playerId, ...formatTimestamps(snap.data()) };
}
```

Throws `Error('Player not found')` when missing → route maps to `404`.

### `updatePlayer(playerId, data)`

```js
async function updatePlayer(playerId, data) {
  const docRef = db.collection(COLLECTION).doc(playerId);
  await docRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const snap = await docRef.get();
  return { playerId, ...formatTimestamps(snap.data()) };
}
```

`update()` merges — only supplied fields change. `updatedAt` is refreshed on every call.

### `deletePlayer(playerId)`

```js
async function deletePlayer(playerId) {
  await db.collection(COLLECTION).doc(playerId).delete();
  return { deleted: playerId };
}
```

### `listPlayers()`

```js
async function listPlayers() {
  const snapshot = await db.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => ({ playerId: doc.id, ...formatTimestamps(doc.data()) }));
}
```

Maps each document, injecting the doc id back as `playerId`.

---

## Firestore document shape

Collection `players`, document id = `playerId`:

```json
{
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "<Firestore timestamp>",
  "updatedAt": "<Firestore timestamp>"
}
```

`playerId` is **not** stored as a field — it's the document id, re-attached to every API response.
