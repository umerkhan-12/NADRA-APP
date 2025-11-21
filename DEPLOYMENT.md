# NADRA System - Railway Deployment Guide

## Quick Deploy to Railway (FREE - No Card Needed)

### Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- This repository pushed to GitHub

---

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. No credit card required!

---

## Step 2: Deploy MySQL Database

1. Click "New Project"
2. Select "Provision MySQL"
3. Railway creates database automatically
4. Copy the `DATABASE_URL` from "Variables" tab
   - Format: `mysql://user:pass@host:port/railway`

---

## Step 3: Deploy Flask Chatbot

1. Click "New" → "GitHub Repo"
2. Select your `NADRA-APP` repository
3. Click "Add Variables":
   ```
   DATABASE_URL=<paste_from_mysql_service>
   HUGGINGFACE_API_KEY=<your_hugging_face_key>
   PORT=5000
   ```
4. Click "Settings":
   - **Root Directory**: `/chatbot`
   - **Start Command**: `python app.py`
5. Deploy automatically starts
6. Copy the generated URL (e.g., `nadra-chatbot-production.up.railway.app`)

---

## Step 4: Setup Database Schema

On your local machine:

```bash
# Update .env with Railway DATABASE_URL
echo "DATABASE_URL=<railway_mysql_url>" > .env

# Push schema to Railway database
npx prisma db push

# Seed the database
npx prisma db seed
```

---

## Step 5: Deploy Next.js Frontend

1. In same Railway project, click "New" → "GitHub Repo"
2. Select `NADRA-APP` again
3. Click "Add Variables":
   ```
   DATABASE_URL=<paste_from_mysql_service>
   NEXTAUTH_SECRET=<generate_with: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-app.up.railway.app
   EMAIL_USER=<your_gmail>
   EMAIL_PASS=<your_gmail_app_password>
   FLASK_API_URL=<flask_url_from_step_3>
   ```
4. Click "Settings":
   - **Root Directory**: `/`
   - Railway auto-detects Next.js
5. After deploy, copy the URL
6. **Update** `NEXTAUTH_URL` variable with this URL

---

## Step 6: Configure Production URLs

1. Go to Flask service → Settings → Generate Domain
2. Go to Next.js service → Settings → Generate Domain
3. Update environment variables with production URLs

---

## File Storage (Optional - For File Uploads)

Since Railway has ephemeral storage, use Cloudinary:

1. Sign up at cloudinary.com (free tier)
2. Get API credentials
3. Install: `npm install cloudinary`
4. Add env vars to Next.js service:
   ```
   CLOUDINARY_CLOUD_NAME=<your_cloud_name>
   CLOUDINARY_API_KEY=<your_api_key>
   CLOUDINARY_API_SECRET=<your_api_secret>
   ```

---

## Cost on Railway

- **MySQL Database**: ~$5/month
- **Flask Service**: ~$5/month  
- **Next.js Service**: ~$5/month
- **Total**: ~$15/month

**Free Credit**: $5/month
**Your Cost**: $10/month (or free for development with low traffic)

---

## Migration to DigitalOcean (Later)

When you're ready to use your $200 DigitalOcean credit:

1. Export Railway MySQL data
2. Deploy to DigitalOcean following their guide
3. Update DNS/domains
4. Keep Railway as backup or delete

---

## Troubleshooting

### Issue: Prisma connection error
**Solution**: Make sure DATABASE_URL includes `?sslaccept=strict` or `?ssl=true`

### Issue: Next.js build fails
**Solution**: Check all environment variables are set

### Issue: Flask not starting
**Solution**: Verify `Procfile` exists in `/chatbot` folder

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/umerkhan-12/NADRA-APP/issues

---

## Production Checklist

- [ ] Database deployed and seeded
- [ ] Flask chatbot running
- [ ] Next.js frontend running
- [ ] All environment variables set
- [ ] NEXTAUTH_URL updated with production URL
- [ ] FLASK_API_URL updated with production URL
- [ ] Test login functionality
- [ ] Test ticket creation
- [ ] Test file uploads
- [ ] Test chatbot responses

---

**🚀 Your app is now live on Railway!**

Free for development, $10-15/month for production traffic.
Upgrade to DigitalOcean ($200 credit) when ready for more resources.
