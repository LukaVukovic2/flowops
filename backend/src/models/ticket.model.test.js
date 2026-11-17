/**
 * Ticket Model Tests
 * Unit tests for ticket data access layer
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import * as TicketModel from './ticket.model.js';
import supabase from '../config/database.js';

describe('Ticket Model', () => {
  let testUserId;
  let testTicketId;

  before(async () => {
    // Create a test user for ticket operations
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: `test-ticket-${Date.now()}@example.com`,
          password_hash: 'test_hash',
          role: 'Registrirani_Korisnik',
          first_name: 'Test',
          last_name: 'User',
        },
      ])
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }

    testUserId = user.id;
  });

  describe('createTicket', () => {
    it('should create a ticket with required fields', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test ticket description',
        creatorId: testUserId,
      };

      const ticket = await TicketModel.createTicket(ticketData);

      assert.ok(ticket);
      assert.strictEqual(ticket.title, ticketData.title);
      assert.strictEqual(ticket.description, ticketData.description);
      assert.strictEqual(ticket.status, 'Nova'); // Should auto-assign "Nova" status
      assert.strictEqual(ticket.creator_id, testUserId);
      assert.ok(ticket.id);
      assert.ok(ticket.created_at);

      testTicketId = ticket.id; // Save for other tests
    });

    it('should create a ticket with optional fields', async () => {
      const ticketData = {
        title: 'Test Ticket with Priority',
        description: 'Test ticket with priority',
        priority: 'Visoka',
        creatorId: testUserId,
      };

      const ticket = await TicketModel.createTicket(ticketData);

      assert.ok(ticket);
      assert.strictEqual(ticket.priority, 'Visoka');
      assert.strictEqual(ticket.status, 'Nova');
    });

    it('should handle timestamps in UTC', async () => {
      const ticketData = {
        title: 'UTC Timestamp Test',
        description: 'Testing UTC timestamps',
        creatorId: testUserId,
      };

      const ticket = await TicketModel.createTicket(ticketData);

      assert.ok(ticket.created_at);
      assert.ok(ticket.updated_at);
      // Timestamps should be ISO 8601 format with timezone
      assert.ok(ticket.created_at.includes('T'));
    });
  });

  describe('getTicketById', () => {
    it('should retrieve a ticket by ID', async () => {
      const ticket = await TicketModel.getTicketById(testTicketId);

      assert.ok(ticket);
      assert.strictEqual(ticket.id, testTicketId);
      assert.ok(ticket.creator); // Should include creator details
      assert.strictEqual(ticket.creator.id, testUserId);
    });

    it('should return null for non-existent ticket', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const ticket = await TicketModel.getTicketById(fakeId);

      assert.strictEqual(ticket, null);
    });
  });

  describe('getTickets', () => {
    it('should retrieve tickets with pagination', async () => {
      const result = await TicketModel.getTickets({ page: 1, limit: 10 });

      assert.ok(result);
      assert.ok(Array.isArray(result.tickets));
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);
      assert.ok(result.tickets.length > 0);
    });

    it('should filter tickets by status', async () => {
      const result = await TicketModel.getTickets({ status: 'Nova' });

      assert.ok(result);
      assert.ok(result.tickets.length > 0);
      result.tickets.forEach((ticket) => {
        assert.strictEqual(ticket.status, 'Nova');
      });
    });

    it('should filter tickets by creator', async () => {
      const result = await TicketModel.getTickets({ creatorId: testUserId });

      assert.ok(result);
      assert.ok(result.tickets.length > 0);
      result.tickets.forEach((ticket) => {
        assert.strictEqual(ticket.creator_id, testUserId);
      });
    });
  });

  describe('updateTicket', () => {
    it('should update ticket fields', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'Srednja',
      };

      const updatedTicket = await TicketModel.updateTicket(testTicketId, updates);

      assert.ok(updatedTicket);
      assert.strictEqual(updatedTicket.title, updates.title);
      assert.strictEqual(updatedTicket.description, updates.description);
      assert.strictEqual(updatedTicket.priority, updates.priority);
    });

    it('should not update non-allowed fields', async () => {
      const originalTicket = await TicketModel.getTicketById(testTicketId);
      const originalStatus = originalTicket.status;

      const updates = {
        status: 'Riješena', // This should not be updated via updateTicket
        title: 'Another Update',
      };

      const updatedTicket = await TicketModel.updateTicket(testTicketId, updates);

      assert.strictEqual(updatedTicket.status, originalStatus); // Status unchanged
      assert.strictEqual(updatedTicket.title, updates.title); // Title changed
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status', async () => {
      const newStatus = 'U radu';
      const updatedTicket = await TicketModel.updateTicketStatus(
        testTicketId,
        newStatus,
        testUserId
      );

      assert.ok(updatedTicket);
      assert.strictEqual(updatedTicket.status, newStatus);
    });

    it('should set resolved_at when status is "Riješena"', async () => {
      const newStatus = 'Riješena';
      const updatedTicket = await TicketModel.updateTicketStatus(
        testTicketId,
        newStatus,
        testUserId
      );

      assert.ok(updatedTicket);
      assert.strictEqual(updatedTicket.status, newStatus);
      assert.ok(updatedTicket.resolved_at);
    });

    it('should set closed_at when status is "Zatvorena"', async () => {
      const newStatus = 'Zatvorena';
      const updatedTicket = await TicketModel.updateTicketStatus(
        testTicketId,
        newStatus,
        testUserId
      );

      assert.ok(updatedTicket);
      assert.strictEqual(updatedTicket.status, newStatus);
      assert.ok(updatedTicket.closed_at);
    });

    it('should reject invalid status', async () => {
      await assert.rejects(
        async () => {
          await TicketModel.updateTicketStatus(testTicketId, 'InvalidStatus', testUserId);
        },
        {
          message: /Invalid status/,
        }
      );
    });
  });

  describe('deleteTicket', () => {
    it('should delete a ticket', async () => {
      // Create a ticket to delete
      const ticketData = {
        title: 'Ticket to Delete',
        description: 'This ticket will be deleted',
        creatorId: testUserId,
      };

      const ticket = await TicketModel.createTicket(ticketData);
      const ticketId = ticket.id;

      // Delete the ticket
      const result = await TicketModel.deleteTicket(ticketId);
      assert.strictEqual(result, true);

      // Verify it's deleted
      const deletedTicket = await TicketModel.getTicketById(ticketId);
      assert.strictEqual(deletedTicket, null);
    });
  });
});

console.log('Ticket model tests completed');
