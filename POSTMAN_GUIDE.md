# Postman Testing Guide - Smart Queue Backend

## Setup
Base URL: `http://localhost:3000`

---

## Step 1: Create Shop Types
**Endpoint:** `POST http://localhost:3000/shop-types`

### Request Body (JSON):
```json
{
  "shopTypeName": "Restaurant"
}
```

### Response Example:
```json
{
  "_id": "65f123abc456def789012345",
  "shopTypeName": "Restaurant",
  "__v": 0
}
```

**Save the `_id` - you'll need it for shop registration!**

### Create more shop types:
```json
{ "shopTypeName": "Cafe" }
{ "shopTypeName": "Bar" }
{ "shopTypeName": "Food Court" }
```

---

## Step 2: Get All Shop Types (Optional)
**Endpoint:** `GET http://localhost:3000/shop-types`

This returns all shop types with their IDs.

---

## Step 3: Register a Shop (with Table Types)

**IMPORTANT:** Before registering a shop, you must verify both email and phone number with OTP!

### Step 3a: Verify Email with OTP
**Endpoint:** `POST http://localhost:3000/api/shops/send-email-otp`

**Request Body:**
```json
{
  "email": "goldendragorn@restaurant.com"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "message": "OTP sent to goldendragorn@restaurant.com"
  }
}
```

**Check console for OTP:**
```
OTP for email goldendragorn@restaurant.com: 123456
```

**Verify Email OTP:**  
**Endpoint:** `POST http://localhost:3000/api/shops/verify-email-otp`

**Request Body:**
```json
{
  "email": "goldendragorn@restaurant.com",
  "otp": "123456"
}
```

---

### Step 3b: Verify Phone with OTP
**Endpoint:** `POST http://localhost:3000/api/shops/send-phone-otp`

**Request Body:**
```json
{
  "phoneNumber": 959123456789
}
```

**Verify Phone OTP:**  
**Endpoint:** `POST http://localhost:3000/api/shops/verify-phone-otp`

**Request Body:**
```json
{
  "phoneNumber": 959123456789,
  "otp": "654321"
}
```

---

### Step 3c: Register Shop
**Endpoint:** `POST http://localhost:3000/api/shops/register`

Now you can register a shop after both email and phone are verified!

### Request Body (JSON):
```json
{
  "name": "Golden Dragon Restaurant",
  "address": "123 Main Street, Yangon",
  "phoneNumber": 959123456789,
  "email": "goldendragorn@restaurant.com",
  "password": "SecurePassword123!",
  "shop_img": "https://example.com/images/golden-dragon.jpg",
  "shopTitle": "Best Chinese Food in Town",
  "descirption": "Authentic Chinese cuisine with over 20 years of experience",
  "shopTypeId": "65f123abc456def789012345",
  "tableTypes": [
    {
      "type": "2-Seater",
      "capacity": 2
    },
    {
      "type": "4-Seater",
      "capacity": 4
    },
    {
      "type": "6-Seater",
      "capacity": 6
    },
    {
      "type": "VIP Room",
      "capacity": 10
    }
  ]
}
```

**Replace:**
- `shopTypeId` with the actual `_id` from Step 1
- `tableTypes` array contains the table configurations for this specific shop (no temporary IDs needed!)

### Response Example:
```json
{
  "data": {
    "_id": "65fabc123def456789012345",
    "name": "Golden Dragon Restaurant",
    "address": "123 Main Street, Yangon",
    "phoneNumber": "959123456789",
    "email": "goldendragorn@restaurant.com",
    "shopImg": "https://example.com/images/golden-dragon.jpg",
    "shopTitle": "Best Chinese Food in Town",
    "description": "Authentic Chinese cuisine with over 20 years of experience",
    "shopTypes": "65f123abc456def789012345",
    "tableTypes": [
      "65f789def012345abc678901",
      "65f789def012345abc678902",
      "65f789def012345abc678903"
    ],
    "__v": 0
  }
}
```

---

## Step 6: Get All Shops with Populated Data
**Endpoint:** `GET http://localhost:3000/api/shops`

This returns all shops with populated shop types and table types.

---

## Quick Reference - Request Order

1. ✅ `POST /shop-types` - Create shop types (Restaurant, Cafe, etc.)
2. ✅ `POST /api/shops/register` - Register shop with table types in one request
3. ✅ `GET /api/shops` - View all registered shops

---

## Authentication & Cookies

