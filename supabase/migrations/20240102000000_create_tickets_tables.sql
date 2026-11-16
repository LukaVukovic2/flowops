-- Migration: Create tickets, ticket_history, and ticket_comments tables
-- Description: Ticket management system with history tracking and comments
-- Requirements: 10.4, 2.1, 2.6

-- Create tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Nova' CHECK (status IN ('Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena')),
  priority VARCHAR(50) CHECK (priority IN ('Niska', 'Srednja', 'Visoka', 'Hitna')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  asset_id UUID,  -- Will be linked when assets table is created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_creator_id ON tickets(creator_id);
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to tickets table
COMMENT ON TABLE tickets IS 'Ticket management system for IT incidents and support requests';
COMMENT ON COLUMN tickets.id IS 'Unique ticket identifier (UUID)';
COMMENT ON COLUMN tickets.title IS 'Ticket title/subject';
COMMENT ON COLUMN tickets.description IS 'Detailed ticket description';
COMMENT ON COLUMN tickets.status IS 'Ticket status: Nova, U radu, Na čekanju, Riješena, Zatvorena';
COMMENT ON COLUMN tickets.priority IS 'Ticket priority: Niska, Srednja, Visoka, Hitna';
COMMENT ON COLUMN tickets.creator_id IS 'User who created the ticket (foreign key to users)';
COMMENT ON COLUMN tickets.assignee_id IS 'Technician assigned to the ticket (foreign key to users)';
COMMENT ON COLUMN tickets.asset_id IS 'Related IT asset (foreign key to assets, to be created)';
COMMENT ON COLUMN tickets.created_at IS 'Ticket creation timestamp';
COMMENT ON COLUMN tickets.updated_at IS 'Last update timestamp (automatically maintained)';
COMMENT ON COLUMN tickets.resolved_at IS 'Timestamp when ticket was resolved';
COMMENT ON COLUMN tickets.closed_at IS 'Timestamp when ticket was closed';

-- Create ticket_history table
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ticket history queries
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id, created_at DESC);

-- Add comments to ticket_history table
COMMENT ON TABLE ticket_history IS 'Audit trail for all ticket changes';
COMMENT ON COLUMN ticket_history.id IS 'Unique history record identifier (UUID)';
COMMENT ON COLUMN ticket_history.ticket_id IS 'Reference to the ticket (foreign key to tickets)';
COMMENT ON COLUMN ticket_history.user_id IS 'User who made the change (foreign key to users)';
COMMENT ON COLUMN ticket_history.action IS 'Type of action performed (e.g., status_changed, assigned, updated)';
COMMENT ON COLUMN ticket_history.old_value IS 'Previous value before the change';
COMMENT ON COLUMN ticket_history.new_value IS 'New value after the change';
COMMENT ON COLUMN ticket_history.created_at IS 'Timestamp when the change occurred';

-- Create ticket_comments table
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ticket comments queries
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id, created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to ticket_comments table
COMMENT ON TABLE ticket_comments IS 'Comments and discussions on tickets';
COMMENT ON COLUMN ticket_comments.id IS 'Unique comment identifier (UUID)';
COMMENT ON COLUMN ticket_comments.ticket_id IS 'Reference to the ticket (foreign key to tickets)';
COMMENT ON COLUMN ticket_comments.author_id IS 'User who wrote the comment (foreign key to users)';
COMMENT ON COLUMN ticket_comments.content IS 'Comment text content';
COMMENT ON COLUMN ticket_comments.created_at IS 'Comment creation timestamp';
COMMENT ON COLUMN ticket_comments.updated_at IS 'Last update timestamp (automatically maintained)';
