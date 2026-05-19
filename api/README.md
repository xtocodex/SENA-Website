# SENA Game API

Node.js + Express server that serves game data (missions, app version) from Firestore to the game app.

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
  "type": "daily",
  "description": "Win 3 matches in a row",
  "rewards": [{ "type": "coins", "amount": 500 }],
  "active": true
}
```

- `id` is auto-generated based on type and existing count (e.g. `daily_003`)
- `active` defaults to `true` if omitted

---

## Architecture

```
api/
  index.js                ← Express app, mounts all routes
  firebaseAdmin.js        ← Firebase Admin SDK init (singleton)
  routes/
    missions.js           ← HTTP handlers for /missions
    versionRoutes.js      ← HTTP handlers for /app-version
  services/
    missionService.js     ← All Firestore logic for missions
    versionService.js     ← All Firestore logic for app version
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
  "active": true,
  "createdAt": "<Firestore timestamp>"
}
```

Reward types: `coins`, `voucher`, `merchandise`, `exclusive`

### `appVersions/config`

Single document at collection `appVersions`, document ID `config`:

```json
{
  "android_version": "1.2.0",
  "ios_version": "1.1.5"
}
```
