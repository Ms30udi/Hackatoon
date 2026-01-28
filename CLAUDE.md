# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Service Intelligence Portal** - A hackathon project for electricity services in Morocco. It consists of a React/TypeScript frontend and a FastAPI backend connected to a MySQL database hosted on Aiven.

## Commands

### Backend
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install email-validator  # Required dependency
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd Frontend
npm install
npm run dev          # Development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## Architecture

```
hackathon/
├── Backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # SQLAlchemy database connection
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas for validation
│   │   └── routes.py        # API route handlers
│   └── requirements.txt     # Python dependencies
├── Frontend/             # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Shadcn UI components (Radix-based)
│   │   │   └── forms/       # Form components
│   │   ├── contexts/        # React contexts (LanguageContext)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, translations, mappings
│   │   ├── pages/           # Page components
│   │   └── test/            # Test files
│   └── vite.config.ts       # Vite configuration
└── documents/            # JSON data files for electricity services
    ├── faqs.json            # Frequently asked questions
    ├── procedures.json      # Service procedures
    ├── tarification.json    # Pricing information
    └── ...                  # Other service documentation
```

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Shadcn UI (Radix), React Router DOM, React Query, Vitest
- **Backend**: FastAPI, SQLAlchemy, PyMySQL, Pydantic, Uvicorn
- **Database**: MySQL (Aiven hosted)

## Path Aliases

Frontend uses `@` alias pointing to `./src`:
```typescript
import { Button } from "@/components/ui/button";
```

## Environment Variables

Backend requires `.env` file with:
```
DATABASE_URL=mysql+pymysql://user:password@host:port/database
```
