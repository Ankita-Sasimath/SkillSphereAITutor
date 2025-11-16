# How to Run SkillSphere AI Tutor on Localhost

## ✅ Quick Start Guide

### Step 1: Verify Environment Setup

Your `.env` file should contain:
```env
DATABASE_URL=your_database_url
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Step 2: Install Dependencies (if not done)

```bash
npm install
```

### Step 3: Test Gemini API Integration

Run the test script to verify API is working:

```bash
node test-gemini-api.js
```

**Expected Output:**
```
✅ API Key found: AIzaSyA6DJaF48Hef...
🔄 Testing API connection...
✅ API Response: Hello! Gemini API is working!
🎉 SUCCESS! Gemini API is integrated and working!
```

### Step 4: Start the Development Server

```bash
npm run dev
```

**Expected Output:**
```
[dotenv] ✅ Loaded .env from ...
serving on port 5000 at http://localhost:5000
```

### Step 5: Access the Application

Open your browser and go to:
```
http://localhost:5000
```

## 🔍 How to Verify API Integration

### Method 1: Test Script (Recommended)
```bash
node test-gemini-api.js
```

### Method 2: Check Server Logs
When you start the server, look for:
- No errors about missing API keys
- Server starts successfully on port 5000

### Method 3: Test in Application
1. Go to **AI Mentor** page
2. Ask a question like "Hello, are you working?"
3. If you get a response, API is working! ✅

### Method 4: Test Quiz Generation
1. Go to **Assessments** page
2. Select a domain and start a quiz
3. If questions are generated, API is working! ✅

## 🐛 Troubleshooting

### Error: "DATABASE_URL must be set"
**Solution:** Make sure your `.env` file has a valid `DATABASE_URL`

### Error: "API key not found"
**Solution:** 
1. Check `.env` file has `GEMINI_API_KEY=your_key`
2. Restart the server after adding the key

### Error: "Invalid API key"
**Solution:**
1. Verify your Gemini API key is correct
2. Get a new key from: https://aistudio.google.com/app/apikey

### Server won't start
**Solution:**
1. Make sure port 5000 is not in use
2. Check if DATABASE_URL is valid
3. Verify all dependencies are installed: `npm install`

### API not responding
**Solution:**
1. Check internet connection
2. Verify API key has quota remaining
3. Check Google AI Studio dashboard for any issues

## 📋 Quick Commands Reference

```bash
# Install dependencies
npm install

# Test Gemini API
node test-gemini-api.js

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check TypeScript
npm run check

# Push database schema
npm run db:push
```

## 🌐 Access Points

Once server is running:
- **Main App**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard
- **AI Mentor**: http://localhost:5000/mentor
- **Courses**: http://localhost:5000/courses
- **Assessments**: http://localhost:5000/assessments

## ✅ Integration Checklist

- [x] `@google/generative-ai` package installed
- [x] `GEMINI_API_KEY` in `.env` file
- [x] Code updated to use Gemini API
- [x] Test script created
- [ ] Server starts without errors
- [ ] API test passes
- [ ] Can generate quizzes
- [ ] AI Mentor responds

## 🎯 Next Steps

1. Run `node test-gemini-api.js` to verify API
2. Start server with `npm run dev`
3. Open http://localhost:5000
4. Test AI Mentor chat
5. Try generating a quiz

Happy coding! 🚀

