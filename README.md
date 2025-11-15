# 🏛️ NADRA Assistance & Ticket Management System  
A modern full-stack web application built using **Next.js 16**, **Prisma ORM**, and **MySQL** to simulate a digital NADRA service center.  

The system provides **citizens**, **agents**, and **admins** with secure login access, ticket processing workflows, and automated email-based OTP verification during signup.

---

## 🚀 Tech Stack

### **Frontend**
- Next.js 16 (App Router)
- React (Client Components)
- TailwindCSS
- shadcn/ui component library
- Lucide Icons

### **Backend**
- Next.js API Routes
- Prisma ORM
- MySQL Database
- Nodemailer (Email OTP)
- bcryptjs (Password hashing)

### **Other Tools**
- Environment variables (.env)
- Prisma Migrations
- Full role-based authentication

---

## ⭐ Project Overview

The NADRA Assistance System allows citizens to create service requests (tickets).  
Agents process these tickets, and admins manage the entire system.

### The application currently includes:

### ✅ **1. User Registration with OTP Verification**  
- User enters **name, email, phone, password**  
- System sends OTP using Nodemailer  
- OTP is verified using Prisma  
- After verification, user account is created  

### OTP Process Implemented:
- Send OTP  
- Verify OTP  
- Create user only after OTP success  

---

### ✅ **2. Login System with Role Selection**  
The login page provides:

- Citizen Login  
- Agent Login  
- Admin Login  

Each role is authenticated separately:

| Role | Database Table | Use |
|------|----------------|-----|
| Citizen | `User` | Request NADRA services |
| Admin | `User` | Manage agents & services |
| Agent | `Agent` | Process tickets |

Login verifies:
- Email  
- Password  
- Role (to prevent wrong-role login)

Redirects after login:
- `/citizen/dashboard`
- `/agent/dashboard`
- `/admin/dashboard`

---

### ✅ **3. Prisma Schema (Database Setup)**
Database tables created so far:

- `User` (citizens + admins, role-based)
- `Agent`
- `Ticket`
- `TicketLog`
- `ChatbotLog` (stores AI chat responses)

### Database configured through:

```env
DATABASE_URL="mysql://root:password@localhost:3306/nadradb"
