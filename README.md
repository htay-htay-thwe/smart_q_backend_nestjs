# Smart Q Backend (NestJS)

## Executive Summary
Smart Q Backend is a production-oriented backend API for digital queue and table-flow management in service businesses (for example restaurants, clinics, and customer service centers). The platform helps businesses reduce waiting-time confusion, improve customer communication, and increase service throughput through real-time queue updates, OTP-based onboarding, and notification automation.

This project is built with NestJS, TypeScript, and MongoDB, and is structured in modular domains (shops, customers, queue, auth, OTP, notifications, and media).

## Problem It Solves
Traditional waiting systems often create:
- Unclear wait times for customers
- High no-show rates when customers are not notified on time
- Manual table or slot assignment overhead for staff
- Limited operational insights for business owners

Smart Q addresses these with:
- Queue creation and automatic wait-time estimation
- Real-time queue events via WebSocket
- Time-threshold push notifications (20/10/5 minutes)
- Queue history and monthly analytics for performance tracking

## Core Business Features

### Shop Partner Management
- Shop registration and login
- OTP verification for email and phone during onboarding and profile updates
- Shop profile management (name, address, image, business details)
- Dynamic table-type setup and capacity updates

### Customer Management
- Customer registration and login (email or phone)
- OTP verification workflows
- Profile updates (name, email, phone, image)
- FCM token registration for mobile push notifications

### Queue Operations
- Create queue entries by shop and table type
- Auto-detect immediate seating vs waiting state
- Queue number generation and estimated wait-time calculation
- QR status transition and table assignment
- Free-table flow with automatic promotion of next waiting customer
- Queue history tracking for completed service records

### Real-Time & Notification Layer
- WebSocket channels for queue activity updates
- Scheduled checks every minute for waiting queues
- Push notifications at 20/10/5-minute thresholds
- Firebase Cloud Messaging integration for mobile delivery

### Insights & Reporting
- Most frequent queue customers per shop
- Finished queues grouped by month for trend analysis

## Technical Architecture

### Stack
- Framework: NestJS (TypeScript)
- Database: MongoDB with Mongoose ODM
- Authentication: JWT
- Realtime: Socket.IO WebSocket gateway
- Scheduling: @nestjs/schedule cron jobs
- Media Storage: Cloudinary
- Email: SendGrid integration
- Push Notifications: Firebase Admin SDK (FCM)

### High-Level Modules
- auth: JWT token generation and verification
- shop: partner onboarding, profile, analytics
- customer: account lifecycle and FCM token storage
- queue: queue lifecycle, assignment, history, realtime gateway
- otp: email and phone OTP generation and verification
- firebase: push notification provider
- cloudinary: image upload service
- shop-types / table-types: category and table capacity management

### Key Data Collections
- Shops
- Customers
- Queues
- QueueHistory
- TableStatus
- TableTypes
- ShopTypes
- Otp

## Security & Reliability Notes
- Password hashing is implemented with bcrypt
- JWT-based authentication protects business-critical routes
- OTP validation is required before sensitive identity changes
- Queue and table updates use transactional logic in critical flows
- CORS is enabled for frontend and mobile integration

## API Domains
Base style used in controllers: /api/...

- /api/shops: registration, login, profile updates, partner analytics
- /api/customers: OTP flows, registration/login, profile updates, FCM token
- /api/queues: queue creation, assignment, table status, queue history
- /api/shop-types and /api/table-types: setup data for operations

## Stakeholder Value

### For Employers and Clients
- Demonstrates a complete backend from onboarding to real-time operations
- Shows practical integration with Cloudinary, SendGrid, and Firebase
- Uses a scalable modular architecture suitable for product growth

### For HR and Recruiters
- Shows backend engineering skills in:
  - REST API design
  - Authentication and account security
  - Database modeling and business logic
  - Realtime communication
  - Cron-based workflow automation
  - Third-party service integration

### For Professors and Academic Review
- Clear applied-software design with domain-driven module separation
- Uses asynchronous workflows, state transitions, and service orchestration
- Demonstrates practical software engineering trade-offs in a real business scenario

## Local Setup
1. Install dependencies
   - npm install
2. Configure environment variables in example.env
3. Start development server
   - npm run start:dev
4. API runs by default on
   - http://localhost:4000 (or PORT from environment)

## Scripts
- npm run start
- npm run start:dev
- npm run start:prod
- npm run build
- npm run lint
- npm run test
- npm run test:e2e
- npm run test:cov

## Professional Roadmap
- Add Swagger/OpenAPI documentation for all routes
- Add role-based authorization guards across sensitive endpoints
- Replace development OTP response behavior with production-safe masked delivery
- Expand automated testing coverage (unit + integration + e2e)
- Add centralized logging, monitoring, and rate limiting

## Project Positioning Statement
Smart Q Backend is a robust, modular backend platform that digitizes waiting-line operations, combines real-time coordination with automated customer communication, and provides measurable operational insights—making it suitable as both a portfolio-grade engineering project and a practical business-ready foundation.
