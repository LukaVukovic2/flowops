/**
 * Announcement Model Tests
 * Unit tests for announcement data access layer
 * Requirements: 3.1, 3.5
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as AnnouncementModel from './announcement.model.js';
import * as CategoryModel from './announcementCategory.model.js';
import supabase from '../config/database.js';

describe('Announcement Model', () => {
  let testAuthorId;
  let testCategoryId;
  let testAnnouncementId;

  before(async () => {
    // Create a test user for announcement operations
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: `test-announcement-${Date.now()}@example.com`,
          password_hash: 'test_hash',
          role: 'Tehničar',
          first_name: 'Test',
          last_name: 'Author',
        },
      ])
      .select()
      .single();

    if (userError) {
      throw new Error(`Failed to create test user: ${userError.message}`);
    }

    testAuthorId = user.id;

    // Create a test category
    const category = await CategoryModel.createCategory({
      name: `Test Category ${Date.now()}`,
      description: 'Test category for announcements',
      color: '#3B82F6',
    });

    testCategoryId = category.id;
  });

  after(async () => {
    // Clean up test data
    if (testAnnouncementId) {
      await supabase.from('announcements').delete().eq('id', testAnnouncementId);
    }
    if (testCategoryId) {
      await supabase.from('announcement_categories').delete().eq('id', testCategoryId);
    }
    if (testAuthorId) {
      await supabase.from('users').delete().eq('id', testAuthorId);
    }
  });

  describe('createAnnouncement', () => {
    it('should create an announcement with required fields', async () => {
      const announcementData = {
        title: 'Test Announcement',
        content: 'Test announcement content',
        authorId: testAuthorId,
      };

      const announcement = await AnnouncementModel.createAnnouncement(announcementData);

      assert.ok(announcement);
      assert.strictEqual(announcement.title, announcementData.title);
      assert.strictEqual(announcement.content, announcementData.content);
      assert.strictEqual(announcement.author_id, testAuthorId);
      assert.strictEqual(announcement.is_published, false); // Should start as draft
      assert.ok(announcement.id);
      assert.ok(announcement.created_at);

      testAnnouncementId = announcement.id; // Save for other tests
    });

    it('should create an announcement with optional fields', async () => {
      const announcementData = {
        title: 'Test Announcement with Category',
        content: 'Test announcement with category and image',
        authorId: testAuthorId,
        categoryId: testCategoryId,
        imageUrl: 'https://example.com/image.jpg',
      };

      const announcement = await AnnouncementModel.createAnnouncement(announcementData);

      assert.ok(announcement);
      assert.strictEqual(announcement.category_id, testCategoryId);
      assert.strictEqual(announcement.image_url, 'https://example.com/image.jpg');

      // Clean up
      await supabase.from('announcements').delete().eq('id', announcement.id);
    });

    it('should validate image URL format', async () => {
      const announcementData = {
        title: 'Test Invalid Image URL',
        content: 'Test content',
        authorId: testAuthorId,
        imageUrl: 'not-a-valid-url',
      };

      await assert.rejects(
        async () => await AnnouncementModel.createAnnouncement(announcementData),
        /Invalid image URL format/
      );
    });

    it('should validate image file format', async () => {
      const announcementData = {
        title: 'Test Invalid Image Format',
        content: 'Test content',
        authorId: testAuthorId,
        imageUrl: 'https://example.com/file.pdf',
      };

      await assert.rejects(
        async () => await AnnouncementModel.createAnnouncement(announcementData),
        /valid image format/
      );
    });

    it('should accept valid image formats', async () => {
      const validFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

      for (const format of validFormats) {
        const announcementData = {
          title: `Test ${format} Format`,
          content: 'Test content',
          authorId: testAuthorId,
          imageUrl: `https://example.com/image${format}`,
        };

        const announcement = await AnnouncementModel.createAnnouncement(announcementData);
        assert.ok(announcement);
        assert.strictEqual(announcement.image_url, `https://example.com/image${format}`);

        // Clean up
        await supabase.from('announcements').delete().eq('id', announcement.id);
      }
    });
  });

  describe('getAnnouncementById', () => {
    it('should retrieve an announcement by ID', async () => {
      const announcement = await AnnouncementModel.getAnnouncementById(testAnnouncementId);

      assert.ok(announcement);
      assert.strictEqual(announcement.id, testAnnouncementId);
      assert.ok(announcement.author); // Should include author details
      assert.strictEqual(announcement.author.id, testAuthorId);
    });

    it('should return null for non-existent announcement', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const announcement = await AnnouncementModel.getAnnouncementById(fakeId);

      assert.strictEqual(announcement, null);
    });

    it('should exclude soft-deleted announcements by default', async () => {
      // Create and soft-delete an announcement
      const tempAnnouncement = await AnnouncementModel.createAnnouncement({
        title: 'Temp Announcement',
        content: 'To be deleted',
        authorId: testAuthorId,
      });

      await AnnouncementModel.softDeleteAnnouncement(tempAnnouncement.id);

      const result = await AnnouncementModel.getAnnouncementById(tempAnnouncement.id);
      assert.strictEqual(result, null);

      // Clean up
      await supabase.from('announcements').delete().eq('id', tempAnnouncement.id);
    });

    it('should include soft-deleted announcements when requested', async () => {
      // Create and soft-delete an announcement
      const tempAnnouncement = await AnnouncementModel.createAnnouncement({
        title: 'Temp Announcement 2',
        content: 'To be deleted',
        authorId: testAuthorId,
      });

      await AnnouncementModel.softDeleteAnnouncement(tempAnnouncement.id);

      const result = await AnnouncementModel.getAnnouncementById(tempAnnouncement.id, true);
      assert.ok(result);
      assert.ok(result.deleted_at);

      // Clean up
      await supabase.from('announcements').delete().eq('id', tempAnnouncement.id);
    });
  });

  describe('getAnnouncements', () => {
    it('should retrieve announcements with pagination', async () => {
      const result = await AnnouncementModel.getAnnouncements({ page: 1, limit: 10 });

      assert.ok(result);
      assert.ok(Array.isArray(result.announcements));
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);
    });

    it('should filter by publication status', async () => {
      const result = await AnnouncementModel.getAnnouncements({ isPublished: false });

      assert.ok(result);
      result.announcements.forEach((announcement) => {
        assert.strictEqual(announcement.is_published, false);
      });
    });

    it('should filter by category', async () => {
      const result = await AnnouncementModel.getAnnouncements({ categoryId: testCategoryId });

      assert.ok(result);
      // All results should have matching category or no category
      result.announcements.forEach((announcement) => {
        if (announcement.category_id) {
          assert.strictEqual(announcement.category_id, testCategoryId);
        }
      });
    });

    it('should filter by author', async () => {
      const result = await AnnouncementModel.getAnnouncements({ authorId: testAuthorId });

      assert.ok(result);
      result.announcements.forEach((announcement) => {
        assert.strictEqual(announcement.author_id, testAuthorId);
      });
    });
  });

  describe('updateAnnouncement', () => {
    it('should update announcement fields', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updated = await AnnouncementModel.updateAnnouncement(testAnnouncementId, updates);

      assert.ok(updated);
      assert.strictEqual(updated.title, updates.title);
      assert.strictEqual(updated.content, updates.content);
    });

    it('should validate image URL on update', async () => {
      await assert.rejects(
        async () =>
          await AnnouncementModel.updateAnnouncement(testAnnouncementId, {
            image_url: 'invalid-url',
          }),
        /Invalid image URL format/
      );
    });
  });

  describe('publishAnnouncement', () => {
    it('should publish an announcement', async () => {
      const published = await AnnouncementModel.publishAnnouncement(testAnnouncementId);

      assert.ok(published);
      assert.strictEqual(published.is_published, true);
      assert.ok(published.published_at);
    });
  });

  describe('unpublishAnnouncement', () => {
    it('should unpublish an announcement', async () => {
      const unpublished = await AnnouncementModel.unpublishAnnouncement(testAnnouncementId);

      assert.ok(unpublished);
      assert.strictEqual(unpublished.is_published, false);
    });
  });

  describe('softDeleteAnnouncement', () => {
    it('should soft delete an announcement', async () => {
      // Create a new announcement for deletion test
      const tempAnnouncement = await AnnouncementModel.createAnnouncement({
        title: 'To be deleted',
        content: 'Test content',
        authorId: testAuthorId,
      });

      await AnnouncementModel.publishAnnouncement(tempAnnouncement.id);

      const deleted = await AnnouncementModel.softDeleteAnnouncement(tempAnnouncement.id);

      assert.ok(deleted);
      assert.ok(deleted.deleted_at);
      assert.strictEqual(deleted.is_published, false); // Should unpublish on delete

      // Clean up
      await supabase.from('announcements').delete().eq('id', tempAnnouncement.id);
    });
  });

  describe('restoreAnnouncement', () => {
    it('should restore a soft-deleted announcement', async () => {
      // Create, delete, and restore
      const tempAnnouncement = await AnnouncementModel.createAnnouncement({
        title: 'To be restored',
        content: 'Test content',
        authorId: testAuthorId,
      });

      await AnnouncementModel.softDeleteAnnouncement(tempAnnouncement.id);
      const restored = await AnnouncementModel.restoreAnnouncement(tempAnnouncement.id);

      assert.ok(restored);
      assert.strictEqual(restored.deleted_at, null);

      // Clean up
      await supabase.from('announcements').delete().eq('id', tempAnnouncement.id);
    });
  });
});
