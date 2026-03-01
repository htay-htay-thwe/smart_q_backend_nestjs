# Postman Testing Guide - Smart Queue Backend

## Setup
**Base URL:** `http://localhost:3000`  
**Start server:** `npm run start:dev`

---

## Authentication

After **login** or **register**, copy the `token` from the response body.

For protected routes, add to the request:
- **Authorization** tab → Type: **Bearer Token** → paste token

Or via cookie: if "Send cookies" is enabled in Postman, `auth_token` is sent automatically.

---

## All Endpoints Overview

### Customer Endpoints (`/api/customers`)

| Method | Endpoint               | Auth | Body Type |
|--------|------------------------|:----:|-----------|
| POST   | `/send-phone-otp`      |      | JSON |
| POST   | `/verify-phone-otp`    |      | JSON |
| POST   | `/send-email-otp`      |      | JSON |
| POST   | `/verify-email-otp`    |      | JSON |
| POST   | `/register`            |      | form-data |
| POST   | `/login`               |      | JSON |
| PATCH  | `/change-password`     | ✅   | JSON |
| PATCH  | `/change-phone-number` | ✅   | JSON |
| PATCH  | `/change-email`        | ✅   | JSON |
| PATCH  | `/change-username`     | ✅   | JSON |
| PATCH  | `/change-profileImage` | ✅   | form-data |
| PATCH  | `/fcm-token`           | ✅   | JSON |

### Shop Endpoints (`/api/shops`)

| Method | Endpoint                         | Auth | Body Type |
|--------|----------------------------------|:----:|-----------|
| POST   | `/send-email-otp`                |      | JSON |
| POST   | `/verify-email-otp`              |      | JSON |
| POST   | `/send-phone-otp`                |      | JSON |
| POST   | `/verify-phone-otp`              |      | JSON |
| POST   | `/register`                      |      | form-data |
| POST   | `/login`                         |      | JSON |
| GET    | `/all`                           | ✅   | — |
| PATCH  | `/change-password`               | ✅   | JSON |
| PATCH  | `/change-email`                  | ✅   | JSON |
| PATCH  | `/change-phone-number`           | ✅   | JSON |
| PATCH  | `/change-address`                |      | JSON |
| PATCH  | `/change-shopName`               |      | JSON |
| PATCH  | `/change-profileImage`           |      | form-data |
| PATCH  | `/change-shop-information`       |      | JSON |
| GET    | `/most-queue-users/:id`          |      | — |
| GET    | `/finished-queues-per-month/:id` |      | — |

### Queue Endpoints (`/api/queues`) — ALL require auth

| Method | Endpoint                        | Description |
|--------|---------------------------------|-------------|
| POST   | `/create`                       | Customer joins queue |
| GET    | `/all`                          | Get all queues |
| GET    | `/shop/:shopId`                 | Get queues by shop |
| GET    | `/customer/:customerId`         | Get queues by customer |
| GET    | `/get-table-status/:shopId`     | Get active table statuses |
| GET    | `/getQueue-history/:shopId`     | Get completed queue history |
| GET    | `/:id`                          | Get queue by ID |
| PATCH  | `/generate-qr`                  | Generate QR code for customer |
| PATCH  | `/assign-table`                 | Assign table after QR scan |
| PATCH  | `/free-table`                   | Free table and promote next customer |

### Shop Types Endpoints (`/api/shop-types`) — No auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/`      | Create a shop type |
| GET    | `/`      | Get all shop types |

### Table Types Endpoints (`/api/table-types`) — No auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/`      | Create a table type |
| GET    | `/`      | Get all table types |

---

## Shop Registration Flow

### Step 1: Create Shop Type
**`POST http://localhost:3000/api/shop-types`**  Body: raw JSON
```json
{ "shopTypeName": "Restaurant" }
```
**Save the `_id` from the response.**

---

### Step 2: Verify Email with OTP
**`POST http://localhost:3000/api/shops/send-email-otp`**  Body: raw JSON
```json
{ "email": "goldendragorn@restaurant.com" }
```
Check server console for OTP, then verify:

