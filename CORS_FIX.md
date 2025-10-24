# CORS Fix for Socket.io

## Problem

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:5000/socket.io/?EIO=4&transport=polling...
(Reason: CORS header 'Access-Control-Allow-Origin' does not match 'http://localhost:3000').
```

## Solution Applied ✅

Updated `server/server.js` with proper CORS configuration:

1. **Socket.io CORS** - Now accepts multiple origins including localhost:3000 and localhost:5000
2. **Express CORS Middleware** - Configured with explicit origins, methods, and headers
3. **Methods Allowed** - GET, POST, PUT, DELETE, OPTIONS for all requests
4. **Credentials** - Enabled for authenticated connections

## How to Fix

### Step 1: Stop All Servers

```bash
# If servers are running, press Ctrl+C in both terminals
```

### Step 2: Clear Browser Cache & Restart

```bash
# Clear your browser cache (Ctrl+Shift+Delete in Chrome)
```

### Step 3: Restart Servers

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm start
```

### Step 4: Test Connection

You should see in browser console:

```
✅ Connected to server
```

And in server console:

```
🔌 WebSocket: ws://localhost:5000
✅ Client connected
```

## Environment Variables

Make sure your `.env` file has (or leave it unset for localhost):

```env
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## If Still Not Working

1. **Check server is running on port 5000**

   ```bash
   netstat -ano | findstr :5000
   ```

2. **Check frontend proxy is set in client/package.json**

   ```json
   "proxy": "http://localhost:5000"
   ```

3. **Clear node_modules and reinstall**

   ```bash
   cd server && rm -r node_modules && npm install
   cd ../client && rm -r node_modules && npm install
   ```

4. **Check for firewall blocking localhost connections**

## What Changed in server.js

### Before:

```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

app.use(cors());
```

### After:

```javascript
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

## Key Improvements

✅ Multiple origin support
✅ Explicit method list
✅ Proper header configuration
✅ EIO3 compatibility
✅ Better ping settings
✅ Filter out undefined values

---

**Status:** ✅ Fixed
**Last Updated:** October 23, 2025
