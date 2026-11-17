/**
 * Announcement Categories Controller
 * Handles HTTP requests for announcement category management
 * Requirements: 3.2
 */

import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../models/announcementCategory.model.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/announcement-categories
 * Get all announcement categories
 * Access: Public (all roles)
 */
export async function getCategories(req, res) {
  try {
    // Get all categories without pagination (suitable for dropdowns and lists)
    const categories = await getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Error getting announcement categories:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja kategorija',
    });
  }
}

/**
 * POST /api/v1/announcement-categories
 * Create new announcement category
 * Access: Administrator only
 */
export async function createAnnouncementCategory(req, res) {
  try {
    const { name, description, color } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Nevažeći unos',
        message: 'Naziv kategorije je obavezan',
      });
    }

    // Validate color format if provided
    if (color && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
      return res.status(400).json({
        error: 'Nevažeći unos',
        message: 'Boja mora biti u hex formatu (npr. #3B82F6)',
      });
    }

    // Create category
    const category = await createCategory({
      name: name.trim(),
      description: description?.trim() || null,
      color: color || null,
    });

    logger.info(`Category created: ${category.id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Konflikt',
        message: error.message,
      });
    }

    logger.error('Error creating announcement category:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom stvaranja kategorije',
    });
  }
}

/**
 * GET /api/v1/announcement-categories/:id
 * Get specific category by ID
 * Access: Public (all roles)
 */
export async function getCategoryByIdHandler(req, res) {
  try {
    const { id } = req.params;

    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        error: 'Nije pronađeno',
        message: 'Kategorija nije pronađena',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error('Error getting category by ID:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja kategorije',
    });
  }
}

/**
 * PUT /api/v1/announcement-categories/:id
 * Update category
 * Access: Administrator only
 */
export async function updateCategoryHandler(req, res) {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        error: 'Nije pronađeno',
        message: 'Kategorija nije pronađena',
      });
    }

    // Validate name if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({
        error: 'Nevažeći unos',
        message: 'Naziv kategorije mora biti neprazan tekst',
      });
    }

    // Validate color format if provided
    if (color !== undefined && color !== null && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
      return res.status(400).json({
        error: 'Nevažeći unos',
        message: 'Boja mora biti u hex formatu (npr. #3B82F6)',
      });
    }

    // Prepare updates
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (color !== undefined) updates.color = color || null;

    // Update category
    const updatedCategory = await updateCategory(id, updates);

    logger.info(`Category updated: ${id} by user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    // Handle duplicate category name
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Konflikt',
        message: error.message,
      });
    }

    logger.error('Error updating category:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom ažuriranja kategorije',
    });
  }
}

/**
 * DELETE /api/v1/announcement-categories/:id
 * Delete category
 * Access: Administrator only
 */
export async function deleteCategoryHandler(req, res) {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        error: 'Nije pronađeno',
        message: 'Kategorija nije pronađena',
      });
    }

    // Delete category
    await deleteCategory(id);

    logger.info(`Category deleted: ${id} by user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: 'Kategorija je uspješno obrisana',
    });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom brisanja kategorije',
    });
  }
}
