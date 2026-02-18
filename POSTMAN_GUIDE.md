# Postman Testing Guide - Smart Queue Backend

## Setup
Base URL: `http://localhost:4000`

---

## Step 1: Create Shop Types
**Endpoint:** `POST http://localhost:4000/shop-types`

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
**Endpoint:** `GET http://localhost:4000/shop-types`

This returns all shop types with their IDs.

---

## Step 3: Register a Shop (with Table Types)

**IMPORTANT:** Before registering a shop, you must verify both email and phone number with OTP!

### Step 3a: Verify Email with OTP
**Endpoint:** `POST http://localhost:4000/api/shops/send-email-otp`

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
**Endpoint:** `POST http://localhost:4000/api/shops/verify-email-otp`

**Request Body:**
```json
{
  "email": "goldendragorn@restaurant.com",
  "otp": "123456"
}
```

---

### Step 3b: Verify Phone with OTP
**Endpoint:** `POST http://localhost:4000/api/shops/send-phone-otp`

**Request Body:**
```json
{
  "phoneNumber": 959123456789
}
```

**Verify Phone OTP:**  
**Endpoint:** `POST http://localhost:4000/api/shops/verify-phone-otp`

**Request Body:**
```json
{
  "phoneNumber": 959123456789,
  "otp": "654321"
}
```

---

### Step 3c: Register Shop
**Endpoint:** `POST http://localhost:4000/api/shops/register`

Now you can register a shop after both email and phone are verified!

**Content-Type:** `multipart/form-data`

### Using Postman:
1. Set request type to `POST`
2. Select `Body` → `form-data`
3. Add the following fields:

| Key | Type | Value |
|-----|------|-------|
| name | Text | Golden Dragon Restaurant |
| fullAddress | Text | 123 Main Street, Yangon |
| lat | Text | 16.8661 |
| lng | Text | 96.1951 |
| phoneNumber | Text | 959123456789 |
| email | Text | goldendragorn@restaurant.com |
| password | Text | SecurePassword123! |
| shop_img | File | [Select image file from your computer] |
| description | Text | Authentic Chinese cuisine with over 20 years of experience |
| shopTypeId | Text | 65f123abc456def789012345 |
| tableTypes[0][type] | Text | 2-Seater |
| tableTypes[0][capacity] | Text | 2 |
| tableTypes[1][type] | Text | 4-Seater |
| tableTypes[1][capacity] | Text | 4 |
| tableTypes[2][type] | Text | 6-Seater |
| tableTypes[2][capacity] | Text | 6 |
| tableTypes[3][type] | Text | VIP Room |
| tableTypes[3][capacity] | Text | 10 |

**Notes:**
- `shop_img` is now a **File field** - select an image from your computer (jpg, png, etc.)
- The image will be automatically uploaded to Cloudinary
- If you don't want to upload an image, you can omit the `shop_img` field
- `shopTypeId` should be the actual `_id` from Step 1

### Frontend (JavaScript/React Example):
```javascript
const formData = new FormData();
formData.append('name', 'Golden Dragon Restaurant');
formData.append('fullAddress', '123 Main Street, Yangon');
formData.append('lat', '16.8661');
formData.append('lng', '96.1951');
formData.append('phoneNumber', '959123456789');
formData.append('email', 'goldendragorn@restaurant.com');
formData.append('password', 'SecurePassword123!');
formData.append('shop_img', imageFile); // File from input type="file"
formData.append('description', 'Authentic Chinese cuisine with over 20 years of experience');
formData.append('shopTypeId', '65f123abc456def789012345');

// Table types as array
formData.append('tableTypes[0][type]', '2-Seater');
formData.append('tableTypes[0][capacity]', '2');
formData.append('tableTypes[1][type]', '4-Seater');
formData.append('tableTypes[1][capacity]', '4');
formData.append('tableTypes[2][type]', '6-Seater');
formData.append('tableTypes[2][capacity]', '6');
formData.append('tableTypes[3][type]', 'VIP Room');
formData.append('tableTypes[3][capacity]', '10');

const response = await fetch('http://localhost:4000/api/shops/register', {
  method: 'POST',
  body: formData,
  // Don't set Content-Type header - browser will set it automatically with boundary
});
```

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
**Endpoint:** `GET http://localhost:4000/api/shops`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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
After login or registration, copy the `token` from the response. Add it to every **protected** request as a Bearer token header:

**Header:**
```
Authorization: Bearer <your-token-here>
```