### JWT Token
Upon successful registration, both shop and customer endpoints return a JWT token:
- **In response body** - For manual storage (localStorage, etc.)
- **In HTTP-only cookie** - Automatically set as `auth_token` cookie

### Cookie Details:
- **Name:** `auth_token`
- **Type:** HTTP-only (not accessible via JavaScript)
- **Duration:** 7 days
- **SameSite:** Strict

### Using the Token:
For protected routes (coming soon), the token will be automatically sent via cookie. Alternatively, you can use the Bearer token:

**Header:**
```
Authorization: Bearer <your-token-here>
```

---

## Shop Login (Email + Password)

**Endpoint:** `POST http://localhost:3000/api/shops/login`

Shops login using email and password (NO OTP required for login).

**Request Body (JSON):**
```json
{
  "email": "goldendragorn@restaurant.com",
  "password": "SecurePassword123!"
}
```

**Response Example:**
```json
{
  "data": {
    "shop": {
      "_id": "65fabc123...",
      "name": "Golden Dragon Restaurant",
      "email": "goldendragorn@restaurant.com",
      "phoneNumber": 959123456789,
      "shopTitle": "Best Chinese Food in Town"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Token is also set in `auth_token` HTTP-only cookie.

---

## Customer Registration (OTP-based)

Customer registration uses phone number verification via OTP (One-Time Password). The flow is:
1. Send OTP to phone number
2. Verify OTP
3. Register customer
4. Login with OTP

### Step 1: Send OTP
**Endpoint:** `POST http://localhost:3000/api/customers/send-otp`

**Request Body (JSON):**
```json
{
  "phoneNumber": 9455555555
}
```

**Response Example:**
```json
{
  "data": {
    "success": true,
    "message": "OTP sent to 09455555555"
  }
}
```

**Note:** In development, the OTP will be printed in the server console. In production, integrate with SMS gateway (Twilio, AWS SNS, etc.).

**Check Server Console for OTP:**
```
OTP for 09455555555: 123456
```

---

### Step 2: Verify OTP
**Endpoint:** `POST http://localhost:3000/api/customers/verify-otp`

**Request Body (JSON):**
```json
{
  "phoneNumber": 9455555555,
  "otp": "123456"
}
```

**Response Example:**
```json
{
  "data": {
    "verified": true,
    "message": "OTP verified successfully"
  }
}
```

**Note:** OTP expires in 5 minutes. If expired, request a new OTP.

---

### Step 3: Register Customer
**Endpoint:** `POST http://localhost:3000/api/customers/register`

**Request Body (JSON):**
```json
{
  "name": "Htay Thwe",
  "phoneNumber": 9455555555,
  "password": "SecurePassword123!",
  "profileImg": "https://example.com/profile.jpg"
}
```

**Required Fields:**
- `name`: Customer name
- `phoneNumber`: Must be verified with OTP first
- `password`: Will be hashed and stored securely

**Optional Fields:**
- `profileImg`: Can be empty string or omitted

**Response Example:**
```json
{
  "data": {
    "customer": {
      "_id": "65fabc123...",
      "name": "Htay Thwe",
      "phoneNumber": 9455555555,
      "profileImg": "https://example.com/profile.jpg",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** 
- Token is set in `auth_token` HTTP-only cookie
- Phone number must be verified with OTP before registration
- Password is hashed with bcrypt (10 rounds) and not returned in response
- After registration, use phone number + password to login

---

### Step 4: Customer Login (Phone + OTP + Password)
**Endpoint:** `POST http://localhost:3000/api/customers/login`

Customers login requires both OTP verification AND password (2-factor authentication).

**Login Flow:**
1. Send OTP to phone number (use `/api/customers/send-otp` endpoint)
2. Check console for OTP
3. Login with phone number + OTP + password

**Request Body (JSON):**
```json
{
  "phoneNumber": 9455555555,
  "otp": "123456",
  "password": "SecurePassword123!"
}
```

