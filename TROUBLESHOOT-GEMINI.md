# Troubleshooting Gemini API 404 Errors

## Current Issue
All Gemini models are returning **404 Not Found** errors, which means:
- The Generative Language API is **NOT enabled** for this API key, OR
- The API key is from a **different Google Cloud project**, OR
- There are **API key restrictions** blocking access

## ✅ Step-by-Step Fix

### Step 1: Verify API Key Project

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Check which **Google Cloud Project** your API key belongs to
3. Note the project name/ID

### Step 2: Enable API in the CORRECT Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **IMPORTANT**: Make sure you're in the **SAME project** as your API key
3. Go to: **APIs & Services** → **Library**
4. Search for: **"Generative Language API"**
5. Click **"Enable"**

**Direct Link:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

### Step 3: Check API Key Restrictions

1. Go to: **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyDhjUNzQ0F-EMEBcQ5I56R8JrpnQaF8MCk`
3. Click to edit
4. Under **"API restrictions"**:
   - Select **"Don't restrict key"** (easiest), OR
   - Select **"Restrict key"** and add **"Generative Language API"**

### Step 4: Verify Billing

1. Go to: **Billing** in Google Cloud Console
2. Make sure a billing account is linked (free tier is available)
3. Gemini API has generous free tier

### Step 5: Wait and Test

1. Wait **2-3 minutes** after enabling
2. Test again:
   ```bash
   npm run test:gemini
   ```

## 🔍 Common Issues

### Issue 1: API Enabled in Wrong Project
**Solution**: Make sure you enable the API in the **same project** where you created the API key.

### Issue 2: API Key Restrictions
**Solution**: Remove restrictions or add "Generative Language API" to allowed APIs.

### Issue 3: Billing Not Set Up
**Solution**: Link a billing account (free tier works fine).

### Issue 4: API Not Fully Enabled
**Solution**: Wait 2-3 minutes after enabling, then test again.

## 🔄 Alternative: Use OpenAI (Temporary)

If Gemini continues to have issues, you can use OpenAI as a fallback:

1. Your `.env` already has `OPENAI_API_KEY`
2. The code automatically falls back to OpenAI if Gemini fails
3. Just make sure `OPENAI_API_KEY` is set

## ✅ Verification Checklist

- [ ] API key is from Google AI Studio
- [ ] Generative Language API is **enabled** in the **correct project**
- [ ] API key has **no restrictions** OR includes Generative Language API
- [ ] Billing account is **linked** (free tier works)
- [ ] Waited **2-3 minutes** after enabling
- [ ] Tested with `npm run test:gemini`

## 📞 Still Not Working?

1. **Create a NEW API key** in Google AI Studio
2. **Enable the API FIRST**, then create the key
3. **Don't set any restrictions** initially
4. Test the new key

## 🎯 Quick Test

After fixing, you should see:
```
✅ API Key found: AIzaSyDhjUNzQ0F-EMEB...
🔄 Testing API connection...
✅ API Response: test
🎉 SUCCESS! Gemini API is integrated and working!
```

