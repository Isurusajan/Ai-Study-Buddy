# 🔑 How to Get a Valid Gemini API Key

## The Problem
Your current API key is invalid or expired. All API calls return 404 errors.

## Solution: Get a New API Key

### Step 1: Go to Google AI Studio
1. Open your browser and go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account

### Step 2: Create API Key
1. Click **"Create API Key"** button
2. Select **"Create API key in new project"** or choose an existing project
3. Copy the new API key (it will look like: `AIzaSy...`)

### Step 3: Enable the API
1. Go to: **https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com**
2. Make sure the **Generative Language API** is ENABLED
3. If not enabled, click the "Enable" button

### Step 4: Update Your .env File
1. Open `server/.env`
2. Replace the old key with your new key:
   ```
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
3. Save the file

### Step 5: Restart Your Server
```bash
# Stop the server (Ctrl+C)
# Then start it again
cd server
npm run dev
```

### Step 6: Test It
Run the test script:
```bash
cd server
node test-gemini-rest.js
```

You should see "✅ SUCCESS" if the key works!

## Common Issues

### Issue 1: Still getting 404 errors
- Make sure you enabled the Generative Language API in Google Cloud Console
- Wait 1-2 minutes after creating the API key

### Issue 2: API key restrictions
- Go to https://console.cloud.google.com/apis/credentials
- Find your API key
- Click "Edit"
- Under "API restrictions", select "Don't restrict key" (for testing)
- Save and wait 1-2 minutes

### Issue 3: Billing not enabled
- Some Google Cloud APIs require billing to be enabled
- Go to https://console.cloud.google.com/billing
- Enable billing if prompted

## Need Help?
- Google AI Studio: https://aistudio.google.com/
- API Documentation: https://ai.google.dev/docs
