from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv
import mysql.connector
import requests
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize Hugging Face API (FREE)
hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct"

if hf_api_key:
    print("✓ Hugging Face AI enabled (FREE)")
else:
    print("ℹ️  Using rule-based responses (set HUGGINGFACE_API_KEY for AI features)")
    print("   Get free key at: https://huggingface.co/settings/tokens")

# Database connection
def get_db_connection():
    """Get database connection for tracking queries"""
    try:
        db_url = os.getenv("DATABASE_URL", "mysql://root:@localhost:3306/nadradb")
        # Parse database URL
        parts = db_url.replace('mysql://', '').split('/')
        host_part = parts[0].split('@')[-1].split(':')[0]
        port = int(parts[0].split(':')[-1]) if ':' in parts[0].split('@')[-1] else 3306
        database = parts[1] if len(parts) > 1 else 'nadradb'
        user_pass = parts[0].split('@')[0].split(':')
        user = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ''
        
        conn = mysql.connector.connect(
            host=host_part,
            port=port,
            user=user,
            password=password,
            database=database
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# NADRA-specific knowledge base for fallback
NADRA_KNOWLEDGE = {
    "id card": {
        "en": "To apply for a National ID Card:\n1. You must be 18 years or older\n2. Required documents: Birth certificate, Family registration certificate\n3. Fee: Rs. 200-500 depending on urgency\n4. Processing time: 7-15 days\n\nWould you like to start an application?",
        "ur": "قومی شناختی کارڈ کے لیے درخواست دینے کے لیے:\n1. آپ کی عمر 18 سال یا اس سے زیادہ ہونی چاہیے\n2. مطلوبہ دستاویزات: پیدائش کا سرٹیفکیٹ، خاندانی رجسٹریشن سرٹیفکیٹ\n3. فیس: Rs. 200-500 عجلت پر منحصر ہے\n4. پروسیسنگ ٹائم: 7-15 دن\n\nکیا آپ درخواست شروع کرنا چاہیں گے?"
    },
    "passport": {
        "en": "Pakistan Passport Services:\n1. Normal passport: 36 pages or 72 pages\n2. Required: Valid CNIC, previous passport (if renewal)\n3. Fee: Rs. 3,000 - Rs. 9,000\n4. Processing: 10-21 working days\n\nYou can track your passport application online.",
        "ur": "پاکستان پاسپورٹ سروسز:\n1. عام پاسپورٹ: 36 صفحات یا 72 صفحات\n2. ضروری: درست CNIC، پچھلا پاسپورٹ (اگر تجدید ہے)\n3. فیس: Rs. 3,000 - Rs. 9,000\n4. پروسیسنگ: 10-21 کاروباری دن\n\nآپ اپنی پاسپورٹ درخواست آن لائن ٹریک کر سکتے ہیں۔"
    },
    "verification": {
        "en": "Document Verification Service:\n✓ Verify CNIC authenticity\n✓ Check family registration\n✓ Verify certificates\n\nOnline verification is instant!\nVisit verification section or provide document number.",
        "ur": "دستاویز کی تصدیق کی خدمت:\n✓ CNIC کی صداقت کی تصدیق کریں\n✓ خاندانی رجسٹریشن چیک کریں\n✓ سرٹیفکیٹ کی تصدیق کریں\n\nآن لائن تصدیق فوری ہے!\nتصدیقی سیکشن ملاحظہ کریں یا دستاویز نمبر فراہم کریں۔"
    },
    "fee": {
        "en": "NADRA Service Fees:\n• ID Card (Normal): Rs. 200\n• ID Card (Urgent): Rs. 500\n• Passport (Normal): Rs. 3,000\n• Passport (Urgent): Rs. 9,000\n• Verification: Rs. 50\n• Family Registration: Rs. 300\n\nPay online via JazzCash, EasyPaisa, or Credit Card.",
        "ur": "نادرا سروس فیسیں:\n• شناختی کارڈ (عام): Rs. 200\n• شناختی کارڈ (فوری): Rs. 500\n• پاسپورٹ (عام): Rs. 3,000\n• پاسپورٹ (فوری): Rs. 9,000\n• تصدیق: Rs. 50\n• خاندانی رجسٹریشن: Rs. 300\n\nآن لائن ادائیگی JazzCash، EasyPaisa، یا کریڈٹ کارڈ کے ذریعے۔"
    },
    "documents": {
        "en": "Required Documents:\n\nFor ID Card:\n- Birth Certificate\n- Family Registration Certificate (FRC)\n- 2 Passport size photos\n\nFor Passport:\n- Valid CNIC\n- Previous Passport (for renewal)\n- 4 Passport size photos\n\nBring originals + photocopies.",
        "ur": "مطلوبہ دستاویزات:\n\nشناختی کارڈ کے لیے:\n- پیدائشی سرٹیفکیٹ\n- خاندانی رجسٹریشن سرٹیفکیٹ\n- 2 پاسپورٹ سائز تصاویر\n\nپاسپورٹ کے لیے:\n- درست CNIC\n- پچھلا پاسپورٹ (تجدید کے لیے)\n- 4 پاسپورٹ سائز تصاویر\n\nاصل + فوٹو کاپیاں ساتھ لائیں۔"
    },
    "tracking": {
        "en": "Track Your Application:\n\n1. Login to your account\n2. Go to 'My Applications' dashboard\n3. View real-time status\n4. Get SMS/WhatsApp updates\n\nNeed your application ID? Check your email or SMS.",
        "ur": "اپنی درخواست ٹریک کریں:\n\n1. اپنے اکاؤنٹ میں لاگ ان کریں\n2. 'میری درخواستیں' ڈیش بورڈ پر جائیں\n3. حقیقی وقت میں حیثیت دیکھیں\n4. SMS/WhatsApp اپ ڈیٹس حاصل کریں\n\nاپنی درخواست ID چاہیے؟ اپنا ای میل یا SMS چیک کریں۔"
    },
    "centers": {
        "en": "NADRA Registration Centers:\n\n🏢 Find centers near you:\n- Major cities: 100+ centers\n- Open: Mon-Fri, 8 AM - 5 PM\n- Saturday: 9 AM - 2 PM\n\nUse our Center Locator to find the nearest center with live queue status!",
        "ur": "نادرا رجسٹریشن مراکز:\n\n🏢 اپنے قریب مراکز تلاش کریں:\n- بڑے شہر: 100+ مراکز\n- کھلا: پیر تا جمعہ، 8 صبح - 5 شام\n- ہفتہ: 9 صبح - 2 شام\n\nقریبی مرکز تلاش کرنے کے لیے ہمارا سینٹر لوکیٹر استعمال کریں!"
    },
    "greeting": {
        "en": "👋 Hello! I'm NADRA Assistant.\n\nI can help you with:\n✓ ID Card applications\n✓ Passport services\n✓ Document verification\n✓ Fee information\n✓ Track applications\n✓ Find centers\n\nHow can I assist you today?",
        "ur": "👋 السلام علیکم! میں نادرا اسسٹنٹ ہوں۔\n\nمیں آپ کی مدد کر سکتا ہوں:\n✓ شناختی کارڈ کی درخواستیں\n✓ پاسپورٹ سروسز\n✓ دستاویز کی تصدیق\n✓ فیس کی معلومات\n✓ درخواستوں کو ٹریک کریں\n✓ مراکز تلاش کریں\n\nآج میں آپ کی کیسے مدد کر سکتا ہوں؟"
    }
}

def get_ticket_status(ticket_id=None, cnic=None, email=None):
    """Get ticket/application status from database"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        if ticket_id:
            query = """
                SELECT t.id, t.status, t.createdAt, s.name as serviceName, 
                       u.name as userName, a.name as agentName
                FROM Ticket t
                JOIN Service s ON t.serviceId = s.id
                JOIN User u ON t.userId = u.id
                LEFT JOIN Agent a ON t.agentId = a.id
                WHERE t.id = %s
            """
            cursor.execute(query, (ticket_id,))
        elif cnic:
            query = """
                SELECT t.id, t.status, t.createdAt, s.name as serviceName
                FROM Ticket t
                JOIN Service s ON t.serviceId = s.id
                JOIN User u ON t.userId = u.id
                WHERE u.cnic = %s
                ORDER BY t.createdAt DESC
                LIMIT 5
            """
            cursor.execute(query, (cnic,))
        elif email:
            query = """
                SELECT t.id, t.status, t.createdAt, s.name as serviceName
                FROM Ticket t
                JOIN Service s ON t.serviceId = s.id
                JOIN User u ON t.userId = u.id
                WHERE u.email = %s
                ORDER BY t.createdAt DESC
                LIMIT 5
            """
            cursor.execute(query, (email,))
        else:
            return None
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Database query error: {e}")
        if conn:
            conn.close()
        return None

def format_ticket_response(tickets, language="en"):
    """Format ticket information for response"""
    if not tickets:
        if language == "ur":
            return "کوئی درخواست نہیں ملی۔ براہ کرم اپنا ٹکٹ نمبر، CNIC، یا ای میل چیک کریں۔"
        return "No applications found. Please check your ticket number, CNIC, or email."
    
    if language == "ur":
        response = "آپ کی درخواستیں:\n\n"
        for ticket in tickets:
            status_ur = {
                'OPEN': 'کھلا',
                'IN_PROGRESS': 'جاری',
                'COMPLETED': 'مکمل',
                'CLOSED': 'بند'
            }.get(ticket['status'], ticket['status'])
            response += f"🎫 ٹکٹ #{ticket['id']}\n"
            response += f"   خدمت: {ticket['serviceName']}\n"
            response += f"   حیثیت: {status_ur}\n"
            response += f"   تاریخ: {ticket['createdAt'].strftime('%Y-%m-%d')}\n\n"
    else:
        response = "Your Applications:\n\n"
        for ticket in tickets:
            response += f"🎫 Ticket #{ticket['id']}\n"
            response += f"   Service: {ticket['serviceName']}\n"
            response += f"   Status: {ticket['status']}\n"
            response += f"   Date: {ticket['createdAt'].strftime('%Y-%m-%d')}\n"
            if ticket.get('agentName'):
                response += f"   Agent: {ticket['agentName']}\n"
            response += "\n"
    
    return response.strip()

def get_ai_response(message, language="en"):
    """Get AI-powered response using Hugging Face (FREE)"""
    if not hf_api_key:
        return None
    
    try:
        # Create NADRA context for AI
        system_message = """You are a helpful NADRA (National Database and Registration Authority of Pakistan) assistant. 
        Help users with:
        - National ID Card (CNIC) applications and renewals
        - Passport services and tracking
        - Document verification services
        - Fee information and payment methods
        - Required documents for different services
        - Application tracking and status
        - NADRA center locations and timings
        
        Be helpful, professional, and provide accurate information about NADRA services.
        Keep responses concise and under 150 words."""
        
        if language == "ur":
            system_message += "\nPlease respond in Urdu language using proper Urdu script."
        
        # Prepare prompt for Hugging Face
        prompt = f"<|system|>{system_message}<|end|><|user|>{message}<|end|><|assistant|>"
        
        # Call Hugging Face API (FREE)
        headers = {"Authorization": f"Bearer {hf_api_key}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 250,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('generated_text', '').strip()
        
        return None
    except Exception as e:
        print(f"Hugging Face API Error: {e}")
        return None

def get_rule_based_response(message, language="en", isDashboard=False):
    """Fallback rule-based chatbot response"""
    
    # Extract original message (before the context)
    original_message = message.split("User's Recent Tickets:")[0].strip()
    message_lower = original_message.lower()
    
    # Debug logging
    print(f"\n=== DEBUG ===")
    print(f"Original Message: {original_message}")
    print(f"Message Lower: {message_lower}")
    print(f"isDashboard: {isDashboard}")
    has_tickets = "User's Recent Tickets:" in message
    print(f"Has tickets context: {has_tickets}")
    print(f"=============\n")
    
    # Dashboard-specific intelligent responses
    if isDashboard:
        # Extract ticket data from context if available
        ticket_data = ""
        
        if has_tickets:
            ticket_section = message.split("User's Recent Tickets:")[1].strip()
            if ticket_section:
                # Parse ticket information
                ticket_lines = [line.strip() for line in ticket_section.split('\n') if line.strip()]
                ticket_count = len(ticket_lines)
                
                # Analyze tickets for status
                in_progress_tickets = [t for t in ticket_lines if 'IN_PROGRESS' in t]
                completed_tickets = [t for t in ticket_lines if 'COMPLETED' in t]
                open_tickets = [t for t in ticket_lines if 'OPEN' in t]
                pending_payments = [t for t in ticket_lines if 'Payment: PENDING' in t]
                
                # How to upload documents (CHECK THIS FIRST - most specific)
                if any(word in message_lower for word in ['upload', 'document', 'file', 'attach', 'send document', 'add document', 'اپ لوڈ', 'دستاویز']):
                    print(f"✓ Matched: UPLOAD keywords")
                    return "📤 **How to Upload Documents:**\n\n1️⃣ Go to 'My Tickets' section on this page\n2️⃣ Find your ticket card\n3️⃣ Look for the 'Upload Document' button at the bottom\n4️⃣ Click it and select your file\n5️⃣ Supported: PDF, JPG, PNG, DOC (Max 5MB)\n\n✅ **Required Documents:**\n• CNIC copy (front & back)\n• Photos (passport size)\n• Birth certificate\n• Previous documents (if renewal)\n\n💡 Upload documents as soon as possible to speed up processing!"
                
                # Agent / assigned
                elif any(word in message_lower for word in ['agent', 'assigned', 'who is', 'who handling', 'officer', 'ایجنٹ', 'افسر']):
                    print(f"✓ Matched: AGENT keywords")
                    agent_tickets = [t for t in ticket_lines if 'Agent:' in t]
                    # Only show non-completed tickets without agents (exclude completed ones with deleted agents)
                    no_agent_tickets = [t for t in ticket_lines if 'Agent:' not in t and 'COMPLETED' not in t]
                    
                    response = ""
                    if agent_tickets:
                        response += "👤 **Assigned Agents:**\n\n"
                        for ticket in agent_tickets:
                            response += f"• {ticket}\n"
                        response += "\n✅ These tickets are being handled by our agents.\n"
                    
                    if no_agent_tickets:
                        if response:
                            response += "\n"
                        response += "⏳ **Waiting for Assignment:**\n\n"
                        for ticket in no_agent_tickets:
                            response += f"• {ticket}\n"
                        response += "\n⏱️ These will be assigned to an agent soon."
                    
                    if not agent_tickets and not no_agent_tickets:
                        response = "✅ All your tickets have been processed.\n\nCompleted tickets don't require agent assignment."
                    
                    return response
                
                # Show my tickets / application status
                elif any(word in message_lower for word in ['show', 'my ticket', 'my application', 'list', 'all ticket', 'میری درخواست', 'دکھائیں']):
                    response = "📋 **Your Applications:**\n\n"
                    for i, ticket in enumerate(ticket_lines, 1):
                        response += f"{i}. {ticket}\n"
                    response += f"\n📊 **Summary:** {ticket_count} total applications"
                    if in_progress_tickets:
                        response += f"\n🔄 {len(in_progress_tickets)} in progress"
                    if completed_tickets:
                        response += f"\n✅ {len(completed_tickets)} completed"
                    if pending_payments:
                        response += f"\n💰 {len(pending_payments)} pending payment"
                    return response
                
                # Latest / recent status
                elif any(word in message_lower for word in ['latest', 'recent', 'last', 'newest', 'تازہ ترین', 'حالیہ']):
                    latest = ticket_lines[0] if ticket_lines else "No tickets found"
                    return f"🎫 **Your Latest Application:**\n\n{latest}\n\n💡 This is your most recent request."
                
                # Payment status
                elif any(word in message_lower for word in ['payment', 'pay', 'fee', 'paid', 'ادائیگی', 'فیس']):
                    if pending_payments:
                        response = "💳 **Payment Status:**\n\n"
                        for ticket in pending_payments:
                            response += f"⚠️ {ticket}\n"
                        response += "\n📌 Please complete payment to proceed with processing."
                    else:
                        response = "✅ **All Payments Completed!**\n\nYou have no pending payments."
                    return response
                
                # In progress / processing
                elif any(word in message_lower for word in ['progress', 'processing', 'working on', 'جاری', 'عمل']):
                    if in_progress_tickets:
                        response = "🔄 **Applications Being Processed:**\n\n"
                        for ticket in in_progress_tickets:
                            response += f"• {ticket}\n"
                        response += "\n⏱️ Your documents are being processed by our team."
                    else:
                        response = "📭 No applications are currently in progress.\n\n"
                        if open_tickets:
                            response += "🔔 You have pending applications waiting for assignment."
                        elif completed_tickets:
                            response += "✅ Your recent applications are completed!"
                    return response
                
                # Completed / finished
                elif any(word in message_lower for word in ['completed', 'finished', 'done', 'ready', 'مکمل', 'ختم']):
                    if completed_tickets:
                        response = "✅ **Completed Applications:**\n\n"
                        for ticket in completed_tickets:
                            response += f"• {ticket}\n"
                        response += "\n🎉 These services are ready for collection/delivery!"
                    else:
                        response = "⏳ No completed applications yet.\n\nYour requests are still being processed."
                    return response
                
                # Delivery status
                elif any(word in message_lower for word in ['delivery', 'deliver', 'ship', 'ڈیلیوری', 'ترسیل']):
                    delivery_tickets = [t for t in ticket_lines if 'Delivery:' in t]
                    if delivery_tickets:
                        response = "🚚 **Delivery Status:**\n\n"
                        for ticket in delivery_tickets:
                            response += f"• {ticket}\n"
                        response += "\n📦 Check 'My Tickets' section for delivery address details."
                    else:
                        response = "📮 No delivery information available.\n\nYour applications might not require delivery or are not at that stage yet."
                    return response
                
                # General tracking response
                else:
                    response = "📋 **Your Applications Overview:**\n\n"
                    for i, ticket in enumerate(ticket_lines[:3], 1):  # Show top 3
                        response += f"{i}. {ticket}\n"
                    if ticket_count > 3:
                        response += f"\n...and {ticket_count - 3} more\n"
                    response += "\n💡 **Ask me about:**\n• Latest status\n• Payment details\n• Document upload\n• Delivery status"
                    return response
        
        # No tickets yet
        else:
            if any(word in message_lower for word in ['ticket', 'application', 'status', 'track', 'show']):
                return "📭 **No Applications Yet**\n\nYou haven't created any service requests.\n\n✨ **Get Started:**\n1. Use 'Create New Service Request' form above\n2. Select a service (ID Card, Passport, etc.)\n3. Choose priority (Normal/Urgent)\n4. Submit your request\n\n🎯 I'll help you track it once created!"
            
            # Help / what can you do
            if any(word in message_lower for word in ['help', 'what can', 'how', 'مدد', 'کیسے']):
                return "🤖 **I can help you with:**\n\n📊 Check application status\n💳 View payment details\n📤 Guide document upload\n🚚 Track delivery\n👤 Check agent assignment\n⏱️ Processing updates\n\n💬 **Try asking:**\n• 'Show my tickets'\n• 'What's my latest status?'\n• 'Any pending payments?'\n• 'How to upload documents?'"
    
    # Public chatbot - redirect to login
    tracking_keywords = ['track', 'status', 'application', 'ticket', 'my application', 'my ticket']
    if any(word in message_lower for word in tracking_keywords) and not isDashboard:
        if language == "ur":
            return "🔐 اپنی درخواستوں کو ٹریک کرنے کے لیے:\n\n1️⃣ اپنے اکاؤنٹ میں لاگ ان کریں\n2️⃣ اپنے ڈیش بورڈ پر جائیں\n3️⃣ 'My Tickets' سیکشن میں تمام درخواستیں دیکھیں\n\n🔒 سیکیورٹی کی وجہ سے، ذاتی درخواست کی تفصیلات صرف لاگ ان کے بعد دستیاب ہیں۔"
        return "🔐 To track your applications:\n\n1️⃣ Login to your account\n2️⃣ Go to your dashboard\n3️⃣ View all tickets in 'My Tickets' section\n\n🔒 For security reasons, personal application details are only available after login."
    
    # Greeting detection
    greetings = ['hello', 'hi', 'hey', 'salam', 'السلام علیکم', 'assalam']
    if any(word in message_lower for word in greetings):
        return NADRA_KNOWLEDGE["greeting"][language]
    
    # Service detection
    if any(word in message_lower for word in ['id card', 'cnic', 'شناختی کارڈ', 'identity']):
        return NADRA_KNOWLEDGE["id card"][language]
    
    if any(word in message_lower for word in ['passport', 'پاسپورٹ']):
        return NADRA_KNOWLEDGE["passport"][language]
    
    if any(word in message_lower for word in ['verify', 'verification', 'تصدیق', 'check']):
        return NADRA_KNOWLEDGE["verification"][language]
    
    if any(word in message_lower for word in ['fee', 'cost', 'price', 'فیس', 'قیمت']):
        return NADRA_KNOWLEDGE["fee"][language]
    
    if any(word in message_lower for word in ['document', 'required', 'need', 'دستاویز']):
        return NADRA_KNOWLEDGE["documents"][language]
    
    if any(word in message_lower for word in ['track', 'status', 'ٹریک', 'حیثیت']):
        return NADRA_KNOWLEDGE["tracking"][language]
    
    if any(word in message_lower for word in ['center', 'office', 'location', 'مرکز']):
        return NADRA_KNOWLEDGE["centers"][language]
    
    # Default response
    if language == "ur":
        return "معذرت، میں یہ سمجھ نہیں سکا۔ کیا آپ یہ دوبارہ پوچھ سکتے ہیں؟\n\nآپ پوچھ سکتے ہیں:\n- شناختی کارڈ کے بارے میں\n- پاسپورٹ کے بارے میں\n- فیس کے بارے میں\n- دستاویزات کے بارے میں"
    else:
        return "I'm sorry, I didn't understand that. Could you rephrase?\n\nYou can ask about:\n- ID Card application\n- Passport services\n- Fees and charges\n- Required documents\n- Application tracking"

def get_response(message, language="en", isDashboard=False):
    """Main response function - tries AI first, falls back to rules"""
    # Try AI response first
    ai_response = get_ai_response(message, language)
    if ai_response:
        return ai_response
    
    # Fallback to rule-based
    return get_rule_based_response(message, language, isDashboard)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "NADRA Chatbot API"})

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        message = data.get('message', '')
        language = data.get('language', 'en')
        user_id = data.get('userId', None)
        isDashboard = data.get('isDashboard', False)
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get chatbot response
        response = get_response(message, language, isDashboard)
        
        return jsonify({
            "success": True,
            "response": response,
            "timestamp": datetime.now().isoformat(),
            "language": language
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/services', methods=['GET'])
def services():
    """Get available services information"""
    return jsonify({
        "services": [
            {"id": 1, "name": "National ID Card", "name_ur": "قومی شناختی کارڈ"},
            {"id": 2, "name": "Passport Services", "name_ur": "پاسپورٹ سروسز"},
            {"id": 3, "name": "Document Verification", "name_ur": "دستاویز کی تصدیق"},
            {"id": 4, "name": "Family Registration", "name_ur": "خاندانی رجسٹریشن"},
            {"id": 5, "name": "Certificates", "name_ur": "سرٹیفکیٹس"},
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
