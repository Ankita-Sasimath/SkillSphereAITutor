# Quick Start Deployment - Railway (5 Minutes)

## 🚀 Fastest Way to Deploy

### Step 1: Prepare Your Code
```bash
# Make sure everything is committed to Git
git add .
git commit -m "Ready for deployment"
git push
```

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app/new
2. **Sign up** with GitHub
3. **Click "Deploy from GitHub repo"**
4. **Select your repository**

### Step 3: Add Database

1. In Railway project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically sets `DATABASE_URL`

### Step 4: Set Environment Variables

1. Go to your service → **"Variables"**
2. Click **"New Variable"**
3. Add these:

```
NODE_ENV=production
PORT=5000
GEMINI_API_KEY=AIzaSyDhjUNzQ0F-EMEBcQ5I56R8JrpnQaF8MCk
```

(Your `DATABASE_URL` is already set by Railway)

### Step 5: Deploy!

1. Railway will automatically:
   - Install dependencies
   - Build your app
   - Start the server

2. **Get your URL**: Click on your service → "Settings" → "Generate Domain"

3. **Visit your live app!** 🎉

---

## 🔧 Run Database Migrations

After first deployment, you may need to run migrations:

1. Go to Railway → Your service → "Settings"
2. Click "Connect" to get shell access
3. Run: `npm run db:push`

Or use Railway CLI:
```bash
railway run npm run db:push
```

---

## ✅ That's It!

Your app is now live! Share the URL with others.

**Next Steps:**
- Add custom domain (optional)
- Set up monitoring
- Configure backups

---

## 🆘 Troubleshooting

**App won't start?**
- Check logs in Railway dashboard
- Verify all environment variables are set
- Make sure `DATABASE_URL` is correct

**Database errors?**
- Run migrations: `npm run db:push`
- Check database is running in Railway

**API not working?**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is valid

---

**Need more help?** See `DEPLOYMENT-GUIDE.md` for detailed instructions.

