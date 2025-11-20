# NADRA System - Full Setup Guide

## 🚀 Complete Installation & Setup

### 1. Next.js Application Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your database credentials
```

### 2. Python Flask Chatbot Setup

```bash
# Navigate to chatbot directory
cd chatbot

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed database with initial data (optional)
npx prisma db seed
```

## 🏃 Running the Application

### Start Both Services:

**Terminal 1 - Next.js App:**
```bash
npm run dev
```
App runs on: http://localhost:3000

**Terminal 2 - Flask Chatbot API:**
```bash
cd chatbot
python app.py
```
API runs on: http://localhost:5000

## ✨ Features Implemented

### ✅ Core Features
- Multi-role authentication (User/Agent/Admin)
- Service management system
- Ticket creation and tracking
- Document upload functionality
- Delivery address management
- Payment integration
- Priority system

### ✅ AI Chatbot (NEW!)
- **Bilingual Support**: English & Urdu
- **24/7 Availability**: Always ready to help
- **Smart Responses**: Context-aware answers
- **Quick Questions**: Pre-defined common queries
- **Beautiful UI**: Modern floating chatbot widget
- **Conversation Logging**: All chats stored in database

### Chatbot Capabilities:
- ID Card application help
- Passport services information
- Document verification guidance
- Fee information
- Application tracking
- Center locator information
- Multilingual responses (English/Urdu)

## 🔧 Environment Variables

Add to your `.env.local`:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/nadra_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Flask Chatbot API
FLASK_API_URL="http://localhost:5000"
```

## 📱 Using the Chatbot

1. Visit the home page
2. Click the green chat icon in the bottom-right corner
3. Choose your language (English/Urdu) using the globe icon
4. Ask questions about NADRA services
5. Use quick questions for common queries

## 🎯 API Endpoints

### Next.js API Routes
- `/api/auth/*` - Authentication
- `/api/services` - Service management
- `/api/tickets/*` - Ticket operations
- `/api/chatbot` - Chatbot integration (connects to Flask)

### Flask API Routes
- `GET /health` - Health check
- `POST /chat` - Chat with bot
- `GET /services` - Get services info

## 🐛 Troubleshooting

### Flask API not connecting:
1. Ensure Flask is running on port 5000
2. Check `FLASK_API_URL` in `.env.local`
3. Verify firewall isn't blocking port 5000

### Database errors:
1. Run `npx prisma generate`
2. Run `npx prisma migrate dev`
3. Check database connection string

### Chatbot not responding:
1. Check Flask API is running (`http://localhost:5000/health`)
2. Check browser console for errors
3. Verify `/api/chatbot` route is accessible

## 🌟 Next Steps

Consider adding:
- WhatsApp integration for notifications
- SMS status updates
- JazzCash/EasyPaisa payment gateways
- Advanced AI with GPT-4 or local LLM
- Voice assistant features
- CNIC OCR scanning

## 📞 Support

For issues or questions, contact the development team.

---

Made with ❤️ for Pakistani Citizens
