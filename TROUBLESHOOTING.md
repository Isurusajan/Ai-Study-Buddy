# 🔧 Troubleshooting Guide - AI Study Buddy

## Common Issues and Solutions

### ❌ 500 Error: "Failed to generate quiz" or "Failed to answer question"

**Symptoms:**
- Works for some questions/documents but not others
- Browser console shows: `AxiosError: Request failed with status code 500`

**Possible Causes & Solutions:**

#### 1. **PDF Content Too Large**
- **Problem**: The extracted text from the PDF is too long for Gemini to process
- **Solution**:
  - Try uploading smaller PDFs (under 50 pages)
  - Split large PDFs into chapters
  - Use the "brief" summary level instead of "detailed"

#### 2. **Content Filtering / Safety Blocks**
- **Problem**: Gemini's safety filters block certain content
- **Solution**:
  - Try rephrasing your question
  - Avoid sensitive topics (politics, religion, etc.)
  - Upload academic/educational content only

#### 3. **Invalid Gemini API Key**
- **Problem**: API key expired or invalid
- **Check**: Server console for messages like:
  ```
  ❌ Gemini API Error: API key not valid
  ```
- **Solution**:
  1. Go to https://makersuite.google.com/app/apikey
  2. Generate a new API key
  3. Update `GEMINI_API_KEY` in [server/.env](server/.env)
  4. Restart server

#### 4. **Rate Limiting**
- **Problem**: Too many requests to Gemini API
- **Symptoms**: Works initially, then stops
- **Solution**:
  - Wait 1-2 minutes between requests
  - Use Gemini 1.5 Flash (free tier: 15 requests/minute)
  - Consider upgrading API quota

#### 5. **Model Not Available**
- **Problem**: `gemini-2.5-flash` model doesn't exist yet
- **Fix**: Update [server/services/geminiService.js:13](server/services/geminiService.js#L13)
  ```javascript
  function getModel() {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use 1.5 instead
  }
  ```

#### 6. **JSON Parsing Errors**
- **Problem**: Gemini returns malformed JSON
- **Symptoms**: Server logs show `JSON.parse` errors
- **Solution**: The code already handles this, but if it persists:
  - Try reducing question count
  - Use simpler PDFs
  - Check server logs for the actual response

---

## 🔍 How to Debug 500 Errors

### Step 1: Check Server Console

Look for detailed error messages:
```bash
# Server console will show:
❌ Gemini MCQ generation error: [error details]
❌ Gemini Q&A error: [error details]
```

### Step 2: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Find the failed request (red status 500)
4. Click on it → Response tab
5. Read the error message

### Step 3: Test with Simple Content

1. Upload a simple 1-2 page PDF
2. Ask basic questions: "What is this document about?"
3. If it works → problem is content-related
4. If it fails → problem is API/configuration

### Step 4: Verify Gemini API

Test your API key manually:
```bash
cd server
node list-models.js
```

Should show available models. If it fails, API key is invalid.

---

## ✅ Working Configurations

### Recommended Gemini Model

**Best**: `gemini-1.5-flash`
- Free tier: 15 requests/min
- Fast response
- Good quality

**Alternative**: `gemini-1.5-pro`
- Free tier: 2 requests/min
- Higher quality
- Slower

Update in [server/services/geminiService.js](server/services/geminiService.js):
```javascript
function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}
```

### Safe Request Limits

- **Quiz Generation**: Max 10 questions at a time
- **Questions**: Keep under 200 words
- **PDF Size**: Under 50 pages recommended
- **Text Length**: Under 20,000 characters

---

## 🚨 Error Messages Explained

### "Failed to generate quiz. The document content might be too complex..."

**Meaning**: Gemini couldn't process the document
**Try**:
1. Use a smaller PDF
2. Reduce question count (try 5 instead of 10)
3. Choose "easy" difficulty instead of "hard"

### "Failed to answer question. This could be due to content filtering..."

**Meaning**: Your question or document triggered safety filters
**Try**:
1. Rephrase the question more neutrally
2. Ask simpler, factual questions
3. Avoid controversial topics

### "Request failed with status code 500"

**Meaning**: Server error (multiple possible causes)
**Check**:
1. Server console logs
2. Network response in browser
3. Gemini API status: https://status.openai.com/

---

## 🔄 Quick Fixes

### Fix 1: Restart Server
```bash
# Stop server (Ctrl+C)
cd server
npm start
```

### Fix 2: Clear Cache
- Browser: Ctrl+Shift+Delete
- Or use Incognito mode

### Fix 3: Update Gemini Package
```bash
cd server
npm update @google/generative-ai
```

### Fix 4: Check Environment Variables
```bash
cd server
# View .env file
cat .env

# Should have:
GEMINI_API_KEY=AIza...your_key
```

---

## 📊 Performance Tips

1. **Use appropriate detail levels**:
   - Brief summaries for quick review
   - Detailed for comprehensive study

2. **Batch your requests**:
   - Don't click "Generate" rapidly
   - Wait for responses to complete

3. **Optimal PDF format**:
   - Text-based PDFs (not scanned images)
   - Clean formatting
   - English language works best

4. **Question best practices**:
   - Be specific and clear
   - Avoid very long questions
   - Ask one thing at a time

---

## 🆘 Still Having Issues?

### Check These:

- [ ] Server is running (`npm start` in server folder)
- [ ] Client is running (`npm start` in client folder)
- [ ] Valid Gemini API key in `.env`
- [ ] Internet connection working
- [ ] No firewall blocking API calls
- [ ] Using supported browser (Chrome, Firefox, Edge)

### Server Console Should Show:

```
✅ Server running on port 5000
✅ MongoDB Connected
✅ GEMINI_API_KEY loaded
```

If you see ❌ or errors, fix those first!

---

## 📝 Common Questions

**Q: Why does it work sometimes but not others?**
A: Gemini has content filters. Some documents/questions trigger them.

**Q: Can I use this offline?**
A: No, it requires internet to connect to Gemini API.

**Q: Is there a request limit?**
A: Yes, Gemini free tier has rate limits:
- Flash: 15 requests/minute
- Pro: 2 requests/minute

**Q: What file types are supported?**
A: PDF and DOCX files. PDFs work best when they're text-based (not scanned).

**Q: Can I change the AI model?**
A: Yes! Edit [server/services/geminiService.js](server/services/geminiService.js) line 13.

---

## 🎯 Best Practices

1. **Upload quality PDFs** - Text-based, clear formatting
2. **Start small** - Test with 5 questions before trying 20
3. **Use simple language** - Clear, direct questions work best
4. **Be patient** - AI generation takes 5-15 seconds
5. **Check logs** - Server console shows helpful error messages

---

## 📞 Need More Help?

1. Check server console for detailed errors
2. Check browser console (F12) for client errors
3. Review this troubleshooting guide
4. Check Gemini API documentation: https://ai.google.dev/docs

**Remember**: Most 500 errors are due to:
- Content too long/complex
- Safety filters
- Rate limiting
- Invalid API key

Fix these first before diving deeper!
