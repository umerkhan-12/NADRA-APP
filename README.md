
# 🏛️ NADRA Assistance & Ticket Management System  

A modern, production-ready full-stack web application built using **Next.js 16**, **NextAuth.js**, **Prisma ORM**, and **MySQL** to simulate a digital NADRA service center with role-based authentication and beautiful gradient UI.

The system provides **citizens**, **agents**, and **admins** with secure JWT-based authentication, real-time ticket management, automated ticket assignment, and stunning modern dashboards.

---

## 🚀 Tech Stack

### **Frontend**
- Next.js 16.0.1 (App Router)  
- React 19.2.0 (Client Components)  
- TailwindCSS 4  
- shadcn/ui component library  
- Lucide React Icons  

### **Backend**
- Next.js API Routes  
- NextAuth.js 4.24.13 (JWT Strategy)
- Prisma ORM 6.19.0  
- MySQL Database  
- bcryptjs 3.0.3 (Password hashing)  

### **Authentication**
- NextAuth with CredentialsProvider
- JWT-based sessions (30-day expiry)
- Role-based access control (USER, ADMIN, AGENT)
- Separate login providers for users and agents

### **Other Tools**
- Environment variables (`.env`)  
- Prisma Migrations  
- Automatic ticket assignment algorithm
- Real-time data updates

---

## ⭐ Project Overview

The NADRA Assistance System is a comprehensive service management platform where:
- **Citizens** can create and track service requests (tickets)
- **Agents** process and resolve tickets with real-time updates
- **Admins** manage the entire system, create agents, and monitor operations

The system features **automated ticket assignment**, **real-time auto-refresh**, **beautiful gradient-themed dashboards**, and complete **session management with NextAuth**.

---

## ✅ Completed Features

### **1. NextAuth Authentication System** 🔐
- **JWT-based authentication** with 30-day session persistence
- **Dual CredentialsProvider** setup:
  - User/Admin login with email
  - Agent login with username
- **bcrypt password hashing** for secure authentication
- **Role-based access control** preventing unauthorized access
- **Session persistence** across browser tabs
- **Secure logout** functionality with session cleanup

---

### **2. User Registration with OTP Verification** 📧
- User enters **name, email, phone, CNIC, password**  
- System sends **OTP via email** using Nodemailer  
- OTP is stored in database with expiry time
- User verifies OTP before account creation
- Account is created only after successful verification  

**OTP Flow:**  
1. Send OTP to email
2. Verify OTP with database check
3. Create user account with role assignment

---

### **3. Unified Login System** 🔑
The login page provides a single interface with dynamic form fields based on role:

- **Citizen/Admin Login** (email-based)
- **Agent Login** (username-based)

**Features:**
- Conditional form rendering based on selected role
- Email validation for USER/ADMIN
- Username validation for AGENT
- Password authentication with bcrypt comparison
- Role-based redirection after successful login
- Error handling with user-friendly messages

**Redirects:**
- `/USER/dashboard` (Citizens)
- `/admin/dashboard` (Admins)
- `/agent/dashboard` (Agents)

---

### **4. User/Citizen Dashboard** 🟢 (Emerald Theme)
**Beautiful gradient design with emerald color scheme**

**Features:**
- Create new service tickets with form validation
- View all personal tickets with status tracking
- Real-time ticket status updates
- Gradient stat cards showing:
  - Total tickets
  - Pending tickets
  - In-progress tickets
  - Resolved tickets
- User profile sidebar with:
  - Full name and CNIC
  - Email and phone
  - Account creation date
  - Mini activity stats
- Hover animations on stat cards
- Auto-refresh ticket list
- Responsive design for all screen sizes

---

### **5. Agent Dashboard** 🔵 (Cyan/Blue Theme)
**Stunning gradient interface with cyan and blue color scheme**

**Features:**
- View all assigned tickets in real-time
- Update ticket status (PENDING → IN_PROGRESS → RESOLVED → REJECTED)
- Gradient stat cards showing:
  - Total assigned tickets
  - Tickets in progress
  - Completed tickets
  - Pending tickets
