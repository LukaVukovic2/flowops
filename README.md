# FlowOps

A comprehensive operations management application.

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
│   └── styles/            # Global styles
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
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## Getting Started

See [INSTALLATION.md](docs/INSTALLATION.md) for setup instructions.

## Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Installation Guide](docs/INSTALLATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [External API Integration](docs/EXTERNAL_API.md)
