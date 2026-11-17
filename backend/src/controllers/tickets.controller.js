/**
 * Tickets Controller
 * Handles HTTP requests for ticket management
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 2.10, 17.1
 */

import * as ticketModel from '../models/ticket.model.js';
import * as ticketHistoryModel from '../models/ticketHistory.model.js';
import * as ticketCommentsModel from '../models/ticketComments.model.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/tickets
 * Get tickets with filtering and pagination
 * Requirements: 2.3, 2.4, 2.5, 17.1
 */
export async function getTickets(req, res) {
  try {
    const { status, assigneeId, creatorId, fromDate, toDate, page, limit } = req.query;
    const user = req.user;

    // Build filters based on user role
    const filters = {
      status,
      assigneeId,
      creatorId,
      fromDate,
      toDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    // Registrirani_Korisnik can only see their own tickets
    if (user.role === 'Registrirani_Korisnik') {
      filters.creatorId = user.userId;
    }

    // Tehničar can see assigned tickets (unless filtering by creator)
    if (user.role === 'Tehničar' && !creatorId) {
      // If no creator filter specified, show assigned tickets
      if (!assigneeId) {
        filters.assigneeId = user.userId;
      }
    }

    // Administrator can see all tickets (no additional filtering)

    const result = await ticketModel.getTickets(filters);

    res.json(result);
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju tiketa',
      },
    });
  }
}

/**
 * POST /api/v1/tickets
 * Create a new ticket
 * Requirement: 2.2 - Auto-assign status "Nova"
 */
export async function createTicket(req, res) {
  try {
    const { title, description, priority, assetId } = req.body;
    const user = req.user;

    const ticketData = {
      title,
      description,
      priority,
      creatorId: user.userId,
      assetId,
    };

    const ticket = await ticketModel.createTicket(ticketData);

    // Log ticket creation in history
    await ticketHistoryModel.createTicketHistory({
      ticketId: ticket.id,
      userId: user.userId,
      action: 'created',
      newValue: JSON.stringify({ title, description, status: 'Nova', priority }),
    });

    logger.info(`Ticket created: ${ticket.id} by user ${user.userId}`);

    res.status(201).json(ticket);
  } catch (error) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri stvaranju tiketa',
      },
    });
  }
}

/**
 * GET /api/v1/tickets/:id
 * Get a single ticket by ID
 * Requirements: 2.3, 2.4, 2.5 - Authorization check
 */
export async function getTicketById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await ticketModel.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Authorization check based on role
    // Registrirani_Korisnik can only view their own tickets
    if (user.role === 'Registrirani_Korisnik' && ticket.creator_id !== user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup ovom tiketu',
        },
      });
    }

    // Tehničar can view assigned tickets
    if (
      user.role === 'Tehničar' &&
      ticket.creator_id !== user.userId &&
      ticket.assignee_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup ovom tiketu',
        },
      });
    }

    // Administrator can view all tickets (no check needed)

    res.json(ticket);
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju tiketa',
      },
    });
  }
}

/**
 * PUT /api/v1/tickets/:id
 * Update a ticket
 * Requirement: 2.10 - Ownership validation
 */
export async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { title, description, priority, assigneeId, assetId } = req.body;
    const user = req.user;

    // Fetch existing ticket
    const existingTicket = await ticketModel.getTicketById(id);

    if (!existingTicket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Ownership validation
    // Registrirani_Korisnik can only update their own tickets
    if (user.role === 'Registrirani_Korisnik' && existingTicket.creator_id !== user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Možete uređivati samo vlastite tikete',
        },
      });
    }

    // Tehničar can update assigned tickets or their own
    if (
      user.role === 'Tehničar' &&
      existingTicket.creator_id !== user.userId &&
      existingTicket.assignee_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Možete uređivati samo vlastite tikete ili tikete dodijeljene vama',
        },
      });
    }

    // Administrator can update all tickets (no check needed)

    // Prepare update data
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (assigneeId !== undefined) updates.assignee_id = assigneeId;
    if (assetId !== undefined) updates.asset_id = assetId;

    const updatedTicket = await ticketModel.updateTicket(id, updates);

    // Log changes in history
    const changes = [];
    if (title !== undefined && title !== existingTicket.title) {
      changes.push({ field: 'title', oldValue: existingTicket.title, newValue: title });
    }
    if (description !== undefined && description !== existingTicket.description) {
      changes.push({
        field: 'description',
        oldValue: existingTicket.description,
        newValue: description,
      });
    }
    if (priority !== undefined && priority !== existingTicket.priority) {
      changes.push({ field: 'priority', oldValue: existingTicket.priority, newValue: priority });
    }
    if (assigneeId !== undefined && assigneeId !== existingTicket.assignee_id) {
      changes.push({
        field: 'assignee',
        oldValue: existingTicket.assignee_id,
        newValue: assigneeId,
      });
    }
    if (assetId !== undefined && assetId !== existingTicket.asset_id) {
      changes.push({ field: 'asset', oldValue: existingTicket.asset_id, newValue: assetId });
    }

    // Record each change in history
    for (const change of changes) {
      await ticketHistoryModel.createTicketHistory({
        ticketId: id,
        userId: user.userId,
        action: `updated_${change.field}`,
        oldValue: String(change.oldValue || ''),
        newValue: String(change.newValue || ''),
      });
    }

    logger.info(`Ticket updated: ${id} by user ${user.userId}`);

    res.json(updatedTicket);
  } catch (error) {
    logger.error('Error updating ticket:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri ažuriranju tiketa',
      },
    });
  }
}