**`POST http://localhost:3000/api/shops/verify-email-otp`**
```json
{
  "email": "goldendragorn@restaurant.com",
  "otp": "123456"
}
```

---

### Step 3: Verify Phone with OTP
**`POST http://localhost:3000/api/shops/send-phone-otp`**
```json
{ "phoneNumber": 959123456789 }
```
Check server console for OTP, then verify:

**`POST http://localhost:3000/api/shops/verify-phone-otp`**
```json
{
  "phoneNumber": 959123456789,
  "otp": "654321"
}
```

---

### Step 4: Register Shop (form-data with image)
**`POST http://localhost:3000/api/shops/register`**  
Body  **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `shop_img` | **File** | *(select image  optional)* |
| `name` | Text | `Golden Dragon Restaurant` |
| `fullAddress` | Text | `123 Main Street, Yangon` |
| `lat` | Text | `16.8409` |
| `lng` | Text | `96.1735` |
| `phoneNumber` | Text | `959123456789` |
| `email` | Text | `goldendragorn@restaurant.com` |
| `password` | Text | `SecurePassword123!` |
| `description` | Text | `Authentic Chinese cuisine` |
| `shopTypeId` | Text | `<_id from Step 1>` |
| `tableTypes` | Text | `[{"type":"2-Seater","capacity":2},{"type":"4-Seater","capacity":4},{"type":"6-Seater","capacity":6}]` |

> `tableTypes` must be a JSON string in a Text field. Do NOT set `Content-Type` manually.

**Response:** Returns `shop` object + `token`. **Save the token.**

---

### Step 5: Shop Login
**`POST http://localhost:3000/api/shops/login`**  Body: raw JSON
```json
{
  "email": "goldendragorn@restaurant.com",
  "password": "SecurePassword123!"
}
```

---

### Step 6: Get All Shops
**`GET http://localhost:3000/api/shops/all`**  
Authorization: Bearer `<token>`

---

## Shop Account Management

### Change Password (requires token)
**`PATCH http://localhost:3000/api/shops/change-password`**
```json
{
  "email": "goldendragorn@restaurant.com",
  "oldPassword": "SecurePassword123!",
  "newPassword": "NewPassword456!",
  "phoneNumber": "959123456789",
  "otp": "123456"
}
```

### Change Email (requires token)
**`PATCH http://localhost:3000/api/shops/change-email`**
```json
{
  "oldEmail": "goldendragorn@restaurant.com",
  "newEmail": "newemail@restaurant.com"
}
```

### Change Phone Number (requires token)
**`PATCH http://localhost:3000/api/shops/change-phone-number`**
```json
{
  "oldPhoneNumber": "959123456789",
  "newPhoneNumber": "959987654321"
}
```

### Change Address
**`PATCH http://localhost:3000/api/shops/change-address`**
```json
{
  "shop_id": "65fabc123...",
  "fullAddress": "456 New Street, Yangon",
  "lat": 16.85,
  "lng": 96.20
}
```

### Change Shop Name
**`PATCH http://localhost:3000/api/shops/change-shopName`**
```json
{
  "shop_id": "65fabc123...",
  "shopTitle": "New Shop Title"
}
```

### Change Shop Information
**`PATCH http://localhost:3000/api/shops/change-shop-information`**
```json
{
  "shop_id": "65fabc123...",
  "name": "Updated Name",
  "description": "Updated description",
  "fullAddress": "New Address",
  "lat": 16.85,
  "lng": 96.20
}
```

### Change Profile Image
**`PATCH http://localhost:3000/api/shops/change-profileImage`**  
Body  **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `shop_id` | Text | `65fabc123...` |
| `image` | **File** | *(select image)* |

### Get Most Queue Users (Report)
**`GET http://localhost:3000/api/shops/most-queue-users/:id`**  
Returns customers who have queued the most at this shop.

