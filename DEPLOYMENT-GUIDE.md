# Deployment Guide - SkillSphere AI Tutor

This guide will help you deploy your application to a live server.

## 📋 Pre-Deployment Checklist

- [ ] Application builds successfully (`npm run build`)
- [ ] All environment variables are documented
- [ ] Database is set up and accessible
- [ ] API keys are ready (Gemini API, OpenAI if needed)
- [ ] Code is committed to Git

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in PostgreSQL
- ✅ Easy environment variable management
- ✅ Great for full-stack apps

**Steps:**

1. **Sign up at Railway**
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Set Environment Variables**
   - Go to your project → "Variables"
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=5000
     GEMINI_API_KEY=your_gemini_api_key
     OPENAI_API_KEY=your_openai_api_key (optional)
     ```

5. **Configure Build Settings**
   - Railway auto-detects Node.js
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

6. **Deploy**
   - Railway will automatically deploy
   - Your app will be live at: `https://your-app.railway.app`

---

### Option 2: Render (Free Tier Available)

**Steps:**

1. **Sign up at Render**
   - Go to: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**
   - **Name**: skillsphere-ai-tutor
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

4. **Add PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Create database
   - Copy the connection string

5. **Set Environment Variables**
   - In your Web Service → "Environment"
   - Add:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=your_render_postgres_url
     GEMINI_API_KEY=your_gemini_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

6. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Your app will be live at: `https://your-app.onrender.com`

---

### Option 3: Vercel (Frontend) + Railway/Render (Backend)

**For Vercel (Frontend only):**

1. **Deploy Frontend to Vercel**
   - Go to: https://vercel.com
   - Import your repository
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

2. **Deploy Backend Separately**
   - Use Railway or Render for backend
   - Update frontend API URLs to point to backend

---

### Option 4: DigitalOcean App Platform

**Steps:**

1. **Sign up at DigitalOcean**
   - Go to: https://www.digitalocean.com
   - Create account

2. **Create App**
   - Go to "Apps" → "Create App"
   - Connect GitHub repository

3. **Configure**
   - **Type**: Web Service
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: 5000

4. **Add Database**
   - Add PostgreSQL database
   - Set `DATABASE_URL` automatically

5. **Environment Variables**
   - Add all required variables

---

## 🔧 Build & Test Locally First

Before deploying, test the production build:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test production build locally
npm start
```

Visit: http://localhost:5000

---

## 📝 Environment Variables Required

Make sure to set these in your hosting platform:

```env
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key

# Optional (for fallback)
OPENAI_API_KEY=your_openai_api_key
```

---

## 🗄️ Database Setup

### If using Railway/Render PostgreSQL:
- They provide `DATABASE_URL` automatically
- Run migrations: `npm run db:push` (or set up in deployment)

### If using external database (Neon, Supabase):
- Copy your connection string
- Set as `DATABASE_URL` environment variable

---

## 🚀 Quick Deploy Commands

### Railway CLI (Alternative)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Render CLI
```bash
# Install Render CLI
npm i -g render-cli

# Login
render login

# Deploy
render deploy
```

---

## ✅ Post-Deployment Checklist

- [ ] Application is accessible via URL
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] Frontend loads properly
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled (automatic on most platforms)
- [ ] Custom domain configured (optional)

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies install correctly
- Check build logs for errors

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check database is accessible from hosting platform
- Ensure database allows connections from hosting IP

### API Not Working
- Verify `GEMINI_API_KEY` is set
- Check API key is valid
- Review server logs for errors

### Port Issues
- Most platforms set `PORT` automatically
- Use `process.env.PORT || 5000` in code

---

## 📚 Platform-Specific Guides

- **Railway**: https://docs.railway.app
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **DigitalOcean**: https://docs.digitalocean.com/products/app-platform

---

## 🎯 Recommended: Railway

For this application, **Railway** is recommended because:
1. ✅ Easiest setup
2. ✅ Free tier with PostgreSQL
3. ✅ Automatic deployments
4. ✅ Great for full-stack apps
5. ✅ Simple environment variable management

**Get started**: https://railway.app/new

---

## 🔒 Security Notes

- Never commit `.env` files
- Use environment variables in hosting platform
- Enable HTTPS (automatic on most platforms)
- Keep API keys secure
- Use strong database passwords

---

## 📞 Need Help?

- Check platform documentation
- Review deployment logs
- Test locally first with `npm run build && npm start`
- Verify all environment variables are set

Good luck with your deployment! 🚀

