# How to Restart Servers - CORS Fix Applied

## ⚠️ IMPORTANT: You MUST restart both servers for the CORS fix to take effect

## Step 1: Stop All Running Servers

**In Terminal 1 (Server):**

```
Press: Ctrl + C
```

**In Terminal 2 (Client):**

```
Press: Ctrl + C
```

**In VS Code:**

- Close any existing terminals
- Close your browser tab with the app

## Step 2: Clear Browser Cache

Press: `Ctrl + Shift + Delete`

- Check "Cookies and other site data"
- Check "Cached images and files"
- Click "Clear data"

## Step 3: Restart Backend Server

```bash
cd "C:\Users\ACER\Documents\GitHub\Ai Study Buddy\server"
npm run dev
```

**Wait until you see:**

```
=================================
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000
🔌 WebSocket: ws://localhost:5000
=================================
```

## Step 4: Restart Frontend Server

**Open a NEW terminal:**

```bash
cd "C:\Users\ACER\Documents\GitHub\Ai Study Buddy\client"
npm start
```

**Wait until you see:**

```
Compiled successfully!
Local: http://localhost:3000
On Your Network: http://192.168.x.x:3000
```

## Step 5: Test Connection

1. Open browser to `http://localhost:3000`
2. Login to your account
3. Go to Dashboard
4. Click "🎮 Battle" on any deck
5. Open browser DevTools (F12)
6. Go to Console tab
7. You should see:
   ```
   ✅ Connected to server
   ```

## If You Still See CORS Error

Try these steps:

### A. Force Hard Refresh

```
Ctrl + Shift + R  (or Cmd + Shift + R on Mac)
```

### B. Check Server is Actually Running

Look for this in server terminal:

```
✅ Connected to MongoDB
🔌 WebSocket: ws://localhost:5000
```

### C. Kill Any Process on Port 5000

**PowerShell:**

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

Then restart:

```bash
npm run dev
```

### D. Check Socket Connection in DevTools

In browser Console:

```javascript
// Type this to check socket connection
console.log(socket);
```

Should show a connected Socket instance

## Quick Checklist ✅

- [ ] Both servers stopped (Ctrl+C)
- [ ] Browser cache cleared
- [ ] Backend started with `npm run dev`
- [ ] Frontend started with `npm start`
- [ ] Both show ready/compiled messages
- [ ] Browser shows no CORS errors in console
- [ ] Console shows "✅ Connected to server"

## What Changed

**server/server.js:**

- Socket.io CORS: `origin: true` (accept all in development)
- Express CORS: `origin: true` (accept all in development)
- Added OPTIONS preflight handler
- Added `perMessageDeflate: false` for better performance
- Added `transports: ['websocket', 'polling']` to client config

**client/src/pages/BattleArena.js:**

- Added `transports` option to Socket.io client
- Added `rejectUnauthorized: false` for localhost

---

**If it still doesn't work after all this, let me know what error you see!** 🎮

Date: October 24, 2025
Status: Ready to test
