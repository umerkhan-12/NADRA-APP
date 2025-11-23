# 🚀 Heroku Deployment Guide - NADRA Portal

## Step 1: Get GitHub Student Pack (Free Credits!)

1. Go to: https://education.github.com/pack
2. Sign in with your GitHub (@umerkhan-12)
3. Verify student status (use student email or ID)
4. Get **$13/month Heroku credits** + tons of other free stuff

---

## Step 2: Connect Heroku to GitHub

1. Go to: https://heroku.com
2. Sign up/Login
3. Go to **Account Settings** → **Applications**
4. Click **"Connect to GitHub"**
5. Authorize Heroku
6. **Redeem GitHub Student Pack** in billing section

---

## Step 3: Install Heroku CLI

Open PowerShell and run:
```powershell
winget install Heroku.HerokuCLI
```

After installation, restart PowerShell and login:
```powershell
heroku login
```

---

## Step 4: Create Heroku App

```powershell
cd "c:\Users\anas_\Desktop\NADRA_PROJECT\nadra-system"
heroku create nadra-citizen-portal
```

This creates: `https://nadra-citizen-portal.herokuapp.com`

---

## Step 5: Add MySQL Database

**Option 1: JawsDB (Recommended - 10MB free)**
```powershell
heroku addons:create jawsdb:kitefin
```

**Option 2: ClearDB (5MB free)**
```powershell
heroku addons:create cleardb:ignite
```

**Get database URL:**
```powershell
heroku config:get JAWSDB_URL
# or
heroku config:get CLEARDB_DATABASE_URL
```

---

## Step 6: Set Environment Variables

```powershell
# Database (automatically set by addon, but verify)
heroku config

# Email Configuration
heroku config:set EMAIL_USER="khaankhattack321@gmail.com"
heroku config:set EMAIL_PASS="cwqg yupt mqlb wumo"

# NextAuth Configuration
heroku config:set NEXTAUTH_SECRET="33aa23cdecf09f58665d4b2327a651d59c004379ef66bac72d3d84ab4d70fd3b"
heroku config:set NEXTAUTH_URL="https://nadra-citizen-portal.herokuapp.com"

# Set DATABASE_URL to JAWSDB_URL
heroku config:set DATABASE_URL=$(heroku config:get JAWSDB_URL)
```

---

## Step 7: Connect GitHub Auto-Deploy (Easiest!)

### Via Heroku Dashboard:
1. Go to: https://dashboard.heroku.com/apps/nadra-citizen-portal
2. Click **"Deploy"** tab
3. Under **"Deployment method"**, click **"GitHub"**
4. Search for: `NADRA-APP`
5. Click **"Connect"**
6. Enable **"Automatic deploys"** from `main` branch
7. Click **"Deploy Branch"**

### Or Via Git (Manual):
```powershell
# Add Heroku remote
heroku git:remote -a nadra-citizen-portal

# Push to Heroku
git push heroku main
```

---

## Step 8: Database Setup

After first deployment:
```powershell
# Generate Prisma Client
heroku run npx prisma generate

# Push database schema
heroku run npx prisma db push

# (Optional) Seed data
heroku run npx prisma db seed
```

---

## Step 9: Create Admin User

**Option 1: Via Heroku Console**
```powershell
heroku run bash

# Inside Heroku bash:
npx prisma studio
# Then create admin user via browser
```

**Option 2: Manual SQL**
```powershell
heroku run bash

# Connect to database
mysql -h <JAWSDB_HOST> -u <JAWSDB_USER> -p<JAWSDB_PASSWORD> <JAWSDB_NAME>

# Insert admin (replace with bcrypt hash of your password)
INSERT INTO User (name, email, password, role, createdAt) 
VALUES ('Admin', 'admin@nadra.gov.pk', '$2a$10$hashedPassword', 'ADMIN', NOW());
```

---

## Step 10: Verify Deployment

1. **Visit your app:**
   ```
   https://nadra-citizen-portal.herokuapp.com
   ```

2. **Check logs:**
   ```powershell
   heroku logs --tail
   ```

3. **Test features:**
   - Register new user (OTP email)
   - Login
   - Create ticket
   - Admin dashboard

---

## Troubleshooting

### Check logs:
```powershell
heroku logs --tail
```

### Restart app:
```powershell
heroku restart
```

### Check config:
```powershell
heroku config
```

### Database issues:
```powershell
heroku run npx prisma studio
```

### Clear build cache:
```powershell
heroku repo:purge_cache -a nadra-citizen-portal
git push heroku main
```

---

## Monitoring & Scaling

### View app info:
```powershell
heroku apps:info
```

### Scale dynos (with credits):
```powershell
heroku ps:scale web=1
```

### Open app:
```powershell
heroku open
```

### View metrics:
```powershell
heroku logs --tail --app nadra-citizen-portal
```

---

## Cost Breakdown (With Student Pack)

✅ **Eco Dyno**: Free with $13 credits  
✅ **JawsDB MySQL**: Free (10MB)  
✅ **Nodemailer/Gmail**: Free  
✅ **SSL Certificate**: Free (auto)  
✅ **Custom Domain**: Free  

**Total: $0/month** 🎉

---

## Updates & Redeployment

### Automatic (Recommended):
- Just push to GitHub `main` branch
- Heroku auto-deploys

### Manual:
```powershell
git push heroku main
```

---

## Important URLs

- **Your App**: https://nadra-citizen-portal.herokuapp.com
- **Dashboard**: https://dashboard.heroku.com/apps/nadra-citizen-portal
- **GitHub Repo**: https://github.com/umerkhan-12/NADRA-APP
- **Student Pack**: https://education.github.com/pack

---

## Security Notes

1. ✅ All environment variables are encrypted on Heroku
2. ✅ Automatic HTTPS/SSL
3. ✅ Gmail app password is secure
4. ✅ Database credentials auto-generated

---

## Support

- **Heroku Docs**: https://devcenter.heroku.com/categories/nodejs-support
- **Next.js on Heroku**: https://vercel.com/guides/deploying-nextjs-with-heroku
- **Prisma on Heroku**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-heroku

---

**Built by Umer Khan** 🚀  
**Repository**: [NADRA-APP](https://github.com/umerkhan-12/NADRA-APP)
