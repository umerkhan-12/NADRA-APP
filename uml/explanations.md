# UML Diagrams Documentation - NADRA Citizen Portal

This document provides explanations for each UML diagram created for the NADRA Citizen Portal system. Each section describes the diagram type, why it's suitable for modeling the system, and what specific aspects of the system it represents.

---

## Table of Contents

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Activity Diagram](#3-activity-diagram)
4. [Sequence Diagram](#4-sequence-diagram)
5. [Collaboration Diagram](#5-collaboration-diagram)
6. [How to Render PlantUML Diagrams](#how-to-render-plantuml-diagrams)

---

## 1. Use Case Diagram

**File:** `use_case_diagram.puml`

### Why This Diagram Type is Suitable

Use case diagrams are ideal for capturing the **functional requirements** of a system from the user's perspective. For the NADRA Citizen Portal, this diagram effectively:

- **Identifies all actors** (Citizens, Agents, Admins, and external systems like Email and Payment Gateway)
- **Shows system boundaries** clearly separating what's inside the system from external entities
- **Captures all major functionalities** organized into logical modules
- **Demonstrates relationships** between actors and use cases, including include/extend relationships

### What Part of the System It Models

This diagram models the **complete functional scope** of the NADRA Citizen Portal, including:

#### Actors Represented:
| Actor | Role | Description |
|-------|------|-------------|
| **Citizen (User)** | Primary | End-users who create service requests and track their tickets |
| **Agent** | Secondary | Staff members who process tickets and manage deliveries |
| **Admin** | Administrator | System administrators who manage users, agents, and services |
| **Email System** | External | Gmail SMTP service for notifications |
| **Payment Gateway** | External | Online payment processing system |

#### Module Breakdown:
1. **Authentication Module** - Login, registration, OTP verification, logout
2. **Ticket Management Module** - Create, track, update, assign, and close tickets
3. **Payment Module** - Process payments, select methods, generate receipts
4. **Delivery Module** - Track delivery, update status, provide delivery info
5. **Administration Module** - Manage users, agents, services, and view logs

#### ECB Stereotypes Included:
- **<<boundary>>**: LoginForm, TicketCreationForm, DashboardView
- **<<control>>**: TicketController, PaymentController, AuthController
- **<<entity>>**: Ticket, TicketLog, Agent, User, Payment

---

## 2. Class Diagram

**File:** `class_diagram.puml`

### Why This Diagram Type is Suitable

Class diagrams are essential for representing the **static structure** of an object-oriented system. For this project, the class diagram:

- **Documents the data model** based on the Prisma schema
- **Shows relationships** including associations, compositions, and dependencies
- **Separates concerns** using the Entity-Control-Boundary (ECB) pattern
- **Defines interfaces** through methods and attributes for each class

### What Part of the System It Models

This diagram models the **complete object model** of the system:

#### Entity Classes (Data Layer):
| Class | Purpose | Key Attributes |
|-------|---------|----------------|
| `User` | Citizen accounts | name, email, cnic, role |
| `Agent` | Staff processing tickets | username, maxTickets |
| `Ticket` | Service requests | status, priority, queuePosition |
| `Payment` | Financial transactions | amount, status, transactionId |
| `Delivery` | Shipping information | trackingNumber, status |
| `Service` | Available services | name, fee, defaultPriority |
| `OTP` | Authentication tokens | code, expireAt, attempts |

#### Control Classes (Business Logic):
| Class | Responsibility |
|-------|----------------|
| `AuthController` | Login, registration, OTP verification |
| `TicketController` | Ticket creation, assignment, status updates |
| `PaymentController` | Payment processing, idempotency handling |
| `DeliveryController` | Delivery status management |
| `AdminController` | User and agent management |

#### Boundary Classes (UI Layer):
| Class | Interface |
|-------|-----------|
| `LoginForm` | Authentication interface |
| `TicketCreationForm` | Ticket submission interface |
| `UserDashboard` | Citizen portal view |
| `AgentDashboard` | Agent workspace |
| `AdminDashboard` | Administration panel |
| `PaymentForm` | Payment processing interface |
| `DeliveryTracker` | Delivery tracking interface |

#### Relationships:
- **Composition**: Ticket contains Payment, Delivery, TicketLog, UploadedDocument
- **Association**: User creates Tickets, Agent handles Tickets
- **Dependency**: Controllers use Entities, Boundaries use Controllers

---

## 3. Activity Diagram

**File:** `activity_diagram.puml`

### Why This Diagram Type is Suitable

Activity diagrams excel at modeling **workflow processes** and **business logic**. For the NADRA system, this diagram:

- **Shows the complete business process** from ticket creation to delivery
- **Illustrates decision points** and branching logic
- **Uses swimlanes** to show responsibility distribution among actors
- **Captures parallel activities** using fork/join nodes

### What Part of the System It Models

This diagram models the **Ticket Creation and Payment Process** - the core business workflow:

#### Swimlanes (Actors/Systems):
| Swimlane | Color | Responsibility |
|----------|-------|----------------|
| Citizen | Green | Initiates requests, makes payments |
| System | Blue | Processes data, manages queue |
| Agent | Orange | Reviews and processes tickets |
| Payment Gateway | Purple | Handles card transactions |

#### Key Process Steps:

1. **Service Selection Phase**
   - Access portal
   - Select service type
   - Choose priority (Normal/Urgent)

2. **Document Upload Phase**
   - Upload required documents
   - Validate file types
   - Check mandatory documents

3. **Delivery Information Phase**
   - Enter address details
   - Validate delivery information

4. **Ticket Processing Phase**
   - Find available agent (load balancing algorithm)
   - Calculate queue position
   - Create ticket, payment, and delivery records
   - Send confirmation email

5. **Payment Phase**
   - Select payment method (Online/COD)
   - Process card payment or defer to delivery
   - Idempotency protection against double payments

6. **Agent Processing Phase**
   - Review documents
   - Process service request
   - Update ticket status

7. **Delivery Phase**
   - Status updates: DISPATCHED → IN_TRANSIT → DELIVERED
   - Email notifications at each stage
   - Final receipt generation

#### Decision Nodes:
- Priority selection (Urgent vs Normal)
- Mandatory document check
- Address validation
- Agent availability
- Payment method selection
- Payment success/failure

---

## 4. Sequence Diagram

**File:** `sequence_diagram.puml`

### Why This Diagram Type is Suitable

Sequence diagrams are ideal for showing **time-ordered interactions** between objects. For this system, the diagram:

- **Shows the chronological flow** of the ticket creation process
- **Illustrates synchronous and asynchronous** message passing
- **Displays activation bars** showing when objects are active
- **Demonstrates the ECB pattern** in action

### What Part of the System It Models

This diagram models the **Ticket Creation Use Case** in detail:

#### Participants:
| Participant | Type | Layer |
|-------------|------|-------|
| Citizen | Actor | External |
| TicketCreationForm | Boundary | Presentation |
| TicketController | Control | Business Logic |
| PaymentController | Control | Business Logic |
| Ticket, Payment, Delivery | Entity | Data |
| Agent | Entity | Data |
| EmailService | Service | Infrastructure |
| Database | Storage | Persistence |

#### Message Sequence:

**Phase 1: Initialization**
1. Citizen accesses the ticket creation page
2. System loads available services
3. Form displays service selection options

**Phase 2: Service Selection**
1. Citizen selects service and priority
2. Document upload form is displayed
3. Documents are validated

**Phase 3: Ticket Submission**
1. Form submits ticket data to TicketController
2. Transaction begins (atomic operations)
3. Agent assignment algorithm executes
4. Priority calculation
5. Ticket, Payment, Delivery, and Log records created
6. Documents uploaded
7. Queue position calculated
8. Transaction commits
9. Email notification sent asynchronously

**Phase 4: Payment Processing**
1. Citizen selects online payment
2. Card details entered and validated
3. Idempotency check performed
4. Payment processed and transaction ID generated
5. Payment confirmation email sent

**Phase 5: Queue Tracking**
- Auto-refresh every 30 seconds
- Real-time queue position updates

#### Message Types:
- `→` : Synchronous message (waits for response)
- `→>` : Asynchronous message (fire and forget)
- `←-` : Return message

---

## 5. Collaboration Diagram

**File:** `collaboration_diagram.puml`

### Why This Diagram Type is Suitable

Collaboration diagrams (also called Communication diagrams) emphasize the **structural organization** of objects that send and receive messages. This diagram:

- **Shows object relationships** and how they're connected
- **Uses numbered messages** to show sequence within spatial organization
- **Highlights the network of objects** involved in a use case
- **Complements the sequence diagram** with a structural view

### What Part of the System It Models

This diagram models the **same Ticket Creation Use Case** as the sequence diagram, but from a structural perspective:

#### Object Instances:
| Object | Class | State/Values |
|--------|-------|--------------|
| ticketForm | TicketCreationForm | Active form |
| ticketController | TicketController | Processing |
| paymentController | PaymentController | Processing |
| :Ticket | Ticket | id=123, status=IN_PROGRESS |
| :Payment | Payment | id=456, status=PENDING |
| :Delivery | Delivery | id=789, status=PENDING |
| assignedAgent | Agent | id=2, currentTickets=3 |
| :Service | Service | id=1, fee=500.00 |

#### Message Numbering Scheme:
| Pattern | Meaning |
|---------|---------|
| 1, 2, 3 | Top-level sequence |
| 1.1, 1.2 | Sub-messages of message 1 |
| 1.1.1, 1.1.2 | Nested sub-messages |

#### Message Flow Summary:

**Phase 1 (1.x): Initialization**
- Load services and required documents

**Phase 2-3 (2.x, 3.x): Form Submission**
- Service selection, document upload, delivery info

**Phase 4 (4.x): Ticket Creation (Transaction)**
- 4.1.1: Find available agent
- 4.1.2: Calculate priority
- 4.1.3: Create ticket entity
- 4.1.4: Create payment entity
- 4.1.5: Create delivery entity
- 4.1.6: Create log entry
- 4.1.7: Create document records
- 4.1.8: Calculate queue position
- 4.2: Send email notification (async)

**Phase 5 (5.x): Payment Processing**
- 5.1.1: Check existing payment (idempotency)
- 5.2: Validate card
- 5.3: Update payment status
- 5.4: Generate transaction ID
- 5.5: Send confirmation email

**Phase 6-7 (6.x, 7.x): Post-Processing**
- Agent notification
- Queue position tracking

---

## How to Render PlantUML Diagrams

### Option 1: GitHub Integration (Recommended)
GitHub can render PlantUML files directly using the PlantUML server. You can view the diagrams by:

1. Installing a PlantUML viewer browser extension
2. Using the PlantUML GitHub Action to auto-generate images

### Option 2: PlantUML Online Server
1. Visit [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Copy the content of any `.puml` file
3. Paste and view the rendered diagram

### Option 3: VS Code Extension
1. Install the "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` to preview the diagram

### Option 4: Command Line
```bash
# Install PlantUML
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu

# Generate PNG images
plantuml uml/*.puml

# Generate SVG images
plantuml -tsvg uml/*.puml
```

### Option 5: IntelliJ IDEA / WebStorm
1. Install the PlantUML Integration plugin
2. Open `.puml` files
3. View rendered diagrams in the integrated viewer

---

## Summary

| Diagram | Purpose | Use Case Modeled |
|---------|---------|------------------|
| **Use Case** | Functional requirements | Complete system scope |
| **Class** | Static structure | Object model with ECB pattern |
| **Activity** | Business workflow | Ticket creation to delivery |
| **Sequence** | Time-ordered interactions | Ticket creation process |
| **Collaboration** | Structural organization | Ticket creation (structural view) |

All diagrams follow **UML 2.0 standards** and use the **Entity-Control-Boundary (ECB)** architectural pattern to separate:
- **Boundary classes** (UI components)
- **Control classes** (Business logic)
- **Entity classes** (Data/Domain objects)

These diagrams provide comprehensive documentation of the NADRA Citizen Portal system architecture and can be used for:
- Requirements documentation
- System design reviews
- Developer onboarding
- Milestone submissions
- Technical documentation

---

*Generated for NADRA Citizen Portal - A production-ready full-stack service management platform*