- Agent profile sidebar with complete information:
  - Full name and username
  - Agent ID and email
  - Max ticket capacity
  - Member since date
  - Performance overview (active/completed counts)
- Auto-refresh every 5 seconds without flicker
- Ticket table with color-coded status badges
- Hover effects and smooth transitions
- Mobile-responsive layout

---

### **6. Admin Dashboard** 🟣 (Purple/Slate Theme)
**Professional dark gradient theme with purple accents**

**Features:**
- **System Overview** with gradient stat cards:
  - Total users (registered citizens)
  - Total tickets (all service requests)
  - Total agents (support staff)
  - Pending payments
- **Agent Management:**
  - Create new agents with form validation
  - Delete agents with automatic ticket reassignment
  - View all agents with capacity info
- **Ticket Management:**
  - View all tickets across the system
  - Monitor ticket status and assignments
  - Track service types and priorities
- **User Management:**
  - View all registered users
  - Monitor user activity
- **Service Management:**
  - View available services
  - Create new services
- **Payment Tracking:**
  - View payment status
  - Monitor pending payments
- **System Logs:**
  - Track all system activities
  - Monitor agent actions
- Beautiful gradient cards with hover animations
- Comprehensive tables for all entities
- Real-time data updates

---

### **7. Smart Ticket Assignment System** 🎯
**Automated algorithm for optimal ticket distribution**

**Features:**
- Checks agent capacity before assignment
- Assigns tickets to agents with available slots
- Prevents overloading any single agent
- Handles ticket reassignment when agents are deleted
- Automatically finds next available agent
- Updates ticket status on assignment
- Logs all assignment actions

**Algorithm:**
1. Fetch all agents from database
2. Check `assignedTickets < maxTickets` for each agent
3. Assign ticket to first available agent
4. Update agent's `assignedTickets` count
5. Update ticket's `agentId` and status
6. Log the assignment action

---

### **8. Agent Deletion with Ticket Handling** ♻️
When an agent is deleted:
1. All assigned tickets are **unassigned** (agentId set to null)
2. Tickets are automatically **reassigned** to available agents
3. Agent's ticket count is decremented
4. System finds agents with capacity
5. Orphaned tickets are distributed fairly
6. Deletion is logged in system

This ensures **no tickets are lost** when agents leave the system.

---

### **9. Complete Prisma Database Schema** 🗄️

**Tables:**
- **User** - Citizens and admins with roles (USER, ADMIN)
- **Agent** - Support staff with ticket capacity tracking
- **Ticket** - Service requests with status and priority
- **Service** - Available NADRA services
- **Payment** - Transaction tracking
- **TicketLog** - Activity history for tickets
- **Account** - NextAuth account linking (OAuth ready)
- **Session** - Session storage (future OAuth support)
- **VerificationToken** - Token management (future OAuth support)
- **OTP** - Email verification tokens with expiry

**Relationships:**
- User ↔ Tickets (one-to-many)
- Agent ↔ Tickets (one-to-many)
- Ticket ↔ Service (many-to-one)
- Ticket ↔ Payment (one-to-one)
- Ticket ↔ TicketLogs (one-to-many)

---

### **10. Beautiful Gradient UI Design** 🎨
Each dashboard has a unique, stunning color theme:

**User Dashboard:**
- Background: Emerald gradient (emerald-900 → green-900 → emerald-900)
- Stat cards: Emerald, blue, yellow, green gradients
- Hover effects: Scale + shadow animations

**Agent Dashboard:**
- Background: Cyan gradient (cyan-900 → blue-900 → slate-900)
- Stat cards: Slate, blue, green, yellow gradients
- Sidebar: Cyan gradient with profile avatar

**Admin Dashboard:**
- Background: Dark purple gradient (slate-900 → purple-900 → slate-900)
- Stat cards: Blue, purple, green, orange gradients
- Professional dark theme with white text

**Design Features:**
- Smooth gradient transitions
- Hover animations (scale + shadow)
- Backdrop blur effects
- Modern glassmorphism style
- Responsive grid layouts
- Consistent spacing and typography

