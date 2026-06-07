# Project Documentation

> **Living document** — updated every time a new feature, module, or API endpoint is added.
> Last updated: 2026-06-07

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Running the Project](#5-running-the-project)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Phase 1 — Project Scaffold](#7-phase-1--project-scaffold)
8. [Phase 2 — User Authentication Module](#8-phase-2--user-authentication-module)
9. [Phase 3 — Category Management Module](#9-phase-3--category-management-module)
10. [Phase 4 — Product Module](#10-phase-4--product-module)
11. [Phase 5 — Product Search, Filter & Sort](#11-phase-5--product-search-filter--sort)
12. [Phase 6 — Cart Module](#12-phase-6--cart-module)
13. [Phase 7 — Order Module](#13-phase-7--order-module)
14. [Phase 8 — Admin Dashboard Stats](#14-phase-8--admin-dashboard-stats)
15. [Phase 9 — Frontend: Product Detail, Cart, Orders, Search](#15-phase-9--frontend-product-detail-cart-orders-search)

---

## 1. Project Overview

A production-ready e-commerce web application built with:
- **Backend**: Django REST Framework API (Python)
- **Frontend**: React + Material UI (TypeScript)
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)
- **Infrastructure**: Docker Compose (dev) / Docker multi-stage (prod)

---

## 2. Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Django | 5.2.2 | Web framework |
| djangorestframework | 3.16.0 | REST API |
| djangorestframework-simplejwt | 5.5.0 | JWT authentication |
| django-cors-headers | 4.7.0 | CORS for React frontend |
| psycopg2-binary | 2.9.10 | PostgreSQL adapter |
| python-decouple | 3.8 | `.env` file support |
| black | 25.1.0 | Code formatter |
| isort | 6.0.1 | Import sorter |
| flake8 | 7.2.0 | Linter |
| pytest | 8.4.0 | Test runner |
| pytest-django | 4.11.1 | Django test integration |
| factory-boy | 3.3.3 | Test data factories |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI library |
| TypeScript | 5.7.2 | Type safety |
| Vite | 6.0.5 | Build tool / dev server |
| Material UI | 6.3.1 | Component library |
| React Router | 6.28.0 | Client-side routing |
| Axios | 1.7.9 | HTTP client |
| Zustand | 5.0.3 | State management |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker Desktop | Container runtime |
| Docker Compose | Multi-service orchestration |
| PostgreSQL 16 | Database |
| nginx 1.27 | Production frontend server |
| GitHub Actions | CI/CD pipeline |

---

## 3. Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI pipeline (lint + test + build)
├── backend/
│   ├── apps/
│   │   ├── core/                   # Shared: models, mixins, exceptions, pagination, utils
│   │   ├── users/                  # User model, profile, password change
│   │   └── authentication/         # JWT login / logout / refresh
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py             # Shared settings
│   │   │   ├── development.py      # Dev overrides
│   │   │   └── production.py       # Prod overrides (HTTPS, HSTS)
│   │   ├── urls.py                 # Root URL config
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── setup.cfg                   # isort + flake8 config
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                    # Typed API functions (one file per resource)
│   │   ├── components/common/      # Shared MUI wrapper components
│   │   ├── constants/              # ROUTES, theme, TOKEN_KEYS
│   │   ├── hooks/                  # useAuth, useApi
│   │   ├── pages/                  # One file per route
│   │   ├── routes/                 # AppRoutes, ProtectedRoute
│   │   ├── store/                  # Zustand stores
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   └── utils/                  # tokenUtils and other helpers
│   ├── Dockerfile                  # Multi-stage: dev (Vite) / prod (nginx)
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml              # Development stack
├── docker-compose.prod.yml         # Production overrides
├── CLAUDE.md                       # AI coding rules
└── DOCUMENT.md                     # This file
```

---

## 4. Environment Setup

### Backend `.env` variables

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

Copy from `backend/.env.example` — never commit `.env`.

### Frontend `.env.local` variables

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 5. Running the Project

### Docker (recommended — one command)

```bash
# Start all services (db + backend + frontend)
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Run after adding a new model
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Run backend tests
docker compose exec backend pytest
```

| Service | URL |
|---|---|
| React frontend | http://localhost:3000 |
| Django API | http://localhost:8000/api/v1/ |
| Django Admin | http://localhost:8000/admin/ |

### Manual (without Docker)

```bash
# Terminal 1 — DB
docker compose up db

# Terminal 2 — Backend
cd backend && venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## 6. CI/CD Pipeline

**File:** `.github/workflows/ci.yml`
**Triggers:** Push or PR to `main` / `develop`

### Backend job
1. Spins up real PostgreSQL 16 service
2. Installs Python 3.13 + pip cache
3. **Black** — format check
4. **isort** — import order check
5. **flake8** — lint
6. `manage.py migrate` — schema check
7. **pytest** — full test suite with coverage

### Frontend job
1. Installs Node 22 + npm cache
2. `npm ci` — clean install from lock file
3. **tsc --noEmit** — TypeScript type check
4. `npm run build` — production Vite build
5. Uploads `dist/` as artifact (7-day retention)

---

## 7. Phase 1 — Project Scaffold

**Status:** Complete  
**Completed:** 2026-06-07

### What was built
- Django project structure with split settings (base / development / production)
- Custom `User` model (email-based login, no username)
- `TimeStampedModel` abstract base class (`created_at`, `updated_at`)
- Shared `SuccessResponseMixin`, `custom_exception_handler`, `StandardResultsPagination`
- React + Vite + TypeScript + MUI v6 scaffold
- Zustand auth store with auto token refresh
- Docker Compose dev stack + multi-stage production Dockerfile
- GitHub Actions CI pipeline

---

## 8. Phase 2 — User Authentication Module

**Status:** Complete  
**Completed:** 2026-06-07

### User model fields

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | PK |
| `email` | EmailField | unique, login identifier |
| `first_name` | CharField(150) | optional |
| `last_name` | CharField(150) | optional |
| `phone_number` | CharField(20) | optional; validated format (7–20 digits) |
| `is_active` | BooleanField | default True |
| `is_staff` | BooleanField | default False |
| `created_at` | DateTimeField | auto set on create |
| `updated_at` | DateTimeField | auto set on save |

### Backend API endpoints

Base URL: `/api/v1/`

#### Authentication (`/api/v1/auth/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/` | Public | Create account (alias for `/users/register/`) |
| `POST` | `/auth/login/` | Public | Email + password → access + refresh tokens |
| `POST` | `/auth/refresh/` | Public | Refresh token → new access token |
| `POST` | `/auth/logout/` | Bearer | Blacklist refresh token |
| `GET` | `/auth/profile/` | Bearer | Get own profile (alias for `/users/me/`) |
| `PATCH` | `/auth/profile/` | Bearer | Update name / phone (alias for `/users/me/`) |

#### Users (`/api/v1/users/`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/users/register/` | Public | Create account |
| `GET` | `/users/me/` | Bearer | Get own profile |
| `PATCH` | `/users/me/` | Bearer | Update first_name, last_name, phone_number |
| `POST` | `/users/change-password/` | Bearer | Change password (current + new) |

### Request / Response shapes

**POST `/auth/login/`**
```json
// Request
{ "email": "user@example.com", "password": "StrongPass123!" }

// Response 200
{
  "success": true,
  "message": "Login successful.",
  "data": { "access": "<token>", "refresh": "<token>" }
}
```

**POST `/auth/register/`** (same as `/users/register/`)
```json
// Request
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "password_confirm": "StrongPass123!",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone_number": "+1-555-123-4567"
}

// Response 201
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "phone_number": "+1-555-123-4567",
    "created_at": "2026-06-07T..."
  }
}
```

**POST `/users/change-password/`**
```json
// Request
{
  "current_password": "OldPass123!",
  "new_password": "NewPass456!",
  "new_password_confirm": "NewPass456!"
}

// Response 200
{ "success": true, "message": "Password changed successfully.", "data": null }
```

**Error envelope (all errors)**
```json
{
  "success": false,
  "message": "Human-readable summary.",
  "errors": { "<field>": ["Detail message."] }
}
```

### Frontend pages

| Route | Page | Auth required |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/dashboard` | `DashboardPage` | Yes |
| `/profile` | `ProfilePage` | Yes |
| `/change-password` | `ChangePasswordPage` | Yes |

### Test coverage

| File | Tests |
|---|---|
| `apps/users/tests/test_user_api.py` | Register (success, with phone, invalid phone, duplicate email, password mismatch, weak password), Me GET (auth, unauth), Me PATCH (name, phone, invalid phone, unauth), ChangePassword (success, wrong current, mismatch, weak, unauth) |
| `apps/authentication/tests/test_auth_api.py` | Register via auth prefix (success, duplicate, mismatch), Profile via auth prefix (get, unauth, update phone), Login (success, wrong password, nonexistent, inactive, missing fields), Refresh (success, invalid token, missing), Logout (success, missing token, unauth) |

---

---

## 9. Phase 3 — Category Management Module

**Status:** Complete  
**Completed:** 2026-06-07

### Category model fields

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | PK |
| `name` | CharField(200) | unique |
| `slug` | SlugField(220) | unique; auto-generated from name if omitted |
| `description` | TextField | optional |
| `is_active` | BooleanField | default True; inactive hidden from public |
| `created_at` | DateTimeField | auto set on create |
| `updated_at` | DateTimeField | auto set on save |

### Backend API endpoints

Base URL: `/api/v1/categories/`  
Lookup: by **slug** (not pk) — e.g. `/api/v1/categories/electronics/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories/` | Public | Paginated list (active only for public; all for admin) |
| `GET` | `/categories/{slug}/` | Public | Single category detail |
| `POST` | `/categories/` | Admin | Create category (slug auto-generated if omitted) |
| `PUT` | `/categories/{slug}/` | Admin | Full update |
| `PATCH` | `/categories/{slug}/` | Admin | Partial update (slug preserved if not supplied) |
| `DELETE` | `/categories/{slug}/` | Admin | Hard delete |

### Serializer design

Two serializers keep read and write separate:

- **`CategoryReadSerializer`** — all fields read-only; returned to all callers including after every write operation.
- **`CategoryWriteSerializer`** — admin input only; `slug` is optional and auto-derived from `name` on create; on PATCH without a new slug the existing slug is preserved.

### Permission matrix

| Action | Unauthenticated | Regular user | Admin (is_staff) |
|---|---|---|---|
| list / retrieve | 200 ✓ | 200 ✓ | 200 ✓ (sees inactive too) |
| create | 401 | 403 | 201 ✓ |
| update / partial update | 401 | 403 | 200 ✓ |
| delete | 401 | 403 | 200 ✓ |

### Request / Response shapes

**POST `/categories/`**
```json
// Request (slug is optional)
{ "name": "Electronics", "description": "All electronic products.", "is_active": true }

// Response 201
{
  "success": true,
  "message": "Category created successfully.",
  "data": { "id": 1, "name": "Electronics", "slug": "electronics", ... }
}
```

**GET `/categories/`** (paginated)
```json
{
  "success": true,
  "count": 12,
  "next": "http://localhost:8000/api/v1/categories/?page=2",
  "previous": null,
  "results": [{ "id": 1, "name": "Electronics", "slug": "electronics", ... }]
}
```

### Test coverage

| File | Tests |
|---|---|
| `apps/categories/tests/test_category_api.py` | List (public, active-only filter, admin sees inactive, field check), Retrieve (public, 404, inactive hidden/visible), Create (success, auto-slug, custom slug, duplicate name, missing name, non-admin 403, unauth 401), Update (full, partial slug preserved, slug change, non-admin 403, unauth 401), Delete (success, non-admin 403, unauth 401, DB removal) |

---

## 10. Phase 4 — Product Module

**Status:** Complete  
**Completed:** 2026-06-07

### Product model fields

| Field | Type | Notes |
|---|---|---|
| `id` | BigAutoField | PK |
| `name` | CharField(255) | unique |
| `slug` | SlugField(280) | unique; auto-generated from name if blank |
| `sku` | CharField(20) | unique; auto-generated (`SKU-XXXXXXXX` from UUID hex) |
| `description` | TextField | optional; defaults to `""` |
| `price` | DecimalField(10,2) | required; min 0.01 enforced in serializer |
| `stock_quantity` | PositiveIntegerField | default 0 |
| `image` | ImageField | optional; stored via Cloudinary |
| `category` | FK → Category | `SET_NULL`; optional |
| `is_active` | BooleanField | default True; inactive hidden from public |
| `created_at` | DateTimeField | auto set on create |
| `updated_at` | DateTimeField | auto set on save |

### Image storage

Media files are stored in **Cloudinary** via `django-cloudinary-storage`. The backend `.env` requires:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Backend API endpoints

Base URL: `/api/v1/products/`  
Lookup: by **slug** — e.g. `/api/v1/products/wireless-mouse/`  
Content-Type: `multipart/form-data` for create/update (image upload)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products/` | Public | Paginated list (active only for public; all for admin) |
| `GET` | `/products/{slug}/` | Public | Single product detail |
| `POST` | `/products/` | Admin | Create product; slug + SKU auto-generated |
| `PATCH` | `/products/{slug}/` | Admin | Partial update; SKU never changes |
| `DELETE` | `/products/{slug}/` | Admin | Hard delete |

### Serializer design

- **`ProductReadSerializer`** — all fields read-only; includes nested `CategoryReadSerializer`; `image_url` via `SerializerMethodField` (returns absolute URL).
- **`ProductWriteSerializer`** — admin input; `slug` optional (auto from name); `image` optional; validates `price > 0`.

### Permission matrix

| Action | Unauthenticated | Regular user | Admin (is_staff) |
|---|---|---|---|
| list / retrieve | 200 ✓ (active only) | 200 ✓ (active only) | 200 ✓ (all) |
| create | 401 | 403 | 201 ✓ |
| update / partial update | 401 | 403 | 200 ✓ |
| delete | 401 | 403 | 200 ✓ |

### Request / Response shapes

**POST `/products/`** (`multipart/form-data`)
```
name=Wireless Mouse
price=39.99
stock_quantity=50
category=1          ← category id
is_active=true
image=<file>        ← optional
```

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "slug": "wireless-mouse",
    "sku": "SKU-A3F2B1C9",
    "price": "39.99",
    "stock_quantity": 50,
    "image_url": "https://res.cloudinary.com/...",
    "category": { "id": 1, "name": "Electronics", "slug": "electronics", ... },
    "is_active": true,
    "created_at": "2026-06-07T..."
  }
}
```

### Frontend

| Route | Page | Auth required | Admin-only actions |
|---|---|---|---|
| `/products` | `ProductsPage` | Yes | New Product button, Edit/Delete per row |

**Key components:**
- `src/pages/ProductsPage.tsx` — table view; admins see ActionMenu per row
- `src/components/products/ProductFormModal.tsx` — create/edit form with image upload + preview, category dropdown, active toggle
- `src/api/productApi.ts` — uses `apiClient.postForm` / `patchForm` for multipart upload

### Test coverage

| File | Tests |
|---|---|
| `apps/products/tests/test_product_api.py` | List (public, active-only filter, admin sees all, SKU in response), Retrieve (public, 404, inactive hidden/visible to admin), Create (success, auto SKU+slug, missing name, non-admin 403, unauth 401), Update (partial success, SKU preserved, non-admin 403, unauth 401), Delete (success, DB removal, non-admin 403, unauth 401) |

### Files created / changed

**Backend:**
- `backend/apps/products/models.py` — Product model
- `backend/apps/products/serializers.py` — read + write serializers
- `backend/apps/products/views.py` — ProductViewSet
- `backend/apps/products/urls.py` — router registration
- `backend/apps/products/admin.py` — admin config
- `backend/apps/products/migrations/0001_initial.py`
- `backend/apps/products/tests/factories.py`
- `backend/apps/products/tests/test_product_api.py`
- `backend/config/settings/base.py` — added `apps.products`, `cloudinary_storage`, `CLOUDINARY_STORAGE`, `STORAGES`
- `backend/config/urls.py` — added products URL
- `backend/requirements.txt` — added Pillow, cloudinary, django-cloudinary-storage
- `backend/.env.example` — added Cloudinary variables

**Frontend:**
- `frontend/src/types/index.ts` — added `Product`, `ProductPayload`
- `frontend/src/constants/index.ts` — added `ROUTES.PRODUCTS`
- `frontend/src/api/client.ts` — added `postForm`, `patchForm`
- `frontend/src/api/productApi.ts` — new
- `frontend/src/components/products/ProductFormModal.tsx` — new
- `frontend/src/pages/ProductsPage.tsx` — new
- `frontend/src/components/layout/AuthLayout.tsx` — added Products nav item
- `frontend/src/pages/DashboardPage.tsx` — added Products quick link
- `frontend/src/pages/ProfilePage.tsx` — added role display + Admin chip
- `frontend/src/routes/AppRoutes.tsx` — added `/products` route

---

## 11. Phase 5 — Product Search, Filter & Sort

**Status:** Complete — **Completed:** 2026-06-07

Product list endpoint now accepts:

| Param | Example | Description |
|---|---|---|
| `search` | `?search=mouse` | Full-text search across `name` + `description` (SearchFilter) |
| `category` | `?category=electronics` | Filter by category **slug** (DjangoFilterBackend) |
| `min_price` | `?min_price=10` | Price ≥ value |
| `max_price` | `?max_price=100` | Price ≤ value |
| `ordering` | `?ordering=price` | Price asc; `-price` desc; `-created_at` newest |
| `page_size` | `?page_size=10` | Items per page (default 10, max 50) |

### Example requests

```
GET /api/v1/products/?search=wireless&category=electronics&max_price=150&ordering=-price
GET /api/v1/products/?min_price=50&ordering=price&page=2
GET /api/v1/products/{slug}/related/   → up to 4 same-category products
```

### New files / changes
- `apps/products/filters.py` — `ProductFilter` (min_price, max_price, category slug)
- `apps/products/views.py` — filter_backends, `related` action
- `apps/core/pagination.py` — `ProductResultsPagination` (page_size=10)
- `requirements.txt` — added `django-filter==24.3`
- `config/settings/base.py` — added `django_filters` to INSTALLED_APPS

---

## 12. Phase 6 — Cart Module

**Status:** Complete — **Completed:** 2026-06-07

One cart per user (OneToOne). Cart is auto-created on first add.

### API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/cart/` | Bearer | Get current cart (creates if missing) |
| `POST` | `/cart/` | Bearer | Add product; increments qty if already present |
| `DELETE` | `/cart/` | Bearer | Clear all items |
| `PATCH` | `/cart/items/{id}/` | Bearer | Update quantity |
| `DELETE` | `/cart/items/{id}/` | Bearer | Remove single item |

### Response shape

```json
{
  "success": true, "message": "...", "data": {
    "id": 1,
    "items": [{ "id": 1, "product": {...}, "quantity": 2, "line_total": "79.98" }],
    "total_items": 2,
    "subtotal": "79.98"
  }
}
```

### Files created
- `apps/cart/models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`
- `apps/cart/migrations/0001_initial.py`
- `apps/core/exceptions.py` — added `AppError(message, status_code)` class

---

## 13. Phase 7 — Order Module

**Status:** Complete — **Completed:** 2026-06-07

### API endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders/checkout/` | Bearer | Atomic checkout: creates order, reduces stock, clears cart |
| `GET` | `/orders/` | Bearer | List orders (own; admin sees all) |
| `GET` | `/orders/{id}/` | Bearer | Retrieve single order |
| `PATCH` | `/orders/{id}/status/` | Admin | Update order status |

### Checkout transaction (atomic)

1. Validate cart is not empty
2. Validate each item has sufficient `stock_quantity`
3. Create `Order` record
4. `bulk_create` `OrderItem`s — copies `product_name`, `product_sku`, `unit_price` as a snapshot
5. Reduce `stock_quantity` on each product via a targeted `.update()` (no race condition)
6. Clear cart items

### Status values

`PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` (or `CANCELLED`)

### Files created
- `apps/orders/models.py`, `serializers.py`, `views.py`, `urls.py`, `admin.py`
- `apps/orders/migrations/0001_initial.py`

---

## 14. Phase 8 — Admin Dashboard Stats

**Status:** Complete — **Completed:** 2026-06-07

### API endpoint

`GET /api/v1/admin/stats/` — Admin only

```json
{
  "success": true, "data": {
    "total_users": 120,
    "total_products": 45,
    "total_orders": 302,
    "total_categories": 8,
    "total_revenue": "18450.00",
    "pending_orders": 12,
    "active_carts": 34
  }
}
```

All values are single-query ORM aggregates (`COUNT`, `SUM`) — no N+1 queries.

### Files created
- `apps/dashboard/views.py`, `urls.py`, `apps.py`, `__init__.py`

---

## 15. Phase 9 — Frontend: Product Detail, Cart, Orders, Search

**Status:** Complete — **Completed:** 2026-06-07

### New routes

| Route | Page | Auth |
|---|---|---|
| `/products/:slug` | `ProductDetailPage` | No |
| `/cart` | `CartPage` | Yes |
| `/orders` | `OrdersPage` | Yes |

### Key features

- **ProductDetailPage** — image, name, SKU, price, stock badge, qty selector, Add to Cart; related products grid below
- **CartPage** — line items with qty editing, remove, order summary panel, Place Order → ConfirmModal → checkout
- **OrdersPage** — collapsible order cards; admin can update status inline
- **ProductsPage** — search bar, category filter, min/max price, sort dropdown — all debounced and synced to URL params
- **HomePage** — real products from API (newest 8), skeleton loading, Add to Cart / Login to Buy
- **DashboardPage** — admin stat cards (users, products, orders, revenue, pending, carts) above quick links
- **Navbar** — auth-aware: logged-in shows Dashboard + Cart badge; logged-out shows Login + Register
- **Sidebar** — fetches cart on mount; Cart nav item shows badge; cart cleared on logout

### Bug fixes

- **Page load flash**: moved Suspense boundary inside `AuthLayout` to only wrap the content area — sidebar no longer disappears during page transitions
- **Navbar after login**: Navbar now reads `isAuthenticated` from auth store and shows Dashboard/Cart instead of Login/Register

### Files created / changed

- `pages/ProductDetailPage.tsx`, `pages/CartPage.tsx`, `pages/OrdersPage.tsx` — new
- `pages/HomePage.tsx`, `pages/ProductsPage.tsx`, `pages/DashboardPage.tsx` — updated
- `api/cartApi.ts`, `api/orderApi.ts`, `api/dashboardApi.ts`, `api/productApi.ts` — new / updated
- `store/cartStore.ts` — new Zustand cart store
- `components/layout/Navbar.tsx` — auth-aware, cart badge, search navigates to products
- `components/layout/AuthLayout.tsx` — inner Suspense fix, cart fetch on mount, cart reset on logout
- `routes/AppRoutes.tsx` — per-route Suspense, new routes wired
- `types/index.ts` — Cart, CartItem, Order, OrderItem, AdminStats
- `constants/index.ts` — ROUTES.CART, ROUTES.ORDERS, ROUTES.PRODUCT_DETAIL, `productDetailPath()`

<!-- ── Add new phases below this line ─────────────────────────────────────── -->
