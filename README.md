# Inteligent Electricity Contract Manager 

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-powered web portal for managing electricity contracts, identity verification, and customer service operations in the Moroccan energy market. Features OCR-based CIN verification, automated PDF contract generation, email delivery, and bilingual support (French/English).

## 🎥 Project Presentation

[![Project Demo Video](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://youtu.be/VIDEO_ID)


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Knowledge Base](#knowledge-base)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This monorepo contains a full-stack application that streamlines electricity contract subscription and customer service for Moroccan energy providers (ONEE, LYDEC, REDAL, AMENDIS). It combines a React frontend with a FastAPI backend, integrating AI services for document processing, contract generation, and intelligent inquiry handling.

```
Hackatoon/
├── Frontend/       # React 18 + TypeScript SPA
├── Backend/        # FastAPI REST API
├── documents/      # Knowledge base (14 JSON files)
└── README.md
```

## Features

- **Contract Management** — Create, modify, and track electricity contracts through a guided workflow (draft, sent, signed, active).
- **OCR Identity Verification** — Upload a CIN (Carte d'Identite Nationale) image; the system extracts data via Mistral Vision API with EasyOCR fallback, then verifies it against form inputs.
- **PDF Contract Generation** — Automatically generate professional PDF contracts from templates (individual, household, commercial) and deliver them by email.
- **E-Signature Workflow** — Digital signature capture via a canvas-based signing page.
- **Complaint Management** — Submit complaints with automatic classification by category (billing, technical, connection, service quality) and severity (low, normal, high, urgent).
- **Bilingual Interface** — Real-time switching between French and English with 1000+ translated strings.
- **Responsive Design** — Mobile-first layout built with Tailwind CSS and shadcn/ui components.
- **Type Safety** — End-to-end validation with TypeScript + Zod on the frontend and Pydantic v2 on the backend.

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript 5 | Type-safe JavaScript |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| shadcn/ui (Radix) | Accessible component primitives |
| React Hook Form + Zod | Form management and validation |
| TanStack Query v5 | Async state management |
| React Router DOM v6 | Client-side routing |
| React Signature Canvas | E-signature capture |
| Recharts | Data visualization |

### Backend

| Technology | Purpose |
|---|---|
| FastAPI 0.128 | Async Python web framework |
| SQLAlchemy 2.0 | ORM and database toolkit |
| Pydantic v2 | Request/response validation |
| Uvicorn 0.40 | ASGI server |
| MySQL 8.0 (Aiven) | Relational database |
| EasyOCR + OpenCV | Local OCR text extraction |
| Mistral Vision API | AI-powered document data extraction |
| ReportLab + xhtml2pdf | PDF generation |
| SMTP | Email delivery |

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                         │
│  React 18 + TypeScript  |  Tailwind CSS  |  shadcn/ui    │
└─────────────────────────┬─────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼─────────────────────────────────┐
│                       API LAYER                           │
│  FastAPI  |  Pydantic Validation  |  Uvicorn  |  CORS    │
└─────────────────────────┬─────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DATA LAYER  │  │   AI LAYER   │  │   SERVICES   │
│ MySQL(Aiven) │  │ Mistral OCR  │  │ SMTP Email   │
│ JSON KBase   │  │ EasyOCR      │  │ PDF Gen      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Data Flow

1. User selects a request type on the frontend (new contract, modification, connection, inquiry, complaint).
2. Form data is validated client-side with Zod, then sent as a POST request to FastAPI.
3. Backend creates Customer/Contract/Complaint records in MySQL.
4. For CIN uploads: OCR extraction via Mistral Vision (with EasyOCR fallback) extracts identity data, which is verified against form inputs.
5. A PDF contract is generated from a template and emailed to the customer via SMTP.
6. The frontend displays a confirmation screen with a reference number.

## Prerequisites

- **Python** 3.10+ — [python.org](https://www.python.org/downloads/)
- **Node.js** 18+ — [nodejs.org](https://nodejs.org/)
- **MySQL** 8.0+ (or an Aiven cloud instance)
- **Git**

Verify installations:

```bash
python --version   # 3.10+
node --version     # 18+
npm --version      # 9+
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ms30udi/Hackatoon.git
cd Hackatoon
```

### 2. Backend Setup

```bash
cd Backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# Database
DATABASE_URL=mysql+pymysql://username:password@host:port/database_name

# SMTP Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Mistral API (for OCR)
MISTRAL_API_KEY=your-mistral-api-key
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Database Initialization

Tables are created automatically on first startup. The FastAPI application connects to MySQL and creates all required tables via SQLAlchemy if they don't already exist. No manual migrations are needed.

## Running the Application

### Start the Backend

```bash
cd Backend

# Development (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend available at: **http://localhost:8000**

### Start the Frontend

```bash
cd Frontend
npm run dev
```

Frontend available at: **http://localhost:5173**

### Verify Installation

1. **Health check**: `GET http://localhost:8000/` should return `{"status":"Backend running, database connected"}`
2. **API docs**: Open http://localhost:8000/docs (Swagger UI)
3. **Frontend**: Open http://localhost:5173 to see the Service Portal

## API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### Contracts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/contracts/draft` | Create a contract draft |
| POST | `/contracts/{id}/upload-cin` | Upload CIN image for OCR verification |
| POST | `/contracts/{id}/send-verification-email` | Send verification email |
| POST | `/contracts/{id}/sign` | Sign a contract |

#### Customers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers/` | Create a customer |
| GET | `/customers/` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| GET | `/customers/check-cin/{national_id}` | Check if CIN exists |

#### Complaints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/complaints/` | Create a complaint |
| GET | `/complaints/` | List all complaints |
| GET | `/complaints/{id}` | Get complaint by ID |

#### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |

## Testing

### Backend

```bash
cd Backend

pytest                              # Run all tests
pytest --cov=app tests/             # With coverage report
pytest tests/test_api_endpoints.py  # API tests only
pytest tests/test_database_storage.py  # Database tests only
pytest -v                           # Verbose output
```

### Frontend

```bash
cd Frontend

npm test              # Run tests (Vitest)
npm run test:watch    # Watch mode
npm run lint          # ESLint
```

## Project Structure

```
Hackatoon/
├── Backend/
│   ├── app/
│   │   ├── main.py                        # FastAPI app, CORS, route registration
│   │   ├── database.py                    # MySQL connection and session management
│   │   ├── models.py                      # SQLAlchemy ORM models (5 tables)
│   │   ├── schemas.py                     # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── contracts.py               # Contract CRUD, CIN upload, PDF, signing
│   │   │   ├── customers.py               # Customer CRUD
│   │   │   └── complaints.py              # Complaint CRUD
│   │   └── utils/
│   │       ├── ocr.py                     # EasyOCR text extraction
│   │       ├── ocr_cleaning.py            # OCR output post-processing
│   │       ├── mistral_extraction.py      # Mistral Vision API integration
│   │       ├── verification.py            # Identity comparison logic
│   │       ├── identity_rules.py          # Moroccan ID validation rules
│   │       ├── cin_id.py                  # CIN format validation
│   │       ├── pdf_generator.py           # PDF creation (ReportLab)
│   │       ├── html_pdf_generator.py      # HTML-to-PDF conversion
│   │       ├── json_pdf_generator.py      # JSON template PDF rendering
│   │       ├── json_template_loader.py    # Contract template loader
│   │       ├── email_service.py           # SMTP email sending
│   │       └── dynamic_contract_generator.py  # Contract generation logic
│   ├── tests/
│   │   ├── test_api_endpoints.py
│   │   └── test_database_storage.py
│   ├── requirements.txt
│   └── pytest.ini
├── Frontend/
│   ├── src/
│   │   ├── main.tsx                       # Entry point
│   │   ├── App.tsx                        # Root component with routing
│   │   ├── pages/
│   │   │   ├── Index.tsx                  # Homepage
│   │   │   ├── ContractSigningPage.tsx    # E-signature workflow
│   │   │   └── NotFound.tsx               # 404 page
│   │   ├── components/
│   │   │   ├── ServicePortal.tsx          # Main portal container
│   │   │   ├── Header.tsx                 # Navigation header
│   │   │   ├── Footer.tsx                 # Footer
│   │   │   ├── ContractTypeSelector.tsx   # Request type selection
│   │   │   ├── LanguageToggle.tsx         # FR/EN language switcher
│   │   │   ├── ConfirmationScreen.tsx     # Submission confirmation
│   │   │   ├── forms/
│   │   │   │   ├── NewContractForm.tsx
│   │   │   │   ├── ModifyContractForm.tsx
│   │   │   │   ├── NewConnectionForm.tsx
│   │   │   │   ├── InformationRequestForm.tsx
│   │   │   │   ├── CINVerificationForm.tsx
│   │   │   │   └── ContractDraftForm.tsx
│   │   │   └── ui/                        # 40+ shadcn/ui components
│   │   ├── contexts/
│   │   │   └── LanguageContext.tsx         # i18n state (FR/EN)
│   │   └── lib/
│   │       └── translations.ts            # Translation strings
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── documents/                             # Knowledge base (14 JSON files)
│   ├── contracts/
│   │   ├── clauses.json
│   │   ├── contrats_templates.json
│   │   └── documents_requis.json
│   ├── knowledge/
│   │   ├── faqs.json
│   │   └── conseils_energie.json
│   ├── reference/
│   │   ├── fournisseurs.json
│   │   ├── qualite_service.json
│   │   ├── reglementation.json
│   │   └── types_compteurs.json
│   └── services/
│       ├── modes_paiement.json
│       ├── procedures.json
│       ├── reclamations.json
│       └── tarification.json
├── PRD_HACKATHON PROJECT.md               # Product Requirements Document
└── README.md
```

## Knowledge Base

The `documents/` directory contains 14 structured JSON files used as a knowledge base for the system:

| File | Content |
|---|---|
| `clauses.json` | Contract legal terms and conditions |
| `contrats_templates.json` | Contract document templates |
| `documents_requis.json` | Required documentation checklist |
| `faqs.json` | Frequently asked questions |
| `conseils_energie.json` | Energy conservation tips |
| `fournisseurs.json` | Electricity provider details |
| `qualite_service.json` | Service quality standards and SLA |
| `reglementation.json` | Moroccan electricity regulations |
| `types_compteurs.json` | Meter types and technical specs |
| `modes_paiement.json` | Payment methods |
| `procedures.json` | Service procedures |
| `reclamations.json` | Complaint handling guidelines |
| `tarification.json` | Pricing and tariff information |

## Database Schema

Five tables with the following relationships:

- **Customer (1) -> Meter (N)**: One customer can have multiple meters
- **Customer (1) -> Contract (N)**: One customer can have multiple contracts
- **Customer (1) -> Complaint (N)**: One customer can file multiple complaints

Status enumerations:

| Entity | Statuses |
|---|---|
| Customer | active, suspended, terminated |
| Contract | draft, sent, signed, active, suspended, terminated |
| Complaint | open, in_progress, resolved, rejected |
| Severity | low, normal, high, urgent |

## Troubleshooting

### Frontend can't connect to backend

- Ensure the backend is running on port 8000.
- Check `Frontend/.env` contains `VITE_API_BASE_URL=http://localhost:8000`.
- Restart the frontend dev server after changing `.env`.

### Database connection error

- Verify `Backend/.env` exists with a valid `DATABASE_URL`.
- Test the connection string with a MySQL client.
- Ensure firewall rules allow connections to the database port.

### Python import errors

```bash
# Ensure virtual environment is activated
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
```

### Frontend build errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Code Style

- **Python**: PEP 8, type hints
- **TypeScript**: ESLint (config provided)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Authors

- **Ms30udi** — [GitHub](https://github.com/Ms30udi)

---

**Need help?** Open an [issue](https://github.com/Ms30udi/Hackatoon/issues) on GitHub.
