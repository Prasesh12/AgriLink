# AgriLink – Project Brief and Sprint Plan

You are building **AgriLink**, a final year BSc CSIT project (Tribhuvan University, Nepal). It is a web platform that combines an agricultural **e-commerce marketplace** with **e-governance** services for farmers. Follow this file as the single source of truth for scope, stack, data model, rules and sprint order.

---

## 1. How to Work

- Work **one sprint at a time**. Do not start the next sprint until I say "Start Sprint N".
- At the start of a sprint, list the tasks you will do. At the end, give a short summary: files created/changed, how to run/test, and anything I must do manually (keys, env values).
- Every sprint must end in a **working, runnable state**. Run the server, client build and tests before declaring a sprint done.
- Make a **git commit at the end of each sprint** with message `Sprint N: <summary>`.
- Do not add features outside this file. If something is unclear, ask before building.
- Keep code simple and readable; this project will be defended in a viva. Add short comments on non-obvious logic (algorithms, transactions).
- Never hardcode secrets. Use `.env` and keep `.env.example` updated.
- If an external API detail (e.g. Khalti) is uncertain, check the official docs instead of guessing, and keep a mock mode so the app works without keys.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite, JavaScript), Tailwind CSS, React Router, Axios, React Hook Form + Zod, i18next (en, ne), Recharts |
| Backend | Node.js, Express, Prisma ORM, JWT, bcrypt, Multer, Zod, Helmet, CORS, express-rate-limit |
| Database | PostgreSQL |
| Payment | Khalti ePayment sandbox (with mock mode) |
| SMS | Pluggable SMS service; console logger in development |
| Testing | Jest + Supertest (server), Vitest + React Testing Library (client, light) |
| Tooling | ESLint, Prettier, Git |

---

## 3. Repository Structure

```
agrilink/
├── CLAUDE.md
├── README.md
├── client/
│   └── src/
│       ├── pages/        # public, farmer, buyer, officer, admin
│       ├── components/   # shared UI
│       ├── layouts/      # role dashboards
│       ├── services/     # axios API wrappers
│       ├── context/      # AuthContext, CartContext
│       ├── hooks/
│       └── locales/      # en.json, ne.json
└── server/
    ├── prisma/           # schema.prisma, migrations, seed.js
    ├── uploads/          # gitignored
    ├── tests/
    └── src/
        ├── app.js, server.js
        ├── config/
        ├── routes/
        ├── controllers/
        ├── middleware/   # auth, requireRole, upload, validate, errorHandler
        ├── services/     # msp, bid, rating, search, payment, sms, notification, analytics
        ├── validators/   # zod schemas
        └── utils/
```

---

## 4. Roles

- **farmer**: registers with citizenship and land details, must be verified by an officer before listing produce; lists produce, handles bids and orders, applies for subsidies, files insurance claims.
- **buyer**: searches produce, orders and pays, places bulk bids, tracks orders, reviews farmers.
- **officer**: works only on data from **their own district**; verifies farmers, processes subsidy applications and insurance claims, sets MSP rates, views analytics.
- **admin**: manages users, creates officer accounts, manages crops and subsidy schemes.

Public registration allows only `farmer` and `buyer`. Officers are created by admin. Admin is created by seed.

---

## 5. Data Model (Prisma)

Implement these models (snake_case table names via `@@map`, camelCase fields in Prisma). Use `Decimal` for money and quantities.