In Postman: open the request → **Authorization** tab → Type: **Bearer Token** → paste your token.

Alternatively, if you enable "Send cookies" in Postman, the `auth_token` cookie is sent automatically.

---

## Protected vs Public Routes

### Customer Endpoints (`/api/customers`)

| Method | Endpoint               | Auth Required | Description              |
|--------|------------------------|:-------------:|--------------------------|
| POST   | `/send-phone-otp`      | ❌ No         | Send OTP to phone        |
| POST   | `/verify-phone-otp`    | ❌ No         | Verify phone OTP         |
| POST   | `/send-email-otp`      | ❌ No         | Send OTP to email        |
| POST   | `/verify-email-otp`    | ❌ No         | Verify email OTP         |
| POST   | `/register`            | ❌ No         | Register new customer    |
| POST   | `/login`               | ❌ No         | Login (returns token)    |
| POST   | `/change-password`     | ✅ **Yes**    | Change password          |
| POST   | `/change-phone-number` | ✅ **Yes**    | Change phone number      |
| POST   | `/change-email`        | ✅ **Yes**    | Change email             |

### Shop Endpoints (`/api/shops`)

| Method | Endpoint               | Auth Required | Description              |
|--------|------------------------|:-------------:|--------------------------|
| POST   | `/send-email-otp`      | ❌ No         | Send OTP to email        |
| POST   | `/verify-email-otp`    | ❌ No         | Verify email OTP         |
| POST   | `/send-phone-otp`      | ❌ No         | Send OTP to phone        |
| POST   | `/verify-phone-otp`    | ❌ No         | Verify phone OTP         |
| POST   | `/register`            | ❌ No         | Register new shop        |
| POST   | `/login`               | ❌ No         | Login (returns token)    |
| GET    | `/`                    | ✅ **Yes**    | Get all shops            |
| POST   | `/change-password`     | ✅ **Yes**    | Change password          |
| POST   | `/change-email`        | ✅ **Yes**    | Change email             |
| POST   | `/change-phone-number` | ✅ **Yes**    | Change phone number      |

---

## Shop Login (Email + Password)

**Endpoint:** `POST http://localhost:4000/api/shops/login`

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

Customer registration uses OTP verification for both phone number and email. The flow is:
1. Send OTP to phone number
2. Verify phone OTP
3. Send OTP to email
4. Verify email OTP
5. Register customer
6. Login with OTP + password

### Step 1: Send Phone OTP
**Endpoint:** `POST http://localhost:4000/api/customers/send-phone-otp`

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

### Step 2: Verify Phone OTP
**Endpoint:** `POST http://localhost:4000/api/customers/verify-phone-otp`

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
    "message": "Phone OTP verified successfully"
  }
}
```

**Note:** OTP expires in 5 minutes. If expired, request a new OTP.

---

### Step 3: Send Email OTP
**Endpoint:** `POST http://localhost:4000/api/customers/send-email-otp`

**Request Body (JSON):**
```json
{
  "email": "htaythwe@gmail.com"
}
```

**Response Example:**
```json
{
  "data": {
    "success": true,
    "message": "OTP sent to htaythwe@gmail.com"
  }
}
```

**Check Server Console for OTP:**
```
OTP for email htaythwe@gmail.com: 123456
```

---

### Step 4: Verify Email OTP
**Endpoint:** `POST http://localhost:4000/api/customers/verify-email-otp`

**Request Body (JSON):**
```json
{
  "email": "htaythwe@gmail.com",
  "otp": "123456"
}
```

**Response Example:**
```json
{
  "data": {
    "verified": true,
    "message": "Email OTP verified successfully"
  }
}
```

---

### Step 5: Register Customer
**Endpoint:** `POST http://localhost:4000/api/customers/register`

**Request Body (JSON):**
```json
{
  "name": "Htay Thwe",
  "phoneNumber": 9455555555,
  "email": "htaythwe@gmail.com",
  "password": "SecurePassword123!",
  "profileImg": "https://example.com/profile.jpg"
}
```

**Required Fields:**
- `name`: Customer name
- `phoneNumber`: Must be verified with OTP first
- `email`: Must be verified with OTP first
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
      "email": "htaythwe@gmail.com",
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
- Phone number and email must be verified with OTP before registration
- Password is hashed with bcrypt (10 rounds) and not returned in response
- After registration, use phone/email + OTP + password to login

---

### Step 6: Customer Login (Phone or Email + OTP + Password)
**Endpoint:** `POST http://localhost:4000/api/customers/login`

