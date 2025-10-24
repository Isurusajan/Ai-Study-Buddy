# 🎮 Battle Mode - Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### 2. Start Services

```bash
# Terminal 1 - Backend (in server folder)
npm run dev

# Terminal 2 - Frontend (in client folder)
npm start
```

### 3. Test It Out

- Open http://localhost:3000
- Login with two accounts (use incognito for second)
- Create a battle on one account
- Join with second account
- Watch the magic happen! ✨

## File Locations Reference

### Backend Files Added/Modified

```
server/models/BattleRoom.js           ← Battle room data
server/models/UserStats.js            ← Player stats & ELO
server/controllers/battleController.js ← API endpoints
server/routes/battles.js              ← Battle routes
server/services/eloService.js         ← ELO calculations
server/services/battleService.js      ← Battle utilities
server/websockets/battleSocket.js     ← Real-time events
server/server.js                      ← Updated with Socket.io
server/package.json                   ← Added socket.io
```

### Frontend Files Added/Modified

```
client/pages/BattleArena.js           ← Main battle page
client/components/Battle/
  ├── LobbyScreen.js                  ← Pre-battle lobby
  ├── QuestionScreen.js               ← Live questions
  ├── ResultsScreen.js                ← Results view
  └── CountdownAnimation.js           ← 3-2-1-GO animation
client/styles/
  ├── battleArena.css                 ← Main styles
  └── battleComponents.css            ← Component styles
client/package.json                   ← Added socket.io-client
```

## What Each Feature Does

### 🎯 Core Battle System

- Create private rooms with unique codes
- Join battles via room code
- Real-time player sync
- Automatic question generation (using Gemini AI)
- Timed questions with live timer

### 🏆 ELO Rating System

- Chess-style rating calculations
- 6 rank tiers: Bronze → Master
- Win/loss streaks tracked
- Individual accuracy tracking

### ⚡ Power-ups

- **50-50**: Remove 2 wrong answers
- **Time Freeze**: Pause timer for 5 seconds
- **Steal Points**: Take 100 points from leader
- **Double Points**: Next correct answer = 2x points
- **Shield**: Wrong answer doesn't lose points

### 📊 Statistics Tracking

- Total battles played
- Win rate percentage
- Current & longest win streaks
- Accuracy rate
- Average response time
- ELO rating changes

### 🎊 Achievements

- First Victory
- Speed Demon
- Perfectionist (100% accuracy)
- Comeback King
- Study Warrior (10 win streak)
- Boss Slayer

## Environment Setup

Create/update `.env` files:

**server/.env**

```env
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**client/.env.local**

```env
REACT_APP_API_URL=http://localhost:5000
```

## Next Steps

1. **Integrate Dashboard Button**

   - Add "Battle Mode" button to Dashboard component
   - Link to `/battle-arena?deck={deckId}`

2. **Add More Features**

   - Tournament mode (brackets)
   - Friend challenges
   - Custom game settings
   - Spectator mode

3. **Deploy to Production**
   - Push to GitHub
   - Deploy backend to Render
   - Deploy frontend to Vercel
   - Update `CLIENT_URL` and `REACT_APP_API_URL`

## Troubleshooting

**Q: WebSocket connection fails**

- A: Make sure server is running on port 5000

**Q: "Questions failed to generate"**

- A: Check GEMINI_API_KEY is valid and deck has content

**Q: Players can't see each other's answers**

- A: Check Socket.io connections in browser DevTools

**Q: Battle freezes after starting**

- A: Check browser console for JS errors

## Detailed Setup Guide

For complete setup instructions with examples, see:
👉 **BATTLE_MODE_SETUP.md**

## Architecture Overview

```
Browser ←→ Socket.io ←→ Server
         Real-time         ↓
         Events       MongoDB
                       Gemini AI
```

**Battle Flow:**

1. Create Room → Generate Questions → Wait for Players
2. Players Join → Ready
3. Host Clicks Start → Countdown
4. Show Question → Timer Runs
5. Players Answer → Update Scores
6. Next Question or Finish
7. Show Results → Update ELO → Done

## Current Status

✅ Backend: 100% Complete

- Models, Controllers, Routes, WebSocket, Services

✅ Frontend: 100% Complete

- Components, Styling, Socket.io Client

⏳ Next: Dashboard Integration & Testing

## Quick Commands

```bash
# Start backend dev server
cd server && npm run dev

# Start frontend dev server
cd client && npm start

# Build for production
npm run build

# Test endpoints (after starting server)
curl http://localhost:5000/api/battles/leaderboard
```

## Need Help?

1. Check the server console for errors
2. Open browser DevTools Network tab
3. Look for Socket.io in DevTools
4. Read detailed guide: BATTLE_MODE_SETUP.md

Enjoy building! 🚀
