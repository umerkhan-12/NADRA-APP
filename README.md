
git clone https://github.com/umerkhan-12/NADRA-APP.git
# 🏛️ NADRA Citizen Portal — Service Management

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/) [![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

Includes `mpv` as a bundled software product (media playback/demo tooling) alongside the web platform.

A concise, production-focused service management platform for citizens, agents and admins. Key emphasis: reliable authentication, robust database design, transactional operations, and efficient dashboards.

---

## Quick Highlights

- Authentication: Email OTP (rate limited), NextAuth JWT sessions, role-based access
- Ticketing: Priority-based queue, atomic agent assignment, real-time position updates
- Payments: Online (simulated) and COD with transaction-based idempotency
- Delivery: Tracking states, agent assignment, email notifications
- Database: Prisma + MySQL with targeted indexes and cascade deletes
- Security: OTP attempt limits, input validation, bcrypt password hashing

---

## Tech Stack (short)

- Frontend: Next.js 16, React 19, TailwindCSS
- Backend: Next.js API routes, NextAuth, Prisma 6.19, MySQL
- Email: Nodemailer (Gmail SMTP for dev)
- Utilities: bcryptjs, Prisma Studio, ESLint

---

## Quick Start

1. Clone:
```powershell
git clone https://github.com/umerkhan-12/NADRA-APP.git
cd nadra-system
```
2. Install:
```powershell
npm install
```
3. Create `.env` (example):
```env
DATABASE_URL="mysql://root:password@localhost:3306/nadradb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secure_secret"
EMAIL_USER="you@gmail.com"
EMAIL_PASS="app_password"
```
4. Push schema & generate client:
```powershell
npx prisma db push
npx prisma generate
```
5. Run dev server:
```powershell
npm run dev
```

---

## Database & Integrity (summary)

- Targeted indexes added for Tickets, OTP, Payments, Delivery to improve query performance.
- Cascade deletes on dependent records (TicketLog, UploadedDocument, Payment, Delivery) to avoid orphans.
- Transactions used for agent assignment, queue recalculation, payment processing and ticket creation to prevent race conditions.
- OTP model includes `attempts` and expiry to enforce rate/attempt limits.

---

## Security & Performance (short)

- OTP: 6-digit, 10-minute expiry, max 3 sends / 15 minutes, max 5 verification attempts.
- Payments: Transactional idempotency — duplicate requests return 409.
- Queries: Replaced broad `include` with selective `select` for dashboards to cut payloads and remove N+1 patterns.

---

## Key API Endpoints (examples)

- `POST /api/auth/send-otp-sms` — send OTP to email (rate limited)
- `POST /api/auth/verify-otp-sms` — verify OTP and create user (attempt-limited)
- `POST /api/tickets/create` — create ticket (atomic assignment)
- `POST /api/payments/process` — process payment (idempotent)
- `PATCH /api/delivery/[id]/update` — update delivery status

Refer to `app/api/*` for full endpoint details.

---

## Contributing

1. Fork → branch → implement → PR.
2. Use conventional commit messages and include tests/documentation for substantial changes.

---

## License

MIT — see `LICENSE`.

---

## Author

Umer Khan — full-stack & database engineer. GitHub: @umerkhan-12

**Last Updated:** November 22, 2025



