# API Integration — RentPlace Frontend

Everything the UI knows about the backend lives in `src/lib/` (client, session, queries, types). This document is the contract.

**Base URL:** `NEXT_PUBLIC_API_URL` (default `https://rent-nest-api-seven.vercel.app`, local: `http://localhost:5000`).

> **Transport:** the browser never calls that URL directly. `src/lib/api.ts` builds same-origin paths (`/api/...`) in the browser and the rewrite in `next.config.ts` forwards them to the API host server-side, so the API's CORS/CORP headers are irrelevant. The absolute base URL is only used for SSR fetches (e.g. `/properties/[id]`) and as the rewrite target.

## 1. Response envelope & errors

Every endpoint answers with:

```jsonc
// success
{
  "success": true,
  "statusCode": 200,
  "message": "Properties retrieved successfully",
  "data": [ ... ],
  "meta": { "page": 1, "limit": 9, "total": 23 }   // list endpoints only
}

// failure
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "data": null
}
```

`src/lib/api.ts` wraps this:

- Non-OK responses and `success: false` throw `ApiError(message, status, details)`.
- Messages fall back per status (401 → session expired, 403 → no permission, 404 → not found, 5xx → server error) when the body has none.
- Network failures throw `ApiError("Could not reach the server…", 0)` so callers can distinguish offline from rejected.
- `errorMessage(error)` is the single helper used by every toast and error boundary.

## 2. Authentication

Tokens are issued by `/api/auth/*` and stored client-side in cookies (`js-cookie`):

| Cookie | Content |
| --- | --- |
| `accessToken` | JWT, sent as `Authorization: Bearer <token>` on every request |
| `refreshToken` | JWT, only used for refresh |
| `rn_user` | `{ id, name, email, role }` snapshot for instant UI hydration |

Flow implemented in `src/lib/api.ts` + `src/lib/session.ts` + `src/store/auth.ts`:

1. **Login / register** → `POST /api/auth/login|register` → save tokens + user snapshot, set Zustand state, redirect by role (`next` query param respected).
2. **Every request** → attach `accessToken`; if absent, try a refresh first.
3. **401 mid-flight** → single-flight refresh (`POST /api/auth/refresh-token` with `Authorization: Bearer <refreshToken>`) → replay the original request exactly once (`_retried` flag prevents loops). Concurrent 401s share one refresh promise.
4. **Logout** → `POST /api/auth/logout` (best-effort) → clear cookies + store → redirect.
5. **Route guard** — `src/proxy.ts` reads `rn_user` and protects `/dashboard/:path*` and `/auth/:path*` per role; unauthorized users land on `/no-access`.

Roles: `TENANT`, `LANDLORD`, `ADMIN`. Backend refuses `ADMIN` on register; admin role is set from the dashboard.

## 3. Endpoint map

### Auth — `src/lib/session.ts`, `src/hooks/use-auth-actions.ts`
| Method | Path | Auth | Used by |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | `/auth/register` (body includes `role`) |
| POST | `/api/auth/login` | – | `/auth/login` |
| POST | `/api/auth/refresh-token` | refresh token header | api client (automatic) |
| POST | `/api/auth/logout` | Bearer | sign-out button |
| GET | `/api/auth/me` | Bearer | session bootstrap |

### Marketplace — `src/lib/queries.ts`
| Method | Path | Query | Used by |
| --- | --- | --- | --- |
| GET | `/api/properties` | `page, limit, search, location, category, minPrice, maxPrice` | `/properties` browse |
| GET | `/api/properties/:id` | – | `/properties/[id]` |
| GET | `/api/categories` | – | browse filters, property form |
| GET | `/api/reviews/property/:id` | `page, limit` | property details, review list |
| POST | `/api/reviews` | – | review form (after `APPROVED` + `PAID`) |

### Rentals — tenant
| Method | Path | Body | Used by |
| --- | --- | --- | --- |
| POST | `/api/rentals` | `{ propertyId, message }` | property details CTA |
| GET | `/api/rentals` | `page, limit` | `/dashboard/tenant`, `…/requests` |
| GET | `/api/rentals/:id` | – | pay page |

### Payments — tenant
| Method | Path | Body | Used by |
| --- | --- | --- | --- |
| GET | `/api/payments` | `page, limit` | `/dashboard/tenant/payments` |
| POST | `/api/payments/create` | `{ rentalRequestId, amount? }` | pay page → returns `{ payment, checkoutUrl, sessionId }` |
| POST | `/api/payments/verify` | `{ sessionId }` | `/payment/success` |
| POST | `/api/payments/webhook` | Stripe payload | server-side only (not called by UI) |

