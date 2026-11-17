/**
 * Announcement Routes
 * API endpoints for announcement management
 * Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 17.2
 */

import express from 'express';
import { authMiddleware, requireRole, optionalAuthMiddleware } from '../middleware/auth.js';
import {
  createAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  softDeleteAnnouncement,
} from '../models/announcement.model.js';
import {
  createCategory,
  getAllCategories,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../models/announcementCategory.model.js';

const router = express.Router();

/**
 * GET /api/v1/announcements
 * List announcements with filtering
 * - Public/Registrirani_Korisnik: Only published announcements
 * - Tehničar/Administrator: All announcements (including unpublished)
 * Requirements: 3.3, 17.2
 */
router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { categoryId, authorId, page, limit } = req.query;
    const userRole = req.user?.role;

    // Determine if user can see unpublished announcements
    const canSeeUnpublished = ['Tehničar', 'Administrator'].includes(userRole);

    const filters = {
      categoryId,
      authorId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    // Non-Tehničar users can only see published announcements
    if (!canSeeUnpublished) {
      filters.isPublished = true;
    }

    const result = await getAnnouncements(filters);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja obavijesti',
    });
  }
});

/**
 * GET /api/v1/announcements/:id
 * Get single announcement by ID
 * - Public: Only if published
 * - Tehničar/Administrator: Any announcement
 */
router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({
        error: 'Nije pronađeno',
        message: 'Obavijest nije pronađena',
      });
    }

    // Check if user can view unpublished announcement
    const canSeeUnpublished = ['Tehničar', 'Administrator'].includes(userRole);
    if (!announcement.is_published && !canSeeUnpublished) {
      return res.status(404).json({
        error: 'Nije pronađeno',
        message: 'Obavijest nije pronađena',
      });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja obavijesti',
    });
  }
});

/**
 * POST /api/v1/announcements
 * Create new announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.1
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  async (req, res) => {
    try {
      const { title, content, categoryId, imageUrl } = req.body;

      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naslov i sadržaj su obavezni',
        });
      }

      // Validate title length
      if (title.length > 255) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naslov ne smije biti duži od 255 znakova',
        });
      }

      // Validate category exists if provided
      if (categoryId) {
        const category = await getCategoryById(categoryId);
        if (!category) {
          return res.status(400).json({
            error: 'Validacijska greška',
            message: 'Navedena kategorija ne postoji',
          });
        }
      }

      const announcementData = {
        title,
        content,
        authorId: req.user.userId,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
      };

      const announcement = await createAnnouncement(announcementData);

      res.status(201).json(announcement);
    } catch (error) {
      // Handle validation errors from model
      if (error.message.includes('Image URL')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom stvaranja obavijesti',
      });
    }
  }
);

/**
 * PUT /api/v1/announcements/:id
 * Update announcement
 * Access: 
 * - Tehničar: Only own unpublished announcements
 * - Administrator: Any announcement
 * Requirements: 3.6, 3.7
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, categoryId, imageUrl } = req.body;

      // Get existing announcement
      const existingAnnouncement = await getAnnouncementById(id);

      if (!existingAnnouncement) {
        return res.status(404).json({
          error: 'Nije pronađeno',
          message: 'Obavijest nije pronađena',
        });
      }

      // Check ownership for Tehničar
      if (req.user.role === 'Tehničar') {
        // Tehničar can only edit own announcements
        if (existingAnnouncement.author_id !== req.user.userId) {
          return res.status(403).json({
            error: 'Zabranjen pristup',
            message: 'Možete uređivati samo vlastite obavijesti',
          });
        }

        // Tehničar can only edit unpublished announcements
        if (existingAnnouncement.is_published) {
          return res.status(403).json({
            error: 'Zabranjen pristup',
            message: 'Ne možete uređivati objavljene obavijesti',
          });
        }
      }

      // Validate category if provided
      if (categoryId) {
        const category = await getCategoryById(categoryId);
        if (!category) {
          return res.status(400).json({
            error: 'Validacijska greška',
            message: 'Navedena kategorija ne postoji',
          });
        }
      }

      // Validate title length if provided
      if (title && title.length > 255) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naslov ne smije biti duži od 255 znakova',
        });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (categoryId !== undefined) updates.category_id = categoryId;
      if (imageUrl !== undefined) updates.image_url = imageUrl;

      const updatedAnnouncement = await updateAnnouncement(id, updates);

      res.json(updatedAnnouncement);
    } catch (error) {
      // Handle validation errors from model
      if (error.message.includes('Image URL')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom ažuriranja obavijesti',
      });
    }
  }
);

/**
 * PATCH /api/v1/announcements/:id/publish
 * Publish or unpublish announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.3
 */