- **User**: id, name, phone (unique), email (unique, optional), passwordHash, role (enum), language (en|ne, default en), isActive, createdAt
- **Farmer**: id, userId (unique FK), citizenshipNo (unique), landRegNo, landArea (ropani), district, documentUrls (string[]), verificationStatus (pending|verified|rejected), verifiedById (FK Officer, nullable), remarks
- **Officer**: id, userId (unique FK), office, district
- **Crop**: id, name (unique), nameNe, category
- **MspRate**: id, cropId, grade (A|B|C), ratePerKg, fiscalYear (string like "2082/83"), setById (FK Officer); unique on (cropId, grade, fiscalYear)
- **Product**: id, farmerId, cropId, quantityKg, grade, pricePerKg, harvestDate, description, imageUrls (string[]), status (active|sold_out|removed), belowMsp (bool), createdAt
- **Order**: id, buyerId, totalAmount, status (pending_payment|confirmed|packed|dispatched|delivered|cancelled), deliveryAddress, createdAt
- **OrderItem**: id, orderId, productId, quantityKg, unitPrice
- **Payment**: id, orderId (unique), gateway (khalti|mock), pidx/txnRef, amount, status (initiated|completed|failed)
- **Bid**: id, productId, buyerId, quantityKg, offeredPrice, status (pending|accepted|rejected|expired), expiresAt, createdAt
- **Review**: id, orderId (unique), farmerId, buyerId, rating (1–5), comment
- **SubsidyScheme**: id, title, description, type, maxAmount, deadline, isActive
- **SubsidyApplication**: id, schemeId, farmerId, officerId (nullable), requestedAmount, reason, documentUrls, status (submitted|under_review|approved|rejected), remarks
- **InsuranceClaim**: id, farmerId, officerId (nullable), cropId, lossDescription, lossDate, photoUrls, claimAmount, approvedAmount, status (submitted|under_review|approved|rejected), remarks
- **Notification**: id, userId, type, message, isRead, createdAt
- **AuditLog**: id, actorId, entity, entityId, action, fromStatus, toStatus, createdAt

---

## 6. Core Business Rules and Algorithms

**6.1 MSP price validation** (on product create/update)
1. Find MspRate for cropId + grade + current fiscal year.
2. No MSP → save normally.
3. price ≥ MSP → save normally.
4. price < MSP → return HTTP 422 with `{ code: "BELOW_MSP", msp }` unless request has `confirmBelowMsp: true`; then save with `belowMsp = true` and notify officers of the farmer's district.

Nepal fiscal year starts mid-July (Shrawan 1). Implement `currentFiscalYear()` in a util, with the label format configurable; a simple AD-based approximation (year switches on July 16) is acceptable, documented in a comment.

**6.2 Bayesian farmer rating**
`rating = (C × m + sum) / (C + n)`, C = 5, m = mean rating across all reviews (default 4.0 if none). Expose on farmer profile and use in search.

**6.3 Bid acceptance** (single Prisma transaction)
1. Lock product row with `SELECT ... FOR UPDATE`.
2. Check the farmer owns the product, bid is pending and not expired, bid quantity ≤ stock.
3. Mark bid accepted, reduce stock, create Order (status pending_payment) + OrderItem at bid price.
4. If stock reaches 0 → product sold_out, other pending bids expired.
5. Commit, notify buyer.
Bids expire 72 hours after creation (check on read and via a periodic job).

**6.4 Checkout**: in one transaction, lock each product row, verify stock, reduce stock, create order. If payment fails or is cancelled, restore stock and set order cancelled.

**6.5 Search ranking**
`score = 0.5 × T + 0.3 × (R / 5) + 0.2 × F`
T = 1 exact crop name match, 0.5 partial, 0 otherwise (1 when no search text). R = Bayesian rating. F = freshness, 1 on harvest day, linear to 0 at 14 days.
Filters: crop, category, district, grade, min/max price, only verified farmers, only active products with stock > 0. Paginate.

**6.6 Officer scope**: every officer query is filtered by `officer.district`. Officers cannot act on another district's data (return 403).

**6.7 Audit trail**: every status change on Farmer verification, SubsidyApplication, InsuranceClaim and Order writes an AuditLog row.

**6.8 Security**: bcrypt (10 rounds), JWT in Authorization header (access token 1 day), Helmet, CORS restricted to client URL, rate limit on auth routes, Zod validation on every input, uploads limited to jpg/png/pdf ≤ 5 MB, uploaded farmer documents served only to the owner and officers/admin.

---

## 7. API Endpoints (minimum)

