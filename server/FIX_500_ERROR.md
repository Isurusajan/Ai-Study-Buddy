# 🔧 Fix for 500 Internal Server Error on Flashcard Generation

## ❌ THE PROBLEM

When clicking "Generate Flashcards", you get:
```
POST http://localhost:3000/api/flashcards/decks/{deckId}/generate 500 (Internal Server Error)
```

**Root Cause:** Your Gemini API key is **INVALID or EXPIRED**. The API returns 404 errors for all models.

## ✅ THE SOLUTION

### Step 1: Get a Valid API Key (REQUIRED)

1. **Go to Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** (or use existing project)
5. **COPY** the new API key (starts with `AIzaSy...`)

### Step 2: Enable the Generative Language API

1. **Go to**: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Make sure **"Generative Language API"** is **ENABLED**
3. If disabled, click **"Enable"** button
4. **Wait 1-2 minutes** for it to activate

### Step 3: Update Your .env File

1. Open `server/.env` in your editor
2. Replace the old API key with your NEW key:

```env
# Google Gemini API
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

3. **Save the file**

### Step 4: Restart Your Server

**IMPORTANT:** You MUST restart the server for the new key to load!

```bash
# In your terminal:
# 1. Stop the server (press Ctrl+C)
# 2. Start it again:
cd server
npm run dev
```

### Step 5: Test It

Try generating flashcards again in your app. It should work now!

## 🧪 Optional: Test the API Key

Before trying in the app, you can test if your API key works:

```bash
cd server
node test-gemini-rest.js
```

You should see: `✅ SUCCESS with [model-name]!`

If you still see errors, your API key is not working.

## 🚨 Common Issues

### Issue 1: Still getting 404 errors after updating key
- Make sure you **ENABLED** the Generative Language API (Step 2)
- **Wait 1-2 minutes** after creating the API key
- Try creating a **new API key** from scratch

### Issue 2: "API key not valid"
- The API key might have restrictions
- Go to: https://console.cloud.google.com/apis/credentials
- Click on your API key
- Under **"API restrictions"**, select **"Don't restrict key"** (for testing)
- Click **"Save"**
- **Wait 1-2 minutes**

### Issue 3: "Billing not enabled"
Some APIs require billing (but Gemini has a free tier):
- Go to: https://console.cloud.google.com/billing
- Enable billing if prompted
- Add a payment method (you won't be charged unless you exceed free limits)

### Issue 4: Server didn't restart
- Make sure you **stopped** the old server (Ctrl+C)
- Run `npm run dev` again
- Check the terminal - it should show the server starting

## 📝 What I Fixed in the Code

1. **Updated [geminiService.js](server/services/geminiService.js)**:
   - Now tries multiple API versions (v1 and v1beta)
   - Tries multiple models (gemini-1.5-flash, gemini-1.5-pro, gemini-pro)
   - Better error handling with helpful messages
   - Shows which model is being tried in the console

2. **Updated [flashcardController.js](server/controllers/flashcardController.js)**:
   - Returns clear error messages to the frontend
   - Provides helpful instructions when API key is invalid

3. **Created test scripts**:
   - `test-gemini-rest.js` - Test your API key
   - This helps debug issues before using the app

## 🎯 Next Steps

1. **Get new API key** from https://aistudio.google.com/app/apikey
2. **Update server/.env** with the new key
3. **Restart the server** (Ctrl+C, then `npm run dev`)
4. **Try generating flashcards** in your app

The error message in the browser will now show you exactly what's wrong if there are still issues.

## 📚 Resources

- Google AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/docs
- API Key Management: https://console.cloud.google.com/apis/credentials

---

**Need more help?** Check the server console output - it will show which models it's trying and why they're failing.
