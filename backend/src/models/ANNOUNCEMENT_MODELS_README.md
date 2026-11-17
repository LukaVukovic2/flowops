# Announcement Data Models

**Task 11.1 Implementation - Complete**

This document describes the announcement data models implementation for the FlowOps platform.

## Overview

The announcement system consists of two main models:
1. **Announcement Model** - Manages announcements (news/information posts)
2. **Announcement Category Model** - Manages categories for organizing announcements

## Requirements Satisfied

- **Requirement 3.1**: Announcement creation with author tracking, categories, and content
- **Requirement 3.5**: Image URL and file format validation

## Files Created

- `announcement.model.js` - Announcement CRUD operations
- `announcementCategory.model.js` - Category management operations
- `announcement.model.test.js` - Unit tests for announcements
- `announcementCategory.model.test.js` - Unit tests for categories
- `announcement-smoke-test.js` - Quick validation script

## Announcement Model

### Features

- **Create announcements** with title, content, author, category, and optional image
- **Soft delete** - Announcements are marked as deleted but preserved in database
- **Publish/Unpublish** - Control announcement visibility
- **Image validation** - URL format and file extension validation
- **Comprehensive filtering** - By publication status, category, author
- **Pagination support** - Efficient data retrieval for lists

### Functions

#### createAnnouncement(announcementData)
Creates a new announcement (starts as unpublished draft).

```javascript
const announcement = await createAnnouncement({
  title: 'System Maintenance',
  content: 'Scheduled maintenance on Saturday...',
  authorId: 'user-uuid',
  categoryId: 'category-uuid', // optional
  imageUrl: 'https://example.com/image.jpg' // optional
});
```

**Validation:**
- Image URL must be valid HTTP/HTTPS URL
- Image URL must have valid extension: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

#### getAnnouncementById(announcementId, includeDeleted)
Retrieves a single announcement by ID.

```javascript
const announcement = await getAnnouncementById('announcement-uuid');
// Includes author and category details
```

**Parameters:**
- `announcementId` - UUID of the announcement
- `includeDeleted` - Boolean (default: false) - Include soft-deleted announcements

#### getAnnouncements(filters)
Retrieves announcements with filtering and pagination.

```javascript
const result = await getAnnouncements({
  isPublished: true,
  categoryId: 'category-uuid',
  authorId: 'user-uuid',
  page: 1,
  limit: 20,
  includeDeleted: false
});

// Returns:
// {
//   announcements: [...],
//   pagination: { page, limit, total, totalPages }
// }
```

**Ordering:**
- Published announcements sorted by `published_at` DESC
- Unpublished announcements sorted by `created_at` DESC

#### updateAnnouncement(announcementId, updates)
Updates announcement fields.

```javascript
const updated = await updateAnnouncement('announcement-uuid', {
  title: 'Updated Title',
  content: 'Updated content',
  category_id: 'new-category-uuid',
  image_url: 'https://example.com/new-image.jpg'
});
```

**Allowed fields:**
- `title`
- `content`
- `category_id`
- `image_url`

**Note:** Cannot update soft-deleted announcements.

#### publishAnnouncement(announcementId)
Publishes an announcement and sets `published_at` timestamp.

```javascript
const published = await publishAnnouncement('announcement-uuid');
// Sets is_published = true and published_at = NOW()
```

#### unpublishAnnouncement(announcementId)
Unpublishes an announcement.

```javascript
const unpublished = await unpublishAnnouncement('announcement-uuid');
// Sets is_published = false
```

#### softDeleteAnnouncement(announcementId)
Soft deletes an announcement (marks as deleted, preserves in database).

```javascript
const deleted = await softDeleteAnnouncement('announcement-uuid');
// Sets deleted_at = NOW() and is_published = false
```

**Note:** Soft-deleted announcements are excluded from queries by default.

#### restoreAnnouncement(announcementId)
Restores a soft-deleted announcement.

```javascript
const restored = await restoreAnnouncement('announcement-uuid');
// Sets deleted_at = NULL
```

#### permanentlyDeleteAnnouncement(announcementId)
Permanently deletes an announcement from database.

```javascript
const result = await permanentlyDeleteAnnouncement('announcement-uuid');
// Returns true on success
```

**Warning:** This is irreversible!

## Announcement Category Model

### Features

- **Category management** - Create, read, update, delete categories
- **Color coding** - Support for hex color codes for UI display
- **Unique names** - Enforced at database level
- **Usage statistics** - Track announcement count per category
- **Safe deletion** - ON DELETE SET NULL ensures announcements aren't lost

### Functions

#### createCategory(categoryData)
Creates a new announcement category.

```javascript
const category = await createCategory({
  name: 'Maintenance',
  description: 'System maintenance announcements',
  color: '#3B82F6' // optional, hex color code
});
```

**Validation:**
- Name must be unique
- Color must be valid hex code: `#FFF` or `#FF5733`

#### getCategoryById(categoryId)
Retrieves a category by ID.

```javascript
const category = await getCategoryById('category-uuid');
```

#### getCategoryByName(name)
Retrieves a category by name.

```javascript
const category = await getCategoryByName('Maintenance');
```

#### getCategories(options)
Retrieves categories with pagination.

```javascript
const result = await getCategories({
  page: 1,
  limit: 50
});

// Returns:
// {
//   categories: [...],
//   pagination: { page, limit, total, totalPages }
// }
```

**Ordering:** Categories sorted alphabetically by name.