Customers login requires OTP verification AND password (2-factor authentication).

**Login Flow:**
1. Send OTP to phone number or email (use `/api/customers/send-phone-otp` or `/api/customers/send-email-otp`)
2. Check console for OTP
3. Login with phone/email + OTP + password

**Request Body (Phone Login):**
```json
{
  "phoneNumber": 9455555555,
  "otp": "123456",
  "password": "SecurePassword123!"
}
```

**Request Body (Email Login):**
```json
{
  "email": "htaythwe@gmail.com",
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
**Endpoint:** `POST http://localhost:4000/api/customers/change-password`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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
**Endpoint:** `POST http://localhost:4000/api/customers/change-phone-number`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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

### Change Customer Email
**Endpoint:** `POST http://localhost:4000/api/customers/change-email`

Change email requires OTP verification on BOTH old and new email addresses (no password needed).

**Steps:**
1. Send OTP to OLD email → Check console for OTP
2. Send OTP to NEW email → Check console for OTP
3. Submit change request with both OTPs

**Request Body (JSON):**
```json
{
  "oldEmail": "htaythwe@gmail.com",
  "newEmail": "newemail@gmail.com",
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
      "email": "newemail@gmail.com",
      "phoneNumber": 9455555555,
      "profileImg": "https://example.com/profile.jpg",
      "isVerified": true
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
1. Send OTP to old email htaythwe@gmail.com → OTP: 123456
2. Send OTP to new email newemail@gmail.com → OTP: 654321
3. Submit change request with both OTPs
4. Email updated successfully ✅
```

---

### Change Customer Profile Image
**Endpoint:** `PATCH http://localhost:4000/api/customers/change-profileImage`

Update the customer's profile image by uploading a new image file to Cloudinary.

**Content-Type:** `multipart/form-data`

### Using Postman:
1. Set request type to `PATCH`
2. Select `Body` → `form-data`
3. Add the following fields:

| Key | Type | Value |
|-----|------|-------|
| customer_id | Text | 65fabc123def456789012345 |
| image | File | [Select new image file] |

### Frontend (JavaScript/React Example):
```javascript
const formData = new FormData();
formData.append('customer_id', '65fabc123def456789012345');
formData.append('image', imageFile); // File from input type="file"

const response = await fetch('http://localhost:4000/api/customers/change-profileImage', {
  method: 'PATCH',
  body: formData,
});

const data = await response.json();
console.log(data.data); // Updated customer with new Cloudinary image URL
```

**Response Example:**
```json
{
  "data": {
    "_id": "65fabc123...",
    "name": "Htay Thwe",
    "email": "htaythwe@gmail.com",
    "phoneNumber": 9455555555,
    "profileImg": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/shops/xyz789.jpg",
    "isVerified": true
  },
  "message": "Customer profile image changed successfully."
}
```

**Required Fields:**
- `customer_id`: Customer's ObjectId
- `image`: Image file (jpg, png, etc.)

**Notes:**
- Image is automatically uploaded to Cloudinary
- Returns the Cloudinary secure URL in `profileImg` field
- Old image URL is replaced with new one

---

## Shop Account Management

### Change Shop Password
**Endpoint:** `POST http://localhost:4000/api/shops/change-password`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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
**Endpoint:** `POST http://localhost:4000/api/shops/change-email`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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
**Endpoint:** `POST http://localhost:4000/api/shops/change-phone-number`

> **Requires Authentication** — Add `Authorization: Bearer <token>` header.

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

### Change Shop Address
**Endpoint:** `PATCH http://localhost:4000/api/shops/change-address`

Update shop's physical address with geolocation coordinates.

**Request Body (JSON):**
```json
{
  "shop_id": "65fabc123def456789012345",
  "fullAddress": "456 New Street, Downtown, Yangon",
  "lat": 16.8661,
  "lng": 96.1951
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
      "address": {
        "fullAddress": "456 New Street, Downtown, Yangon",
        "location": {
          "type": "Point",
          "coordinates": [96.1951, 16.8661]
        }
      },
      "shopTitle": "Best Chinese Food in Town"
    },
    "message": "Address changed successfully."
  }
}
```

**Required Fields:**
- `shop_id`: Shop's ObjectId
- `fullAddress`: Complete address string
- `lat`: Latitude (decimal degrees)
- `lng`: Longitude (decimal degrees)

**Note:** Coordinates are stored as [longitude, latitude] in GeoJSON format.

