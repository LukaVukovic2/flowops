-- Migration: Create audit_logs and external_service_status tables
-- Description: Activity logging for security auditing and external service status caching
-- Requirements: 16.1, 16.2, 7.4

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit_logs table
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add comment to audit_logs table
COMMENT ON TABLE audit_logs IS 'Activity logging table for security auditing and system usage tracking';

-- Add comments to audit_logs columns
COMMENT ON COLUMN audit_logs.id IS 'Unique audit log entry identifier (UUID)';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action (null if user deleted)';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed (e.g., login, ticket_created, role_changed)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., ticket, user, workflow_rule)';
COMMENT ON COLUMN audit_logs.resource_id IS 'Unique identifier of the affected resource';
COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action in JSON format';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address from which the action was performed';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the client';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action was logged';

-- Create external_service_status table
CREATE TABLE external_service_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  status_data JSONB,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cached_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for external_service_status table
CREATE INDEX idx_external_service_cache ON external_service_status(service_name, cached_until);

-- Add comment to external_service_status table
COMMENT ON TABLE external_service_status IS 'Cache for external service status information (e.g., GitHub Status API)';

-- Add comments to external_service_status columns
COMMENT ON COLUMN external_service_status.id IS 'Unique cache entry identifier (UUID)';
COMMENT ON COLUMN external_service_status.service_name IS 'Name of the external service (unique identifier)';
COMMENT ON COLUMN external_service_status.status IS 'Current status of the service (e.g., operational, degraded, down)';
COMMENT ON COLUMN external_service_status.status_data IS 'Detailed status information in JSON format';
COMMENT ON COLUMN external_service_status.last_checked_at IS 'Timestamp when the service status was last checked';
COMMENT ON COLUMN external_service_status.cached_until IS 'Timestamp until which the cached data is valid (max 5 minutes per requirement 7.4)';
