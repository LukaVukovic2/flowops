/**
 * Express Application Setup
 * Configures Express app with middleware and routes
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      query: req.query,
      body: Object.keys(req.body).length > 0 ? '(has body)' : undefined
    });
    next();
  });
}

// Rate limiting for API routes
app.use('/api/v1', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'FlowOps API',
    version: '1.0.0',
    description: 'IT Operations and Workflow Automation Platform API',
    endpoints: {
      auth: '/api/v1/auth',
      tickets: '/api/v1/tickets',
      announcements: '/api/v1/announcements',
      assets: '/api/v1/assets',
      workflows: '/api/v1/workflows',
      users: '/api/v1/users',
      dashboard: '/api/v1/dashboard',
      external: '/api/v1/external'
    }
  });
});

// API Routes
import { authRoutes, ticketRoutes, announcementRoutes, usersRoutes, dashboardRoutes, assetsRoutes } from './routes/index.js';

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Ticket routes
app.use('/api/v1/tickets', ticketRoutes);

// Announcement routes
app.use('/api/v1/announcements', announcementRoutes);

// User management routes (Administrator only)
app.use('/api/v1/users', usersRoutes);

// Dashboard routes
app.use('/api/v1/dashboard', dashboardRoutes);

// Asset routes
app.use('/api/v1/assets', assetsRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint nije pronađen'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