---

### Change Shop Name
**Endpoint:** `PATCH http://localhost:4000/api/shops/change-shopName`

Update the shop's display title/name.

**Request Body (JSON):**
```json
{
  "shop_id": "65fabc123def456789012345",
  "shopTitle": "Premium Chinese Cuisine"
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
      "shopTitle": "Premium Chinese Cuisine"
    },
    "message": "Shop Name changed successfully."
  }
}
```

**Required Fields:**
- `shop_id`: Shop's ObjectId
- `shopTitle`: New shop title/name

---

### Change Shop Profile Image
**Endpoint:** `PATCH http://localhost:4000/api/shops/change-profileImage`

Update the shop's profile image by uploading a new image file to Cloudinary.

**Content-Type:** `multipart/form-data`

### Using Postman:
1. Set request type to `PATCH`
2. Select `Body` → `form-data`
3. Add the following fields:

| Key | Type | Value |
|-----|------|-------|
| shop_id | Text | 65fabc123def456789012345 |
| image | File | [Select new image file] |

### Frontend (JavaScript/React Example):
```javascript
const formData = new FormData();
formData.append('shop_id', '65fabc123def456789012345');
formData.append('image', imageFile); // File from input type="file"

const response = await fetch('http://localhost:4000/api/shops/change-profileImage', {
  method: 'PATCH',
  body: formData,
});

const data = await response.json();
console.log(data.data); // Updated shop with new Cloudinary image URL
```

**Response Example:**
```json
{
  "data": {
    "_id": "65fabc123...",
    "name": "Golden Dragon Restaurant",
    "email": "goldendragorn@restaurant.com",
    "shopImg": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/shops/abc123.jpg",
    "shopTitle": "Premium Chinese Cuisine"
  },
  "message": "Shop Image changed successfully."
}
```

**Required Fields:**
- `shop_id`: Shop's ObjectId
- `image`: Image file (jpg, png, etc.)

**Notes:**
- Image is automatically uploaded to Cloudinary
- Returns the Cloudinary secure URL in `shopImg` field
- Old image URL is replaced with new one

---

## Queue Management

### Queue Workflow

**Complete User Journey:**
```
1. Customer joins queue (POST /api/queues/create)
   ↓ Selects table type (2-Seater, 4-Seater, VIP, etc.)
   ↓ Gets queue number (e.g., #15), NO QR yet
   
   IF tables available:
   ↓ Status: "Ready to seat"
   ↓ Estimated wait time: 0 minutes
   
   IF no tables available:
   ↓ Status: "waiting"
   ↓ Estimated wait time: 120 minutes (2 people ahead × 60 min each)

2. Customer checks position (GET /api/queues/position/:queueId)
   ↓ See: position in line, people ahead, wait time

3. Customer's turn approaches (Admin monitors queue)
   ↓ Admin checks who to notify (GET /api/queues/check-nearby/:shopId)

4. Admin generates QR code (PATCH /api/queues/generate-qr)
   ↓ QR code created, customer gets notification
   ↓ Status: "ready"

5. Customer comes to shop & scans QR code
   ↓ Admin verifies QR

6. Admin assigns table (PATCH /api/queues/assign-table)
   ↓ Table assigned (e.g., "A-05")
   ↓ Status: "seated"
```

---

### Create Queue
**Endpoint:** `POST http://localhost:4000/api/queues/create`

Customer joins the queue. System automatically:
- Assigns queue number (sequential, resets daily)
- Checks table availability for the requested table type
- Sets status to "Ready to seat" if tables available, or "waiting" if not
- Calculates estimated wait time (60 min per customer if waiting)
- NO QR code yet (generated by admin later)

**Request Body (JSON):**
```json
{
  "shop_id": "65fabc123def456789012345",
  "customer_id": "65fabc456def789012345678",
  "table_type_id": "65f789def012345abc678901",
  "userRequirements": "Window seat preferred"
}
```

**Response Example (Table Available):**
```json
{
  "data": {
    "_id": "65fabc789def012345678901",
    "queue_number": 15,
    "queue_qr": null,
    "status": "Ready to seat",
    "table_no": null,
    "table_type_id": "65f789def012345abc678901",
    "userRequirements": "Window seat preferred",
    "estimated_wait_time": 0,
    "notification_sent": false,
    "shop_id": {
      "_id": "65fabc123def456789012345",
      "name": "Golden Dragon Restaurant",
      "phoneNumber": 959123456789
    },
    "customer_id": {
      "_id": "65fabc456def789012345678",
      "name": "Htay Thwe",
      "phoneNumber": 9455555555
    },
    "createdAt": "2026-02-13T08:30:00.000Z",
    "updatedAt": "2026-02-13T08:30:00.000Z"
  },
  "message": "Queue created successfully"
}
```

