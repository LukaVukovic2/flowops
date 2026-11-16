-- Migration: Create announcements tables
-- Description: Announcement categories and announcements tables for content management system
-- Requirements: 10.5, 3.1

-- Create announcement_categories table
CREATE TABLE announcement_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),  -- Hex color code (e.g., #3B82F6)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES announcement_categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for frequently queried columns on announcements
CREATE INDEX idx_announcements_is_published ON announcements(is_published);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_announcements_author_id ON announcements(author_id);
CREATE INDEX idx_announcements_category_id ON announcements(category_id);

-- Create index for category name lookups
CREATE INDEX idx_announcement_categories_name ON announcement_categories(name);

-- Create trigger to automatically update updated_at timestamp on announcements
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to announcement_categories table
COMMENT ON TABLE announcement_categories IS 'Categories for organizing announcements';
COMMENT ON COLUMN announcement_categories.id IS 'Unique category identifier (UUID)';
COMMENT ON COLUMN announcement_categories.name IS 'Category name (unique)';
COMMENT ON COLUMN announcement_categories.description IS 'Category description (optional)';
COMMENT ON COLUMN announcement_categories.color IS 'Category color in hex format for UI display';
COMMENT ON COLUMN announcement_categories.created_at IS 'Category creation timestamp';

-- Add comments to announcements table
COMMENT ON TABLE announcements IS 'Announcements for internal IT operations news and information';
COMMENT ON COLUMN announcements.id IS 'Unique announcement identifier (UUID)';
COMMENT ON COLUMN announcements.title IS 'Announcement title';
COMMENT ON COLUMN announcements.content IS 'Announcement content (can include HTML)';
COMMENT ON COLUMN announcements.author_id IS 'User ID of the announcement author (Tehničar or Administrator)';
COMMENT ON COLUMN announcements.category_id IS 'Category ID (optional, nullable if category is deleted)';
COMMENT ON COLUMN announcements.image_url IS 'URL to announcement image (optional)';
COMMENT ON COLUMN announcements.is_published IS 'Publication status (false for drafts)';
COMMENT ON COLUMN announcements.published_at IS 'Publication timestamp (set when published)';
COMMENT ON COLUMN announcements.created_at IS 'Announcement creation timestamp';
COMMENT ON COLUMN announcements.updated_at IS 'Last update timestamp (automatically maintained)';
COMMENT ON COLUMN announcements.deleted_at IS 'Soft delete timestamp (null for active announcements)';

</content>
</invoke>