# NADRA AI Chatbot API

Flask-based AI chatbot with **Cohere AI** integration and Urdu language support.

## 🤖 Features

✅ **AI-Powered Responses** - Uses Cohere AI for intelligent conversations
✅ **Bilingual Support** - English & Urdu languages
✅ **NADRA Context** - Trained on NADRA services information
✅ **Fallback System** - Rule-based responses when AI is unavailable
✅ **REST API** - Easy integration with Next.js frontend

## 🚀 Setup

### 1. Install Python Dependencies

```bash
cd chatbot
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
# Copy example file
copy .env.example .env

# Edit .env and add your Cohere API key
# Get free API key from: https://dashboard.cohere.com/api-keys
```

Your `.env` file should look like:
```env
COHERE_API_KEY=your_actual_cohere_key_here
PORT=5000
```

### 3. Run the Flask Server

```bash
python app.py
```

The API will run on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Chat with Bot
```http
POST /chat
Content-Type: application/json

{
  "message": "How to apply for ID card?",
  "language": "en",
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "response": "To apply for a National ID Card...",
  "timestamp": "2025-11-21T10:30:00",
  "language": "en"
}
```

### Get Services Info
```http
GET /services
```

## 🧠 AI Features

### Cohere AI Integration
- Smart, context-aware responses
- Natural language understanding
- Trained on NADRA-specific information
- Supports complex queries

### Fallback System
If Cohere AI is unavailable:
- Rule-based responses kick in
- Predefined answers for common questions
- Service-specific information

## 💬 Example Questions

**English:**
- "How do I apply for a new ID card?"
- "What documents do I need for passport?"
- "How much does verification cost?"
- "Where is the nearest NADRA center?"

**Urdu:**
- "شناختی کارڈ کے لیے کیسے اپلائی کریں؟"
- "پاسپورٹ کے لیے کون سے دستاویزات چاہیے؟"
- "تصدیق کی فیس کیا ہے؟"

## 🔧 Technologies Used

- **Flask** - Web framework
- **Cohere AI** - Large Language Model
- **Flask-CORS** - Cross-origin support
- **python-dotenv** - Environment variables

## 📝 Credits

Integrated from the original **Siri Voice Assistant** project with AI capabilities from Cohere.

Original voice assistant features (GUI, speech recognition) available in `/ai assistant` folder.
