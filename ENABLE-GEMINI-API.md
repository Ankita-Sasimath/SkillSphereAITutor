# How to Enable Gemini API for Your API Key

## ✅ API Key Updated
Your new API key has been set: `AIzaSyC8uexz6enT7uHqHHK-wUqVRVxoUU9EIfY`

## ⚠️ Current Issue
The API is returning 404 errors, which usually means:
1. **Gemini API is not enabled** in Google Cloud Console
2. **API key doesn't have permissions** for Generative Language API

## 🔧 Step-by-Step Fix

### Step 1: Enable Generative Language API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the Google account that created the API key
3. Navigate to: **APIs & Services** → **Library**
4. Search for: **"Generative Language API"**
5. Click on it and press **"Enable"**

**Direct Link:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

### Step 2: Verify API Key Permissions

1. Go to: **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyC8uexz6enT7uHqHHK-wUqVRVxoUU9EIfY`
3. Click on it to edit
4. Under **API restrictions**, make sure:
   - Either **"Don't restrict key"** is selected, OR
   - **"Restrict key"** includes **"Generative Language API"**

**Direct Link:** https://console.cloud.google.com/apis/credentials

### Step 3: Check Billing (Free Tier Available)

1. Go to: **Billing** in Google Cloud Console
2. Make sure billing account is linked (free tier available)
3. Gemini API has generous free tier limits

### Step 4: Test Again

After enabling the API, wait 1-2 minutes, then test:

```bash
npm run test:gemini
```

## 🎯 Quick Checklist

- [ ] Generative Language API is **Enabled**
- [ ] API key has **no restrictions** OR includes Generative Language API
- [ ] Billing account is **linked** (free tier works)
- [ ] Waited **1-2 minutes** after enabling
- [ ] Tested with `npm run test:gemini`

## 🔍 Alternative: Use OpenAI (Temporary)

If Gemini continues to have issues, you can temporarily use OpenAI:

1. Your `.env` already has `OPENAI_API_KEY`
2. The code will automatically fallback to OpenAI if Gemini fails
3. Just comment out or remove `GEMINI_API_KEY` temporarily

## 📞 Still Having Issues?

1. **Check API Status:** https://status.cloud.google.com/
2. **Google AI Studio:** https://aistudio.google.com/app/apikey
3. **API Documentation:** https://ai.google.dev/docs

## ✅ Expected Result After Fix

When working correctly, you should see:
```
✅ API Key found: AIzaSyC8uexz6enT7uHq...
🔄 Testing API connection...
✅ API Response: Hello! Gemini API is working!
🎉 SUCCESS! Gemini API is integrated and working!
```

