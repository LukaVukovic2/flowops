/**
 * Announcement Category Model Tests
 * Unit tests for announcement category data access layer
 * Requirements: 3.1
 */

import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import * as CategoryModel from './announcementCategory.model.js';
import supabase from '../config/database.js';

describe('Announcement Category Model', () => {
  let testCategoryId;
  const testCategoryIds = [];

  after(async () => {
    // Clean up test data
    for (const id of testCategoryIds) {
      await supabase.from('announcement_categories').delete().eq('id', id);
    }
  });

  describe('createCategory', () => {
    it('should create a category with required fields', async () => {
      const categoryData = {
        name: `Test Category ${Date.now()}`,
      };

      const category = await CategoryModel.createCategory(categoryData);

      assert.ok(category);
      assert.strictEqual(category.name, categoryData.name);
      assert.ok(category.id);
      assert.ok(category.created_at);

      testCategoryId = category.id;
      testCategoryIds.push(category.id);
    });

    it('should create a category with optional fields', async () => {
      const categoryData = {
        name: `Test Category Full ${Date.now()}`,
        description: 'Test category description',
        color: '#3B82F6',
      };

      const category = await CategoryModel.createCategory(categoryData);

      assert.ok(category);
      assert.strictEqual(category.description, categoryData.description);
      assert.strictEqual(category.color, categoryData.color);

      testCategoryIds.push(category.id);
    });

    it('should validate hex color format', async () => {
      const categoryData = {
        name: `Invalid Color ${Date.now()}`,
        color: 'not-a-color',
      };

      await assert.rejects(
        async () => await CategoryModel.createCategory(categoryData),
        /valid hex color code/
      );
    });

    it('should accept 3-digit hex colors', async () => {
      const categoryData = {
        name: `Short Color ${Date.now()}`,
        color: '#FFF',
      };

      const category = await CategoryModel.createCategory(categoryData);
      assert.ok(category);
      assert.strictEqual(category.color, '#FFF');

      testCategoryIds.push(category.id);
    });

    it('should accept 6-digit hex colors', async () => {
      const categoryData = {
        name: `Long Color ${Date.now()}`,
        color: '#FF5733',
      };

      const category = await CategoryModel.createCategory(categoryData);
      assert.ok(category);
      assert.strictEqual(category.color, '#FF5733');

      testCategoryIds.push(category.id);
    });

    it('should enforce unique category names', async () => {
      const categoryName = `Unique Test ${Date.now()}`;

      // Create first category
      const category1 = await CategoryModel.createCategory({ name: categoryName });
      testCategoryIds.push(category1.id);

      // Try to create duplicate
      await assert.rejects(
        async () => await CategoryModel.createCategory({ name: categoryName }),
        /already exists/
      );
    });
  });

  describe('getCategoryById', () => {
    it('should retrieve a category by ID', async () => {
      const category = await CategoryModel.getCategoryById(testCategoryId);

      assert.ok(category);
      assert.strictEqual(category.id, testCategoryId);
    });

    it('should return null for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const category = await CategoryModel.getCategoryById(fakeId);

      assert.strictEqual(category, null);
    });
  });

  describe('getCategoryByName', () => {
    it('should retrieve a category by name', async () => {
      // Create a category with known name
      const uniqueName = `Findable Category ${Date.now()}`;
      const created = await CategoryModel.createCategory({ name: uniqueName });
      testCategoryIds.push(created.id);

      const category = await CategoryModel.getCategoryByName(uniqueName);

      assert.ok(category);
      assert.strictEqual(category.name, uniqueName);
      assert.strictEqual(category.id, created.id);
    });

    it('should return null for non-existent category name', async () => {
      const category = await CategoryModel.getCategoryByName('Non-existent Category');

      assert.strictEqual(category, null);
    });
  });

  describe('getCategories', () => {
    it('should retrieve categories with pagination', async () => {
      const result = await CategoryModel.getCategories({ page: 1, limit: 10 });

      assert.ok(result);
      assert.ok(Array.isArray(result.categories));
      assert.ok(result.pagination);
      assert.strictEqual(result.pagination.page, 1);
      assert.strictEqual(result.pagination.limit, 10);
    });

    it('should sort categories by name', async () => {
      const result = await CategoryModel.getCategories({ limit: 100 });

      assert.ok(result.categories.length > 0);

      // Verify alphabetical sorting
      for (let i = 1; i < result.categories.length; i++) {
        const prev = result.categories[i - 1].name;
        const curr = result.categories[i].name;
        assert.ok(prev <= curr, `Categories should be sorted: ${prev} <= ${curr}`);
      }
    });
  });

  describe('getAllCategories', () => {
    it('should retrieve all categories without pagination', async () => {
      const categories = await CategoryModel.getAllCategories();

      assert.ok(Array.isArray(categories));
      // Should have at least our test categories
      assert.ok(categories.length > 0);
    });
  });

  describe('updateCategory', () => {
    it('should update category fields', async () => {
      const updates = {
        description: 'Updated description',
        color: '#FF0000',
      };

      const updated = await CategoryModel.updateCategory(testCategoryId, updates);

      assert.ok(updated);
      assert.strictEqual(updated.description, updates.description);
      assert.strictEqual(updated.color, updates.color);
    });

    it('should validate color on update', async () => {
      await assert.rejects(
        async () =>
          await CategoryModel.updateCategory(testCategoryId, { color: 'invalid' }),
        /valid hex color code/
      );
    });

    it('should enforce unique names on update', async () => {
      // Create two categories
      const name1 = `Category A ${Date.now()}`;
      const name2 = `Category B ${Date.now()}`;

      const cat1 = await CategoryModel.createCategory({ name: name1 });
      const cat2 = await CategoryModel.createCategory({ name: name2 });
      testCategoryIds.push(cat1.id, cat2.id);

      // Try to update cat2 to have same name as cat1
      await assert.rejects(
        async () => await CategoryModel.updateCategory(cat2.id, { name: name1 }),
        /already exists/
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      // Create a temporary category
      const tempCategory = await CategoryModel.createCategory({
        name: `Temp Category ${Date.now()}`,
      });

      const result = await CategoryModel.deleteCategory(tempCategory.id);

      assert.strictEqual(result, true);

      // Verify deletion
      const deleted = await CategoryModel.getCategoryById(tempCategory.id);
      assert.strictEqual(deleted, null);
    });
  });

  describe('getCategoryStats', () => {
    it('should return category with announcement count', async () => {
      const stats = await CategoryModel.getCategoryStats(testCategoryId);

      assert.ok(stats);
      assert.strictEqual(stats.id, testCategoryId);
      assert.ok(typeof stats.announcementCount === 'number');
      assert.ok(stats.announcementCount >= 0);
    });

    it('should throw error for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      await assert.rejects(
        async () => await CategoryModel.getCategoryStats(fakeId),
        /Category not found/
      );
    });
  });
});
