console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  🔧 ENABLE GEMINI API                          ║
╔════════════════════════════════════════════════════════════════╗

Your API key format is correct (starts with AIzaSy...) ✅
But you're getting 404 errors - this means the API is NOT ENABLED ❌

📋 FOLLOW THESE STEPS:

Step 1: Enable the Generative Language API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Open this link in your browser:
👉 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

You should see:
- A page titled "Generative Language API"
- A blue "ENABLE" button (if not already enabled)

Click "ENABLE" and wait for it to activate (1-2 minutes)


Step 2: Check Your API Key Project
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The API must be enabled in the SAME project as your API key!

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key in the list (starts with AIzaSy...)
3. Look at which PROJECT it belongs to
4. Make sure the Generative Language API is enabled in THAT project


Step 3: Alternative - Create Fresh API Key
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sometimes it's easier to start fresh:

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select "Create API key in NEW project" (important!)
4. Copy the new key
5. The new project will have the API auto-enabled


Step 4: Update .env and Restart
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After enabling the API:

1. Make sure your .env has the key:
   GEMINI_API_KEY=AIzaSy...your_key...

2. Restart your server:
   Ctrl+C (stop)
   npm run dev (start)

3. Wait 1-2 minutes for the API to activate

4. Test again:
   node test-gemini-rest.js


🔍 VERIFICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After enabling, you should see "✅ SUCCESS" when running the test.

If you still see 404 errors:
- Wait 2-3 minutes (API takes time to activate)
- Make sure you're using the same browser/Google account
- Try creating a new API key in a NEW project

╚════════════════════════════════════════════════════════════════╝
`);
