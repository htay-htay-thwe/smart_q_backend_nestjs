# Smart Queue Backend API (NestJS)

A production-ready RESTful backend and WebSocket server powering the Smart Queue system — a digital queue and table-flow management platform for restaurants, clinics, and any service business. Built to eliminate manual queue handling by automating customer flow, real-time table tracking, OTP-verified onboarding, and time-sensitive push notification delivery.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Modules & Endpoints](#api-modules--endpoints)
- [Real-Time System](#real-time-system)
- [Notification Engine](#notification-engine)
- [Authentication Flow](#authentication-flow)
- [Database Collections](#database-collections)
- [Deployment](#deployment)

---

## Overview

Smart Queue Backend serves as the single source of truth for all queue operations, table states, user accounts, and business analytics. It is consumed by two clients:

- **Staff Web App** — a Next.js dashboard used by shop staff to manage queues and tables
- **Customer Mobile App** — used by customers to join queues and receive wait-time alerts

The backend exposes REST endpoints for all CRUD operations and a Socket.IO gateway for real-time events, backed by a MongoDB database and integrated with Cloudinary, SendGrid, Twilio, and Firebase for media, email, SMS, and push notifications.

---

## Key Features

| Feature | Description |
|---|---|
| OTP-Verified Onboarding | 6-digit OTP sent via email (SendGrid) or phone (Twilio) with 5-minute expiry for both shop and customer registration |
| JWT Authentication | Stateless JWT tokens issued on login for both shop partners and customers, validated by a global guard |
| Queue Lifecycle Management | Full state machine: `waiting` → `Ready to seat` → `qr-scanned` → `seated` → `finished` with auto-promotion on table free |
| Wait-Time Estimation | Automatically calculates estimated wait time based on table capacity and number of customers ahead |
| Real-Time WebSocket Events | Socket.IO gateway emits `newCustomerQueue` and `freeTable` events to all connected staff dashboards instantly |
| Time-Threshold Push Notifications | Cron job fires every minute; sends FCM push at 20, 10, and 5-minute remaining thresholds — each threshold fires once only |
| Table Status Tracking | Active `TableStatus` records track every occupied table; freed when a customer is marked as finished |
| MongoDB Transactions | Critical `freeTable` flow uses MongoDB sessions and transactions to guarantee data consistency |
| Queue History | Completed queues are archived to `QueueHistory` for reporting and analytics |
| Business Analytics | Aggregation pipelines expose top customers by visit count and monthly finished-queue trends |
| Image Upload | Profile photos and shop images are uploaded to Cloudinary via stream upload |
| Profile Management | Both shops and customers can update name, email, phone, address, password, and profile image — all OTP-gated where required |

---

## Tech Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| NestJS | ^11.0 | Backend framework with modular architecture |
| TypeScript | ^5.7 | Static typing across the entire codebase |
| Node.js | v18+ | Runtime environment |
| MongoDB | via Mongoose ^9.2 | Primary database with ODM |

### Auth & Security

| Technology | Purpose |
|---|---|
| @nestjs/jwt + passport-jwt | JWT generation, signing, and route-level guard validation |
| bcrypt | Password hashing with salt rounds |
| cookie-parser | HTTP-only cookie support for token storage |

### Real-Time & Scheduling

| Technology | Purpose |
|---|---|
| @nestjs/websockets + Socket.IO | WebSocket gateway for live queue and table events |
| @nestjs/schedule | Cron-based background job for wait-time notification checks |

### Integrations

| Technology | Purpose |
|---|---|
| Firebase Admin SDK | FCM push notifications to customer mobile devices |
| SendGrid | Transactional OTP emails |
| Twilio | SMS OTP delivery |
| Cloudinary | Cloud image upload and storage |

### Validation & Utilities

| Technology | Purpose |
|---|---|
| class-validator + class-transformer | DTO-level request validation |
| uuid | Unique identifier generation |
| multer | Multipart form-data handling for file uploads |

---

## System Architecture

```
+-----------------------------------------------------------+
|              Client Apps                                  |
|                                                           |
|  +---------------------+   +-------------------------+   |
|  | Staff Web (Next.js) |   | Customer Mobile App     |   |
|  +----------+----------+   +-----------+-------------+   |
|             |                          |                  |
+-------------|--------------------------|------------------+
              |                          |
              |  REST (Axios / Fetch)    |  Socket.IO
              |                          |
+-------------|--------------------------|------------------+
|             v                          v                  |
|  +---------------------+   +-------------------------+   |
|  |  REST API Layer     |   |  WebSocket Gateway      |   |
|  |  (Controllers)      |   |  (QueueGateway)         |   |
|  +----------+----------+   +-----------+-------------+   |
|             |                          |                  |
|  +----------+--------------------------+-------------+   |
|  |           Service & Business Logic Layer          |   |
|  |  ShopsService | QueuesService | CustomersService  |   |
|  |  OtpService   | AuthService   | NotificationSvc   |   |
|  +----------------------+----------------------------+   |
|                         |                                 |
|  +-----------+  +-------+-------+  +----------------+   |
|  | MongoDB   |  | Firebase FCM  |  | Cloudinary /   |   |
|  | (Mongoose)|  | (Push Notif.) |  | SendGrid/Twilio|   |
|  +-----------+  +---------------+  +----------------+   |
|                                                           |
|                  NestJS Application                       |
+-----------------------------------------------------------+
```

---

## Project Structure

```
smart_q_backend_nestjs/
├── src/
│   ├── main.ts                        # Bootstrap: CORS, cookie-parser, port
│   ├── app.module.ts                  # Root module wiring all feature modules
│   │
│   ├── auth/                          # JWT strategy, guard, token service
│   ├── otp/                           # OTP generation, email/phone send & verify
│   ├── email/                         # SendGrid email service
│   ├── phone/                         # Twilio SMS service
│   ├── firebase/                      # Firebase Admin SDK + FCM push sender
│   ├── cloudinary/                    # Cloudinary image upload service
│   │
│   ├── shop/                          # Shop partner domain
│   │   ├── shops.controller.ts        # /api/shops routes
│   │   ├── shops.service.ts           # Registration, login, profile, analytics
│   │   └── dtos/                      # ShopInformation, Login, ChangeShop DTOs
│   │
│   ├── customer/                      # Customer domain
│   │   ├── customers.controller.ts    # /api/customers routes
│   │   ├── customers.service.ts       # Registration, login, profile, FCM token
│   │   └── dtos/                      # CustomerInformation, Login, OTP DTOs
│   │
│   ├── queue/                         # Queue domain (core business logic)
│   │   ├── queues.controller.ts       # /api/queues routes
│   │   ├── queues.service.ts          # Full queue lifecycle & table management
│   │   ├── queue.gateway.ts           # Socket.IO WebSocket gateway
│   │   ├── queue-notification.service.ts  # Cron job: FCM push at wait thresholds
│   │   └── dtos/                      # QueueData, AssignTable, GenerateQr DTOs
│   │
│   ├── shop-types/                    # Shop category management
│   ├── table-types/                   # Table type & capacity management
│   │
│   └── schemas/                       # Mongoose schema definitions
│       ├── Shops.schema.ts
│       ├── Customers.schema.ts
│       ├── Queues.schema.ts
│       ├── QueueHistory.schema.ts
│       ├── TableStatus.schema.ts
│       ├── TableTypes.schema.ts
│       ├── ShopTypes.schema.ts
│       └── Otp.schema.ts
│
├── test/                              # e2e test setup
├── example.env                        # Environment variable reference
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9+
- MongoDB instance (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd smart_q_backend_nestjs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp example.env .env

# 4. Start the development server
npm run start:dev
```

The API will be available at `http://localhost:4000`.

---

## Environment Variables

Create a `.env` file at the project root using `example.env` as reference:

```env
PORT=4000
MONGODB_URI=
NODE_ENV=development

# Cloudinary (image uploads)
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

# SendGrid (email OTP)
SENDGRID_API_KEY=
SENDGRID_SENDER_EMAIL=

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# JWT
JWT_SECRET=

# Firebase Admin SDK (FCM push notifications)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start with hot-reload in development mode |
| `npm run start` | Start from compiled `dist/` |
| `npm run start:prod` | Production start from `dist/main.js` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run test` | Run unit tests with Jest |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage report |

---

## API Modules & Endpoints

### Shops — `/api/shops`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new shop partner (OTP-verified) |
| POST | `/login` | Shop login — returns JWT |
| GET | `/all` | Retrieve all registered shops |
| POST | `/send-email-otp` | Send OTP to shop email |
| POST | `/verify-email-otp` | Verify shop email OTP |
| POST | `/send-phone-otp` | Send OTP to shop phone |
| POST | `/verify-phone-otp` | Verify shop phone OTP |
| PATCH | `/change-password` | Update shop password |
| PATCH | `/change-email` | Update shop email (OTP-gated) |
| PATCH | `/change-phone-number` | Update shop phone (OTP-gated) |
| PATCH | `/change-address` | Update shop address with geo-coordinates |
| PATCH | `/change-shopName` | Update shop display name |
| PATCH | `/change-profileImage` | Upload new shop profile image |
| PATCH | `/change-shop-information` | Update description, shop type, and table types |
| GET | `/most-queue-users/:id` | Top 5 customers by visit count |
| GET | `/finished-queues-per-month/:id` | Monthly finished queue counts |

### Customers — `/api/customers`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-email-otp` | Send OTP to customer email |
| POST | `/verify-email-otp` | Verify customer email OTP |
| POST | `/send-phone-otp` | Send OTP to customer phone |
| POST | `/verify-phone-otp` | Verify customer phone OTP |
| POST | `/register` | Register a new customer (OTP-verified) |
| POST | `/login` | Customer login — returns JWT |
| PATCH | `/change-password` | Update customer password |
| PATCH | `/change-phone-number` | Update phone (OTP-gated) |
| PATCH | `/change-email` | Update email (OTP-gated) |
| PATCH | `/change-username` | Update display name |
| PATCH | `/change-profileImage` | Upload new profile image |
| PATCH | `/fcm-token` | Save FCM device token for push notifications |

### Queues — `/api/queues`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create` | Create a new queue entry |
| GET | `/all` | Get all queue entries |
| GET | `/shop/:shopId` | Get all queues for a shop |
| GET | `/customer/:customerId` | Get all queues for a customer |
| GET | `/:id` | Get a single queue by ID |
| PATCH | `/generate-qr` | Mark queue as QR-scanned, attach QR data |
| PATCH | `/assign-table` | Assign a table and mark customer as seated |
| PATCH | `/free-table` | Free a table, mark queue as finished, promote next waiting customer |
| GET | `/get-table-status/:shopId` | Get all currently occupied tables for a shop |
| GET | `/getQueue-history/:shopId` | Get completed queue history for a shop |

### Reference Data

| Base Path | Method | Description |
|---|---|---|
| `/api/shop-types` | GET / POST | List or create shop categories |
| `/api/table-types` | GET / POST | List or create table types |

---

## Real-Time System

The `QueueGateway` establishes a persistent Socket.IO server alongside the HTTP server. Staff dashboards and customer apps connect on mount and join a room keyed by `shop_id` or `customer_id`.

| Event | Direction | Trigger | Payload |
|---|---|---|---|
| `events` | Client → Server | Staff app connects; joins shop room | `shop_id` |
| `joinCustomerRoom` | Client → Server | Customer app connects; joins customer room | `customer_id` |
| `newCustomerQueue` | Server → Client | A new customer joins the waiting queue | `{ table_type_id, table_type_name }` |
| `freeTable` | Server → Client | A table is freed and queue is updated | `{ table_type_id, table_type_name }` |

React Query's `invalidateQueries` on the frontend re-fetches stale data on each event, keeping all dashboard widgets in sync with zero manual refresh.

---

## Notification Engine

`QueueNotificationService` runs a `@Cron(EVERY_MINUTE)` job that scans all queues in `waiting` status with a positive estimated wait time.

```
Every 60 seconds
       │
       ▼
Find all waiting queues with estimated_wait_time > 0
       │
       ▼
For each queue — calculate elapsed time since creation
       │
       ├── remaining ≤ 5 min  AND notified_5min = false
       │     └── Send FCM: "Your table is almost ready!"
       │         Mark notified_5min, notified_10min, notified_20min = true
       │
       ├── remaining ≤ 10 min AND notified_10min = false
       │     └── Send FCM: "~10 minutes remaining"
       │         Mark notified_10min, notified_20min = true
       │
       └── remaining ≤ 20 min AND notified_20min = false
             └── Send FCM: "~20 minutes remaining"
                 Mark notified_20min = true
```

Each threshold fires **exactly once** per queue entry. Flags are written to the database immediately before the notification is sent to prevent duplicate delivery on the next cron tick.

---

## Authentication Flow

```
1. Send OTP to phone number
          │
          ▼
2. Verify phone OTP (6-digit, 5-minute expiry)
          │
          ▼
3. Send OTP to email address
          │
          ▼
4. Verify email OTP
          │
          ▼
5. Submit registration payload (name, password, business details)
          │
          ▼
6. Server confirms OTP records, hashes password with bcrypt
          │
          ▼
7. Account created → JWT issued → stored in HTTP-only cookie
```

---

## Database Collections

| Collection | Purpose |
|---|---|
| `Shops` | Shop partner accounts, business info, table type references |
| `Customers` | Customer accounts, FCM tokens, profile images |
| `Queues` | Active queue entries with status state machine and wait time |
| `QueueHistory` | Archived records of all completed/finished queues |
| `TableStatus` | Live record of every currently occupied table per shop |
| `TableTypes` | Table category definitions (type name, total capacity, shop reference) |
| `ShopTypes` | Business category labels (restaurant, clinic, etc.) |
| `Otp` | OTP records with expiry and verification status for email and phone |

---

## Deployment

This project is deployed and running on **Render**.

For manual deployment to any Node.js host:

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

Ensure all environment variables listed in the [Environment Variables](#environment-variables) section are configured on your deployment platform before starting.

---

## License

This project is proprietary software developed for the Smart Queue system.  
All rights reserved © 2026 Smart Queue.
