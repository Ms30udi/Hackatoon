# ⚡ Service Intelligence Portal - Energy Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A professional, multi-language web portal for managing electricity contracts, connections, and customer inquiries. Built for hackathon with production-grade architecture and modern best practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This repository contains a full-stack application designed to streamline the interaction between energy providers and their customers. It features an institutional-grade frontend and a robust FastAPI backend with MySQL integration.

### Monorepo Structure

```
hackathon/
├── Frontend/          # React 18 + TypeScript SPA
├── Backend/           # FastAPI application
├── documents/         # Technical specifications & knowledge base
└── README.md
```

## ✨ Features

- 🌐 **Multi-language Support**: Real-time switching between French and English
- 📝 **Dynamic Forms**: Context-aware forms that adapt to request types
  - New Contract Requests
  - Contract Modifications
  - New Connection Requests
  - Information Inquiries
- 🎫 **Reference Tracking**: Automated reference number generation for all submissions
- 📱 **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- 🎨 **Institutional Aesthetics**: Clean, professional design language
- 🔐 **Type Safety**: End-to-end TypeScript and Pydantic validation
- 📊 **Database Persistence**: SQLAlchemy ORM with MySQL backend
- 🧪 **Test Coverage**: Comprehensive test suites for backend

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with modern hooks |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Radix UI** | Accessible component primitives (via shadcn/ui) |
| **React Hook Form** | Performant form management |
| **Zod** | Schema validation |
| **Vite** | Next-generation build tool |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Modern Python web framework |
| **SQLAlchemy 2.0** | SQL toolkit and ORM |
| **MySQL** | Relational database (Aiven hosted) |
| **Pydantic v2** | Data validation using Python type hints |
| **Uvicorn** | Lightning-fast ASGI server |
| **Pytest** | Testing framework |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python**: 3.10 or higher ([Download](https://www.python.org/downloads/))
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **MySQL**: 8.0+ (or Aiven/cloud-hosted instance)
- **Git**: For cloning the repository

Verify installations:
```bash
python --version  # Should be 3.10+
node --version    # Should be 18.x+
npm --version     # Should be 9.x+
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ms30udi/Hackatoon.git
cd Hackatoon
```

### 2. Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://username:password@host:port/database_name

# Example for local MySQL:
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/energy_portal

# Example for Aiven:
# DATABASE_URL=mysql+pymysql://user:pass@mysql-service.aivencloud.com:12345/defaultdb
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

### Database Initialization

Tables are created automatically on first startup. The FastAPI app will:
1. Connect to your MySQL database
2. Create all required tables if they don't exist
3. Initialize schema based on SQLAlchemy models

No manual migrations required for initial setup!

## 🏃 Running the Application

### Start Backend Server

```bash
cd Backend

# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode (optional)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Backend will be available at: **http://localhost:8000**

### Start Frontend Development Server

```bash
cd Frontend

npm run dev
```

Frontend will be available at: **http://localhost:5173** (or the port shown in terminal)

### Verify Installation

1. **Backend Health Check**: Visit http://localhost:8000/
   - Should return: `{"status":"Backend running, Aiven DB connected"}`

2. **API Documentation**: Visit http://localhost:8000/api/docs
   - Interactive Swagger UI for testing endpoints

3. **Frontend**: Open http://localhost:5173
   - Should display the Service Portal homepage

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/contracts/new` | Create new contract |
| POST | `/api/connections/new` | Request new connection |
| POST | `/api/contracts/modify` | Modify existing contract |
| POST | `/api/complaints/new` | Submit inquiry/complaint |

### Example Request

```bash
curl -X POST "http://localhost:8000/api/contracts/new" \
  -H "Content-Type: application/json" \
  -d '{
    "cin": "AB123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0612345678",
    "address": "123 Main St",
    "city": "Casablanca",
    "postalCode": "20000",
    "contractType": "individual",
    "startDate": "2026-02-01",
    "subscribedPower": "6"
  }'
```

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_api_endpoints.py

# Verbose output
pytest -v
```

### Frontend Tests

```bash
cd Frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📁 Project Structure

```
hackathon/
├── Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app & routes
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── database.py       # DB connection
│   │   └── routes.py         # (unused - routes in main.py)
│   ├── tests/
│   │   ├── test_api_endpoints.py
│   │   └── test_database_storage.py
│   ├── .env                  # Environment variables
│   ├── requirements.txt
│   └── pytest.ini
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── forms/        # Form components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── contexts/         # React contexts
│   │   ├── lib/              # Utilities & translations
│   │   ├── pages/            # Route pages
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── documents/                # Knowledge base & specs
│   ├── faqs.json
│   ├── contrats_templates.json
│   └── ...
└── README.md
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Failed to submit request" / Connection Error

**Problem**: Frontend can't connect to backend

**Solution**:
- Ensure backend is running on port 8000
- Check `Frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`
- Restart frontend dev server after changing `.env`
- Verify CORS is enabled in backend

#### 2. Database Connection Error

**Problem**: `DATABASE_URL not found` or connection fails

**Solution**:
- Check `Backend/.env` exists with valid `DATABASE_URL`
- Verify MySQL server is running
- Test connection string with a MySQL client
- Ensure firewall allows connection to database port

#### 3. Module Not Found Errors (Python)

**Problem**: Import errors when starting backend

**Solution**:
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### 4. Frontend Build Errors

**Problem**: TypeScript or dependency errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

#### 5. Port Already in Use

**Problem**: `Address already in use` error

**Solution**:
```bash
# Find process using port 8000 (backend)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or use different port:
uvicorn app.main:app --reload --port 8001
```

### Enable Debug Logging

**Backend**:
```python
# In app/main.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend**:
Check browser console (F12) for error messages

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use type hints
- **TypeScript**: ESLint configuration provided
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ms30udi** - *Initial work* - [GitHub](https://github.com/Ms30udi)

## 🙏 Acknowledgments

- Built for hackathon demonstration
- Energy sector workflow inspiration
- shadcn/ui for beautiful components
- FastAPI community for excellent documentation

---

**Need help?** Open an issue on GitHub or contact the maintainers.

**⭐ Star this repo if you find it useful!**
