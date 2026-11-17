/**
 * Announcements Controller
 * Handles HTTP requests for announcement management
 * Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 17.2
 */

import {
  createAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  softDeleteAnnouncement,
} from '../models/announcement.model.js';
import { getCategoryById } from '../models/announcementCategory.model.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/announcements
 * List announcements with filtering
 * - Public/Registrirani_Korisnik: Only published announcements
 * - Tehničar/Administrator: All announcements (including unpublished)
 * Requirements: 3.3, 17.2
 */
export async function getAnnouncementsList(req, res) {
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

    res.status(200).json({
      success: true,
      data: result.announcements,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Error getting announcements:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja obavijesti',
    });
  }
}

/**
 * GET /api/v1/announcements/:id
 * Get single announcement by ID
 * - Public: Only if published
 * - Tehničar/Administrator: Any announcement
 * Requirements: 3.3
 */
export async function getAnnouncementByIdHandler(req, res) {
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

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    logger.error('Error getting announcement by ID:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja obavijesti',
    });
  }
}

/**
 * POST /api/v1/announcements
 * Create new announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.1
 */
export async function createAnnouncementHandler(req, res) {
  try {
    const { title, content, categoryId, imageUrl } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Validacijska greška',
        message: 'Naslov je obavezan',
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Validacijska greška',
        message: 'Sadržaj je obavezan',
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
      title: title.trim(),
      content: content.trim(),
      authorId: req.user.userId,
      categoryId: categoryId || null,
      imageUrl: imageUrl || null,
    };

    const announcement = await createAnnouncement(announcementData);

    logger.info(`Announcement created: ${announcement.id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    // Handle validation errors from model
    if (error.message.includes('Image URL')) {
      return res.status(400).json({
        error: 'Validacijska greška',
        message: error.message,
      });
    }

    logger.error('Error creating announcement:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom stvaranja obavijesti',
    });
  }
}

/**
 * PUT /api/v1/announcements/:id
 * Update announcement
 * Access: 
 * - Tehničar: Only own unpublished announcements
 * - Administrator: Any announcement
 * Requirements: 3.6, 3.7
 */
export async function updateAnnouncementHandler(req, res) {
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
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naslov mora biti neprazan tekst',
        });
      }
      if (title.length > 255) {
        return res.status(400).json({
          error: 'Validacijska greška',
          message: 'Naslov ne smije biti duži od 255 znakova',
        });
      }
    }

    // Validate content if provided
    if (content !== undefined && (typeof content !== 'string' || content.trim().length === 0)) {
      return res.status(400).json({
        error: 'Validacijska greška',
        message: 'Sadržaj mora biti neprazan tekst',
      });
    }

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const updatedAnnouncement = await updateAnnouncement(id, updates);

    logger.info(`Announcement updated: ${id} by user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      data: updatedAnnouncement,
    });
  } catch (error) {
    // Handle validation errors from model
    if (error.message.includes('Image URL')) {
      return res.status(400).json({
        error: 'Validacijska greška',
        message: error.message,
      });
    }

    logger.error('Error updating announcement:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom ažuriranja obavijesti',
    });
  }
}

/**
 * PATCH /api/v1/announcements/:id/publish
 * Publish or unpublish announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.3
 */
export async function publishAnnouncementHandler(req, res) {
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
      logger.info(`Announcement published: ${id} by user ${req.user.userId}`);
    } else {
      updatedAnnouncement = await unpublishAnnouncement(id);
      logger.info(`Announcement unpublished: ${id} by user ${req.user.userId}`);
    }

    res.status(200).json({
      success: true,
      data: updatedAnnouncement,
    });
  } catch (error) {
    logger.error('Error publishing/unpublishing announcement:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom objave obavijesti',
    });
  }
}

/**
 * DELETE /api/v1/announcements/:id
 * Soft delete announcement
 * Access: 
 * - Tehničar: Only own announcements
 * - Administrator: Any announcement
 * Requirements: 3.8
 */
export async function deleteAnnouncementHandler(req, res) {
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

    logger.info(`Announcement deleted: ${id} by user ${req.user.userId}`);

    res.status(200).json({
      success: true,
      message: 'Obavijest je uspješno obrisana',
    });
  } catch (error) {
    logger.error('Error deleting announcement:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom brisanja obavijesti',
    });
  }
}
