# Postman Testing Guide - Smart Queue Backend

## Setup
**Base URL:** `http://localhost:3000`  
**Start server:** `npm run start:dev`

---

## Authentication

After **login** or **register**, copy the `token` from the response body.

For protected routes, add to the request:
- **Authorization** tab  Type: **Bearer Token**  paste token

Or via cookie: if "Send cookies" is enabled in Postman, `auth_token` is sent automatically.

---

## Protected vs Public Routes

### Customer Endpoints (`/api/customers`)

| Method | Endpoint               | Auth | Body Type |
|--------|------------------------|:----:|-----------|
| POST   | `/send-phone-otp`      |    | JSON |
| POST   | `/verify-phone-otp`    |    | JSON |
| POST   | `/send-email-otp`      |    | JSON |
| POST   | `/verify-email-otp`    |    | JSON |
| POST   | `/register`            |    | form-data |
| POST   | `/login`               |    | JSON |
| PATCH  | `/change-password`     |    | JSON |
| PATCH  | `/change-phone-number` |    | JSON |
| PATCH  | `/change-email`        |    | JSON |
| PATCH  | `/change-username`     |    | JSON |
| PATCH  | `/change-profileImage` |    | form-data |

### Shop Endpoints (`/api/shops`)

| Method | Endpoint               | Auth | Body Type |
|--------|------------------------|:----:|-----------|
| POST   | `/send-email-otp`      |    | JSON |
| POST   | `/verify-email-otp`    |    | JSON |
| POST   | `/send-phone-otp`      |    | JSON |
| POST   | `/verify-phone-otp`    |    | JSON |
| POST   | `/register`            |    | form-data |
| POST   | `/login`               |    | JSON |
| GET    | `/`                    |    |  |
| PATCH  | `/change-password`     |    | JSON |
| PATCH  | `/change-email`        |    | JSON |
| PATCH  | `/change-phone-number` |    | JSON |
| PATCH  | `/change-address`      |    | JSON |
| PATCH  | `/change-shopName`     |    | JSON |
| PATCH  | `/change-profileImage` |    | form-data |

### Queue Endpoints (`/api/queues`)  ALL require auth 

| Method | Endpoint                    | Description |
|--------|-----------------------------|-------------|
| POST   | `/create`                   | Join queue |
| GET    | `/all`                      | Get all queues |
| GET    | `/shop/:shopId`             | Get queues by shop |
| GET    | `/customer/:customerId`     | Get queues by customer |
| GET    | `/check-nearby/:shopId`     | Check customers to notify |
| GET    | `/get-table-status/:shopId` | Get table status |
| GET    | `/:id`                      | Get queue by ID |
| PATCH  | `/generate-qr`              | Generate QR code |
| PATCH  | `/assign-table`             | Assign table to customer |

---

## Shop Registration Flow

### Step 1: Create Shop Type
**`POST http://localhost:3000/shop-types`**  Body: raw JSON

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
| `tableTypes` | Text | `[{"type":"2-Seater","capacity":2},{"type":"4-Seater","capacity":4},{"type":"6-Seater","capacity":6},{"type":"VIP Room","capacity":10}]` |

> `tableTypes` must be a JSON string. Do NOT set `Content-Type` manually.

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

### Step 6: Get All Shops (requires token)
**`GET http://localhost:3000/api/shops`**  
Authorization: Bearer `<token>`

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

**Phone login:**
```json
{
  "phoneNumber": 9455555555,
  "otp": "123456",
  "password": "SecurePassword123!"
}
```
**Email login:**
```json
{
  "email": "htaythwe@gmail.com",
  "otp": "123456",
  "password": "SecurePassword123!"
}
```
> Customer login requires OTP + password (2-factor). Send OTP first using `/send-phone-otp` or `/send-email-otp`.

---

## Customer Account Management (all require Bearer token)

### Change Password
**`PATCH http://localhost:3000/api/customers/change-password`**
```json
{
  "phoneNumber": 9455555555,
  "oldPassword": "SecurePassword123!",
  "newPassword": "NewPassword456!",
  "otp": "123456"
}
```

### Change Phone Number
**`PATCH http://localhost:3000/api/customers/change-phone-number`**
```json
{
  "oldPhoneNumber": 9455555555,
  "newPhoneNumber": 9466666666,
  "oldOtp": "123456",
  "newOtp": "654321"
}
```

