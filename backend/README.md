# RentPlace API

A full-stack rental property marketplace backend built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Stripe.

## Live Demo

- **API Base URL:** https://rent-nest-api-seven.vercel.app
- **Database:** Neon PostgreSQL (free tier)


## Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, make payments, leave reviews |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject requests, view tenant history |
| **Admin** | Platform moderators | Manage all users, oversee all listings & requests, ban/unban users |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript 7 |
| ORM | Prisma 7 (PrismaPg adapter) |
| Database | PostgreSQL (Neon) |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| Security | helmet, CORS |

## Features

### Public Features
- Browse all available rental properties
- Search and filter by location, price range, property type
- View detailed property listings
- View property categories

### Tenant Features
- Register and login as tenant
- Submit rental requests for properties
- Make payments via Stripe after rental request is approved
- View payment history and payment status
- View rental request history (pending, approved, rejected)
- Leave reviews after a completed rental
- Manage profile

### Landlord Features
- Register and login as landlord
- Create, edit, and remove property listings
- Approve or reject rental requests
- View rental history and tenant reviews
- View own properties

### Admin Features
- View all users (tenants and landlords)
- Manage user status (ban/unban)
- Change user roles (tenant/landlord)
- View all listings and rental requests
- System-wide statistics

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon free tier)
- Stripe account (test mode)

### Installation

```bash
git clone https://github.com/Imtius10/NewStart_NextLevel.git
cd NewStart_NextLevel/Module_4
npm install
```

### Environment Variables

Create `.env` file:

```env
DATABASE_URL=your_postgresql_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGIN=https://rent-nest-api-seven.vercel.app
FRONTEND_URL=https://rent-nest-api-seven.vercel.app
```

### Database Setup

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Run Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentnest.com | admin123 |
| Landlord | imtius1@example.com | 12345678 |
| Tenant | tanvir@tenant.com | 123456 |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| GET | /api/auth/me | Get current user | Any |
| POST | /api/auth/refresh-token | Refresh access token | Public |
| POST | /api/auth/logout | Logout | Any |

### Properties (Public)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/properties | List properties with filters | Public |
| GET | /api/properties/:id | Get property details | Public |
| GET | /api/categories | Get property categories | Public |

### Landlord Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/landlord/properties | Create property | Landlord |
| PUT | /api/landlord/properties/:id | Update property | Landlord |
| DELETE | /api/landlord/properties/:id | Delete property | Landlord |
| GET | /api/landlord/properties | Get own properties | Landlord |
| GET | /api/landlord/requests | Get all rental requests | Landlord |
| PATCH | /api/landlord/requests/:id | Approve/reject request | Landlord |

### Rental Requests

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/rentals | Submit rental request | Tenant |
| GET | /api/rentals | Get own requests | Tenant |
| GET | /api/rentals/:id | Get request details | Tenant |

### Payments

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/payments/create | Create Stripe checkout | Tenant |
| GET | /api/payments | Payment history | Tenant |
| GET | /api/payments/:id | Get payment details | Tenant |
| POST | /api/payments/confirm | Confirm payment (dev) | Dev |
| POST | /api/payments/webhook | Stripe webhook | Stripe |

### Reviews

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/reviews | Create review | Tenant |
| GET | /api/reviews/property/:id | Property reviews | Public |

### Admin

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/admin/users | All users | Admin |
| PATCH | /api/admin/users/:id/status | Ban/unban user | Admin |
| PATCH | /api/admin/users/:id/role | Change user role | Admin |
| GET | /api/admin/properties | All properties | Admin |
| DELETE | /api/admin/properties/:id | Delete property | Admin |
| GET | /api/admin/rentals | All rental requests | Admin |
| GET | /api/admin/statistics | System statistics | Admin |

## Request/Response Format

### Success
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorDetails": { ... }
}
```

## Project Structure

```
Module_4/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Entry point
│   ├── config/                   # DB, env config
│   ├── middlewares/
│   │   ├── auth/auth.ts          # JWT + role check
│   │   └── GlobalError/          # Error handler
│   ├── module/
│   │   ├── user/                 # Auth routes
│   │   ├── properties/           # Property public routes
│   │   ├── rentalRequest/        # Rental workflow
│   │   ├── landlord/             # Landlord actions + property CRUD
│   │   ├── admin/                # Admin dashboard
│   │   ├── payment/              # Stripe integration
│   │   └── review/               # Review system
│   └── utils/                    # catchAsync, sendResponse, JWT
├── prisma/
│   ├── schema/                   # Prisma models
│   └── seed.ts                   # Database seeder
├── api/index.ts                  # Vercel entry point
├── vercel.json                   # Vercel config
├── postman_collection.json       # API testing collection
└── package.json
```

## Payment Flow

```
1. Tenant submits rental request → status: PENDING
2. Landlord approves → status: APPROVED
3. Tenant creates payment → Stripe Checkout Session
4. Tenant pays with card (4242 4242 4242 4242)
5. Stripe webhook confirms → transactionId saved
6. Tenant leaves review
```

## Deployment

- **API:** Vercel (free tier)
- **Database:** Neon PostgreSQL (free tier)
- **Payment:** Stripe test mode

```bash
# Deploy to Vercel
cd Module_4
npx vercel --prod
```

## Git History

55+ commits following conventional format:
- `feat:` — new features
- `fix:` — bug fixes
- `docs:` — documentation
- `refactor:` — code improvements
- `chore:` — maintenance


