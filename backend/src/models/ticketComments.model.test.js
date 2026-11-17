/**
 * Ticket Comments Model Tests
 * Unit tests for ticket comments data access layer
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import * as TicketCommentsModel from './ticketComments.model.js';
import * as TicketModel from './ticket.model.js';
import supabase from '../config/database.js';

describe('Ticket Comments Model', () => {
  let testUserId;
  let testTicketId;
  let testCommentId;

  before(async () => {
    // Create a test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: `test-comments-${Date.now()}@example.com`,
          password_hash: 'test_hash',
          role: 'Registrirani_Korisnik',
          first_name: 'Comment',
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
      title: 'Test Ticket for Comments',
      description: 'Test ticket for comment testing',
      creatorId: testUserId,
    });

    testTicketId = ticket.id;
  });

  describe('createComment', () => {
    it('should create a comment on a ticket', async () => {
      const commentData = {
        ticketId: testTicketId,
        authorId: testUserId,
        content: 'This is a test comment',
      };

      const comment = await TicketCommentsModel.createComment(commentData);

      assert.ok(comment);
      assert.strictEqual(comment.ticket_id, testTicketId);
      assert.strictEqual(comment.author_id, testUserId);
      assert.strictEqual(comment.content, commentData.content);
      assert.ok(comment.id);
      assert.ok(comment.created_at);
      assert.ok(comment.author); // Should include author details
      assert.strictEqual(comment.author.id, testUserId);

      testCommentId = comment.id; // Save for other tests
    });

    it('should handle timestamps in UTC', async () => {
      const commentData = {
        ticketId: testTicketId,
        authorId: testUserId,
        content: 'UTC timestamp test comment',
      };

      const comment = await TicketCommentsModel.createComment(commentData);

      assert.ok(comment.created_at);
      assert.ok(comment.updated_at);
      // Timestamps should be ISO 8601 format with timezone
      assert.ok(comment.created_at.includes('T'));
    });
  });

  describe('getCommentsByTicketId', () => {
    it('should retrieve comments for a ticket with pagination', async () => {
      // Create additional comments
      await TicketCommentsModel.createComment({
        ticketId: testTicketId,
        authorId: testUserId,
        content: 'Second comment',
      });

      await TicketCommentsModel.createComment({
        ticketId: testTicketId,
        authorId: testUserId,
        content: 'Third comment',
      });

      const result = await TicketCommentsModel.getCommentsByTicketId(testTicketId, {
        page: 1,
        limit: 10,
      });

      assert.ok(result);
      assert.ok(Array.isArray(result.comments));
      assert.ok(result.comments.length >= 3);
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);

      // Verify comments are in chronological order (ascending)
      for (let i = 1; i < result.comments.length; i++) {
        const prevDate = new Date(result.comments[i - 1].created_at);
        const currDate = new Date(result.comments[i].created_at);
        assert.ok(currDate >= prevDate);
      }

      // Verify author details are included
      result.comments.forEach((comment) => {
        assert.ok(comment.author);
        assert.strictEqual(comment.author.id, testUserId);
      });
    });

    it('should return empty array for ticket with no comments', async () => {
      const newTicket = await TicketModel.createTicket({
        title: 'Ticket Without Comments',
        description: 'No comments yet',
        creatorId: testUserId,
      });

      const result = await TicketCommentsModel.getCommentsByTicketId(newTicket.id);

      assert.ok(result);
      assert.ok(Array.isArray(result.comments));
      assert.strictEqual(result.comments.length, 0);
    });

    it('should handle pagination correctly', async () => {
      // Test second page
      const result = await TicketCommentsModel.getCommentsByTicketId(testTicketId, {
        page: 2,
        limit: 2,
      });

      assert.ok(result);
      assert.strictEqual(result.pagination.page, 2);
      assert.strictEqual(result.pagination.limit, 2);
    });
  });

  describe('getCommentById', () => {
    it('should retrieve a comment by ID', async () => {
      const comment = await TicketCommentsModel.getCommentById(testCommentId);

      assert.ok(comment);
      assert.strictEqual(comment.id, testCommentId);
      assert.ok(comment.author); // Should include author details
      assert.strictEqual(comment.author.id, testUserId);
    });

    it('should return null for non-existent comment', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const comment = await TicketCommentsModel.getCommentById(fakeId);

      assert.strictEqual(comment, null);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const newContent = 'Updated comment content';
      const updatedComment = await TicketCommentsModel.updateComment(
        testCommentId,
        newContent
      );

      assert.ok(updatedComment);
      assert.strictEqual(updatedComment.content, newContent);
      assert.strictEqual(updatedComment.id, testCommentId);
    });
  });

  describe('countCommentsByTicketId', () => {
    it('should count comments for a ticket', async () => {
      const count = await TicketCommentsModel.countCommentsByTicketId(testTicketId);

      assert.ok(typeof count === 'number');
      assert.ok(count >= 3); // We created at least 3 comments
    });

    it('should return 0 for ticket with no comments', async () => {
      const newTicket = await TicketModel.createTicket({
        title: 'Ticket for Count Test',
        description: 'Count test',
        creatorId: testUserId,
      });

      const count = await TicketCommentsModel.countCommentsByTicketId(newTicket.id);

      assert.strictEqual(count, 0);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      // Create a comment to delete
      const commentToDelete = await TicketCommentsModel.createComment({
        ticketId: testTicketId,
        authorId: testUserId,
        content: 'Comment to delete',
      });

      const commentId = commentToDelete.id;

      // Delete the comment
      const result = await TicketCommentsModel.deleteComment(commentId);
      assert.strictEqual(result, true);

      // Verify it's deleted
      const deletedComment = await TicketCommentsModel.getCommentById(commentId);
      assert.strictEqual(deletedComment, null);
    });
  });

  describe('deleteCommentsByTicketId', () => {
    it('should delete all comments for a ticket', async () => {
      // Create a ticket with comments
      const ticket = await TicketModel.createTicket({
        title: 'Ticket to Delete Comments',
        description: 'Comments will be deleted',
        creatorId: testUserId,
      });

      await TicketCommentsModel.createComment({
        ticketId: ticket.id,
        authorId: testUserId,
        content: 'First comment to delete',
      });

      await TicketCommentsModel.createComment({
        ticketId: ticket.id,
        authorId: testUserId,
        content: 'Second comment to delete',
      });

      // Delete all comments
      const result = await TicketCommentsModel.deleteCommentsByTicketId(ticket.id);
      assert.strictEqual(result, true);

      // Verify comments are deleted
      const remainingComments = await TicketCommentsModel.getCommentsByTicketId(ticket.id);
      assert.strictEqual(remainingComments.comments.length, 0);
    });
  });
});

console.log('Ticket comments model tests completed');
