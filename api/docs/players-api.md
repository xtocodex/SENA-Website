# Players API

REST endpoints for managing players in the SENA game backend. Data is stored in the Firestore `players` collection. All endpoints return JSON.

> **Base URL:** `https://sena-missions-api-332405485338.us-central1.run.app` — the Cloud Run URL of the `sena-missions-api` service (region `us-central1`).

---

## Authentication

Every players endpoint is **protected**. Send the shared API key on every request:

```
x-api-key: <YOUR_API_KEY>
```

Missing or wrong key → `401 Unauthorized`:

```json
{ "error": "Unauthorized" }
```

---

## Endpoints at a glance

| Method | Path | Description |
|---|---|---|
| `GET` | `/players` | List all players |
| `GET` | `/players/:id` | Get a single player by `playerId` |
| `POST` | `/players` | Create a new player |
| `PATCH` | `/players/:id` | Update fields on a player |
| `DELETE` | `/players/:id` | Delete a player |

`:id` is the `playerId` — the same value you supply when creating the player. The caller owns the id; the server never generates one.

---

## The player object

```json
{
  "playerId": "player_4471",
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T08:00:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `playerId` | string | Caller-supplied unique id. Returned in every response. Used as the Firestore document id. |
| `username` | string | Optional. Any app-defined field. |
| `email` | string | Optional. Any app-defined field. |
| `createdAt` | string (ISO 8601) | Set by the server on create. |
| `updatedAt` | string (ISO 8601) | Set by the server on every update. Absent until the first update. |

Any additional fields you send in the body are stored as-is and returned. Only `playerId`, `createdAt`, and `updatedAt` are special.

---

## `GET /players`

List every player.

**Request**

```bash
curl https://sena-missions-api-332405485338.us-central1.run.app/players \
  -H "x-api-key: YOUR_API_KEY"
```

**Response — `200 OK`**

```json
[
  {
    "playerId": "player_4471",
    "username": "player_name",
    "email": "player@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

Returns `[]` when there are no players.

---

## `GET /players/:id`

Fetch a single player by `playerId`.

**Request**

```bash
curl https://sena-missions-api-332405485338.us-central1.run.app/players/player_4471 \
  -H "x-api-key: YOUR_API_KEY"
```

**Response — `200 OK`**

```json
{
  "playerId": "player_4471",
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T08:00:00.000Z"
}
```

**Errors**

| Status | Body | When |
|---|---|---|
| `404` | `{ "error": "Player not found" }` | No player with that id |

---

## `POST /players`

Create a new player. **You choose the `playerId`** and pass it in the body.

**Request**

```bash
curl -X POST https://sena-missions-api-332405485338.us-central1.run.app/players \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player_4471",
    "username": "player_name",
    "email": "player@example.com"
  }'
```

**Body**

| Field | Required | Rules |
|---|---|---|
| `playerId` | yes | Non-empty string. Must **not** contain `/`, must not be `.` or `..`, and must not match `__*__`. |
| any others | no | Stored as-is. |

**Response — `201 Created`**

```json
{
  "playerId": "player_4471",
  "username": "player_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors**

| Status | Body | When |
|---|---|---|
| `400` | `{ "error": "playerId is required" }` | `playerId` missing/empty/not a string |
| `400` | `{ "error": "playerId contains invalid characters" }` | `playerId` fails the rules above |
| `409` | `{ "error": "A player with this playerId already exists" }` | Id already taken — the existing record is **not** overwritten |

---

## `PATCH /players/:id`

Update one or more fields on an existing player. Only the fields you send change; everything else is left alone. `updatedAt` is refreshed automatically.

**Request**

```bash
curl -X PATCH https://sena-missions-api-332405485338.us-central1.run.app/players/player_4471 \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "username": "new_name" }'
```

**Response — `200 OK`**

```json
{
  "playerId": "player_4471",
  "username": "new_name",
  "email": "player@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T08:00:00.000Z"
}
```

---

## `DELETE /players/:id`

Delete a player.

**Request**

```bash
curl -X DELETE https://sena-missions-api-332405485338.us-central1.run.app/players/player_4471 \
  -H "x-api-key: YOUR_API_KEY"
```

**Response — `200 OK`**

```json
{ "deleted": "player_4471" }
```

---

## Error format

All errors share the same shape:

```json
{ "error": "human-readable message" }
```

| Status | Meaning |
|---|---|
| `400` | Bad request (invalid/missing `playerId`) |
| `401` | Missing or wrong `x-api-key` |
| `404` | Player not found |
| `409` | `playerId` already exists |
| `500` | Unexpected server error |
