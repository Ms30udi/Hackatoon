## Overview

This portal enables customers to submit and track various types of service requests including new contracts, contract modifications, information inquiries, and new connection requests. The application features a clean, institutional design with full internationalization support.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI primitives (shadcn/ui)
│   └── forms/          # Form components for different request types
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and translations
├── pages/              # Page components
└── test/               # Test setup and test files
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd service-intelligence

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run test suite |

## Features

- **Multi-language Support**: Full French and English translations
- **Request Type Selection**: Visual cards for selecting service request types
- **Dynamic Forms**: Context-aware forms that adapt to request type
- **Confirmation System**: Reference number generation and confirmation screens
- **Responsive Design**: Mobile-first, accessible interface
- **Form Validation**: Client-side validation with helpful error messages

## Configuration

### Environment Variables

No environment variables are required for basic operation. The application runs entirely on the client side.

### Customization

- **Translations**: Edit `src/lib/translations.ts` to modify text content
- **Theme**: Modify `tailwind.config.ts` and `src/index.css` for styling
- **Components**: shadcn/ui configuration in `components.json`

## License

This project is proprietary software. All rights reserved.
