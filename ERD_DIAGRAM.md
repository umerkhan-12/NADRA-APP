# ERD Diagram - NADRA E-Services System

This is a text-based representation. For the report, use a tool like dbdiagram.io or draw.io

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NADRA E-SERVICES DATABASE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│      USER            │         │       AGENT          │
├──────────────────────┤         ├──────────────────────┤
│ PK id                │         │ PK id                │
│    name              │         │    name              │
│ U  cnic              │         │ U  email             │
│ U  email             │         │ U  username          │
│    phone             │         │    password          │
│    password          │         │    maxTickets        │
│    role (ENUM)       │         │    createdAt         │
│    createdAt         │         └──────────────────────┘
└──────────────────────┘                    │
         │ 1                                │ 1
         │                                  │
         │ has many                         │ handles
         │                                  │
         │ M                                │ M
         ▼                                  ▼
┌────────────────────────────────────────────────────────┐
│                     TICKET                             │
├────────────────────────────────────────────────────────┤
│ PK  id                                                 │
│ FK  userId          ───────────┐                       │
│ FK  agentId         ───────────┼───────────┐           │
│ FK  serviceId       ───────────┼───────┐   │           │
│     servicePriority (ENUM)     │       │   │           │
│     customerPriority (ENUM)    │       │   │           │
│     finalPriority             │       │   │           │
│     queuePosition             │       │   │           │
│     status (ENUM)             │       │   │           │
│     createdAt                 │       │   │           │
│     closedAt                  │       │   │           │
└───────────────────────────────┘       │   │           │
         │ 1                             │   │           │
         │                               │   │           │
         ├─────has one──────┐            │   │           │
         │                  │            │   │           │
         │ 1                │ 1          │   │           │
         ▼                  ▼            │   │           │
┌──────────────┐    ┌──────────────┐    │   │           │
│   PAYMENT    │    │   DELIVERY   │    │   │           │
├──────────────┤    ├──────────────┤    │   │           │
│ PK id        │    │ PK id        │    │   │           │
│ FK ticketId  │    │ FK ticketId  │    │   │           │
│ FK userId    │    │    address   │    │   │           │
│    amount    │    │    city      │    │   │           │
│    status    │    │    phone     │    │   │           │
│    method    │    │    status    │    │   │           │
│    txnId     │    │    tracking# │    │   │           │
│    paidAt    │    │    agentName │    │   │           │
│    createdAt │    │    agentPhone│    │   │           │
└──────────────┘    │    estimated │    │   │           │
                    │    delivered │    │   │           │
                    │    notes     │    │   │           │
                    │    createdAt │    │   │           │
                    └──────────────┘    │   │           │
                                        │   │           │
         ┌──────────────────────────────┘   │           │
         │ M                                │           │
         │ has many                         │           │
         │                                  │           │
┌────────▼──────────────┐      ┌───────────▼───────────┐
│  UPLOADED_DOCUMENT    │      │      SERVICE          │
├───────────────────────┤      ├───────────────────────┤
│ PK id                 │      │ PK id                 │
│ FK ticketId           │      │    name               │
│    filePath           │      │    description        │
│    fileType           │      │    fee                │
│    uploadedAt         │      │    defaultPriority    │
└───────────────────────┘      └───────────────────────┘
                                         │ 1
         ┌───────────────────────────────┤
         │ M                             │ M
         │ generates                     │ requires
         │                               │
┌────────▼──────────────┐      ┌────────▼──────────────┐
│    TICKET_LOG         │      │ REQUIRED_DOCUMENT     │
├───────────────────────┤      ├───────────────────────┤
│ PK id                 │      │ PK id                 │
│ FK ticketId           │      │ FK serviceId          │
│    message            │      │    documentName       │
│    time               │      │    description        │
└───────────────────────┘      │    isMandatory        │
                               │    createdAt          │
                               └───────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│    CHATBOT_LOG       │         │        OTP           │
├──────────────────────┤         ├──────────────────────┤
│ PK id                │         │ PK id                │
│ FK userId (nullable) │         │    email             │
│    question (TEXT)   │         │    phoneNumber       │
│    response (TEXT)   │         │    code              │
│    createdAt         │         │    expireAt          │
│    isHelpful         │         │    verified          │
└──────────────────────┘         │    attempts          │
                                 │    metaData (TEXT)   │
                                 │    createdAt         │
                                 └──────────────────────┘

┌─────────────────── NEXTAUTH TABLES ─────────────────────┐
│                                                          │
│  ┌─────────────┐   ┌──────────────┐  ┌───────────────┐ │
│  │  ACCOUNT    │   │   SESSION    │  │ VERIFICATION  │ │
│  ├─────────────┤   ├──────────────┤  │    TOKEN      │ │
│  │ PK id       │   │ PK id        │  ├───────────────┤ │
│  │    userId   │   │    sessionTkn│  │    identifier │ │
│  │    type     │   │    userId    │  │    token      │ │
│  │    provider │   │    userType  │  │    expires    │ │
│  │    providerId│  │    expires   │  └───────────────┘ │
│  │    tokens..  │   └──────────────┘                    │
│  └─────────────┘                                        │
└──────────────────────────────────────────────────────────┘

LEGEND:
───────────────────────
PK  = Primary Key
FK  = Foreign Key
U   = Unique Constraint
M   = Many (in relationship)
1   = One (in relationship)
ENUM = Enumerated Type