router.patch(
  '/:id/publish',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { publish } = req.body;

      // Validate publish parameter
      if (typeof publish !== 'boolean') {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Parametar "publish" mora biti true ili false',
        });
      }

      // Get existing announcement
      const existingAnnouncement = await getAnnouncementById(id);

      if (!existingAnnouncement) {
        return res.status(404).json({
          error: 'Nije pronađeno',
          message: 'Obavijest nije pronađena',
        });
      }

      // Tehničar can only publish/unpublish own announcements
      if (req.user.role === 'Tehničar') {
        if (existingAnnouncement.author_id !== req.user.userId) {
          return res.status(403).json({
            error: 'Zabranjen pristup',
            message: 'Možete objavljivati samo vlastite obavijesti',
          });
        }
      }

      let updatedAnnouncement;
      if (publish) {
        updatedAnnouncement = await publishAnnouncement(id);
      } else {
        updatedAnnouncement = await unpublishAnnouncement(id);
      }

      res.json(updatedAnnouncement);
    } catch (error) {
      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom objave obavijesti',
      });
    }
  }
);

/**
 * DELETE /api/v1/announcements/:id
 * Soft delete announcement
 * Access: 
 * - Tehničar: Only own announcements
 * - Administrator: Any announcement
 * Requirements: 3.8
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get existing announcement
      const existingAnnouncement = await getAnnouncementById(id);

      if (!existingAnnouncement) {
        return res.status(404).json({
          error: 'Nije pronađeno',
          message: 'Obavijest nije pronađena',
        });
      }

      // Tehničar can only delete own announcements
      if (req.user.role === 'Tehničar') {
        if (existingAnnouncement.author_id !== req.user.userId) {
          return res.status(403).json({
            error: 'Zabranjen pristup',
            message: 'Možete brisati samo vlastite obavijesti',
          });
        }
      }

      await softDeleteAnnouncement(id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom brisanja obavijesti',
      });
    }
  }
);

// ==================== ANNOUNCEMENT CATEGORY ROUTES ====================

/**
 * GET /api/v1/announcement-categories
 * Get all announcement categories
 * Access: Public
 * Requirements: 3.2
 */
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja kategorija',
    });
  }
});

/**
 * GET /api/v1/announcement-categories (with pagination)
 * Get announcement categories with pagination
 * Access: Public
 */
router.get('/categories', async (req, res) => {
  try {
    const { page, limit } = req.query;
    
    const result = await getCategories({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja kategorija',
    });
  }
});

/**
 * POST /api/v1/announcement-categories
 * Create new announcement category
 * Access: Administrator only
 * Requirements: 3.2
 */
router.post(
  '/categories',
  authMiddleware,
  requireRole('Administrator'),
  async (req, res) => {
    try {
      const { name, description, color } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naziv kategorije je obavezan',
        });
      }

      // Validate name length
      if (name.length > 100) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naziv ne smije biti duži od 100 znakova',
        });
      }

      const categoryData = {
        name,
        description: description || null,
        color: color || null,
      };

      const category = await createCategory(categoryData);

      res.status(201).json(category);
    } catch (error) {
      // Handle duplicate name error
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      // Handle color validation error
      if (error.message.includes('Color must be')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom stvaranja kategorije',
      });
    }
  }
);

/**
 * PUT /api/v1/announcement-categories/:id
 * Update announcement category
 * Access: Administrator only
 */
router.put(
  '/categories/:id',
  authMiddleware,
  requireRole('Administrator'),
  async (req, res) => {
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

      // Validate name length if provided
      if (name && name.length > 100) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naziv ne smije biti duži od 100 znakova',
        });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (color !== undefined) updates.color = color;

      const updatedCategory = await updateCategory(id, updates);

      res.json(updatedCategory);
    } catch (error) {
      // Handle duplicate name error
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      // Handle color validation error
      if (error.message.includes('Color must be')) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: error.message,
        });
      }

      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom ažuriranja kategorije',
      });
    }
  }
);

/**
 * DELETE /api/v1/announcement-categories/:id
 * Delete announcement category
 * Access: Administrator only
 * Note: Announcements with this category will have category_id set to NULL
 */
router.delete(
  '/categories/:id',
  authMiddleware,
  requireRole('Administrator'),
  async (req, res) => {
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

      await deleteCategory(id);

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom brisanja kategorije',
      });
    }
  }
);

export default router;
