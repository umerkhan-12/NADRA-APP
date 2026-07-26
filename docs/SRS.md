# Software Requirements Specification (SRS)

## NADRA Citizen Portal - Complete Service Management System

### IEEE 830-1998 Format

---

## Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Software Requirements Specification |
| **Project Name** | NADRA Citizen Portal |
| **Version** | 1.0 |
| **Date** | December 2025 |
| **Author** | Umer Khan |
| **Organization** | Software Engineering Project |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Process Model](#3-process-model)
4. [Project Plan](#4-project-plan)
5. [Feasibility Report](#5-feasibility-report)
6. [Specific Requirements](#6-specific-requirements)
7. [Use Case Descriptions](#7-use-case-descriptions)
8. [Analysis Models](#8-analysis-models)
9. [Working Software](#9-working-software)
10. [Appendices](#10-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the NADRA Citizen Portal system. It details the functional and non-functional requirements, system architecture, and design specifications following IEEE 830-1998 standards.

### 1.2 Scope

The NADRA Citizen Portal is a full-stack web application designed to:
- Enable citizens to request NADRA services online
- Manage service tickets through an automated queue system
- Process payments (online and cash-on-delivery)
- Track document delivery status
- Provide role-based dashboards for Citizens, Agents, and Administrators

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **NADRA** | National Database and Registration Authority |
| **CNIC** | Computerized National Identity Card |
| **OTP** | One-Time Password |
| **JWT** | JSON Web Token |
| **RBAC** | Role-Based Access Control |
| **COD** | Cash on Delivery |
| **API** | Application Programming Interface |
| **ORM** | Object-Relational Mapping |
| **SSR** | Server-Side Rendering |
| **CSR** | Client-Side Rendering |

### 1.4 References

1. IEEE Std 830-1998 - IEEE Recommended Practice for Software Requirements Specifications
2. Next.js Documentation - https://nextjs.org/docs
3. Prisma ORM Documentation - https://www.prisma.io/docs
4. NextAuth.js Documentation - https://next-auth.js.org

### 1.5 Overview

This document is organized into sections covering the system's purpose, features, constraints, assumptions, and detailed requirements. It serves as a contract between stakeholders and developers.

---

## 2. Overall Description

### 2.1 Product Perspective

The NADRA Citizen Portal is a standalone web-based system that interfaces with:
- **MySQL Database** - For data persistence
- **Gmail SMTP** - For email notifications
- **Payment Gateway** - For online payment processing

### 2.2 Product Functions

The system provides the following major functions:

1. **User Authentication**
   - Email-based registration with OTP verification
   - Secure login with JWT sessions
   - Role-based access control (USER, AGENT, ADMIN)

2. **Ticket Management**
   - Service request creation
   - Document upload and validation
   - Automated agent assignment
   - Queue position tracking

3. **Payment Processing**
   - Online card payment
   - Cash on delivery option
   - Payment verification and receipts

4. **Delivery Tracking**
   - Real-time status updates
   - Email notifications
   - Tracking number assignment

5. **Administration**
   - User management
   - Agent management
   - Service configuration
   - System monitoring

### 2.3 User Classes and Characteristics

| User Class | Description | Technical Expertise |
|------------|-------------|---------------------|
| **Citizen** | End users requesting NADRA services | Basic computer literacy |
| **Agent** | Staff processing service requests | Moderate technical skills |
| **Admin** | System administrators | Advanced technical skills |

### 2.4 Operating Environment

- **Client**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server**: Node.js 18+ runtime environment
- **Database**: MySQL 8.0+
- **Email**: Gmail SMTP service

### 2.5 Design and Implementation Constraints

1. Must use Next.js 16 framework
2. Database must be MySQL with Prisma ORM
3. Authentication via NextAuth.js
4. Responsive design for mobile devices
5. HTTPS for all communications

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have valid email addresses
- Stable internet connectivity
- Valid CNIC for registration

**Dependencies:**
- Gmail SMTP service availability
- MySQL database server uptime
- Payment gateway integration

---

## 3. Process Model

### 3.1 Development Methodology: Agile Scrum

The NADRA Citizen Portal was developed using **Agile Scrum** methodology with the following characteristics:

#### 3.1.1 Sprint Structure
- **Sprint Duration**: 2 weeks
- **Daily Standups**: 15-minute daily meetings
- **Sprint Review**: End of each sprint
- **Retrospective**: Continuous improvement

#### 3.1.2 Development Phases

```
Phase 1: Planning & Requirements (Week 1-2)
├── Stakeholder interviews
├── Requirements gathering
├── User story creation
└── Sprint backlog prioritization

Phase 2: Design (Week 3-4)
├── Database schema design
├── UI/UX wireframes
├── Architecture design
└── API specification

Phase 3: Development Sprints (Week 5-12)
├── Sprint 1: Authentication module
├── Sprint 2: Ticket management
├── Sprint 3: Payment processing
├── Sprint 4: Delivery tracking
└── Sprint 5: Admin dashboard

Phase 4: Testing & Deployment (Week 13-14)
├── Integration testing
├── User acceptance testing
├── Performance optimization
└── Production deployment
```

#### 3.1.3 Agile Practices Implemented

| Practice | Implementation |
|----------|----------------|
| **User Stories** | Requirements documented as user stories |
| **Sprint Planning** | Bi-weekly planning sessions |
| **Continuous Integration** | Automated builds on each commit |
| **Code Review** | Peer review for all pull requests |
| **Refactoring** | Continuous code improvement |

### 3.2 Version Control Strategy

- **Main Branch**: Production-ready code
- **Development Branch**: Integration branch
- **Feature Branches**: Individual feature development
- **Commit Convention**: Conventional commits (feat, fix, docs)

---

## 4. Project Plan

### 4.1 Work Breakdown Structure (WBS)

```
1. NADRA Citizen Portal
├── 1.1 Project Management
│   ├── 1.1.1 Project Planning
│   ├── 1.1.2 Risk Management
│   └── 1.1.3 Progress Monitoring
│
├── 1.2 Requirements Analysis
│   ├── 1.2.1 Stakeholder Analysis
│   ├── 1.2.2 Functional Requirements
│   └── 1.2.3 Non-Functional Requirements
│
├── 1.3 System Design
│   ├── 1.3.1 Database Design
│   ├── 1.3.2 Architecture Design
│   ├── 1.3.3 UI/UX Design
│   └── 1.3.4 API Design
│
├── 1.4 Implementation
│   ├── 1.4.1 Frontend Development
│   ├── 1.4.2 Backend Development
│   ├── 1.4.3 Database Implementation
│   └── 1.4.4 Integration
│
├── 1.5 Testing
│   ├── 1.5.1 Unit Testing
│   ├── 1.5.2 Integration Testing
│   └── 1.5.3 User Acceptance Testing
│
└── 1.6 Deployment
    ├── 1.6.1 Environment Setup
    ├── 1.6.2 Production Deployment
    └── 1.6.3 Documentation
```

### 4.2 Project Timeline (Gantt Chart Representation)

| Task | Week 1-2 | Week 3-4 | Week 5-6 | Week 7-8 | Week 9-10 | Week 11-12 | Week 13-14 |
|------|----------|----------|----------|----------|-----------|------------|------------|
| Requirements | ████████ | | | | | | |
| Design | | ████████ | | | | | |
| Authentication | | | ████████ | | | | |
| Tickets | | | | ████████ | | | |
| Payments | | | | | ████████ | | |
| Delivery | | | | | | ████████ | |
| Testing/Deploy | | | | | | | ████████ |

### 4.3 Resource Allocation

| Resource | Role | Allocation |
|----------|------|------------|
| Developer 1 | Full-Stack Developer | 100% |
| Database | MySQL Server | Shared |
| Email Service | Gmail SMTP | Shared |

### 4.4 Milestones

| Milestone | Description | Target Date |
|-----------|-------------|-------------|
| M1 | Requirements Complete | Week 2 |
| M2 | Design Complete | Week 4 |
| M3 | Core Features Complete | Week 10 |
| M4 | Testing Complete | Week 13 |
| M5 | Production Deployment | Week 14 |

---

## 5. Feasibility Report

### 5.1 Technical Feasibility

#### 5.1.1 Technology Assessment

| Technology | Maturity | Community Support | Risk Level |
|------------|----------|-------------------|------------|
| Next.js 16 | Stable | Excellent | Low |
| React 19 | Stable | Excellent | Low |
| Prisma ORM | Stable | Good | Low |
| MySQL 8.0 | Mature | Excellent | Very Low |
| NextAuth.js | Stable | Good | Low |
| TailwindCSS | Stable | Excellent | Low |

#### 5.1.2 Technical Requirements Met

✅ Modern web framework with SSR/CSR support
✅ Type-safe database operations
✅ Secure authentication system
✅ Responsive UI framework
✅ Email integration capability
✅ Payment gateway integration ready

**Technical Feasibility: APPROVED**

### 5.2 Economic Feasibility

#### 5.2.1 Development Costs

| Item | Cost (PKR) |
|------|------------|
| Developer (14 weeks) | 280,000 |
| Cloud Hosting (Annual) | 50,000 |
| Domain & SSL | 10,000 |
| Email Service | 5,000 |
| Contingency (10%) | 34,500 |
| **Total** | **379,500** |

#### 5.2.2 Operational Costs (Annual)

| Item | Cost (PKR) |
|------|------------|
| Hosting | 50,000 |
| Maintenance | 100,000 |
| Support | 50,000 |
| **Total Annual** | **200,000** |

#### 5.2.3 Benefits

- Reduced manual processing time by 70%
- 24/7 service availability
- Automated queue management
- Real-time tracking capability
- Reduced operational errors

**Economic Feasibility: APPROVED**

### 5.3 Operational Feasibility

#### 5.3.1 User Acceptance Factors

| Factor | Assessment |
|--------|------------|
| Ease of Use | Intuitive interface design |
| Training Required | Minimal (1-2 hours) |
| Process Change | Moderate adaptation needed |
| User Resistance | Low expected |

#### 5.3.2 Organizational Impact

- Streamlined service delivery
- Improved citizen satisfaction
- Better resource utilization
- Enhanced transparency

**Operational Feasibility: APPROVED**

### 5.4 Schedule Feasibility

| Constraint | Assessment |
|------------|------------|
| Timeline | 14 weeks - Achievable |
| Resources | Single developer - Adequate |
| Dependencies | External services - Available |

**Schedule Feasibility: APPROVED**

### 5.5 Feasibility Conclusion

| Aspect | Status |
|--------|--------|
| Technical | ✅ Feasible |
| Economic | ✅ Feasible |
| Operational | ✅ Feasible |
| Schedule | ✅ Feasible |

**OVERALL PROJECT FEASIBILITY: APPROVED**

---

## 6. Specific Requirements

### 6.1 Functional Requirements

#### 6.1.1 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-001 | System shall allow user registration with email, CNIC, phone, and password | High |
| FR-AUTH-002 | System shall send 6-digit OTP to user's email for verification | High |
| FR-AUTH-003 | OTP shall expire after 10 minutes | High |
| FR-AUTH-004 | System shall limit OTP requests to 3 per 15 minutes | Medium |
| FR-AUTH-005 | System shall lock account after 5 failed OTP attempts | Medium |
| FR-AUTH-006 | System shall support role-based login (USER, AGENT, ADMIN) | High |
| FR-AUTH-007 | Agent login shall use username instead of email | Medium |
| FR-AUTH-008 | System shall maintain JWT sessions for 30 days | Medium |

#### 6.1.2 Ticket Management Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TKT-001 | Users shall be able to create service tickets | High |
| FR-TKT-002 | Users shall select service type and priority | High |
| FR-TKT-003 | System shall allow document upload (PDF, JPG, PNG) | High |
| FR-TKT-004 | System shall automatically assign tickets to agents | High |
| FR-TKT-005 | System shall calculate queue position based on priority | High |
| FR-TKT-006 | Users shall view real-time queue position | Medium |
| FR-TKT-007 | Queue position shall refresh every 30 seconds | Medium |
| FR-TKT-008 | Agents shall update ticket status | High |
| FR-TKT-009 | System shall log all ticket status changes | Medium |

#### 6.1.3 Payment Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PAY-001 | System shall support online card payment | High |
| FR-PAY-002 | System shall support cash on delivery | High |
| FR-PAY-003 | System shall validate card details (16 digits, CVV, expiry) | High |
| FR-PAY-004 | System shall prevent duplicate payments (idempotency) | High |
| FR-PAY-005 | System shall generate transaction IDs | Medium |
| FR-PAY-006 | Users shall download/print payment receipts | Medium |
| FR-PAY-007 | System shall send payment confirmation emails | Medium |

#### 6.1.4 Delivery Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DEL-001 | Users shall provide delivery address | High |
| FR-DEL-002 | System shall track delivery status (PENDING, DISPATCHED, IN_TRANSIT, DELIVERED) | High |
| FR-DEL-003 | Agents shall assign tracking numbers | Medium |
| FR-DEL-004 | System shall send email notifications on status change | Medium |
| FR-DEL-005 | Users shall view delivery timeline | Medium |

#### 6.1.5 Administration Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADM-001 | Admin shall create/delete agent accounts | High |
| FR-ADM-002 | Admin shall view all system users | High |
| FR-ADM-003 | Admin shall manage services | High |
| FR-ADM-004 | Admin shall view system statistics | Medium |
| FR-ADM-005 | Admin shall access system logs | Medium |
| FR-ADM-006 | Admin shall manually assign tickets | Low |

### 6.2 Non-Functional Requirements

#### 6.2.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| NFR-PERF-001 | Page load time shall be < 3 seconds |
| NFR-PERF-002 | API response time shall be < 500ms |
| NFR-PERF-003 | System shall support 100 concurrent users |
| NFR-PERF-004 | Database queries shall be optimized with indexes |

#### 6.2.2 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | Passwords shall be hashed using bcrypt (10 rounds) |
| NFR-SEC-002 | All communications shall use HTTPS |
| NFR-SEC-003 | JWT tokens shall be stored in HTTP-only cookies |
| NFR-SEC-004 | SQL injection shall be prevented via Prisma ORM |
| NFR-SEC-005 | CSRF protection shall be enabled |

#### 6.2.3 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-USE-001 | Interface shall be responsive (mobile, tablet, desktop) |
| NFR-USE-002 | Error messages shall be user-friendly |
| NFR-USE-003 | Loading states shall be displayed during operations |
| NFR-USE-004 | Role-specific color themes shall be implemented |

#### 6.2.4 Reliability Requirements

| ID | Requirement |
|----|-------------|
| NFR-REL-001 | System availability shall be 99.5% |
| NFR-REL-002 | Database transactions shall ensure data consistency |
| NFR-REL-003 | Failed operations shall not corrupt data |

---

## 7. Use Case Descriptions

### 7.1 UC-001: User Registration

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-001 |
| **Use Case Name** | User Registration |
| **Actor** | Citizen |
| **Description** | A new user registers for an account on the NADRA Citizen Portal |
| **Preconditions** | User has valid email, CNIC, and phone number |
| **Postconditions** | User account is created and user is logged in |

**Main Flow:**
1. User accesses registration page
2. User enters personal details (name, email, phone, CNIC, password)
3. System validates input fields
4. System checks if email already exists
5. System generates 6-digit OTP
6. System sends OTP to user's email
7. User enters OTP
8. System verifies OTP
9. System creates user account
10. System logs user in and redirects to dashboard

**Alternative Flows:**
- **A1**: Email already exists → Show error, prompt for different email
- **A2**: Invalid OTP → Increment attempt counter, allow retry
- **A3**: Max attempts exceeded → Lock registration, require new OTP

**Exception Flows:**
- **E1**: Email service unavailable → Show error, allow retry later
- **E2**: Database error → Show error, log incident

---

### 7.2 UC-002: User Login

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-002 |
| **Use Case Name** | User Login |
| **Actor** | Citizen, Agent, Admin |
| **Description** | User authenticates to access the system |
| **Preconditions** | User has registered account |
| **Postconditions** | User session is created |

**Main Flow:**
1. User accesses login page
2. User enters credentials (email/username and password)
3. System validates credentials
4. System creates JWT session
5. System redirects to role-appropriate dashboard

**Alternative Flows:**
- **A1**: Invalid credentials → Show error, allow retry
- **A2**: Account locked → Show locked message, contact admin

---

### 7.3 UC-003: Create Service Ticket

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-003 |
| **Use Case Name** | Create Service Ticket |
| **Actor** | Citizen |
| **Description** | User creates a new service request |
| **Preconditions** | User is logged in |
| **Postconditions** | Ticket is created and assigned to agent |

**Main Flow:**
1. User navigates to create ticket
2. System displays available services
3. User selects service type
4. User selects priority (NORMAL/URGENT)
5. User uploads required documents
6. User enters delivery information
7. User submits ticket
8. System validates all inputs
9. System assigns available agent
10. System creates ticket, payment, and delivery records
11. System calculates queue position
12. System sends confirmation email
13. System displays ticket summary

**Alternative Flows:**
- **A1**: No agent available → Set status to OPEN, add to waiting queue
- **A2**: Missing documents → Prompt for required documents
- **A3**: Invalid file type → Show error, request valid format

---

### 7.4 UC-004: Process Payment

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-004 |
| **Use Case Name** | Process Payment |
| **Actor** | Citizen |
| **Description** | User pays for service ticket |
| **Preconditions** | Ticket is created with pending payment |
| **Postconditions** | Payment is completed or COD is selected |

**Main Flow (Online Payment):**
1. User views ticket with payment pending
2. User selects online payment
3. System displays card input form
4. User enters card details (number, CVV, expiry)
5. System validates card format
6. System checks for duplicate payment (idempotency)
7. System processes payment with gateway
8. System generates transaction ID
9. System updates payment status to COMPLETED
10. System sends payment confirmation email
11. System displays receipt

**Alternative Flows:**
- **A1**: COD selected → Set payment method, keep status PENDING
- **A2**: Card validation fails → Show error, allow correction
- **A3**: Payment gateway error → Show error, allow retry

---

### 7.5 UC-005: Track Delivery

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-005 |
| **Use Case Name** | Track Delivery |
| **Actor** | Citizen |
| **Description** | User tracks delivery status of their documents |
| **Preconditions** | Ticket is completed, delivery initiated |
| **Postconditions** | User views current delivery status |

**Main Flow:**
1. User navigates to delivery tracking
2. System displays delivery timeline
3. System shows current status and details
4. System displays tracking number (if assigned)
5. System shows estimated delivery date
6. System displays delivery agent information

---

### 7.6 UC-006: Agent Process Ticket

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-006 |
| **Use Case Name** | Agent Process Ticket |
| **Actor** | Agent |
| **Description** | Agent processes assigned service ticket |
| **Preconditions** | Agent is logged in, has assigned tickets |
| **Postconditions** | Ticket status is updated |

**Main Flow:**
1. Agent views dashboard with assigned tickets
2. Agent selects ticket to process
3. Agent reviews ticket details and documents
4. Agent updates status to IN_PROGRESS
5. Agent completes required actions
6. Agent marks ticket as COMPLETED
7. System updates payment status (if COD)
8. System recalculates queue positions
9. System auto-assigns next waiting ticket
10. System sends completion notification to user

---

### 7.7 UC-007: Update Delivery Status

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-007 |
| **Use Case Name** | Update Delivery Status |
| **Actor** | Agent |
| **Description** | Agent updates delivery status for completed ticket |
| **Preconditions** | Ticket is completed |
| **Postconditions** | Delivery status is updated, user notified |

**Main Flow:**
1. Agent accesses delivery section
2. Agent selects delivery status (DISPATCHED/IN_TRANSIT/DELIVERED)
3. Agent enters tracking number
4. Agent enters delivery agent details
5. Agent sets estimated delivery date
6. System updates delivery record
7. System sends notification email to user

---

### 7.8 UC-008: Admin Manage Agents

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC-008 |
| **Use Case Name** | Admin Manage Agents |
| **Actor** | Admin |
| **Description** | Administrator manages agent accounts |
| **Preconditions** | Admin is logged in |
| **Postconditions** | Agent account is created/deleted |

**Main Flow (Create Agent):**
1. Admin navigates to agent management
2. Admin clicks create new agent
3. Admin enters agent details (name, email, username, password, max tickets)
4. System validates input
5. System creates agent account
6. System sends credentials email to agent

**Alternative Flow (Delete Agent):**
1. Admin selects agent to delete
2. System checks for assigned tickets
3. System reassigns tickets to other agents
4. System deletes agent account

---

## 8. Analysis Models

### 8.1 Deployment Diagram

The deployment diagram shows the physical architecture of the system:

![Deployment Diagram](../uml/deployment_diagram.png)

**Components:**
- **Client Tier**: Web browsers (desktop/mobile) running React components
- **Application Tier**: Next.js server with API routes and business logic
- **Data Tier**: Prisma ORM connecting to MySQL database
- **External Services**: Gmail SMTP and Payment Gateway

---

### 8.2 Use Case Diagram

The use case diagram shows system functionality from user perspective:

![Use Case Diagram](../uml/use_case_diagram.png)

**Actors:**
- Citizen (Primary user)
- Agent (Staff)
- Admin (Administrator)
- Email System (External)
- Payment Gateway (External)

**ECB Classes:**
- **Entity**: User, Agent, Ticket, Payment, Delivery, Service
- **Control**: AuthController, TicketController, PaymentController, DeliveryController
- **Boundary**: LoginForm, TicketCreationForm, PaymentForm, Dashboards

---

### 8.3 Class Diagram

The class diagram shows the static structure of the system:

![Class Diagram](../uml/class_diagram.png)

**Entity Classes:**
- User, Agent, Service, Ticket, Payment, Delivery, TicketLog, UploadedDocument

**Control Classes:**
- AuthController, TicketController, PaymentController, DeliveryController, AdminController

**Boundary Classes:**
- LoginForm, RegistrationForm, TicketCreationForm, PaymentForm, UserDashboard, AgentDashboard, AdminDashboard

---

### 8.4 Activity Diagrams

Activity diagrams model system workflows:

#### 8.4.1 Ticket Creation & Payment
![Activity Diagram - Ticket Creation](../uml/activity_diagram.png)

#### 8.4.2 User Registration
![Activity Diagram - Registration](../uml/activity_diagram_registration.png)

#### 8.4.3 Payment Processing
![Activity Diagram - Payment](../uml/activity_diagram_payment.png)

#### 8.4.4 Delivery Tracking
![Activity Diagram - Delivery](../uml/activity_diagram_delivery.png)

---

### 8.5 Sequence Diagrams

Sequence diagrams show time-ordered interactions:

#### 8.5.1 Ticket Creation
![Sequence Diagram - Ticket Creation](../uml/sequence_diagram.png)

#### 8.5.2 User Registration
![Sequence Diagram - Registration](../uml/sequence_diagram_registration.png)

#### 8.5.3 Payment Processing
![Sequence Diagram - Payment](../uml/sequence_diagram_payment.png)

#### 8.5.4 Agent Ticket Processing
![Sequence Diagram - Agent](../uml/sequence_diagram_agent.png)

---

### 8.6 Collaboration Diagrams

Collaboration diagrams show object relationships:

#### 8.6.1 Ticket Creation
![Collaboration Diagram - Ticket](../uml/collaboration_diagram.png)

#### 8.6.2 User Registration
![Collaboration Diagram - Registration](../uml/collaboration_diagram_registration.png)

#### 8.6.3 Payment Processing
![Collaboration Diagram - Payment](../uml/collaboration_diagram_payment.png)

#### 8.6.4 Delivery Update
![Collaboration Diagram - Delivery](../uml/collaboration_diagram_delivery.png)

#### 8.6.5 Agent Ticket Processing
![Collaboration Diagram - Agent](../uml/collaboration_diagram_agent.png)

#### 8.6.6 Admin User Management
![Collaboration Diagram - Admin](../uml/collaboration_diagram_admin.png)

---

## 9. Working Software

### 9.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.0.1 |
| Frontend | React | 19.2.0 |
| Styling | TailwindCSS | 4.0 |
| Components | shadcn/ui | Latest |
| Backend | Next.js API Routes | - |
| Authentication | NextAuth.js | 4.24.13 |
| ORM | Prisma | 6.19.0 |
| Database | MySQL | 8.0 |
| Email | Nodemailer | Latest |

### 9.2 Installation Instructions

```bash
# 1. Clone repository
git clone https://github.com/umerkhan-12/NADRA-APP.git
cd NADRA-APP

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database and email credentials

# 4. Setup database
npx prisma db push
npx prisma generate

# 5. Run development server
npm run dev

# 6. Access application
# Open http://localhost:3000
```

### 9.3 Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/nadradb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 9.4 Database Schema

The database schema is defined in `prisma/schema.prisma` and includes:

- **User**: Citizen accounts
- **Agent**: Staff accounts
- **Service**: Available NADRA services
- **Ticket**: Service requests
- **Payment**: Financial transactions
- **Delivery**: Shipping information
- **TicketLog**: Audit trail
- **UploadedDocument**: User documents
- **RequiredDocument**: Service requirements
- **OTP**: Verification codes
- **Session**: User sessions

### 9.5 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp-sms | Send OTP for registration |
| POST | /api/auth/verify-otp-sms | Verify OTP and create account |
| POST | /api/auth/[...nextauth] | NextAuth authentication |
| POST | /api/tickets/create | Create new ticket |
| GET | /api/tickets/[id] | Get ticket details |
| PATCH | /api/tickets/update/[id] | Update ticket status |
| POST | /api/payments/process | Process payment |
| PATCH | /api/delivery/[id]/update | Update delivery status |
| GET | /api/admin/users | Get all users |
| POST | /api/admin/agents | Create agent |
| DELETE | /api/admin/agents/[id] | Delete agent |

---

## 10. Appendices

### 10.1 Glossary

| Term | Definition |
|------|------------|
| Ticket | A service request created by a citizen |
| Queue Position | The position of a ticket in the processing queue |
| Priority | Service urgency level (NORMAL or URGENT) |
| OTP | One-time password sent via email for verification |
| Transaction ID | Unique identifier for payment transactions |

### 10.2 File Structure

```
NADRA-APP/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── USER/              # User pages
│   ├── agent/             # Agent pages
│   ├── admin/             # Admin pages
│   └── components/        # React components
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── uml/                   # UML diagrams
│   ├── *.puml            # PlantUML source files
│   └── *.png             # Rendered diagrams
└── docs/
    └── SRS.md            # This document
```

### 10.3 Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 2025 | Umer Khan | Initial release |

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Quality Assurance | | | |
| Client Representative | | | |

---

**End of Software Requirements Specification**

*NADRA Citizen Portal - IEEE 830-1998 Compliant SRS Document*