**Response Example:**
```json
{
  "data": {
    "customer": {
      "_id": "65fabc123...",
      "name": "Htay Thwe",
      "phoneNumber": 9455555555,
      "profileImg": "https://example.com/profile.jpg",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Token is also set in `auth_token` HTTP-only cookie.

---

## Common Issues

### Error: "Type 'undefined' is not assignable"
- Make sure the server is running: `npm run start:dev`

### Error: "Validation failed"
- Check all required fields are present
- Ensure `phoneNumber` is a number, not a string (e.g., 9455555555)
- Verify `shopTypeId` is a valid MongoDB ObjectId
- Ensure `tableTypes` is an array of objects with `type` and `capacity`

### Error: "Cast to ObjectId failed"
- The shop type ID doesn't exist in the database
- Re-check the ID from the GET /shop-types request

### Error: "Email already exists" (409 Conflict)
- The email is already registered in the system
- Use a different email address or login instead

### Error: "Phone number already registered" (409 Conflict)
- The phone number is already registered
- Use a different phone number or login instead

### Error: "Phone number not verified" (400 Bad Request)
- You must verify the phone number with OTP before registration
- For customers: Use `/api/customers/send-otp` and `/api/customers/verify-otp`
- For shops: Use `/api/shops/send-phone-otp` and `/api/shops/verify-phone-otp`

### Error: "Email not verified" (400 Bad Request)  
- For shops only: You must verify email with OTP before registration
- Use `/api/shops/send-email-otp` and `/api/shops/verify-email-otp`

### Error: "Invalid or expired OTP" (400 Bad Request)
- The OTP is incorrect or has expired (5 minute validity)
- Request a new OTP using `/send-otp`

### Error: "Invalid old password" (401 Unauthorized)
- The old password provided is incorrect
- Double-check the current password when changing password

### Error: "Invalid OTP for old/new phone number" (401 Unauthorized)
- One of the OTPs is incorrect when changing phone/email
- Make sure to verify both old and new contact information with correct OTPs

### Error: "New phone number/email is already registered" (409 Conflict)
- The new phone number or email is already in use by another account
- Choose a different phone number or email address

---

## Error Response Format

When an error occurs, the API returns:

**HTTP 409 Conflict (Duplicate email/phone):**
```json
{
  "statusCode": 409,
  "message": "Email already exists. Please use a different email.",
  "error": "Conflict"
}
```

**HTTP 400 Bad Request (Validation error):**
```json
{
  "statusCode": 400,
  "message": ["email must be a string", "password should not be empty"],
  "error": "Bad Request"
}
```

**HTTP 401 Unauthorized (Invalid token):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

---

## Testing Flow Examples

### Shop Registration Flow
```
1. Create "Restaurant" shop type → Get ID: 65f123...
2. Send OTP to email "goldendragorn@restaurant.com" → Check console for OTP
3. Verify email OTP
4. Send OTP to phone 959123456789 → Check console for OTP
5. Verify phone OTP
6. Register shop with:
   - shopTypeId: 65f123...
   - email (verified)
   - phone (verified)
   - password
   - tableTypes: [
       { type: "2-Seater", capacity: 2 },
       { type: "4-Seater", capacity: 4 }
     ]
7. Success! Shop and table types created together
8. Login with email + password → Get token ✅
```

### Customer Registration Flow
```
1. Send OTP to phone 9455555555 → Check console for OTP
2. Verify OTP with code from console (e.g., "123456")
3. Register customer with verified phone number + password
4. Success! Customer created with token in cookie ✅
```

### Customer Login Flow
```
1. Send OTP to registered phone 9455555555 → Check console for OTP
2. Login with phone number + OTP + password → Get token
3. Token saved in HTTP-only cookie
4. Use token for authenticated requests ✅
```

---

## Customer Account Management

### Change Customer Password
**Endpoint:** `POST http://localhost:3000/api/customers/change-password`

Change password requires OTP verification for security.

**Steps:**
1. Send OTP to customer's phone number (use `/api/customers/send-otp`)
2. Check console for OTP
3. Submit change password request

**Request Body (JSON):**
```json
{
  "phoneNumber": 9455555555,
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "otp": "123456"
}
```

**Response Example:**
```json
{
  "data": {
    "message": "Password changed successfully."
  }
}
```

**Required Fields:**
- `phoneNumber`: Customer's registered phone number
- `oldPassword`: Current password
- `newPassword`: New password to set
- `otp`: OTP code received on phone

---

### Change Customer Phone Number
**Endpoint:** `POST http://localhost:3000/api/customers/change-phone-number`

Change phone number requires OTP verification on BOTH old and new phone numbers (no password needed).

**Steps:**
1. Send OTP to OLD phone number → Check console for OTP
2. Send OTP to NEW phone number → Check console for OTP
3. Submit change request with both OTPs

