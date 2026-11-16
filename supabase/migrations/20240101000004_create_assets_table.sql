-- Migration: Create assets table
-- Description: IT asset management table for tracking hardware, software, network equipment, and peripherals
-- Requirements: 8.1, 8.2, 8.3

-- Create assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Hardware', 'Software', 'Network', 'Peripheral')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Inactive', 'Maintenance', 'Retired')),
  serial_number VARCHAR(100),
  model VARCHAR(100),
  manufacturer VARCHAR(100),
  location VARCHAR(255),
  purchase_date DATE,
  warranty_expiry DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_location ON assets(location);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE assets IS 'IT asset management table for tracking hardware, software, network equipment, and peripherals';

-- Add comments to columns
COMMENT ON COLUMN assets.id IS 'Unique asset identifier (UUID)';
COMMENT ON COLUMN assets.name IS 'Asset name or description';
COMMENT ON COLUMN assets.type IS 'Asset type: Hardware, Software, Network, or Peripheral';
COMMENT ON COLUMN assets.status IS 'Asset status: Active, Inactive, Maintenance, or Retired';
COMMENT ON COLUMN assets.serial_number IS 'Asset serial number (optional)';
COMMENT ON COLUMN assets.model IS 'Asset model name or number (optional)';
COMMENT ON COLUMN assets.manufacturer IS 'Asset manufacturer or vendor (optional)';
COMMENT ON COLUMN assets.location IS 'Physical or logical location of the asset (optional)';
COMMENT ON COLUMN assets.purchase_date IS 'Date when asset was purchased (optional)';
COMMENT ON COLUMN assets.warranty_expiry IS 'Date when warranty expires (optional)';
COMMENT ON COLUMN assets.notes IS 'Additional notes or information about the asset (optional)';
COMMENT ON COLUMN assets.created_at IS 'Asset record creation timestamp';
COMMENT ON COLUMN assets.updated_at IS 'Last update timestamp (automatically maintained)';