```
POST   /api/auth/register            public (farmer|buyer)
POST   /api/auth/login               public
GET    /api/auth/me                  any

POST   /api/farmers/profile          farmer (with documents)
GET    /api/farmers/:id/public       public (profile + rating)
GET    /api/officer/farmers?status=  officer
PATCH  /api/officer/farmers/:id      officer (verify|reject + remarks)

GET    /api/crops                    public
POST   /api/admin/crops              admin
GET    /api/msp?cropId=&grade=       public
POST   /api/msp                      officer

GET    /api/products                 public (search + filters + ranking)
GET    /api/products/:id             public
GET    /api/farmer/products          farmer
POST   /api/products                 verified farmer
PATCH  /api/products/:id             owner farmer
DELETE /api/products/:id             owner farmer (soft remove)

POST   /api/orders                   buyer (checkout)
GET    /api/orders                   buyer: own; farmer: containing their products
GET    /api/orders/:id               involved parties
PATCH  /api/orders/:id/status        farmer (packed|dispatched|delivered)
GET    /api/orders/:id/invoice       buyer, farmer

POST   /api/payments/khalti/initiate buyer
POST   /api/payments/khalti/verify   buyer
POST   /api/payments/mock/complete   buyer (only when PAYMENT_MODE=mock)

POST   /api/bids                     buyer
GET    /api/bids                     buyer: own; farmer: on own products
PATCH  /api/bids/:id                 farmer (accept|reject)

POST   /api/reviews                  buyer (delivered orders only, once per order)

GET    /api/subsidies/schemes        public
POST   /api/admin/subsidies/schemes  admin
POST   /api/subsidies/apply          verified farmer
GET    /api/subsidies/mine           farmer
GET    /api/officer/subsidies        officer
PATCH  /api/officer/subsidies/:id    officer

POST   /api/claims                   verified farmer (photos)
GET    /api/claims/mine              farmer
GET    /api/officer/claims           officer
PATCH  /api/officer/claims/:id       officer

GET    /api/notifications            any
PATCH  /api/notifications/:id/read   any

GET    /api/analytics/region         officer (own district)
GET    /api/admin/users              admin
POST   /api/admin/officers           admin
PATCH  /api/admin/users/:id          admin (activate/deactivate)
```

All responses follow `{ success, data, message }`; errors go through one central error handler.

---

## 8. Sprints

### Sprint 0 – Project Setup
- Initialize git repo, root README, `.gitignore`.
- `server/`: Express app with Helmet, CORS, JSON parser, morgan, central error handler, health route `GET /api/health`.
- Prisma connected to PostgreSQL, `.env.example` (DATABASE_URL, JWT_SECRET, CLIENT_URL, PAYMENT_MODE, KHALTI_SECRET_KEY, KHALTI_BASE_URL, SMS_MODE).
- `client/`: Vite React app, Tailwind, React Router, Axios instance with base URL and token interceptor, i18next with en/ne files.
- ESLint + Prettier for both. npm scripts: `dev`, `test`, `lint`.

**Done when:** both apps start, client calls `/api/health` successfully, lint passes.

### Sprint 1 – Database and Seed
- Full Prisma schema from Section 5, first migration.
- Seed: 1 admin, 2 officers (different districts), 4 farmers (verified + pending), 3 buyers, 10 crops (with Nepali names), MSP rates for paddy/wheat/sugarcane, 2 subsidy schemes, ~20 products, a few orders, bids and reviews. Print seed login credentials.

**Done when:** `npx prisma migrate dev` and `npm run seed` work on a fresh database.

### Sprint 2 – Authentication, Roles and Farmer Verification
- Register, login, me. Middleware: `auth`, `requireRole(...roles)`, `requireVerifiedFarmer`, `validate(zodSchema)`.
- Farmer profile submission with document upload (Multer).
- Officer: list pending farmers in own district, view documents, verify/reject with remarks; AuditLog + notification.
- Client: login, register (role choice), protected routes per role, role-based dashboard layouts with sidebar, logout, language switcher, farmer "verification pending" screen, officer verification page.

