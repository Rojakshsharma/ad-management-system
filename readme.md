# Ad Management System

A full-stack advertising management platform where **admins configure ad spaces and pricing rules**, while **advertisers create ads, reserve placement time, make payments, and monitor ad performance**.

The system is designed around a **24-hour advertising capacity model**, with availability validation, pricing rules, order management, payment confirmation, and analytics.

---

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod validation

### Architecture

```text
React.js
   ↓
Axios / REST APIs
   ↓
Express.js
   ↓
Controllers
   ↓
Services
   ↓
Prisma ORM
   ↓
PostgreSQL
```

The backend follows a modular structure:

```text
routes → controllers → services → database
```

Business logic is kept inside services while controllers handle HTTP requests and responses.

---

# User Roles

## Admin

Admins manage the advertising platform.

* Create and manage ad spaces
* Configure pricing rules
* Set date-based pricing overrides
* Review advertisements
* Approve or reject advertisements
* View platform analytics
* Monitor orders and revenue

## Advertiser

Advertisers manage their own advertising campaigns.

* Login
* Create advertisements
* Submit ads for approval
* View approved advertisements
* Check placement availability
* Reserve advertising time
* Complete demo payment
* View orders
* View advertising analytics
* Track impressions, clicks and display intervals

---

# Authentication

There is **no public registration API**.

The project uses two pre-seeded accounts:

* Admin
* Advertiser

Users authenticate using:

```http
POST /api/auth/login
```

The API returns a JWT token which is used for protected endpoints.

---

# API Documentation

## Authentication

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| POST   | `/api/auth/login` | Login and receive JWT token |

---

## Ad Spaces

### Admin

| Method | Endpoint                   | Description        |
| ------ | -------------------------- | ------------------ |
| POST   | `/api/admin/ad-spaces`     | Create an ad space |
| GET    | `/api/admin/ad-spaces`     | Get ad spaces      |
| PUT    | `/api/admin/ad-spaces/:id` | Update an ad space |
| DELETE | `/api/admin/ad-spaces/:id` | Delete an ad space |

Ad spaces support:

* Page number
* Position
* Size
* Active/inactive configuration

---

## Pricing Rules

### Admin

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| POST   | `/api/admin/pricing-rules`     | Create pricing rule |
| GET    | `/api/admin/pricing-rules`     | Get pricing rules   |
| PUT    | `/api/admin/pricing-rules/:id` | Update pricing rule |

Pricing rules support:

* Date or date range
* Price override
* Priority
* Rule details
* Color information

Higher-priority rules are used when multiple rules apply to the same date.

---

# Advertisements

### Advertiser

| Method | Endpoint       | Description                     |
| ------ | -------------- | ------------------------------- |
| POST   | `/api/ads`     | Create advertisement            |
| GET    | `/api/ads`     | Get advertiser's advertisements |
| GET    | `/api/ads/:id` | Get advertisement               |
| PUT    | `/api/ads/:id` | Update advertisement            |

### Admin

| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| GET    | `/api/admin/ads`             | View advertisements   |
| PATCH  | `/api/admin/ads/:id/approve` | Approve advertisement |
| PATCH  | `/api/admin/ads/:id/reject`  | Reject advertisement  |

The normal flow is:

```text
Create Ad
   ↓
Submit for Verification
   ↓
Admin Approval
   ↓
Ad becomes available for placement
```

---

# Placement

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| GET    | `/api/placements/availability` | Check placement availability |

Advertisers can select:

* Page
* Position
* Size
* Date
* Duration

The availability system calculates the remaining capacity within the **24-hour daily window** before allowing a reservation.

---

# Orders & Payment

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/api/orders`         | Create placement order |
| GET    | `/api/orders`         | Get advertiser orders  |
| GET    | `/api/orders/:id`     | Get order details      |
| POST   | `/api/orders/:id/pay` | Complete demo payment  |

Order lifecycle:

```text
PENDING
   ↓
Payment
   ↓
CONFIRMED
```

Payment lifecycle:

```text
PENDING → PAID
```

The payment implementation is a **demo payment stub** and does not charge real money.

---

# Analytics

## Advertiser

| Method | Endpoint                              | Description                     |
| ------ | ------------------------------------- | ------------------------------- |
| GET    | `/api/analytics/advertiser`           | Detailed advertising analytics  |
| GET    | `/api/analytics/advertiser/dashboard` | Advertiser dashboard statistics |

Analytics include:

* Total orders
* Paid orders
* Impressions
* Clicks
* Display duration
* Display intervals
* Advertising spend

## Admin

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/analytics/admin` | Platform-wide analytics |

Admin analytics include:

* Total ad spaces
* Total advertisements
* Pending advertisements
* Approved advertisements
* Total orders
* Paid orders
* Total clicks
* Total impressions
* Total revenue

---

# Scheduling & Availability

Each ad space has a maximum capacity of:

```text
24 hours = 86,400 seconds
```

When an advertiser requests a duration, the backend checks:

```text
Remaining Capacity >= Requested Duration
```

Only then is the order allowed to proceed.

This prevents advertisers from booking more time than the available daily capacity.

The system also keeps placement, date, duration and order information separately so that booked time can be calculated from existing orders.

---

# Project Structure

```text
ad-management/
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── routes/
│
├── server/
│   ├── controller/
│   ├── middleware/
│   ├── routes/
│   ├── service/
│   ├── prisma/
│   └── config/
│
└── README.md
```

---

# Getting Started

## 1. Clone

```bash
git clone <your-github-repository-url>
cd ad-management
```

## 2. Backend

```bash
cd server
npm install
```

Create `.env`:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

Run Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

Start backend:

```bash
npm run dev
```

---

## 3. Frontend

```bash
cd client
npm install
npm run dev
```

---

# Basic Testing

### 1. Login

Use the seeded Admin or Advertiser account:

```http
POST /api/auth/login
```

Copy the returned JWT token.

### 2. Test Admin Flow

```text
Login
 ↓
Create Ad Space
 ↓
Create Pricing Rule
 ↓
Review Advertisement
 ↓
Approve Advertisement
 ↓
Check Admin Dashboard
```

### 3. Test Advertiser Flow

```text
Login
 ↓
Create Advertisement
 ↓
Admin Approval
 ↓
Check Placement Availability
 ↓
Create Order
 ↓
Pay Order
 ↓
View Analytics
```

### 4. Verify Edge Cases

Test that the system:

* Rejects unauthenticated requests
* Enforces Admin/Advertiser roles
* Prevents booking beyond available capacity
* Handles invalid dates and durations
* Resolves overlapping pricing rules using priority
* Prevents invalid order/payment state transitions

---

# Demo Payment

The project uses a payment stub for assignment purposes.

**No real money is charged.**

A successful payment changes:

```text
Order: PENDING → CONFIRMED
Payment: PENDING → PAID
```

---

# Assignment Deliverables

* Full-stack React + Node.js application
* PostgreSQL database
* REST API
* Admin panel
* Advertiser panel
* Pricing rule engine
* Placement availability system
* Order and demo payment flow
* Analytics dashboard
* API documentation
* GitHub repository
