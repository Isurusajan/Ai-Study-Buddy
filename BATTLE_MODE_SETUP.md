# 🎮 Battle Mode Implementation Guide

This guide walks you through setting up and testing the Battle Mode feature for AI Study Buddy.

## 📋 What's Been Implemented

### Backend Components (✅ Complete)

- **Database Models**

  - `BattleRoom.js` - Stores active and completed battles
  - `UserStats.js` - Tracks player statistics, ELO ratings, and achievements

- **WebSocket Server**

  - `websockets/battleSocket.js` - Real-time battle logic via Socket.io

- **Services**

  - `services/eloService.js` - ELO rating calculations (chess-style)
  - `services/battleService.js` - Battle utilities (room codes, question generation, achievements)

- **API Endpoints** (REST)
  - `POST /api/battles/create` - Create a battle room
  - `GET /api/battles/:roomCode` - Get battle room details
  - `GET /api/battles/stats/user` - Get user battle statistics
  - `GET /api/battles/leaderboard` - Get leaderboard
  - `GET /api/battles/history/user` - Get battle history
  - `GET /api/battles/:battleId/details` - Get battle details

### Frontend Components (✅ Complete)

- **Pages**

  - `BattleArena.js` - Main battle page with Socket.io connection

- **Components**

  - `LobbyScreen.js` - Pre-battle lobby with player list
  - `QuestionScreen.js` - Live question display with timer and leaderboard
  - `ResultsScreen.js` - Battle results and rankings
  - `CountdownAnimation.js` - 3-2-1-GO animation

- **Styling**
  - `battleComponents.css` - Comprehensive UI styling with animations
  - `battleArena.css` - Main page styles

## 🚀 Installation & Setup

### 1. Install Dependencies

**Backend:**

```bash
cd server
npm install socket.io
```

**Frontend:**

```bash
cd client
npm install socket.io-client react-toastify
```

### 2. Environment Variables

**Server (.env):**

```env
# Existing variables
MONGODB_URI=your_mongodb_connection
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

# New for Battle Mode
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client (.env or .env.local):**

```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Database Setup

No migrations needed! The models will be created automatically when first used.

## 🎮 How It Works

### Battle Flow

1. **Create Room** (Host)

   - User clicks "Start Battle" on dashboard
   - Server generates unique room code (e.g., STUDY123)
   - Gemini AI generates 10 questions from selected deck
   - Room created in database with `status: 'waiting'`

2. **Join Room** (Guests)

   - Players receive room code
   - Connect via Socket.io
   - Emit `join-room` event with userId, username, avatar
   - Server adds player to room
   - All players notified of join

3. **Start Battle** (Host)

   - Host clicks "Start Battle"
   - Room status changes to `active`
   - 3-2-1-GO countdown animation
   - First question sent to all players
   - Timer starts (15 seconds default)

4. **Answer Question**

   - Players select answer
   - Emit `submit-answer` with question id, answer, time taken
   - Server checks correctness
   - Points calculated: base points + speed bonus
   - Player score updated
   - All players notified "Player X answered"
   - When all answer or time runs out → next question

5. **Battle Ends**

   - After all questions answered
   - Determine winner (highest score)
   - Calculate ELO ratings
   - Check achievements
   - Update user statistics
   - Emit `battle-finished` with results

6. **View Results**
   - Final rankings displayed
   - Win/loss recorded
   - ELO changes shown
   - Option to play again or return to dashboard

### Socket Events

**Client → Server:**

- `join-room` - Join a waiting room
- `start-battle` - Start the battle (host only)
- `submit-answer` - Submit answer to question
- `use-powerup` - Activate a power-up
- `disconnect` - Player left

**Server → Client:**

- `player-joined` - New player joined
- `battle-starting` - Battle is starting
- `countdown` - Countdown tick
- `new-question` - New question data
- `timer-update` - Timer tick
- `time-warning` - 5 seconds left
- `time-up` - Time's up for this question
- `player-answered` - Another player answered
- `question-results` - Show answer and leaderboard
- `powerup-activated` - Power-up was used
- `player-left` - Player disconnected
- `battle-finished` - Battle ended, show results
- `error` - Error occurred

## 📊 ELO Rating System

The system uses chess-style ELO calculation:

```
Expected Score = 1 / (1 + 10^((opponent_elo - your_elo) / 400))
New Rating = Old Rating + K * (Actual - Expected)
```

**K-factor = 32** (standard value)

**Ranks:**

- Bronze: < 1000
- Silver: 1000-1199
- Gold: 1200-1399
- Platinum: 1400-1599
- Diamond: 1600-1799
- Master: 1800+

## 🎯 Testing Locally

### Start Backend Server

```bash
cd server
npm run dev
```

You should see:

```
=================================
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
🔌 WebSocket: ws://localhost:5000
=================================
```

### Start Frontend

```bash
cd client
npm start
```

