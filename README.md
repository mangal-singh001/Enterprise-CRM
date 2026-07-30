# Internal Enterprise CRM Platform

A unified, modular, enterprise-grade internal CRM web application built for operational efficiency across multiple SaaS products (**EduPulse** and **CloudMetric**). Designed with Python (FastAPI + SQLAlchemy) on the backend, React + Vite + Tailwind CSS on the frontend, and an extensible metadata entity registry pattern for effortless long-term growth.

---

## 🌟 Key Architecture & Features

### 1. Identity Provider (IdP) Token Authentication (No Login Page)
- **Token-Based SSO Flow**: Employees authenticate via company Identity Provider (IdP). Opening the application with `?token=<signed_token>` automatically validates the signature, extracts user claims (`email`, `name`, `products`, `role`), issues a session JWT token, and strips the query parameter for a clean URL.
- **Product-Level RBAC**: Enforces strict access boundaries per product (e.g. a user authorized for `EduPulse` cannot access `CloudMetric` records unless authorized).

### 2. Extensible Dynamic Entity Registry Architecture
- **Low-Code Module Registration**: Entities are defined declaratively in `backend/app/core/registry.py`.
- **Dynamic Frontend UI Engine**: The React frontend queries `/api/v1/metadata/entities/{productId}/{entityId}` to render data tables, search filters, badges, formatted columns, and channel-dependent dynamic input forms automatically.
- **Adding a New Product or Entity in 5 Minutes**: Requires only creating an ORM model + registering it in `registry.py`. No repetitive frontend table/form rewriting needed.

### 3. Supported SaaS Product Workspaces & Entities
- **EduPulse Workspace**:
  - **Subscription Plans**: Plan name, price, billing cycle (Monthly, Quarterly, Yearly), and structured JSON features builder.
  - **Message Templates**: Template name, delivery channel (Email, SMS, WhatsApp, Push), and channel-dependent configuration (Email subject/HTML body vs SMS message text & sender ID).
- **CloudMetric Workspace**:
  - **Client Sites**: Domain name, live API key (with auto-generator tool), status (Active, Suspended, Maintenance), and daily request quota.

### 4. Executive Analytics & System Governance Audit Log
- Cross-product metric aggregations, quota meter tracking, and real-time audit history feed tracking every `CREATE`, `UPDATE`, and `DELETE` action across products.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyJWT, Pytest.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Database**: SQLite (default zero-config local run) + MySQL / PostgreSQL support (`database/schema.sql` and `database/seed.sql` provided).

---

## 🚀 Quick Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (npm)

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
*The backend automatically seeds initial sample data for EduPulse and CloudMetric upon first startup!*

### Step 2: Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The React frontend will be accessible at `http://localhost:3000`.

---

## 🔑 Helper Script: Generating Local Testing SSO URLs

Since the platform relies on signed IdP SSO tokens rather than a traditional login form, a helper script is included to generate valid local login URLs.

```bash
# Run from project root directory
python scripts/generate_auth_token.py --user ops.lead@company.com --name "Jane Doe" --products edupulse,cloudmetric --role ADMIN
```

**Output:**
```
================================================================================
  ENTERPRISE CRM - IDENTITY PROVIDER (IdP) TEST SSO URL GENERATOR
================================================================================
 User Identity   : Jane Doe (ops.lead@company.com)
 User Role       : ADMIN
 Authorized Scopes: edupulse, cloudmetric
--------------------------------------------------------------------------------
 Copy and paste the following URL into your browser to log in:

 http://localhost:3000/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
================================================================================
```

---

## 📐 Assumptions & Design Decisions

### Assumptions Made
1. **IdP Token Standard**: The external system issues HMAC-SHA256 JWT tokens containing `email`, `name`, `products` (list of authorized product IDs), and `role`.
2. **Relational Database**: Relational schema design with JSON column support allows both strict tabular constraints and flexible schema fields (e.g. template message configurations).
3. **Product Isolation**: Operations employees work within specific product scopes, but executive roles require cross-product visibility.

### Key Architectural Decisions
- **Declarative Entity Registry**: Instead of writing separate CRUD controllers and custom table views for every entity, entities register their fields, constraints, and table column definitions once in Python. The React frontend queries this metadata to render tables and forms dynamically.
- **Audit Logging Middleware**: Every mutation API (`POST`, `PUT`, `DELETE`) creates an immutable `crm_audit_logs` record capturing product ID, entity ID, action, user email, timestamp, and field diffs.

---

## 🗄️ Database Schemas & SQL Files

- **`database/schema.sql`**: Production MySQL/PostgreSQL DDL table creation script.
- **`database/seed.sql`**: Comprehensive SQL seed data script.

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/
```
Tests cover SSO token verification, invalid token rejection, and product authorization enforcement.