**Response Example (No Tables Available - Waiting):**
```json
{
  "data": {
    "_id": "65fabc789def012345678902",
    "queue_number": 16,
    "queue_qr": null,
    "status": "waiting",
    "table_no": null,
    "table_type_id": "65f789def012345abc678901",
    "userRequirements": "",
    "estimated_wait_time": 120,
    "notification_sent": false,
    "shop_id": {
      "_id": "65fabc123def456789012345",
      "name": "Golden Dragon Restaurant",
      "phoneNumber": 959123456789
    },
    "customer_id": {
      "_id": "65fabc456def789012345679",
      "name": "John Doe",
      "phoneNumber": 9477777777
    },
    "createdAt": "2026-02-13T09:00:00.000Z",
    "updatedAt": "2026-02-13T09:00:00.000Z"
  },
  "message": "Queue created successfully"
}
```

**Required Fields:**
- `shop_id`: Shop ObjectId
- `customer_id`: Customer ObjectId
- `table_type_id`: Table type ObjectId (e.g., "2-Seater", "4-Seater", "VIP Room")

**Optional Fields:**
- `userRequirements`: Special requests (default: empty)

**Auto-calculated:**
- `queue_number`: Sequential number (resets daily per shop)
- `status`: "Ready to seat" (if tables available) or "waiting" (if fully occupied)
- `estimated_wait_time`: Minutes to wait (based on people ahead × 60 min, or 0 if ready)

**How it works:**
1. System checks total tables of requested type at the shop
2. Checks how many are currently occupied (active)
3. If available tables exist → Status: "Ready to seat", Wait time: 0
4. If all tables occupied → Status: "waiting", Wait time: calculated based on queue position

---

### Check Nearby Queues (Admin)
**Endpoint:** `GET http://localhost:4000/api/queues/check-nearby/:shopId`

Check which customers should be notified (their turn is coming soon).

**Example:** `GET http://localhost:4000/api/queues/check-nearby/65fabc123def456789012345`

**Response Example:**
```json
{
  "data": [
    {
      "queue_id": "65fabc789def012345678901",
      "queue_number": 15,
      "customer_id": "65fabc456def789012345678",
      "should_notify": true
    },
    {
      "queue_id": "65fabc789def012345678902",
      "queue_number": 16,
      "customer_id": "65fabc456def789012345679",
      "should_notify": true
    }
  ],
  "message": "Queues ready for notification"
}
```

**Note:** Returns customers who should be notified (turn approaching).

---

### Generate QR Code (Admin)
**Endpoint:** `PATCH http://localhost:4000/api/queues/generate-qr`

Admin generates QR code when customer's turn arrives. This:
- Creates unique QR code
- Changes status to "ready"
- Sends notification to customer
- Marks notification as sent

**Request Body (JSON):**
```json
{
  "queue_id": "65fabc789def012345678901"
}
```

**Response Example:**
```json
{
  "data": {
    "_id": "65fabc789def012345678901",
    "queue_number": 15,
    "queue_qr": "QR-123e4567-e89b-12d3-a456-426614174000",
    "status": "ready",
    "table_no": null,
    "userRequirements": "Window seat preferred",
    "estimated_wait_time": 0,
    "notification_sent": true,
    "shop_id": {
      "_id": "65fabc123def456789012345",
      "name": "Golden Dragon Restaurant"
    },
    "customer_id": {
      "_id": "65fabc456def789012345678",
      "name": "Htay Thwe",
      "phoneNumber": 9455555555
    }
  },
  "message": "QR code generated and notification sent to customer"
}
```

**Check Server Console:**
```
Notification sent to customer for queue 15
QR Code generated: QR-123e4567-e89b-12d3-a456-426614174000
```

---

### Assign Table (Admin)
**Endpoint:** `PATCH http://localhost:4000/api/queues/assign-table`

After customer scans QR code at shop, admin assigns table.

**Request Body (JSON):**
```json
{
  "queue_id": "65fabc789def012345678901",
  "table_no": "A-05"
}
```