---

## 📋 Environment Setup

Create a `.env` file with:

```env
DATABASE_URL="mysql://root:password@localhost:3306/nadradb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secure_secret_key_here"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_specific_password"
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/umerkhan-12/NADRA-APP.git
cd nadra-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory with the variables shown above.

4. **Run Prisma migrations**
```bash
npx prisma migrate dev
```

5. **Seed the database (optional)**
```bash
npx prisma db seed
```

6. **Start the development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to `http://localhost:3000`

---

## 📱 Application Routes

| Route | Role Required | Description |
|-------|---------------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Unified login page |
| `/register` | Public | User registration with OTP |
| `/USER/dashboard` | USER | Citizen dashboard |
| `/agent/dashboard` | AGENT | Agent work portal |
| `/admin/dashboard` | ADMIN | Admin control panel |
| `/api/auth/[...nextauth]` | - | NextAuth endpoints |
| `/api/tickets/*` | Authenticated | Ticket management APIs |
| `/api/admin/*` | ADMIN | Admin management APIs |
| `/api/agent/*` | AGENT | Agent data APIs |

---

## 🔒 Security Features

- **Password Hashing** with bcryptjs (10 rounds)
- **JWT-based Sessions** with 30-day expiry
- **Role-based Access Control** at route level
- **CSRF Protection** via NextAuth
- **Session Validation** on every protected route
- **Secure Password Storage** (never stored in plaintext)
- **OTP Expiry** (10 minutes for email verification)
- **Environment Variable Protection** (.env in .gitignore)

---

## 📊 Database Schema Highlights

**Key Models:**
- `User` - role (USER/ADMIN), email, password (hashed), CNIC, phone
- `Agent` - username, email, password (hashed), maxTickets, assignedTickets
- `Ticket` - status, priority, serviceType, userId, agentId
- `OTP` - email, otp, expiresAt (10-minute validity)
- `Session/Account` - NextAuth integration (OAuth ready)

---

## 🎯 Upcoming Features

- [ ] Real-time notifications with WebSockets
- [ ] Payment gateway integration
- [ ] Document upload functionality
- [ ] AI-powered chatbot for common queries
- [ ] Email notifications for ticket updates
- [ ] Advanced analytics and reporting
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] OAuth login (Google, Facebook)
- [ ] Two-factor authentication (2FA)

---

## 👥 User Roles & Permissions

### **Citizen (USER)**
✅ Create tickets  
✅ View own tickets  
✅ Track ticket status  
❌ Cannot access other users' data  
❌ Cannot modify agent assignments  

### **Agent**
✅ View assigned tickets  
✅ Update ticket status  
✅ Mark tickets as resolved/rejected  
❌ Cannot create new agents  
❌ Cannot access admin functions  

### **Admin**
✅ Full system access  
✅ Create/delete agents  
✅ View all tickets and users  
✅ Manage services and payments  
✅ Monitor system logs  

---

## 🛠️ Tech Architecture

```
nadra-system/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/        # NextAuth handlers
│   │   ├── admin/       # Admin APIs
│   │   ├── agent/       # Agent APIs
│   │   └── tickets/     # Ticket management
│   ├── admin/           # Admin dashboard
│   ├── agent/           # Agent dashboard
│   ├── USER/            # User/Citizen dashboard
│   ├── login/           # Login page
│   └── register/        # Registration page
├── components/
│   ├── ui/              # shadcn/ui components
│   └── SessionProvider.tsx
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Migration history
├── lib/
│   ├── prisma.js        # Prisma client
│   └── ticketHelper.js  # Ticket assignment logic
└── hooks/
    └── useAuth.js       # Authentication hook
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Developer

**Umer (umerkhan-12)**  
GitHub: [@umerkhan-12](https://github.com/umerkhan-12)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- NextAuth.js for authentication
- shadcn/ui for beautiful components
- Vercel for hosting capabilities

---

## 📞 Support

For support, email support@nadra-system.com or open an issue on GitHub.

---

**⭐ If you like this project, please give it a star on GitHub! ⭐**



