# Fixing Gemini API Errors

## Current Error
```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

## Possible Causes

### 1. API Key Permissions
Your API key might not have access to Gemini models. 

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Make sure your API key is active
3. Check if Gemini API is enabled for your project

### 2. API Not Enabled
The Gemini API might not be enabled in your Google Cloud project.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Generative Language API"
3. Make sure billing is set up (free tier available)

### 3. Model Name Issue
The model names might have changed or require different format.

**Try these model names:**
- `gemini-1.5-flash`
- `gemini-1.5-pro`  
- `gemini-pro-latest` (gave 503, so exists but overloaded)

### 4. API Version
The error mentions "API version v1beta" - might need different version.

## Quick Fix Steps

1. **Verify API Key:**
   ```bash
   # Test with curl
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
   ```

2. **Enable Gemini API:**
   - Visit: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
   - Click "Enable"

3. **Check API Key Restrictions:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Make sure API key has no restrictions or includes Generative Language API

4. **Try Different Model:**
   - Update model name in code to `gemini-1.5-flash` or `gemini-1.5-pro`

## Alternative: Use OpenAI (Fallback)

If Gemini continues to have issues, the code supports OpenAI as fallback:
- Set `OPENAI_API_KEY` in `.env`
- Code will use OpenAI if Gemini fails

## Test Script

Run this to test:
```bash
node list-gemini-models.js
```

This will test all available model names and show which ones work.