#### getAllCategories()
Retrieves all categories without pagination (useful for dropdowns).

```javascript
const categories = await getAllCategories();
// Returns array of all categories
```

#### updateCategory(categoryId, updates)
Updates category fields.

```javascript
const updated = await updateCategory('category-uuid', {
  name: 'Updated Name',
  description: 'Updated description',
  color: '#FF0000'
});
```

**Allowed fields:**
- `name` (must remain unique)
- `description`
- `color` (must be valid hex code)

#### deleteCategory(categoryId)
Deletes a category.

```javascript
const result = await deleteCategory('category-uuid');
// Returns true on success
```

**Note:** When a category is deleted, announcements in that category will have their `category_id` set to `NULL` (ON DELETE SET NULL constraint).

#### getCategoryStats(categoryId)
Retrieves category with announcement count.

```javascript
const stats = await getCategoryStats('category-uuid');
// Returns:
// {
//   id, name, description, color, created_at,
//   announcementCount: 5
// }
```

## Database Schema

### announcements table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Announcement content |
| author_id | UUID | NOT NULL, FK(users) | Author user ID |
| category_id | UUID | FK(categories) | Category (nullable) |
| image_url | TEXT | | Image URL (optional) |
| is_published | BOOLEAN | DEFAULT false | Publication status |
| published_at | TIMESTAMPTZ | | Publication timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | | Soft delete timestamp |

**Indexes:**
- `idx_announcements_is_published` ON (is_published)
- `idx_announcements_published_at` ON (published_at DESC)
- `idx_announcements_author_id` ON (author_id)
- `idx_announcements_category_id` ON (category_id)

**Triggers:**
- `update_announcements_updated_at` - Automatically updates `updated_at` on row modification

### announcement_categories table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | UNIQUE NOT NULL | Category name |
| description | TEXT | | Category description |
| color | VARCHAR(7) | | Hex color code (#RRGGBB) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_announcement_categories_name` ON (name)

## Usage Examples

### Creating and Publishing an Announcement

```javascript
import * as AnnouncementModel from './models/announcement.model.js';
import * as CategoryModel from './models/announcementCategory.model.js';

// 1. Create category
const category = await CategoryModel.createCategory({
  name: 'IT Updates',
  description: 'IT system updates and news',
  color: '#3B82F6'
});

// 2. Create announcement (draft)
const announcement = await AnnouncementModel.createAnnouncement({
  title: 'New Email System',
  content: 'We are upgrading to a new email system...',
  authorId: 'tech-user-uuid',
  categoryId: category.id,
  imageUrl: 'https://example.com/email-icon.png'
});

// 3. Publish announcement
const published = await AnnouncementModel.publishAnnouncement(announcement.id);
```

### Filtering Published Announcements

```javascript
// Get only published announcements in a specific category
const result = await AnnouncementModel.getAnnouncements({
  isPublished: true,
  categoryId: category.id,
  page: 1,
  limit: 10
});

console.log(`Found ${result.pagination.total} published announcements`);
result.announcements.forEach(ann => {
  console.log(`${ann.title} - ${ann.published_at}`);
});
```

### Soft Delete and Restore

```javascript
// Soft delete (announcement is hidden but preserved)
await AnnouncementModel.softDeleteAnnouncement('announcement-uuid');

// Later, restore if needed
await AnnouncementModel.restoreAnnouncement('announcement-uuid');
```

## Testing

### Running Unit Tests

```bash
# Run announcement model tests
npm test -- src/models/announcement.model.test.js

# Run category model tests
npm test -- src/models/announcementCategory.model.test.js

# Run all model tests
npm test -- src/models/*.test.js
```

### Running Smoke Test

```bash
node src/models/announcement-smoke-test.js
```

## Error Handling

All model functions throw descriptive errors:

```javascript
try {
  await AnnouncementModel.createAnnouncement({
    title: 'Test',
    content: 'Test content',
    authorId: 'user-uuid',
    imageUrl: 'not-a-valid-url' // Invalid!
  });
} catch (error) {
  console.error(error.message);
  // "Invalid image URL format"
}
```

**Common errors:**
- `Invalid image URL format` - Image URL is malformed
- `Image URL must point to a valid image format` - Invalid file extension
- `Category with name "..." already exists` - Duplicate category name
- `Color must be a valid hex color code` - Invalid hex format
- `Failed to create/update/delete...` - Database operation failed

## Integration with API

These models are designed to be called from API controllers:

```javascript
// Example controller function
async function createAnnouncementHandler(req, res) {
  try {
    const { title, content, categoryId, imageUrl } = req.body;
    const authorId = req.user.id; // From auth middleware
    
    const announcement = await AnnouncementModel.createAnnouncement({
      title,
      content,
      authorId,
      categoryId,
      imageUrl
    });
    
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

## Next Steps

With Task 11.1 complete, proceed to:

- **Task 11.2**: Implement announcement CRUD API endpoints
- **Task 11.3**: Implement announcement categories API
- **Task 12.1**: Create announcement display components
- **Task 12.2**: Create announcement management UI

## Notes

- All timestamps are stored in UTC using PostgreSQL `TIMESTAMP WITH TIME ZONE`
- Soft delete is the default deletion method to preserve data
- Image validation is basic URL and extension checking (actual file validation should be done at upload)
- The `updated_at` timestamp is automatically maintained by a database trigger
- Foreign key constraints ensure referential integrity