### Get Finished Queues Per Month (Report)
**`GET http://localhost:3000/api/shops/finished-queues-per-month/:id`**  
Returns monthly completed queue counts for chart/report.

---

## Customer Registration Flow

### Step 1: Verify Phone with OTP
**`POST http://localhost:3000/api/customers/send-phone-otp`**
```json
{ "phoneNumber": 9455555555 }
```
**`POST http://localhost:3000/api/customers/verify-phone-otp`**
```json
{ "phoneNumber": 9455555555, "otp": "123456" }
```

---

### Step 2: Verify Email with OTP
**`POST http://localhost:3000/api/customers/send-email-otp`**
```json
{ "email": "htaythwe@gmail.com" }
```
**`POST http://localhost:3000/api/customers/verify-email-otp`**
```json
{ "email": "htaythwe@gmail.com", "otp": "123456" }
```

---

### Step 3: Register Customer (form-data with image)
**`POST http://localhost:3000/api/customers/register`**  
Body  **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `profileImg` | **File** | *(select image  optional)* |
| `name` | Text | `Htay Thwe` |
| `email` | Text | `htaythwe@gmail.com` |
| `phoneNumber` | Text | `9455555555` |
| `password` | Text | `SecurePassword123!` |

**Response:** Returns `customer` object + `token`. **Save the token.**

---

### Step 4: Customer Login
**`POST http://localhost:3000/api/customers/login`**  Body: raw JSON

**Email login:**
```json
{
  "email": "htaythwe@gmail.com",
  "password": "SecurePassword123!"
}
```
**Phone login:**
```json
{
  "phoneNumber": 9455555555,
  "password": "SecurePassword123!"
}
```

---

## Customer Account Management (all require Bearer token)

### Change Password
> First verify phone OTP: `send-phone-otp`  `verify-phone-otp` using the account phone number

**`PATCH http://localhost:3000/api/customers/change-password`**
```json
{
  "phoneNumber": 9455555555,
  "oldPassword": "SecurePassword123!",
  "newPassword": "NewPassword456!",
}
```

### Change Phone Number
> First verify OTP for **both** old and new numbers via `send-phone-otp`  `verify-phone-otp` for each

**`PATCH http://localhost:3000/api/customers/change-phone-number`**
```json
{
  "oldPhoneNumber": 9455555555,
  "newPhoneNumber": 9466666666
}
```

### Change Email
> First verify OTP for **both** old and new emails via `send-email-otp`  `verify-email-otp` for each

**`PATCH http://localhost:3000/api/customers/change-email`**
```json
{
  "oldEmail": "htaythwe@gmail.com",
  "newEmail": "newemail@gmail.com"
}
```

### Change Username
**`PATCH http://localhost:3000/api/customers/change-username`**
```json
{
  "customer_id": "65fabc123...",
  "newUsername": "newname"
}
```

### Change Profile Image
**`PATCH http://localhost:3000/api/customers/change-profileImage`**  
Body  **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `customer_id` | Text | `65fabc123...` |
| `image` | **File** | *(select image)* |

### Save FCM Token (Mobile Push Notifications)
**`PATCH http://localhost:3000/api/customers/fcm-token`**  
Authorization: Bearer `<token>`
```json
{
  "customer_id": "65fabc123...",
  "fcmToken": "dK3f8gX..."
}
```
> Call once after customer login from the mobile app. Token obtained via `Notifications.getDevicePushTokenAsync()` from `expo-notifications`. Once saved, the backend automatically sends FCM push notifications at ≤20 min, ≤10 min, and ≤5 min remaining wait time.

---

## Queue Management (all require Bearer token)

### Queue Workflow
```
1. POST   /api/queues/create           Customer joins queue
                                        ↓ backend cron auto-notifies at ≤20min / ≤10min / ≤5min via FCM
2. PATCH  /api/queues/generate-qr      Admin generates QR when customer's turn arrives
3. PATCH  /api/queues/assign-table     Admin assigns table after QR scan
4. PATCH  /api/queues/free-table       Admin frees table when customer leaves → next customer promoted
```