### Landlord
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/landlord/properties` | `page, limit` |
| POST | `/api/landlord/properties` | create listing (`imageUrl`, `isAvailable` optional) |
| PUT | `/api/landlord/properties/:id` | partial update (availability toggle sends only `isAvailable`) |
| DELETE | `/api/landlord/properties/:id` | confirm dialog first |
| GET | `/api/landlord/requests` | includes `tenant`, `property` |
| PATCH | `/api/landlord/requests/:id` | `{ status: "APPROVED" \| "REJECTED" }` — optimistic in UI |

### Admin
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/admin/statistics` | counts of users/properties/requests by status |
| GET | `/api/admin/users` | `page, limit` |
| PATCH | `/api/admin/users/:id/status` | `{ status: "ACTIVE" \| "BLOCKED" }` — optimistic |
| PATCH | `/api/admin/users/:id/role` | `{ role: "TENANT" \| "LANDLORD" }` — optimistic |
| GET | `/api/admin/properties` | `page, limit`, includes `landlord` |
| DELETE | `/api/admin/properties/:id` | confirm dialog first |
| GET | `/api/admin/rentals` | includes `property`, `tenant`, `payment` |

## 4. Query keys & caching

All keys live in `queryKeys` (`src/lib/queries.ts`):

| Key | Scope |
| --- | --- |
| `["properties", params]` | browse list (params object keeps filters distinct) |
| `["property", id]` | details + edit form |
| `["categories"]`, `["reviews", propertyId]` | lookups, 5 min `staleTime` |
| `["rentals","me",page]`, `["payments","me",page]` | tenant dashboards |
| `["landlord","properties"\|"requests", page]` | landlord dashboards |
| `["admin","statistics"\|"users"\|"properties"\|"rentals", page]` | admin dashboards |

Mutations invalidate their own key (and cross-related keys, e.g. approving a request also refreshes admin rentals) in `onSettled`, so lists never show stale badges.

## 5. State management split

- **Server state** → TanStack Query only (no duplicated copies in the store).
- **Session state** → Zustand `useAuth` (`user`, `status`, `notice`) hydrated from cookies, driven by `useAuthActions` (`login`, `register`, `finishAuth`, `signOut`).
- **Optimistic state** → `onMutate` snapshots + `onError` rollback for landlord approve/reject and admin block/unban/role.
- **URL state** → browse filters are mirrored into the query string (`router.replace`, `scroll: false`) so results are shareable and survive refresh.
- **Form state** → react-hook-form + zod (`src/lib/validations/auth.ts`, `src/components/landlord/property-form.tsx`).

## 6. Payment flow (Stripe Checkout)

```
Tenant opens /dashboard/tenant/requests/[id]/pay
  └─ GET  /api/rentals/:id                    → request + property + payment
  └─ POST /api/payments/create                → { payment, checkoutUrl, sessionId }
       └─ window.location = checkoutUrl       (Stripe hosts the card form)
Stripe redirects to FRONTEND_URL/payment/success?session_id=...
  └─ POST /api/payments/verify { sessionId }  → confirms payment, marks rental ACTIVE
  └─ UI shows amount, transaction id, links to dashboard/payments
Stripe cancel → FRONTEND_URL/payment/cancel   → "no money taken" + back-to-requests CTA
```

The verify page runs the POST exactly once (`useRef` guard) inside `useMutation`, handles missing `session_id`, pending, success and error states, and never trusts the query string alone.

`FRONTEND_URL` on the API must equal the deployed frontend origin or the redirects will fail.

## 7. Error handling strategy

| Layer | Behaviour |
| --- | --- |
| `src/lib/api.ts` | normalizes every failure into `ApiError` with a human message |
| React Query | `staleTime: 30s`, `refetchOnWindowFocus: false`, `retry: 1` (see `src/providers.tsx`) |
| Mutations | `toast.error(errorMessage(error))`, optimistic state rolled back from `context.snapshot` |
| Forms | zod field errors inline + `formState.errors.root` banner for server-side errors |
| Pages | `error.tsx` boundaries (property details, browse, global) with retry + back home |
| Loading | route-level `loading.tsx` + component skeletons for lists, grids, tables |
| Empty | `EmptyState` with an icon, copy and a recovery CTA |

Every data surface has four explicit states: loading skeleton → error with retry → empty state → content.

## 8. Local development

```bash
# backend (repo: Module-4)
cd ../NewStart_NextLevel/Module_4
npm install && npm run dev          # http://localhost:5000

# frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                         # http://localhost:3000
```

Seeded accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@rentnest.com` | `admin123` |
| Tenant | `tanvir@tenant.com` | `123456` |
| Landlord | `imtius1@example.com` | `12345678` |

Stripe: `payments/create` runs in test mode with the API's `STRIPE_SECRET_KEY`; use test card `4242 4242 4242 4242`, any future expiry, any CVC.
