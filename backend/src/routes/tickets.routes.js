/**
 * Ticket Routes
 * API endpoints for ticket management
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 2.10, 17.1
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import * as ticketsController from '../controllers/tickets.controller.js';

const router = express.Router();

/**
 * GET /api/v1/tickets
 * Get tickets with filtering and pagination
 * Access: Registrirani_Korisnik (own tickets), Tehničar (assigned), Administrator (all)
 */
router.get(
  '/',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    query('status').optional().isIn(['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena']),
    query('assigneeId').optional().isUUID(),
    query('creatorId').optional().isUUID(),
    query('fromDate').optional().isISO8601(),
    query('toDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ticketsController.getTickets
);

/**
 * POST /api/v1/tickets
 * Create a new ticket
 * Access: Registrirani_Korisnik, Tehničar, Administrator
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    body('title').trim().notEmpty().withMessage('Naslov je obavezan').isLength({ max: 255 }),
    body('description').trim().notEmpty().withMessage('Opis je obavezan'),
    body('priority')
      .optional()
      .isIn(['Niska', 'Srednja', 'Visoka', 'Hitna'])
      .withMessage('Nevažeći prioritet'),
    body('assetId').optional().isUUID().withMessage('Nevažeći ID imovine'),
  ],
  validate,
  ticketsController.createTicket
);

/**
 * GET /api/v1/tickets/:id
 * Get a single ticket by ID
 * Access: Creator, Assignee, Tehničar, Administrator
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [param('id').isUUID().withMessage('Nevažeći ID tiketa')],
  validate,
  ticketsController.getTicketById
);

/**
 * PUT /api/v1/tickets/:id
 * Update a ticket
 * Access: Creator (own), Tehničar (assigned), Administrator (all)
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID tiketa'),
    body('title').optional().trim().notEmpty().isLength({ max: 255 }),
    body('description').optional().trim().notEmpty(),
    body('priority')
      .optional()
      .isIn(['Niska', 'Srednja', 'Visoka', 'Hitna'])
      .withMessage('Nevažeći prioritet'),
    body('assigneeId').optional().isUUID().withMessage('Nevažeći ID tehničara'),
    body('assetId').optional().isUUID().withMessage('Nevažeći ID imovine'),
  ],
  validate,
  ticketsController.updateTicket
);

/**
 * PATCH /api/v1/tickets/:id/status
 * Change ticket status
 * Access: Tehničar (assigned), Administrator (all)
 */
router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID tiketa'),
    body('status')
      .notEmpty()
      .withMessage('Status je obavezan')
      .isIn(['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'])
      .withMessage('Nevažeći status'),
  ],
  validate,
  ticketsController.updateTicketStatus
);

/**
 * GET /api/v1/tickets/:id/history
 * Get ticket change history
 * Access: Creator, Assignee, Administrator
 */
router.get(
  '/:id/history',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [param('id').isUUID().withMessage('Nevažeći ID tiketa')],
  validate,
  ticketsController.getTicketHistory
);

/**
 * GET /api/v1/tickets/:id/comments
 * Get ticket comments
 * Access: Creator, Assignee, Tehničar, Administrator
 */
router.get(
  '/:id/comments',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID tiketa'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  ticketsController.getTicketComments
);

/**
 * POST /api/v1/tickets/:id/comments
 * Add a comment to a ticket
 * Access: Creator, Assignee, Tehničar, Administrator
 */
router.post(
  '/:id/comments',
  authMiddleware,
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID tiketa'),
    body('content').trim().notEmpty().withMessage('Sadržaj komentara je obavezan'),
  ],
  validate,
  ticketsController.createTicketComment
);

export default router;