---

### Create Queue
**`POST http://localhost:3000/api/queues/create`**  Body: raw JSON
```json
{
  "shop_id": "65fabc123def456789012345",
  "customer_id": "65fabc456def789012345678",
  "table_type_id": "65f789def012345abc678901",
  "userRequirements": "Window seat preferred"
}
```
> If a table is available → status: `Ready to seat`, estimated_wait_time: `0`  
> If no tables available → status: `waiting`, estimated_wait_time calculated automatically

---

### Generate QR Code (Admin)
**`PATCH http://localhost:3000/api/queues/generate-qr`**
```json
{
  "queue_id": "65fabc789def012345678901",
  "queue_qr": "QR_DATA_STRING_HERE"
}
```

---

### Assign Table (Admin)
**`PATCH http://localhost:3000/api/queues/assign-table`**
```json
{
  "queue_id": "65fabc789def012345678901",
  "table_no": "A-05",
  "table_type_id": "65f789def012345abc678901",
  "shop_id": "65fabc123def456789012345"
}
```

---

### Free Table (Admin)
**`PATCH http://localhost:3000/api/queues/free-table`**
```json
{
  "shop_id": "65fabc123def456789012345",
  "table_no": "A-05",
  "table_type_id": "65f789def012345abc678901"
}
```
> Frees the table, marks queue as `finished`, saves to history, and promotes the next `waiting` customer to `Ready to seat`.

---

### Get Queues by Shop
**`GET http://localhost:3000/api/queues/shop/:shopId`**

### Get Queues by Customer
**`GET http://localhost:3000/api/queues/customer/:customerId`**

### Get Table Status
**`GET http://localhost:3000/api/queues/get-table-status/:shopId`**  
Returns all currently active (occupied) tables for the shop.

### Get Queue History
**`GET http://localhost:3000/api/queues/getQueue-history/:shopId`**  
Returns all completed queues sorted by `completedAt` descending.

### Get All Queues
**`GET http://localhost:3000/api/queues/all`**

### Get Queue by ID
**`GET http://localhost:3000/api/queues/:id`**

---

## Queue Status Values

| Status | Meaning |
|--------|---------|
| `Ready to seat` | Table available, customer can be seated immediately |
| `waiting` | No tables available, customer is in queue |
| `qr-scanned` | QR code generated, waiting for table assignment |
| `seated` | Table assigned, customer is seated |
| `finished` | Visit finished, moved to history |

---

## Push Notification Thresholds (Auto — no API call needed)

The backend cron runs **every minute** and auto-notifies waiting customers via FCM:

| Remaining Wait Time | Notification Title | Fires |
|---------------------|-------------------|-------|
| ≤ 20 min | ⏳ ~20 minutes remaining | Once |
| ≤ 10 min | ⏰ ~10 minutes remaining | Once |
| ≤ 5 min  | 🚨 Your table is almost ready! | Once |

> Requires `fcmToken` saved via `PATCH /api/customers/fcm-token` and Firebase env vars configured.

---

## Common Errors

| Error | Reason | Fix |
|-------|--------|-----|
| `401 - No token provided` | Missing Bearer token | Add `Authorization: Bearer <token>` header |
| `401 - Invalid or expired token` | Token expired | Login again to get a new token |
| `400 - Phone number not verified` | OTP step skipped | Call `send-phone-otp` → `verify-phone-otp` first |
| `400 - Email not verified` | OTP step skipped | Call `send-email-otp` → `verify-email-otp` first |
| `409 - Email already exists` | Duplicate email | Use different email or login |
| `409 - Phone number already exists` | Duplicate phone | Use different phone or login |
| `400 - Invalid or expired OTP` | OTP wrong or >5 min old | Request a new OTP |
| `400 - tableTypes must be an array` | Wrong body type | Use form-data, `tableTypes` as Text with JSON string value |
| `404 - Cannot PATCH /...` | Wrong HTTP method | Check the method table above |
