# 🎮 Battle Mode - API Testing Guide

## REST API Endpoints

### Authentication Note

All endpoints except `GET /api/battles/:roomCode` require the `Authorization: Bearer {token}` header.

Get your token from login response and store in `localStorage` (already done by AuthContext).

---

## 1. Create a Battle Room

**Endpoint:** `POST /api/battles/create`

**Required Headers:**

```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "deckId": "64f7a3c8d9e2b1a0f5c6d7e8",
  "battleType": "private",
  "maxPlayers": 4,
  "difficulty": "medium"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Battle room created successfully",
  "data": {
    "roomCode": "STUDY123",
    "battleId": "64f7a3c8d9e2b1a0f5c6d7e9",
    "hostId": "user_id_here",
    "hostName": "Your Name",
    "maxPlayers": 4,
    "questionsCount": 10,
    "timePerQuestion": 15
  }
}
```

**Example (cURL):**

```bash
curl -X POST http://localhost:5000/api/battles/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_ID",
    "battleType": "private",
    "maxPlayers": 4,
    "difficulty": "medium"
  }'
```

**Example (JavaScript):**

```javascript
const response = await fetch("http://localhost:5000/api/battles/create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    deckId: "YOUR_DECK_ID",
    battleType: "private",
    maxPlayers: 4,
    difficulty: "medium",
  }),
});

const data = await response.json();
console.log("Room Code:", data.data.roomCode);
```

---

## 2. Get Battle Room Details

**Endpoint:** `GET /api/battles/:roomCode`

**No authentication required!**

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "roomCode": "STUDY123",
    "hostId": "...",
    "status": "waiting",
    "players": [
      {
        "userId": "...",
        "username": "Player1",
        "avatar": "url",
        "score": 0,
        "isActive": true,
        "joinedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "settings": {
      "maxPlayers": 4,
      "questionsCount": 10,
      "timePerQuestion": 15,
      "allowPowerUps": true
    }
  }
}
```

**Example:**

```bash
curl http://localhost:5000/api/battles/STUDY123
```

---

## 3. Get User Battle Statistics

**Endpoint:** `GET /api/battles/stats/user`

**Required:** Authorization header

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalBattles": 25,
    "wins": 18,
    "losses": 7,
    "winRate": 72,
    "eloRating": 1250,
    "rank": "Gold",
    "currentWinStreak": 3,
    "longestWinStreak": 7,
    "accuracyRate": 85.5,
    "averageScore": 850,
    "achievements": [
      {
        "name": "First Victory",
        "earnedAt": "2024-01-01T10:00:00Z",
        "icon": "🏆"
      }
    ]
  }
}
```

**Example:**

```bash
curl http://localhost:5000/api/battles/stats/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Get Leaderboard

**Endpoint:** `GET /api/battles/leaderboard?period=daily&limit=100`

**Query Parameters:**

- `period`: `daily` | `weekly` | `alltime` | `elo` (default: `alltime`)
- `limit`: 1-1000 (default: 100)

**Response (200 OK):**

```json
{
  "success": true,
  "period": "daily",
  "data": [
    {
      "rank": 1,
      "userId": "user_id",
      "username": "TopPlayer",
      "avatar": "url",
      "wins": 5,
      "totalBattles": 6,
      "winRate": "83.33%",
      "eloRating": 1450,
      "rank": "Platinum",
      "currentWinStreak": 5,
      "accuracyRate": "92.5%"
    },
    {
      "rank": 2,
      "userId": "user_id_2",
      "username": "Player2",
      "avatar": "url",
      "wins": 4,
      "totalBattles": 5,
      "winRate": "80%",
      "eloRating": 1350,
      "rank": "Gold",
      "currentWinStreak": 2,
      "accuracyRate": "88%"
    }
  ]
}
```

**Example - Top Daily Winners:**

```bash
curl "http://localhost:5000/api/battles/leaderboard?period=daily&limit=10"
```

**Example - All-time ELO Rankings:**

```bash
curl "http://localhost:5000/api/battles/leaderboard?period=elo&limit=50"
```

---

## 5. Get User Battle History

**Endpoint:** `GET /api/battles/history/user?limit=10`

**Required:** Authorization header

**Query Parameters:**

- `limit`: Number of battles to return (default: 10)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "battleId": "64f7a3c8...",
      "deckName": "Biology 101",
      "opponents": ["Player2", "Player3"],
      "score": 850,
      "accuracy": "92.5",
      "won": true,
      "startedAt": "2024-01-15T14:30:00Z",
      "finishedAt": "2024-01-15T14:45:00Z",
      "duration": 900
    },
    {
      "battleId": "64f7a3c9...",
      "deckName": "Chemistry Basics",
      "opponents": ["Opponent1"],
      "score": 720,
      "accuracy": "80",
      "won": false,
      "startedAt": "2024-01-15T13:00:00Z",
      "finishedAt": "2024-01-15T13:15:00Z",
      "duration": 900
    }
  ]
}
```

**Example:**

