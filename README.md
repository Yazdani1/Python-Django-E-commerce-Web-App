# Django E-Commerce Web App

A production-ready full-stack e-commerce application built with Django REST Framework and React + Material UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2 · DRF 3.16 · SimpleJWT |
| Frontend | React 18 · TypeScript · Vite · Material UI v6 |
| Database | PostgreSQL 16 |
| State | Zustand |
| Auth | JWT (access + refresh tokens) |
| Infrastructure | Docker Compose · nginx (prod) · GitHub Actions |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended path)
- **Or** manually: Python 3.13+, Node 20+, PostgreSQL 16

---

## Quick Start — Docker (recommended)

```bash
# 1. Clone the repo
git clone <repo-url>
cd <repo-directory>

# 2. Create the backend .env file (see Environment Variables below)
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 3. Start all services (db + backend + frontend)
docker compose up --build -d

# 4. Create a superuser (first time only)
docker compose exec backend python manage.py createsuperuser
```

| Service | URL |
|---|---|
| React frontend | http://localhost:3000 |
| Django REST API | http://localhost:8000/api/v1/ |
| Django Admin | http://localhost:8000/admin/ |

### Useful Docker commands

```bash
# View live logs from all services
docker compose logs -f

# Run after adding a new Django model
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Run the backend test suite
docker compose exec backend pytest

# Stop all services
docker compose down

# Stop and remove volumes (wipes the database)
docker compose down -v
```

---

## Manual Setup (without Docker)

### 1. Start the database

```bash
# Spin up only the PostgreSQL container
docker compose up db -d
```

Or point `backend/.env` at an existing PostgreSQL instance.

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# (Optional) Create a superuser
python manage.py createsuperuser

# Start the dev server
python manage.py runserver
# Runs at http://localhost:8000
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create the frontend env file
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env.local

# Start the Vite dev server
npm run dev
# Runs at http://localhost:3000
```

---

## Environment Variables

### `backend/.env`

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Cloudinary (media storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Copy from `backend/.env.example`. **Never commit `.env`.**

### `frontend/.env.local`

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Running Tests

```bash
# With Docker
docker compose exec backend pytest

# Without Docker (activate venv first)
cd backend
pytest

# With coverage report
pytest --cov=apps --cov-report=term-missing
```

---

## Production Deployment

The production stack uses a multi-stage Docker build — Django is served by Gunicorn and the React build is served by nginx.

```bash
# Build and start production services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Key differences from dev:
- Backend runs Gunicorn with 4 workers instead of `runserver`
- `collectstatic` is run automatically on startup
- Frontend is built and served by nginx on port 80
- `DJANGO_SETTINGS_MODULE` is set to `config.settings.production`

---

## Project Structure

```
├── backend/
│   ├── apps/
│   │   ├── core/            # Shared utilities, mixins, exceptions, pagination
│   │   ├── users/           # User model, profile, password change
│   │   ├── authentication/  # JWT login / logout / refresh
│   │   ├── categories/      # Category CRUD
│   │   ├── products/        # Product CRUD, search, filter, sort
│   │   ├── cart/            # Cart & cart items
│   │   ├── orders/          # Order placement & history
│   │   └── dashboard/       # Admin stats
│   ├── config/
│   │   └── settings/        # base / development / production
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API functions (one file per resource)
│   │   ├── components/      # Shared MUI wrapper components + feature components
│   │   ├── constants/       # ROUTES, theme, TOKEN_KEYS
│   │   ├── hooks/           # useApi, useAuth, feature hooks
│   │   ├── pages/           # One file per route
│   │   ├── routes/          # AppRoutes, ProtectedRoute
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # Shared TypeScript interfaces
│   │   └── utils/           # Pure helper functions
│   ├── Dockerfile           # Multi-stage: dev (Vite) / prod (nginx)
│   └── nginx.conf
├── docker-compose.yml       # Development stack
├── docker-compose.prod.yml  # Production overrides
└── DOCUMENT.md              # Full API & feature documentation
```

---

## Key Features

- JWT authentication (register, login, logout, token refresh)
- Category management (admin-only CRUD)
- Product listing with search, filter by category/price, and sort
- Product image upload via Cloudinary
- Shopping cart (add, update quantity, remove items)
- Order placement and order history
- Admin dashboard with revenue and order stats
- Role-based access control (admin vs. customer)

---

## Documentation

Full API reference, endpoint contracts, and phase-by-phase feature breakdown are in [DOCUMENT.md](DOCUMENT.md).