### Test Battle Mode

1. **Open 2 Browser Windows**

   - Window 1: http://localhost:3000 (login as User A)
   - Window 2: http://localhost:3000 (login as User B in incognito)

2. **User A Creates Battle**

   - Dashboard → Select a deck → Click "Start Battle" (after integration)
   - Copy room code

3. **User B Joins**

   - Enter room code
   - Wait in lobby

4. **User A Starts Battle**

   - Click "Start Battle" button
   - Both see countdown

5. **Answer Questions**

   - Both select answers
   - Watch leaderboard update in real-time
   - When both answered or timer runs out → next question

6. **See Results**
   - Final rankings
   - ELO changes
   - Can play again

## 🐛 Troubleshooting

### Socket Connection Issues

**Problem:** "WebSocket is closed before the connection is established"

**Solution:** Make sure server is running and `CLIENT_URL` matches your frontend URL.

**Problem:** CORS errors in console

**Solution:** Check server `.env` has correct `CLIENT_URL`:

```env
CLIENT_URL=http://localhost:3000
```

### Questions Not Generating

**Problem:** "Failed to generate questions for battle"

**Solution:**

1. Verify `GEMINI_API_KEY` in `.env`
2. Make sure deck has extracted text (upload a PDF)
3. Check server logs for API errors

### Player Not Receiving Events

**Problem:** Player sees frozen screen after joining

**Solution:**

1. Check Socket.io connections in browser DevTools
2. Verify firewall isn't blocking WebSocket
3. Try `npm start` with `REACT_APP_API_URL=ws://localhost:5000`

## 📈 Performance Optimization

### Current Setup

- Questions generated in-memory and stored in database
- Active rooms stored in Map for fast access
- Timer updates sent every second
- Leaderboard pushed to all players

### For Production

1. **Add Redis** for caching leaderboards
2. **Implement message queuing** for high player count
3. **Use CDN** for assets
4. **Load test** with Artillery or K6
5. **Monitor** with Sentry or similar

## 🔐 Security Considerations

### Current Protections

- JWT authentication for creating rooms
- Socket.io socket stored per connection
- Room codes are unique and hard to guess

### For Production

1. Add **rate limiting** on room creation
2. Implement **fraud detection** (suspicious win patterns)
3. Add **anti-cheat** measures (time validation)
4. **Sanitize** all user input
5. Use **HTTPS + WSS** (WebSocket Secure)

## 🎯 Next Steps

### Phase 1 (Now) ✅

- [x] Core battle system
- [x] Real-time communication
- [x] ELO rating system
- [x] Basic UI

### Phase 2 (Soon)

- [ ] Integrate Dashboard "Start Battle" button
- [ ] Add more power-ups
- [ ] Tournament mode
- [ ] Friend challenges
- [ ] Chat during battles

### Phase 3 (Later)

- [ ] Mobile app
- [ ] Spectator mode
- [ ] Replay system
- [ ] Custom game modes
- [ ] Battle pass system
- [ ] Cosmetics/skins

## 📚 File Structure

```
server/
├── models/
│   ├── BattleRoom.js        (Battle data model)
│   ├── UserStats.js         (Player statistics)
│   └── ...existing
├── controllers/
│   ├── battleController.js  (REST API)
│   └── ...existing
├── services/
│   ├── eloService.js        (ELO calculations)
│   ├── battleService.js     (Battle utilities)
│   └── ...existing
├── routes/
│   ├── battles.js           (Battle routes)
│   └── ...existing
├── websockets/
│   └── battleSocket.js      (Socket.io events)
└── server.js                (Updated with Socket.io)

client/
├── pages/
│   ├── BattleArena.js       (Main battle page)
│   └── ...existing
├── components/
│   ├── Battle/
│   │   ├── LobbyScreen.js
│   │   ├── QuestionScreen.js
│   │   ├── ResultsScreen.js
│   │   └── CountdownAnimation.js
│   └── ...existing
└── styles/
    ├── battleArena.css
    └── battleComponents.css
```

## 🤝 Contributing

When adding features:

1. **Backend features** → Add to battleSocket.js, use existing models
2. **Frontend components** → Keep in Battle folder, import styles
3. **New models** → Follow UserStats pattern
4. **New endpoints** → Add to routes/battles.js
5. **Styling** → Use CSS classes from battleComponents.css

## 📞 Support

For issues:

1. Check server logs: `npm run dev`
2. Check browser console for errors
3. Verify all `npm install` packages installed
4. Check environment variables set correctly
5. Make sure MongoDB is running

## ✨ Feature Highlights

- ⚡ Real-time multiplayer battles
- 🏆 ELO rating system
- 💪 Power-ups during battles
- 📊 Leaderboards
- 🎯 Achievement system
- 🎨 Smooth animations
- 📱 Responsive design
- 🔊 Sound effects ready

Enjoy your competitive study battles! 🎮🚀
