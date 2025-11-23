# 🤖 NADRA Chatbot - Heroku Deployment Guide

## Quick Deployment (5 Minutes)

### Step 1: Create New Heroku App for Chatbot

1. Go to Heroku Dashboard: https://dashboard.heroku.com
2. Click **"New"** → **"Create new app"**
3. App name: `nadra-chatbot-umer` (choose any unique name)
4. Region: **United States**
5. Click **"Create app"**

---

### Step 2: Deploy Using Heroku Dashboard

#### Option A: Deploy from GitHub (Recommended)

Since the chatbot is in a subdirectory, we'll use a buildpack:

1. In your chatbot app → **Settings** tab
2. Scroll to **"Buildpacks"** section
3. Click **"Add buildpack"**
4. Enter this URL:
   ```
   https://github.com/timanovsky/subdir-heroku-buildpack
   ```
5. Click **"Save changes"**
6. Add another buildpack: **"heroku/python"**
7. Make sure **subdir-heroku-buildpack is FIRST** in the list

Then:

8. Go to **Settings** → **Config Vars**
9. Add:
   ```
   KEY: PROJECT_PATH
   VALUE: chatbot
   ```

10. Go to **Deploy** tab
11. Choose **"GitHub"** as deployment method
12. Connect to **NADRA-APP** repository
13. Enable **"Automatic deploys"**
14. Click **"Deploy Branch"** (main branch)

---

#### Option B: Manual Git Push (Alternative)

If Option A doesn't work, use this:

1. Open PowerShell in your project folder
2. Run these commands:

```powershell
# Navigate to chatbot folder
cd "c:\Users\anas_\Desktop\NADRA_PROJECT\nadra-system\chatbot"

# Add Heroku remote (replace with YOUR chatbot app name)
git remote add heroku https://git.heroku.com/nadra-chatbot-umer.git

# Deploy
git push heroku master
```

---

### Step 3: Configure Database Connection

In your **chatbot app** → Settings → Config Vars:

Add these variables:

```
KEY: DATABASE_URL
VALUE: mysql://p4xuh0pd8jtwevs4:jew2ycfkbafcj70d@u28rhuskh0x5paau.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/zh4dp6vgxcjqs4lq

KEY: HUGGINGFACE_API_KEY
VALUE: (optional - leave blank for rule-based responses)
```

---

### Step 4: Connect Main App to Chatbot

In your **MAIN app** (nadra-pakistan...) → Settings → Config Vars:

Add:

```
KEY: FLASK_API_URL
VALUE: https://nadra-chatbot-umer.herokuapp.com
```

(Replace `nadra-chatbot-umer` with your actual chatbot app name)

---

### Step 5: Test Your Chatbot

1. Open your main app: `https://nadra-pakistan-a0e7404251e9.herokuapp.com`
2. Look for the chatbot icon (bottom right)
3. Click it and send a message
4. It should respond!

---

## Troubleshooting

### Chatbot not responding?

1. **Check chatbot logs:**
   - Go to chatbot app → **More** → **View logs**
   - Look for errors

2. **Verify Config Vars:**
   - Main app has `FLASK_API_URL`
   - Chatbot app has `DATABASE_URL`

3. **Test chatbot directly:**
   - Visit: `https://YOUR-CHATBOT-APP.herokuapp.com/health`
   - Should return: `{"status": "healthy"}`

### Build failed?

- Make sure you added the **subdir-heroku-buildpack**
- Make sure `PROJECT_PATH=chatbot` is set
- Check that `requirements.txt` and `Procfile` exist in chatbot folder

---

## Your App URLs

**Main App:** https://nadra-pakistan-a0e7404251e9.herokuapp.com  
**Chatbot API:** https://nadra-chatbot-umer.herokuapp.com (update with your name)

---

## What the Chatbot Does

✅ Answers questions about NADRA services  
✅ Checks ticket status  
✅ Provides application requirements  
✅ Helps with payment queries  
✅ Supports English (more languages can be added)  
✅ Uses rule-based responses (or AI with Hugging Face key)

---

**Need Help?**  
Check Heroku logs or contact support!