/**
 * PATCH /api/v1/tickets/:id/status
 * Change ticket status
 * Requirement: 2.8 - Ticket status changes
 */
export async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Fetch existing ticket
    const existingTicket = await ticketModel.getTicketById(id);

    if (!existingTicket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Status changes typically require Tehničar or Administrator role
    if (user.role === 'Registrirani_Korisnik') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za promjenu statusa tiketa',
        },
      });
    }

    // For Tehničar, they can only change status of assigned tickets
    if (
      user.role === 'Tehničar' &&
      existingTicket.assignee_id !== user.userId &&
      existingTicket.creator_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Možete mijenjati status samo tiketa dodijeljenih vama',
        },
      });
    }

    // Validate status value
    const validStatuses = ['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nevažeći status',
          details: [
            {
              field: 'status',
              message: `Status mora biti jedan od: ${validStatuses.join(', ')}`,
            },
          ],
        },
      });
    }

    const updatedTicket = await ticketModel.updateTicketStatus(id, status, user.userId);

    // Log status change in history
    await ticketHistoryModel.createTicketHistory({
      ticketId: id,
      userId: user.userId,
      action: 'status_changed',
      oldValue: existingTicket.status,
      newValue: status,
    });

    logger.info(`Ticket status changed: ${id} from ${existingTicket.status} to ${status}`);

    res.json(updatedTicket);
  } catch (error) {
    logger.error('Error updating ticket status:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri promjeni statusa tiketa',
      },
    });
  }
}

/**
 * GET /api/v1/tickets/:id/history
 * Get ticket change history
 */
export async function getTicketHistory(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if ticket exists and user has access
    const ticket = await ticketModel.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Authorization check
    if (user.role === 'Registrirani_Korisnik' && ticket.creator_id !== user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup povijesti ovog tiketa',
        },
      });
    }

    if (
      user.role === 'Tehničar' &&
      ticket.creator_id !== user.userId &&
      ticket.assignee_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup povijesti ovog tiketa',
        },
      });
    }

    const history = await ticketHistoryModel.getTicketHistory(id);

    res.json({ history });
  } catch (error) {
    logger.error('Error fetching ticket history:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju povijesti tiketa',
      },
    });
  }
}

/**
 * GET /api/v1/tickets/:id/comments
 * Get ticket comments
 */
export async function getTicketComments(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const user = req.user;

    // Check if ticket exists and user has access
    const ticket = await ticketModel.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Authorization check
    if (user.role === 'Registrirani_Korisnik' && ticket.creator_id !== user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup komentarima ovog tiketa',
        },
      });
    }

    if (
      user.role === 'Tehničar' &&
      ticket.creator_id !== user.userId &&
      ticket.assignee_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za pristup komentarima ovog tiketa',
        },
      });
    }

    const result = await ticketCommentsModel.getCommentsByTicketId(id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching ticket comments:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju komentara tiketa',
      },
    });
  }
}

/**
 * POST /api/v1/tickets/:id/comments
 * Add a comment to a ticket
 */
export async function createTicketComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Check if ticket exists and user has access
    const ticket = await ticketModel.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Tiket nije pronađen',
        },
      });
    }

    // Authorization check - Creator, Assignee, Tehničar, or Administrator can comment
    if (user.role === 'Registrirani_Korisnik' && ticket.creator_id !== user.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za komentiranje na ovaj tiket',
        },
      });
    }

    if (
      user.role === 'Tehničar' &&
      ticket.creator_id !== user.userId &&
      ticket.assignee_id !== user.userId
    ) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Nemate ovlasti za komentiranje na ovaj tiket',
        },
      });
    }

    const comment = await ticketCommentsModel.createComment({
      ticketId: id,
      authorId: user.userId,
      content,
    });

    logger.info(`Comment added to ticket ${id} by user ${user.userId}`);

    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error creating ticket comment:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dodavanju komentara',
      },
    });
  }
}