**Done when:** a farmer registers, an officer of the same district verifies them, and the farmer's dashboard unlocks.

### Sprint 3 – Produce Listing and MSP
- Crop list, admin crop management, officer MSP management.
- Product CRUD with image upload and MSP validation (6.1), including the confirm flow.
- Client: farmer "My Listings" page, add/edit listing form that shows the MSP for the selected crop and grade live, below-MSP warning dialog; officer MSP page.

**Done when:** a below-MSP listing triggers the warning, can be confirmed, is flagged, and the officer is notified.

### Sprint 4 – Marketplace, Cart, Checkout and Payment
- Search endpoint with filters, pagination and ranking (6.5), product detail with farmer profile and rating.
- Cart (client-side context, persisted in localStorage), checkout transaction (6.4).
- Payment service with `PAYMENT_MODE=mock|khalti`. Khalti sandbox initiate + verify (check current Khalti docs). Mock mode completes payment with one click.
- Invoice endpoint (HTML or PDF) with order, items, farmer and buyer details.
- Client: home page, marketplace with filters, product detail, cart, checkout, payment return page, buyer order history, invoice view.

**Done when:** a buyer finds produce, pays in mock mode, stock decreases, and the invoice is viewable.

### Sprint 5 – Bidding, Order Tracking and Reviews
- Bids: create, list, accept/reject with the transaction in 6.3, expiry after 72 h.
- Farmer order management: update status packed → dispatched → delivered, with AuditLog.
- Reviews on delivered orders; Bayesian rating service (6.2) used by profile and search.
- Client: buyer "Place bid" modal and "My Bids" page; farmer "Bids on my produce" page sorted by price; order status timeline; review form.

**Done when:** accepting a bid creates an order, overselling is impossible, and ratings update after a review.

### Sprint 6 – Subsidy and Insurance (E-governance)
- Admin scheme management; farmer applies with documents; officer reviews in own district with status flow and remarks.
- Insurance claims with photos; officer assesses and sets approved amount.
- When reviewing, the officer sees the farmer's listings and sales summary as evidence.
- AuditLog + notifications on every decision.
- Client: farmer schemes list, apply form, "My Applications" and "My Claims" with status; officer review queues and detail pages.

**Done when:** both flows work end to end and every status change is logged.

### Sprint 7 – Notifications, Analytics and Localization
- In-app notifications with unread count in the navbar; SMS service (console in dev) for verification result, new bid, bid accepted, order confirmed, application/claim decision.
- Officer analytics for own district: quantity listed and sold per crop, average price per crop vs MSP, number of below-MSP listings, monthly sales trend, pending task counts. Charts with Recharts.
- Admin dashboard: user counts by role, officer management, user activation.
- Complete Nepali translations for all UI text.

**Done when:** officer dashboard shows correct charts from seed data and the whole UI switches between English and Nepali.

### Sprint 8 – Testing, Hardening and Final Polish
- Server tests (Jest + Supertest, separate test database) covering at least:
  - UT-01 register valid user → 201
  - UT-02 duplicate phone → error
  - UT-03 wrong password → 401
  - UT-04 farmer accessing officer route → 403
  - UT-05 price above MSP → saved, belowMsp false
  - UT-06 price below MSP → 422 BELOW_MSP
  - UT-07 Bayesian rating (n=1, r=5, m=4, C=5) → 4.17
  - UT-08 accept bid larger than stock → error, rollback
  - UT-09 unverified farmer creating listing → 403
  - Concurrent checkout of last stock → only one succeeds
  - Officer acting on another district → 403
- Security review against 6.8, loading/empty/error states on every page, mobile responsiveness check on all pages, accessibility basics (labels, contrast, keyboard).
- Refresh seed data for a good demo.
- README: setup, env, seed credentials, scripts, folder structure, API list.
- Write `TEST_RESULTS.md` with the actual pass/fail result of each test (used to update the project report).

**Done when:** all tests pass, the app is demo-ready on a fresh setup by following the README.
