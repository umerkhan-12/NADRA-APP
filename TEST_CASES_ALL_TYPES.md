# NADRA Complete Test Cases (All Testing Types)

**Goal:** cover all major functionalities with **at least 2 test cases each** and include unit, integration, API, E2E, security, performance, concurrency, regression, and smoke testing.

## 1) Functionality coverage (minimum 2 each)

| Functionality | Test Case 1 | Test Case 2 |
|---|---|---|
| Authentication & Session | TC-001 | TC-002 |
| Ticket Lifecycle | TC-003 | TC-004 |
| Queue Management | TC-005 | TC-006 |
| Document Management | TC-007 | TC-008 |
| Payments & Receipts | TC-009 | TC-010 |
| Delivery Tracking | TC-011 | TC-012 |
| Agent Operations | TC-013 | TC-014 |
| Admin Operations | TC-015 | TC-016 |
| Service Catalog | TC-017 | TC-018 |
| Chatbot | TC-019 | TC-020 |
| Visitor Tracking | TC-021 | TC-022 |
| Dashboards/UI | TC-023 | TC-024 |

## 2) Detailed test cases

| ID | Type | Module | Scenario | Steps | Expected Result |
|---|---|---|---|---|---|
| TC-001 | Unit | Auth/OTP | OTP expiry logic | Create OTP with 10-minute expiry, check validity at T+9 and T+11 | Valid at T+9, invalid at T+11 |
| TC-002 | Integration | Auth | Register -> send OTP -> verify OTP -> login | Complete auth flow with valid inputs | User can log in and receives valid session |
| TC-003 | Unit | Ticket | Priority mapping function | Pass `URGENT`, `NORMAL`, invalid priority | Returns correct numeric priority, defaults safely |
| TC-004 | API Integration | Ticket | Ticket creation with auto assignment | Call `POST /api/tickets/create` with valid user/service | Ticket created, payment record created, agent assigned or left open correctly |
| TC-005 | Unit | Queue | Queue position assignment | Add ticket with known ordering context | `queuePosition` calculated correctly |
| TC-006 | Integration | Queue | Recalculate after status changes | Move one ticket to COMPLETED, recalc queue | Completed ticket removed from queue, others renumbered |
| TC-007 | Unit | Documents | File validation | Validate `.pdf`, `.jpg`, `.png`, `.exe` | Allowed types pass, invalid type rejected |
| TC-008 | API Integration | Documents | Upload document to ticket | Call `POST /api/tickets/[id]/upload-document` | File metadata saved and linked to ticket |
| TC-009 | Unit | Payments | Idempotency guard | Process same payment twice with same ticket state | First succeeds, second blocked with conflict |
| TC-010 | Integration | Payments | Online payment + receipt | Process payment then call receipt endpoint | Payment status becomes COMPLETED and receipt is generated |
| TC-011 | Unit | Delivery | Delivery state transition rules | Update `PENDING -> DISPATCHED -> IN_TRANSIT -> DELIVERED` | Valid transitions accepted; invalid transitions rejected |
| TC-012 | API Integration | Delivery | Delivery update endpoint | Call `PUT /api/delivery/[id]/update` with agent/tracking fields | Delivery data persisted and status updated |
| TC-013 | Integration | Agent | Agent "my profile" + assigned tickets | Call `/api/agent/me` and `/api/agent/[id]/tickets` as agent | Agent info and assigned tickets returned correctly |
| TC-014 | E2E | Agent Dashboard | Agent updates ticket status from UI | Login as agent and update ticket | UI reflects new status and backend persists change |
| TC-015 | Integration | Admin | Admin login and stats | Login admin then call `/api/admin/stats` | Admin authenticated and stats returned |
| TC-016 | Security | Admin | Non-admin access blocked | Access `/api/admin/*` with user/agent session | Returns 403/unauthorized |
| TC-017 | API Integration | Services | List services and required docs | Call `/api/services` and `/api/services/[id]/documents` | Service list and document requirements returned |
| TC-018 | Regression | Services | Admin create/delete service | Create service then delete it via admin routes | Service lifecycle works and list remains consistent |
| TC-019 | API Integration | Chatbot | Chat API response persistence | Call `/api/chatbot` with question and user | Response returned and log stored |
| TC-020 | Performance | Chatbot | Chat response time baseline | Send 100 standard requests | P95 latency within target threshold |
| TC-021 | API Integration | Visitor | Visitor tracking endpoint | Call `/api/visitor` with page + metadata | Visit is recorded in `VisitorCount` |
| TC-022 | Performance | Visitor | High-frequency visit logging | Send burst traffic to visitor endpoint | Endpoint stable; no data corruption |
| TC-023 | E2E | User Dashboard | User creates ticket from dashboard | Login user, create request, open dashboard | Ticket appears with correct status/queue/payment data |
| TC-024 | E2E | Admin/Agent/User UIs | Role-based routing | Login as each role and open dashboard routes | Each role only accesses allowed pages |
| TC-025 | Security | Auth | OTP brute-force protection | Submit wrong OTP repeatedly (>5 attempts) | Account/OTP blocked per policy |
| TC-026 | Security | Payments | Unauthorized payment attempt | Process payment for another user ticket | Request denied with proper status code |
| TC-027 | Security | Documents | Malicious upload filename/path | Upload file with traversal patterns (`../`) | Path traversal prevented; upload rejected/sanitized |
| TC-028 | Security | Input Validation | SQL/script injection payloads | Send payloads in auth/ticket/chat fields | Input safely handled, no execution, no server crash |
| TC-029 | Performance | Tickets | Open tickets query speed | Benchmark open-ticket query path | Avg and P95 remain under defined threshold |
| TC-030 | Performance | Payments | Payment processing latency | Benchmark payment endpoint with realistic load | Latency stable and acceptable |
| TC-031 | Concurrency | Payments | Double-submit race | Trigger two payment requests in parallel | Exactly one successful payment completion |
| TC-032 | Concurrency | Ticket Assignment | Parallel ticket creation | Create many tickets concurrently | Agent capacity not exceeded; assignments remain consistent |
| TC-033 | Smoke | Core APIs | API health smoke | Hit auth, ticket, payment, delivery endpoints | All core endpoints respond successfully |
| TC-034 | Smoke | Critical Journey | End-to-end happy path smoke | Register -> create ticket -> pay -> track delivery | Full critical journey works |
| TC-035 | Regression | Queue | Completed ticket queue cleanup | Mark ticket completed and fetch queue | `queuePosition` becomes null/removed as expected |
| TC-036 | Regression | Receipt | Receipt after COD completion | Complete COD ticket and fetch receipt | Receipt content/status remains correct |

## 3) Test type minimums satisfied

| Test Type | Cases Included |
|---|---:|
| Unit | 6 |
| Integration/API Integration | 13 |
| E2E | 3 |
| Security | 5 |
| Performance | 4 |
| Concurrency | 2 |
| Regression | 3 |
| Smoke | 2 |

## 4) Execution priority

| Priority | Cases |
|---|---|
| P0 (must run every release) | TC-002, TC-004, TC-010, TC-012, TC-016, TC-023, TC-024, TC-031, TC-034 |
| P1 (daily/CI) | TC-001, TC-003, TC-005, TC-006, TC-007, TC-008, TC-009, TC-011, TC-013, TC-015, TC-017, TC-021, TC-025, TC-026, TC-029, TC-032 |
| P2 (weekly/regression) | TC-018, TC-019, TC-020, TC-022, TC-027, TC-028, TC-030, TC-033, TC-035, TC-036 |
