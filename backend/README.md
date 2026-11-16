# FlowOps Backend

Node.js backend API server for the FlowOps IT Operations and Workflow Automation Platform.

## Technology Stack

- **Node.js 18+**: JavaScript runtime
- **Express.js**: Web application framework
- **Supabase**: PostgreSQL database and authentication
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **express-validator**: Request validation
- **node-cron**: Scheduled task execution
- **axios**: HTTP client for external APIs

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Supabase database configuration
│   │   ├── auth.js       # JWT and auth configuration
│   │   └── external.js   # External API configuration
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── validation.js      # Request validation
│   ├── routes/           # API route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Data access layer
│   ├── workflow-engine/  # Workflow automation engine
│   ├── utils/            # Utility functions
│   │   ├── logger.js     # Logging utility
│   │   └── helpers.js    # Helper functions
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── .env.example          # Environment variables template
├── package.json
└── README.md
```

## Setup

1. **Install Dependencies**

```bash
cd backend
npm install
```

2. **Configure Environment Variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `JWT_SECRET`: Secret key for JWT signing (generate a strong random string)
- `PORT`: Server port (default: 3000)

3. **Run Development Server**

```bash
npm run dev
```

The server will start with auto-reload on file changes.

4. **Run Production Server**

```bash
npm start
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api/v1` - API version and available endpoints

### Authentication (to be implemented)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Tickets (to be implemented)
- `GET /api/v1/tickets` - List tickets
- `POST /api/v1/tickets` - Create ticket
- `GET /api/v1/tickets/:id` - Get ticket details
- `PUT /api/v1/tickets/:id` - Update ticket
- `PATCH /api/v1/tickets/:id/status` - Change ticket status

### Announcements (to be implemented)
- `GET /api/v1/announcements` - List announcements
- `POST /api/v1/announcements` - Create announcement
- `GET /api/v1/announcements/:id` - Get announcement
- `PUT /api/v1/announcements/:id` - Update announcement
- `PATCH /api/v1/announcements/:id/publish` - Publish announcement

## Error Handling

All errors return JSON with Croatian error messages:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Croatian error message",
    "details": []
  }
}
```

Error codes:
- `VALIDATION_ERROR` (400): Invalid input data
- `AUTHENTICATION_ERROR` (401): Authentication failed
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Create controller in `src/controllers/`
3. Create service in `src/services/`
4. Import and use in `src/app.js`

### Testing Database Connection

Start the server and check logs for database connection status.

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with 24-hour expiry
- CORS configured for frontend origin
- Rate limiting on all endpoints
- Input validation with express-validator
- SQL injection prevention via parameterized queries
- XSS prevention via output sanitization

## License

ISC