**Response Example:**
```json
{
  "data": {
    "_id": "65fabc789def012345678901",
    "queue_number": 15,
    "queue_qr": "QR-123e4567-e89b-12d3-a456-426614174000",
    "status": "seated",
    "table_no": "A-05",
    "userRequirements": "Window seat preferred",
    "shop_id": {
      "_id": "65fabc123def456789012345",
      "name": "Golden Dragon Restaurant"
    },
    "customer_id": {
      "_id": "65fabc456def789012345678",
      "name": "Htay Thwe"
    }
  },
  "message": "Table assigned successfully"
}
```

**Required Fields:**
- `queue_id`: Queue ObjectId
- `table_no`: Table identifier

**Note:** QR code must be generated first, otherwise will throw error.

---

### Get Queues by Shop
**Endpoint:** `GET http://localhost:4000/api/queues/shop/:shopId`

Get all queues for a shop, sorted by queue number.

**Example:** `GET http://localhost:4000/api/queues/shop/65fabc123def456789012345`

**Response Example:**
```json
{
  "data": [
    {
      "_id": "65fabc789def012345678901",
      "queue_number": 15,
      "status": "waiting",
      "estimated_wait_time": 90,
      "customer_id": {
        "name": "Htay Thwe",
        "phoneNumber": 9455555555
      }
    },
    {
      "_id": "65fabc789def012345678902",
      "queue_number": 16,
      "status": "ready",
      "queue_qr": "QR-987e4567-...",
      "customer_id": {
        "name": "John Doe"
      }
    }
  ]
}
```

---

### Get Queues by Customer
**Endpoint:** `GET http://localhost:4000/api/queues/customer/:customerId`

Get all queues for a customer (newest first).

**Example:** `GET http://localhost:4000/api/queues/customer/65fabc456def789012345678`

**Response Example:**
```json
{
  "data": [
    {
      "_id": "65fabc789def012345678901",
      "queue_number": 15,
      "status": "waiting",
      "estimated_wait_time": 90,
      "shop_id": {
        "name": "Golden Dragon Restaurant"
      }
    }
  ]
}
```

---

### Get All Queues
**Endpoint:** `GET http://localhost:4000/api/queues/all`

Get all queues across all shops.

---

### Get Queue by ID
**Endpoint:** `GET http://localhost:4000/api/queues/:id`

Get specific queue details.

**Example:** `GET http://localhost:4000/api/queues/65fabc789def012345678901`

---

### Get Table Status (Admin)
**Endpoint:** `GET http://localhost:4000/api/queues/get-table-status/:shopId`

Get the status of all tables at a shop, grouped by table type.

**Example:** `GET http://localhost:4000/api/queues/get-table-status/65fabc123def456789012345`

**Response Example:**
```json
{
  "data": [
    {
      "table_type_id": "65f789def012345abc678901",
      "shop_id": "65fabc123def456789012345",
      "available_tables": [
        {
          "_id": "65ftable01...",
          "table_number": "A-01",
          "table_type_id": "65f789def012345abc678901",
          "shop_id": "65fabc123def456789012345",
          "isActive": false,
          "queue_id": null
        }
      ],
      "occupied_tables": [
        {
          "_id": "65ftable02...",
          "table_number": "A-02",
          "table_type_id": "65f789def012345abc678901",
          "shop_id": "65fabc123def456789012345",
          "isActive": true,
          "queue_id": {
            "_id": "65fqueue01...",
            "queue_number": 15,
            "customer_id": {
              "name": "Htay Thwe",
              "phone": 9455555555
            }
          }
        }
      ],
      "total_tables": 10,
      "available_count": 6,
      "occupied_count": 4
    }
  ]
}
```

**Response Fields:**
- `table_type_id`: ID of the table type (e.g., 2-Seater, 4-Seater)
- `shop_id`: Shop ObjectId
- `available_tables`: Array of tables that are not currently occupied
- `occupied_tables`: Array of tables currently in use (with customer info)
- `total_tables`: Total number of tables of this type
- `available_count`: Number of available tables
- `occupied_count`: Number of occupied tables

**Use Case:** Admin dashboard to see real-time table availability and occupancy.

---

## Queue Status Values

- `Ready to seat` - Table is available, customer can be seated immediately (no waiting)
- `waiting` - Customer is waiting in queue, no tables available (no QR yet)
- `ready` - Customer's turn, QR generated, notification sent
- `seated` - Customer has been assigned a table
- `completed` - Customer finished (optional)
- `cancelled` - Queue cancelled (optional)

---