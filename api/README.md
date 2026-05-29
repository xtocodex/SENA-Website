# SENA Game API

Node.js + Express server that serves game data (missions, players, app version) from Firestore to the game app.

## Setup

### 1. Install dependencies

```bash
cd api
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 3000) |
| `API_KEY` | Secret key required for write endpoints — choose any strong random string |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_PRIVATE_KEY_ID` | `private_key_id` from the service account JSON |
| `FIREBASE_PRIVATE_KEY` | `private_key` from the service account JSON (keep the `\n` characters as-is) |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from the service account JSON |
| `FIREBASE_CLIENT_ID` | `client_id` from the service account JSON |

#### Getting the Firebase service account key

1. Go to [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings**
2. Click the **Service accounts** tab
3. Click **Generate new private key** → download the JSON file
4. Copy the individual fields from that JSON into the matching env vars above

### 3. Run the server

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

---

## Docker

```bash
# Build
docker build -t sena-api .

# Run (pass env vars at runtime)
docker run -p 8080:8080 \
  -e API_KEY=your_key \
  -e FIREBASE_PROJECT_ID=your_project \
  -e FIREBASE_PRIVATE_KEY_ID=your_key_id \
  -e FIREBASE_PRIVATE_KEY="your_private_key" \
  -e FIREBASE_CLIENT_EMAIL=your_client_email \
  -e FIREBASE_CLIENT_ID=your_client_id \
  sena-api
```

Exposes port `8080` (matches Cloud Run default).

---

## Endpoints

### Public (no auth required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/missions/daily` | All active daily missions |
| `GET` | `/missions/weekly` | All active weekly missions |
| `GET` | `/app-version` | Current Android and iOS app versions |

### Protected (requires `x-api-key` header)

| Method | Path | Description |
|---|---|---|
| `POST` | `/missions` | Create a new mission |
| `PUT` | `/missions/:docId` | Update a mission by Firestore doc ID |
| `DELETE` | `/missions/:docId` | Delete a mission by Firestore doc ID |
| `GET` | `/players` | List all players |
| `GET` | `/players/:id` | Get a single player by ID |
| `POST` | `/players` | Create a new player |
| `PATCH` | `/players/:id` | Update player fields |
| `DELETE` | `/players/:id` | Delete a player |

---

## Response shapes

### GET /missions/daily and GET /missions/weekly

```json
{
  "missions": [
    {
      "id": "daily_001",
      "description": "Win 3 matches in a row",
      "rewards": [
        { "type": "coins", "amount": 500 }
      ]
    }
  ]
}
```

### GET /app-version

```json
{
  "android_version": "1.2.0",
  "ios_version": "1.1.5"
}
```

### POST /missions — request body

```json
{
  "id": "daily_003",
  "type": "daily",
  "description": "Win 3 matches in a row",
  "rewards": [{ "type": "coins", "amount": 500 }],
  "value": 100,
  "active": true
}
```

Required fields: `id`, `type`, `description`, `rewards`, `value`
- `type` must be `"daily"` or `"weekly"`
- `active` defaults to `true` if omitted

### POST /players — request body

```json
{
  "username": "player_name",
  "email": "player@example.com"
}
```

Any fields passed in the body are stored. `playerId` (UUID) and `createdAt` are auto-generated.

### POST /players — response

```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /players/:id — response

```json
{
  "playerId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T08:00:00.000Z"
}
```

Returns `404` if the player does not exist.

### PATCH /players/:id — request body

```json
{
  "username": "new_name"
}
```

Only the fields provided are updated. `updatedAt` is set automatically.

### DELETE /players/:id — response

```json
{ "deleted": "550e8400-e29b-41d4-a716-446655440000" }
```

---

## Architecture

```
api/
  index.js                  ← Express app, mounts all routes
  firebaseAdmin.js          ← Firebase Admin SDK init (singleton)
  middleware/
    auth.js                 ← API key guard (x-api-key header)
  routes/
    missions.js             ← HTTP handlers for /missions
    players.js              ← HTTP handlers for /players
    versionRoutes.js        ← HTTP handlers for /app-version
  services/
    missionService.js       ← All Firestore logic for missions
    playerService.js        ← All Firestore logic for players
    versionService.js       ← All Firestore logic for app version
```

Routes never query Firestore directly. Only the service files do. To swap the database later, change only those files.

---

## Firestore collections

### `missions`

```json
{
  "id": "daily_001",
  "type": "daily",
  "description": "Win 3 matches in a row",
  "rewards": [{ "type": "coins", "amount": 500 }],
  "value": 100,
  "active": true,
  "createdAt": "<Firestore timestamp>"
}
```

Reward types: `coins`, `voucher`, `merchandise`, `exclusive`

### `players`

```json
{
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "<Firestore timestamp>",
  "updatedAt": "<Firestore timestamp>"
}
```

Document ID is a UUID generated at creation time and returned as `playerId` in all responses.

### `appVersions/config`

Single document at collection `appVersions`, document ID `config`:

```json
{
  "android_version": "1.2.0",
  "ios_version": "1.1.5"
}
```
// Auto deploy test 