# FlowOps

IT Operations and Workflow Automation Platform with Croatian-language user interface.

## Features

- 🎫 **Ticket Management** - Track and manage IT incidents and support requests
- 📢 **Announcement CMS** - Publish internal IT operations news
- 💻 **IT Asset Management** - Inventory tracking for hardware, software, and network equipment
- ⚙️ **Workflow Automation** - Rule-based automation for IT operations
- 📊 **Dashboard** - Real-time overview of IT operations status
- 🌐 **External Service Monitoring** - Integration with service status APIs
- 🔐 **Role-Based Access Control** - Four distinct user roles with enforced permissions
- 🇭🇷 **Croatian Localization** - Full UI, dates, and messages in Croatian

## Tech Stack

### Frontend
- **React 18+** - Component-based UI library
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Hook Form + Zod** - Form state management and validation
- **date-fns** - Date/time manipulation with Croatian locale
- **Lucide React** - Icon library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FlowOps
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
flowops/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # React components
│   │   ├── common/        # Shared/reusable components
│   │   ├── layout/        # Layout components
│   │   ├── announcements/ # Announcement components
│   │   ├── tickets/       # Ticket components
│   │   └── forms/         # Form components
│   ├── pages/             # Page components
│   │   ├── public/        # Public pages
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin pages
│   │   └── profile/       # User profile pages
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── routes/            # Route definitions
│   ├── schemas/           # Validation schemas
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles and Tailwind CSS
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── supabase/
│   ├── functions/         # Edge functions
│   ├── migrations/        # Database migrations
│   └── seed.sql          # Seed data
├── docs/                  # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   ├── INSTALLATION.md
│   ├── USER_GUIDE.md
│   └── EXTERNAL_API.md
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## Design System

FlowOps uses a carefully crafted design system with:

- **Dark navy/charcoal theme** - Professional and modern appearance
- **Deep blue primary color** (#3b82f6) - Primary actions and highlights
- **Purple accents** (#a855f7) - Secondary elements
- **Croatian localization** - All dates formatted as dd.MM.yyyy, 24-hour time
- **Responsive design** - Works on desktop, tablet, and mobile devices

## Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Installation Guide](docs/INSTALLATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [External API Integration](docs/EXTERNAL_API.md)

## License

This project is developed for academic demonstration purposes.
