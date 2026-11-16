-- Migration: Create workflow tables
-- Description: Workflow automation rules and execution history tables
-- Requirements: 4.1, 4.5

-- Create workflow_rules table
CREATE TABLE workflow_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  trigger_type VARCHAR(100) NOT NULL CHECK (trigger_type IN (
    'ticket_created',
    'ticket_status_changed',
    'time_scheduled',
    'external_status_changed'
  )),
  trigger_config JSONB NOT NULL,  -- Trigger-specific configuration
  actions JSONB NOT NULL,         -- Array of actions to execute
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow_rules
CREATE INDEX idx_workflow_rules_enabled ON workflow_rules(is_enabled);
CREATE INDEX idx_workflow_rules_trigger ON workflow_rules(trigger_type);

-- Create workflow_executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_rule_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
  trigger_data JSONB,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failure', 'partial')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for workflow_executions
CREATE INDEX idx_workflow_executions_rule ON workflow_executions(workflow_rule_id, executed_at DESC);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Create trigger to automatically update updated_at timestamp for workflow_rules
CREATE TRIGGER update_workflow_rules_updated_at
  BEFORE UPDATE ON workflow_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to workflow_rules table
COMMENT ON TABLE workflow_rules IS 'Workflow automation rules with triggers and actions';

COMMENT ON COLUMN workflow_rules.id IS 'Unique workflow rule identifier (UUID)';
COMMENT ON COLUMN workflow_rules.name IS 'Workflow rule name';
COMMENT ON COLUMN workflow_rules.description IS 'Workflow rule description';
COMMENT ON COLUMN workflow_rules.is_enabled IS 'Whether the workflow rule is active';
COMMENT ON COLUMN workflow_rules.trigger_type IS 'Type of trigger: ticket_created, ticket_status_changed, time_scheduled, or external_status_changed';
COMMENT ON COLUMN workflow_rules.trigger_config IS 'JSONB configuration specific to the trigger type (e.g., fromStatus, toStatus for status changes, cronExpression for scheduled)';
COMMENT ON COLUMN workflow_rules.actions IS 'JSONB array of actions to execute (e.g., send_notification, update_ticket_status, assign_technician, create_announcement)';
COMMENT ON COLUMN workflow_rules.created_by IS 'User who created this workflow rule (references users table)';
COMMENT ON COLUMN workflow_rules.created_at IS 'Workflow rule creation timestamp';
COMMENT ON COLUMN workflow_rules.updated_at IS 'Last update timestamp (automatically maintained)';

-- Add comments to workflow_executions table
COMMENT ON TABLE workflow_executions IS 'Execution history for workflow rules';

COMMENT ON COLUMN workflow_executions.id IS 'Unique execution identifier (UUID)';
COMMENT ON COLUMN workflow_executions.workflow_rule_id IS 'Reference to the workflow rule that was executed';
COMMENT ON COLUMN workflow_executions.trigger_data IS 'JSONB data about what triggered this execution';
COMMENT ON COLUMN workflow_executions.status IS 'Execution status: success, failure, or partial';
COMMENT ON COLUMN workflow_executions.error_message IS 'Error message if execution failed';
COMMENT ON COLUMN workflow_executions.executed_at IS 'Timestamp when the workflow was executed';