### Change Email
**`PATCH http://localhost:3000/api/customers/change-email`**
```json
{
  "oldEmail": "htaythwe@gmail.com",
  "newEmail": "newemail@gmail.com",
  "oldOtp": "123456",
  "newOtp": "654321"
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

---

## Shop Account Management

### Change Password (requires token)
**`PATCH http://localhost:3000/api/shops/change-password`**
```json
{
  "email": "goldendragorn@restaurant.com",
  "oldPassword": "SecurePassword123!",
  "newPassword": "NewPassword456!",
  "phoneNumber": 959123456789,
  "otp": "123456"
}
```

### Change Email (requires token)
**`PATCH http://localhost:3000/api/shops/change-email`**
```json
{
  "oldEmail": "goldendragorn@restaurant.com",
  "newEmail": "newemail@restaurant.com",
  "oldOtp": "123456",
  "newOtp": "654321"
}
```

### Change Phone Number (requires token)
**`PATCH http://localhost:3000/api/shops/change-phone-number`**
```json
{
  "oldPhoneNumber": 959123456789,
  "newPhoneNumber": 959987654321,
  "oldOtp": "123456",
  "newOtp": "654321"
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

### Change Shop Name/Title
**`PATCH http://localhost:3000/api/shops/change-shopName`**
```json
{
  "shop_id": "65fabc123...",
  "shopTitle": "New Shop Title"
}
```

### Change Profile Image
**`PATCH http://localhost:3000/api/shops/change-profileImage`**  
Body  **form-data**:

| Key | Type | Value |
|-----|------|-------|
| `shop_id` | Text | `65fabc123...` |
| `image` | **File** | *(select image)* |

---

## Queue Management (all require Bearer token)

### Queue Workflow
```
1. POST   /api/queues/create                Customer joins queue
2. GET    /api/queues/check-nearby/:shopId  Admin checks who to notify
3. PATCH  /api/queues/generate-qr           Admin generates QR
4. PATCH  /api/queues/assign-table          Admin assigns table after QR scan
```

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

### Check Nearby Queues (Admin)
**`GET http://localhost:3000/api/queues/check-nearby/:shopId`**

### Generate QR Code (Admin)
**`PATCH http://localhost:3000/api/queues/generate-qr`**
```json
{ "queue_id": "65fabc789def012345678901" }
```

### Assign Table (Admin)
**`PATCH http://localhost:3000/api/queues/assign-table`**
```json
{
  "queue_id": "65fabc789def012345678901",
  "table_no": "A-05"
}
```

### Get Queues by Shop
**`GET http://localhost:3000/api/queues/shop/:shopId`**

### Get Queues by Customer
**`GET http://localhost:3000/api/queues/customer/:customerId`**

### Get Table Status
**`GET http://localhost:3000/api/queues/get-table-status/:shopId`**

### Get All Queues
**`GET http://localhost:3000/api/queues/all`**

### Get Queue by ID
**`GET http://localhost:3000/api/queues/:id`**

---

## Queue Status Values

| Status | Meaning |
|--------|---------|
| `Ready to seat` | Table available, can be seated immediately |
| `waiting` | No tables available, in queue |
| `ready` | Turn arrived, QR generated |
| `seated` | Table assigned |
| `completed` | Visit finished |
| `cancelled` | Queue cancelled |

---

## Common Errors

| Error | Reason | Fix |
|-------|--------|-----|
| `401 - No token provided` | Missing Bearer token | Add `Authorization: Bearer <token>` header |
| `401 - Invalid or expired token` | Token expired | Login again to get a new token |
| `400 - Phone number not verified` | OTP step skipped | Call `send-phone-otp`  `verify-phone-otp` first |
| `400 - Email not verified` | OTP step skipped | Call `send-email-otp`  `verify-email-otp` first |
| `409 - Email already exists` | Duplicate email | Use different email or login |
| `409 - Phone number already exists` | Duplicate phone | Use different phone or login |
| `400 - Invalid or expired OTP` | OTP wrong or >5 min old | Request a new OTP |
| `400 - tableTypes must be an array` | Wrong body type | Use form-data, `tableTypes` as Text with JSON string value |
| `404 - Cannot PATCH /...` | Wrong HTTP method | Check the method table above |
