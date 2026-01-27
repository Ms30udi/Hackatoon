# Service Intelligence Portal - Energy Management System

A professional, multi-language web portal for managing electricity contracts, connections, and customer inquiries.

## Project Overview

This repository contains a full-stack application designed to streamline the interaction between energy providers and their customers. It features an institutional-grade frontend and a robust FastAPI backend with MySQL integration.

### Monorepo Structure

*   **/Frontend**: React 18 + TypeScript SPA featuring a modern, responsive UI.
*   **/Backend**: FastAPI application handling RESTful services and database operations.
*   **/documents**: Technical specifications, database schemas, and API documentation.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with institutional design tokens
- **UI Components**: Radix UI (via shadcn/ui)
- **State Management**: TanStack Query (React Query)
- **Form Lifecycle**: React Hook Form + Zod
- **I18n**: Custom multi-language context (FR/EN)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **Database**: MySQL (Hosted on Aiven)
- **Validation**: Pydantic v2
- **Server**: Uvicorn with Gunicorn production readiness

## Getting Started

### Backend Setup
1. Navigate to the backend directory: `cd Backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env` with your `DATABASE_URL`
5. Start the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Features

- **Dynamic Workflows**: Context-aware forms that adapt to request types (New Contract, Modification, Connection).
- **Multi-language Support**: Real-time switching between French and English.
- **Reference Tracking**: Automated reference number generation for all submissions.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.
- **Institutional Aesthetics**: Clean, professional design language suitable for public services.

## License

This project is proprietary and confidential. All rights reserved.