```bash
curl "http://localhost:5000/api/battles/history/user?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Get Battle Details

**Endpoint:** `GET /api/battles/:battleId/details`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "roomCode": "STUDY123",
    "hostName": "Host Player",
    "deckName": "Chemistry 101",
    "status": "finished",
    "winner": {
      "userId": "...",
      "name": "Winner",
      "avatar": "url"
    },
    "players": [
      {
        "userId": "...",
        "username": "Player1",
        "avatar": "url",
        "score": 950,
        "accuracy": "95.0",
        "correctAnswers": 9,
        "totalAnswered": 10
      },
      {
        "userId": "...",
        "username": "Player2",
        "avatar": "url",
        "score": 720,
        "accuracy": "80.0",
        "correctAnswers": 8,
        "totalAnswered": 10
      }
    ],
    "totalQuestions": 10,
    "startedAt": "2024-01-15T14:30:00Z",
    "finishedAt": "2024-01-15T14:45:00Z",
    "duration": 900
  }
}
```

---

## Socket.io Events

### Client → Server

**1. Join Room**

```javascript
socket.emit("join-room", {
  roomCode: "STUDY123",
  userId: "user_id",
  username: "Your Name",
  avatar: "https://...",
});
```

**2. Start Battle** (Host only)

```javascript
socket.emit("start-battle", {
  roomCode: "STUDY123",
});
```

**3. Submit Answer**

```javascript
socket.emit("submit-answer", {
  roomCode: "STUDY123",
  userId: "user_id",
  questionId: "q1",
  answer: "Option A",
  timeTaken: 5000, // milliseconds
});
```

**4. Use Power-up**

```javascript
socket.emit("use-powerup", {
  roomCode: "STUDY123",
  userId: "user_id",
  powerUpType: "50-50", // or 'time-freeze', 'steal-points'
});
```

### Server → Client

**1. Player Joined**

```javascript
socket.on("player-joined", (data) => {
  console.log(`${data.player.username} joined!`);
  console.log(`${data.totalPlayers}/${data.maxPlayers} players`);
});
```

**2. Battle Starting**

```javascript
socket.on("battle-starting", (data) => {
  console.log("Countdown:", data.countdown);
});

socket.on("countdown", (data) => {
  console.log("Count:", data.count); // 3, 2, 1...
});
```

**3. New Question**

```javascript
socket.on("new-question", (data) => {
  console.log(`Q${data.questionNumber}/${data.totalQuestions}`);
  console.log("Question:", data.question.question);
  console.log("Options:", data.question.options);
  console.log("Time Limit:", data.question.timeLimit, "seconds");
});
```

**4. Timer Update**

```javascript
socket.on("timer-update", (data) => {
  console.log("Time Left:", data.timeLeft, "seconds");
});
```

**5. Player Answered**

```javascript
socket.on("player-answered", (data) => {
  console.log(`${data.username} answered!`);
  console.log("Correct:", data.correct);
  console.log("Points Earned:", data.pointsEarned);
  console.log("Total Score:", data.totalScore);
});
```

**6. Battle Finished**

```javascript
socket.on("battle-finished", (data) => {
  console.log("Winner:", data.winner.username);
  console.log("Final Results:", data.finalResults);
});
```

---

## Testing Workflow

### 1. Get Your Deck ID

```bash
curl http://localhost:5000/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Copy a deck's `_id` value.

### 2. Create a Battle

```bash
curl -X POST http://localhost:5000/api/battles/create \
  -H "Authorization: Bearer PLAYER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_ID",
    "battleType": "private",
    "maxPlayers": 2
  }'
```

Save the `roomCode` from response.

### 3. Check Room Status

```bash
curl "http://localhost:5000/api/battles/STUDY123"
```

### 4. View Your Stats

```bash
curl http://localhost:5000/api/battles/stats/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Check Leaderboard

```bash
curl "http://localhost:5000/api/battles/leaderboard?period=alltime&limit=10"
```

---

## Error Responses

### Invalid Room Code

```json
{
  "success": false,
  "message": "Room not found or already started"
}
```

### Room Full

```json
{
  "success": false,
  "message": "Room is full"
}
```

### Missing Authentication

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### Failed Question Generation

```json
{
  "success": false,
  "message": "Failed to generate questions for battle",
  "error": "..."
}
```

---

## Tools for Testing

### Postman

1. Import endpoints
2. Set up environment variables
3. Test all endpoints
4. Export collection for team

### VS Code REST Client

Create `.http` file:

```http
@host = http://localhost:5000
@token = YOUR_JWT_TOKEN

### Create Battle
POST {{host}}/api/battles/create
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "deckId": "YOUR_DECK_ID",
  "battleType": "private"
}

### Get Leaderboard
GET {{host}}/api/battles/leaderboard?period=daily&limit=10

### Get User Stats
GET {{host}}/api/battles/stats/user
Authorization: Bearer {{token}}
```

### WebSocket Testing

Use Socket.io test client or write test script:

```javascript
const io = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected");

  socket.emit("join-room", {
    roomCode: "STUDY123",
    userId: "test_user",
    username: "Test Player",
    avatar: "url",
  });
});

socket.on("player-joined", (data) => {
  console.log("Player joined:", data);
});
```

---

## Performance Testing

Generate load with Artillery:

```yaml
# load-test.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 10
      arrivalRate: 5

scenarios:
  - name: "Get Leaderboard"
    flow:
      - get:
          url: "/api/battles/leaderboard"
```

```bash
artillery run load-test.yml
```

Happy Testing! 🎉