**Request Body (JSON):**
```json
{
  "oldPhoneNumber": 9455555555,
  "newPhoneNumber": 9466666666,
  "oldOtp": "123456",
  "newOtp": "654321"
}
```

**Response Example:**
```json
{
  "data": {
    "data": {
      "_id": "65fabc123...",
      "name": "Htay Thwe",
      "phoneNumber": 9466666666,
      "profileImg": "https://example.com/profile.jpg",
      "isVerified": true
    },
    "message": "Phone number changed successfully."
  }
}
```

**Required Fields:**
- `oldPhoneNumber`: Current phone number
- `newPhoneNumber`: New phone number (must be available)
- `oldOtp`: OTP sent to old phone number
- `newOtp`: OTP sent to new phone number

**Flow:**
```
1. Send OTP to old phone 9455555555 → OTP: 123456
2. Send OTP to new phone 9466666666 → OTP: 654321
3. Submit change request with both OTPs
4. Phone number updated successfully ✅
```

---

## Shop Account Management

### Change Shop Password
**Endpoint:** `POST http://localhost:3000/api/shops/change-password`

Change password requires old password verification + phone OTP.

**Steps:**
1. Send OTP to shop's phone number (use `/api/shops/send-phone-otp`)
2. Check console for OTP
3. Submit change password request

**Request Body (JSON):**
```json
{
  "email": "goldendragorn@restaurant.com",
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "phoneNumber": 959123456789,
  "otp": "123456"
}
```

**Response Example:**
```json
{
  "data": {
    "message": "Password changed successfully."
  }
}
```

**Required Fields:**
- `email`: Shop's registered email
- `oldPassword`: Current password
- `newPassword`: New password to set
- `phoneNumber`: Shop's registered phone number
- `otp`: OTP code received on phone

---

### Change Shop Email
**Endpoint:** `POST http://localhost:3000/api/shops/change-email`

Change email requires OTP verification on BOTH old and new email addresses (no password needed).

**Steps:**
1. Send OTP to OLD email → Check console for OTP
2. Send OTP to NEW email → Check console for OTP
3. Submit change request with both OTPs

**Request Body (JSON):**
```json
{
  "oldEmail": "goldendragorn@restaurant.com",
  "newEmail": "newemail@restaurant.com",
  "oldOtp": "123456",
  "newOtp": "654321"
}
```

**Response Example:**
```json
{
  "data": {
    "data": {
      "_id": "65fabc123...",
      "name": "Golden Dragon Restaurant",
      "email": "newemail@restaurant.com",
      "phoneNumber": 959123456789,
      "shopTitle": "Best Chinese Food in Town"
    },
    "message": "Email changed successfully."
  }
}
```

**Required Fields:**
- `oldEmail`: Current email address
- `newEmail`: New email address (must be available)
- `oldOtp`: OTP sent to old email
- `newOtp`: OTP sent to new email

**Flow:**
```
1. Send OTP to old email goldendragorn@restaurant.com → OTP: 123456
2. Send OTP to new email newemail@restaurant.com → OTP: 654321
3. Submit change request with both OTPs
4. Email updated successfully ✅
```

---

### Change Shop Phone Number
**Endpoint:** `POST http://localhost:3000/api/shops/change-phone-number`

Change phone number requires OTP verification on BOTH old and new phone numbers (no password needed).

**Steps:**
1. Send OTP to OLD phone number → Check console for OTP
2. Send OTP to NEW phone number → Check console for OTP
3. Submit change request with both OTPs

**Request Body (JSON):**
```json
{
  "oldPhoneNumber": 959123456789,
  "newPhoneNumber": 959987654321,
  "oldOtp": "123456",
  "newOtp": "654321"
}
```

**Response Example:**
```json
{
  "data": {
    "data": {
      "_id": "65fabc123...",
      "name": "Golden Dragon Restaurant",
      "email": "goldendragorn@restaurant.com",
      "phoneNumber": 959987654321,
      "shopTitle": "Best Chinese Food in Town"
    },
    "message": "Phone number changed successfully."
  }
}
```

**Required Fields:**
- `oldPhoneNumber`: Current phone number
- `newPhoneNumber`: New phone number (must be available)
- `oldOtp`: OTP sent to old phone number
- `newOtp`: OTP sent to new phone number

**Flow:**
```
1. Send OTP to old phone 959123456789 → OTP: 123456
2. Send OTP to new phone 959987654321 → OTP: 654321
3. Submit change request with both OTPs
4. Phone number updated successfully ✅
```

---