RELATIONSHIPS:
───────────────────────
User    1 ──< M  Ticket       (One user can have many tickets)
Agent   1 ──< M  Ticket       (One agent handles many tickets)
Service 1 ──< M  Ticket       (One service has many tickets)
Service 1 ──< M  RequiredDoc  (One service requires many documents)
Ticket  1 ──  1  Payment      (One ticket has one payment)
Ticket  1 ──  1  Delivery     (One ticket has one delivery)
Ticket  1 ──< M  TicketLog    (One ticket has many logs)
Ticket  1 ──< M  UploadedDoc  (One ticket has many uploaded docs)
User    1 ──< M  Payment      (One user makes many payments)
User    1 ──< M  ChatbotLog   (One user has many chat conversations)

CASCADE DELETE:
───────────────────────
Delete Ticket    → Deletes Payment, Delivery, Logs, UploadedDocs
Delete Service   → Deletes RequiredDocuments (but NOT tickets)
Delete User/Agent → Keeps tickets (referential integrity)

INDEXES:
───────────────────────
Ticket: [status], [queuePosition], [agentId + status], [userId + createdAt]
Payment: [userId], [status]
Delivery: [status], [trackingNumber]
TicketLog: [ticketId]
UploadedDocument: [ticketId]
OTP: [email + code], [expireAt]

ENUMS:
───────────────────────
UserRole:         USER, ADMIN
TicketStatus:     OPEN, IN_PROGRESS, COMPLETED, CLOSED
Priority:         HIGH, MEDIUM, LOW
CustomerPriority: NORMAL, URGENT
PaymentStatus:    PENDING, COMPLETED
DeliveryStatus:   PENDING, DISPATCHED, IN_TRANSIT, DELIVERED, CANCELLED
```

## Priority Calculation Algorithm

```
servicePriority (from Service table):
  HIGH   = 1
  MEDIUM = 2
  LOW    = 3

customerPriority (selected by user):
  URGENT = -10 (boost)
  NORMAL = 0   (no boost)

finalPriority = servicePriority + customerPriority

Examples:
  HIGH service + URGENT customer  = 1 + (-10) = -9  (highest priority)
  HIGH service + NORMAL customer  = 1 + 0     = 1
  MEDIUM service + URGENT         = 2 + (-10) = -8
  LOW service + NORMAL            = 3 + 0     = 3   (lowest priority)

Queue sorted by: finalPriority ASC, createdAt ASC
```

## To create visual ERD:

### Option 1: dbdiagram.io (Recommended)
1. Go to https://dbdiagram.io/
2. Paste Prisma schema or use DBML syntax
3. Export as PNG/PDF

### Option 2: Draw.io
1. Go to https://app.diagrams.net/
2. Use Entity-Relationship shapes
3. Draw tables and relationships manually

### Option 3: MySQL Workbench
1. Open MySQL Workbench
2. Database → Reverse Engineer
3. Select your database
4. Generate ERD automatically
5. Export as image

### Option 4: Prisma Studio + Screenshot
1. Run: npx prisma studio
2. Open browser DevTools
3. View schema visualization
4. Take screenshot

### Quick DBML for dbdiagram.io:

```dbml
Table User {
  id int [pk, increment]
  name varchar
  cnic varchar [unique]
  email varchar [unique]
  phone varchar
  password varchar
  role UserRole
  createdAt timestamp
}

Table Agent {
  id int [pk, increment]
  name varchar
  email varchar [unique]
  username varchar [unique]
  password varchar
  maxTickets int
  createdAt timestamp
}

Table Service {
  id int [pk, increment]
  name varchar
  description text
  fee float
  defaultPriority Priority
}

Table Ticket {
  id int [pk, increment]
  userId int [ref: > User.id]
  agentId int [ref: > Agent.id]
  serviceId int [ref: > Service.id]
  servicePriority Priority
  customerPriority CustomerPriority
  finalPriority int
  queuePosition int
  status TicketStatus
  createdAt timestamp
  closedAt timestamp
}

Table Payment {
  id int [pk, increment]
  ticketId int [ref: - Ticket.id]
  userId int [ref: > User.id]
  amount float
  status PaymentStatus
  paymentMethod varchar
  transactionId varchar
  paidAt timestamp
  createdAt timestamp
}

Table Delivery {
  id int [pk, increment]
  ticketId int [ref: - Ticket.id]
  address varchar
  city varchar
  phone varchar
  status DeliveryStatus
  trackingNumber varchar
  agentName varchar
  agentPhone varchar
  estimatedDelivery timestamp
  actualDelivery timestamp
  notes text
  createdAt timestamp
}

Table RequiredDocument {
  id int [pk, increment]
  serviceId int [ref: > Service.id]
  documentName varchar
  description text
  isMandatory boolean
  createdAt timestamp
}

Table UploadedDocument {
  id int [pk, increment]
  ticketId int [ref: > Ticket.id]
  filePath varchar
  fileType varchar
  uploadedAt timestamp
}

Table TicketLog {
  id int [pk, increment]
  ticketId int [ref: > Ticket.id]
  message varchar
  time timestamp
}

Table ChatbotLog {
  id int [pk, increment]
  userId int [ref: > User.id]
  question text
  response text
  createdAt timestamp
  isHelpful boolean
}

Table OTP {
  id int [pk, increment]
  email varchar
  phoneNumber varchar
  code varchar
  expireAt timestamp
  verified boolean
  attempts int
  metaData text
  createdAt timestamp
}

Enum UserRole {
  USER
  ADMIN
}

Enum TicketStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CLOSED
}

Enum Priority {
  HIGH
  MEDIUM
  LOW
}

Enum CustomerPriority {
  NORMAL
  URGENT
}

Enum PaymentStatus {
  PENDING
  COMPLETED
}

Enum DeliveryStatus {
  PENDING
  DISPATCHED
  IN_TRANSIT
  DELIVERED
  CANCELLED
}
```

Copy the DBML code above to https://dbdiagram.io/ for instant visual ERD!
