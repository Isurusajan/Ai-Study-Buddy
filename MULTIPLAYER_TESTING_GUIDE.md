cdv # 🎮 Multiplayer Battle Mode Testing Guide

## Why Second Player Can't Join

**The Issue:** You were trying to join your own battle with the same account!

When testing multiplayer features, you MUST use **2 different user accounts**:

- **Account 1 (Host):** Creates the battle
- **Account 2 (Player):** Joins the battle

If the same user tries to join their own battle room, they'll get:

```
❌ Player already in room: [userId]
```

This causes the WebSocket connection to fail.

---

## ✅ Correct Testing Steps

### Option 1: Use Existing Accounts

If you already have multiple user accounts created:

1. **In Browser 1 (Tab 1):**

   - Open `http://localhost:3000`
   - Login as **"isuru"** (Account 1)
   - Go to Dashboard
   - Click deck's ⚔️ **Battle** button
   - Wait in lobby, note the **Room Code**

2. **In Browser 2 (Different Browser/Incognito Tab 2):**

   - Open `http://localhost:3000`
   - Login as **"isuru2"** or any other account (Account 2)
   - Go to Dashboard
   - Click 🎮 **Join Battle** button
   - Enter the room code from Browser 1
   - Click **Join**
   - ✅ You should now be in the lobby!

3. **Back in Browser 1:**
   - See Account 2's player card appear in lobby
   - Host can now edit ⚙️ **Settings**
   - Click 🚀 **Start Battle**
   - Battle begins!

---

### Option 2: Create a New Test Account

If you only have one account, create a second one:

1. Click **Sign Up** on homepage
2. Register new account (e.g., `testplayer@email.com` / username: `testplayer`)
3. Complete registration
4. Now you have 2 accounts to test with!

---

## 🧪 What to Test

### ✅ Settings Update Feature (NEW)

1. Host clicks ✏️ **Edit Settings** in lobby
2. Change **Difficulty** (Easy/Medium/Hard)
3. Change **Questions** (5-20)
4. Change **Time/Question** (5-60 seconds)
5. Click ✅ **Save**
6. Both players should see updated settings in real-time

### ✅ Question Shuffling (NEW)

1. After battle starts, both players see **same question content**
2. But **different option order** for the answers
3. Both players can answer correctly despite different positions
4. Scores calculated correctly

### ✅ Player Joining

1. Second player joins with room code ✅
2. Player appears in lobby ✅
3. Host count updates ✅
4. Settings visible to all ✅

---

## ⚠️ Common Mistakes

❌ **Don't do:**

- Same account creating and joining battle → "Player already in room"
- Using same browser/tab for both players → Session conflicts
- Different room codes → "Room not found"

✅ **Do:**

- Use 2 separate browser windows/tabs (or 2 browsers)
- Use 2 different user accounts
- Both players in same room code
- Keep Server and Client both running

---

## 🔧 Troubleshooting

### "Room not found" Error

- Check the room code is typed correctly
- Make sure it matches exactly (case-insensitive)
- Room must be in "waiting" status (not started)

### "Player already in room" Error

- You're trying to join with the same account that created it
- Use a different account

### WebSocket Connection Failed

- Check server is running: `npm run dev` in `/server`
- Check client is running: `npm start` in `/client`
- Check ports: Server (5000), Client (3000)
- Try refreshing browser

### Settings Don't Update

- Make sure you're the host (edit button only shows for host)
- Battle must not have started yet (status = "waiting")
- Click ✅ **Save** after changing values

---

## 📊 Current Features Working ✅

| Feature              | Status | Notes                                   |
| -------------------- | ------ | --------------------------------------- |
| Battle Creation      | ✅     | Any user can create                     |
| Player Joining       | ✅     | Different account required              |
| Settings Edit (Host) | ✅     | 3 settings: difficulty, questions, time |
| Settings Broadcast   | ✅     | All players get real-time update        |
| Question Shuffling   | ✅     | Each player sees different option order |
| Battle Start         | ✅     | Host only, needs 2+ players             |
| Answer Submission    | ✅     | Works despite shuffled options          |
| Leaderboard          | ✅     | Correct scores calculated               |

---

## 🎯 Next Steps

1. ✅ Create a second test account
2. ✅ Test joining with room code
3. ✅ Test host settings update
4. ✅ Verify question shuffling
5. ✅ Complete full battle cycle
6. ✅ Celebrate! 🎉
