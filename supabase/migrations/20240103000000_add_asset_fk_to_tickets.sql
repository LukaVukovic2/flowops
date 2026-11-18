-- Migration: Add foreign key constraint from tickets to assets
-- Description: Establish referential integrity between tickets and assets tables
-- Requirements: 8.6, 8.7, 17.3

-- Add foreign key constraint to tickets.asset_id
ALTER TABLE tickets
ADD CONSTRAINT fk_tickets_asset_id
FOREIGN KEY (asset_id)
REFERENCES assets(id)
ON DELETE SET NULL;

-- Create index for asset_id for better query performance
CREATE INDEX idx_tickets_asset_id ON tickets(asset_id);

-- Update comment
COMMENT ON COLUMN tickets.asset_id IS 'Related IT asset (foreign key to assets)';
