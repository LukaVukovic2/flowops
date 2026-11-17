/**
 * Ticket History Model Tests
 * Unit tests for ticket history data access layer
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import * as TicketHistoryModel from './ticketHistory.model.js';
import * as TicketModel from './ticket.model.js';
import supabase from '../config/database.js';

describe('Ticket History Model', () => {
  let testUserId;
  let testTicketId;

  before(async () => {
    // Create a test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: `test-history-${Date.now()}@example.com`,
          password_hash: 'test_hash',
          role: 'Tehničar',
          first_name: 'History',
          last_name: 'Tester',
        },
      ])
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }

    testUserId = user.id;

    // Create a test ticket
    const ticket = await TicketModel.createTicket({
      title: 'Test Ticket for History',
      description: 'Test ticket for history tracking',
      creatorId: testUserId,
    });

    testTicketId = ticket.id;
  });

  describe('createTicketHistory', () => {
    it('should create a history entry', async () => {
      const historyData = {
        ticketId: testTicketId,
        userId: testUserId,
        action: 'created',
        oldValue: null,
        newValue: 'Nova',
      };

      const history = await TicketHistoryModel.createTicketHistory(historyData);

      assert.ok(history);
      assert.strictEqual(history.ticket_id, testTicketId);
      assert.strictEqual(history.user_id, testUserId);
      assert.strictEqual(history.action, 'created');
      assert.ok(history.created_at);
    });

    it('should handle timestamps in UTC', async () => {
      const historyData = {
        ticketId: testTicketId,
        userId: testUserId,
        action: 'updated',
        oldValue: 'Old',
        newValue: 'New',
      };

      const history = await TicketHistoryModel.createTicketHistory(historyData);

      assert.ok(history.created_at);
      // Timestamps should be ISO 8601 format with timezone
      assert.ok(history.created_at.includes('T'));
    });
  });

  describe('getTicketHistory', () => {
    it('should retrieve ticket history in chronological order', async () => {
      // Create multiple history entries
      await TicketHistoryModel.createTicketHistory({
        ticketId: testTicketId,
        userId: testUserId,
        action: 'first_action',
        newValue: 'First',
      });

      await TicketHistoryModel.createTicketHistory({
        ticketId: testTicketId,
        userId: testUserId,
        action: 'second_action',
        newValue: 'Second',
      });

      const history = await TicketHistoryModel.getTicketHistory(testTicketId);

      assert.ok(Array.isArray(history));
      assert.ok(history.length >= 2);

      // Verify chronological order (ascending)
      for (let i = 1; i < history.length; i++) {
        const prevDate = new Date(history[i - 1].created_at);
        const currDate = new Date(history[i].created_at);
        assert.ok(currDate >= prevDate);
      }

      // Verify user details are included
      assert.ok(history[0].user);
      assert.strictEqual(history[0].user.id, testUserId);
    });

    it('should return empty array for ticket with no history', async () => {
      const newTicket = await TicketModel.createTicket({
        title: 'New Ticket',
        description: 'No history yet',
        creatorId: testUserId,
      });

      const history = await TicketHistoryModel.getTicketHistory(newTicket.id);

      assert.ok(Array.isArray(history));
      assert.strictEqual(history.length, 0);
    });
  });

  describe('recordStatusChange', () => {
    it('should record a status change', async () => {
      const history = await TicketHistoryModel.recordStatusChange(
        testTicketId,
        testUserId,
        'Nova',
        'U radu'
      );

      assert.ok(history);
      assert.strictEqual(history.action, 'status_changed');
      assert.strictEqual(history.old_value, 'Nova');
      assert.strictEqual(history.new_value, 'U radu');
    });
  });

  describe('recordAssignmentChange', () => {
    it('should record an assignment change', async () => {
      const history = await TicketHistoryModel.recordAssignmentChange(
        testTicketId,
        testUserId,
        null,
        testUserId
      );

      assert.ok(history);
      assert.strictEqual(history.action, 'assigned');
      assert.strictEqual(history.old_value, 'Unassigned');
      assert.strictEqual(history.new_value, testUserId);
    });

    it('should record unassignment', async () => {
      const history = await TicketHistoryModel.recordAssignmentChange(
        testTicketId,
        testUserId,
        testUserId,
        null
      );

      assert.ok(history);
      assert.strictEqual(history.action, 'assigned');
      assert.strictEqual(history.old_value, testUserId);
      assert.strictEqual(history.new_value, 'Unassigned');
    });
  });

  describe('recordFieldUpdate', () => {
    it('should record a field update', async () => {
      const history = await TicketHistoryModel.recordFieldUpdate(
        testTicketId,
        testUserId,
        'priority',
        'Niska',
        'Visoka'
      );

      assert.ok(history);
      assert.strictEqual(history.action, 'priority_updated');
      assert.strictEqual(history.old_value, 'Niska');
      assert.strictEqual(history.new_value, 'Visoka');
    });
  });

  describe('recordTicketCreation', () => {
    it('should record ticket creation', async () => {
      const newTicket = await TicketModel.createTicket({
        title: 'Another Ticket',
        description: 'Track creation',
        creatorId: testUserId,
      });

      const history = await TicketHistoryModel.recordTicketCreation(
        newTicket.id,
        testUserId
      );

      assert.ok(history);
      assert.strictEqual(history.action, 'created');
      assert.strictEqual(history.new_value, 'Nova');
      assert.strictEqual(history.old_value, null);
    });
  });

  describe('deleteTicketHistory', () => {
    it('should delete all history for a ticket', async () => {
      // Create a ticket with history
      const ticket = await TicketModel.createTicket({
        title: 'Ticket to Delete History',
        description: 'History will be deleted',
        creatorId: testUserId,
      });

      await TicketHistoryModel.createTicketHistory({
        ticketId: ticket.id,
        userId: testUserId,
        action: 'test_action',
        newValue: 'test',
      });

      // Delete history
      const result = await TicketHistoryModel.deleteTicketHistory(ticket.id);
      assert.strictEqual(result, true);

      // Verify history is deleted
      const history = await TicketHistoryModel.getTicketHistory(ticket.id);
      assert.strictEqual(history.length, 0);
    });
  });
});

console.log('Ticket history model tests completed');
