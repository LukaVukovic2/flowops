# FlowOps Database Documentation

This document describes the complete database schema for the FlowOps IT Operations and Workflow Automation Platform.

## Database Technology

- **Platform:** Supabase (PostgreSQL)
- **Version:** PostgreSQL 14+
- **Region:** EU Central 1
- **Extensions Used:** uuid-ossp

## Schema Overview

The FlowOps database consists of **11 tables** organized into logical domains:

1. **Authentication & Users** (1 table)
2. **Ticket Management** (3 tables)
3. **Content Management** (2 tables)
4. **Asset Management** (1 table)
5. **Workflow Automation** (2 tables)
6. **Audit & Monitoring** (2 tables)

---

## Table Schemas

### 1. Users Table

**Purpose:** User authentication and role-based access control

**Table:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password (SALT_ROUNDS=12) |
| role | VARCHAR(50) | NOT NULL, CHECK | User role (see enum below) |
| first_name | VARCHAR(100) | | User first name |
| last_name | VARCHAR(100) | | User last name |
| is_active | BOOLEAN | DEFAULT true | Account active status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Account creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last update timestamp |

**Role Enum Values:**
- `Posjetitelj` - Visitor (read-only public access)
- `Registrirani_Korisnik` - Registered User (can create tickets)
- `Tehničar` - Technician (can manage tickets and create announcements)
- `Administrator` - Administrator (full system access)

**Indexes:**
- `idx_users_email` on (email)
- `idx_users_role` on (role)
- `idx_users_is_active` on (is_active)

**Relationships:**
- Referenced by: tickets (creator_id, assignee_id), ticket_history, ticket_comments, announcements, workflow_rules, audit_logs

---

### 2. Tickets Table

**Purpose:** IT support ticket management

**Table:** `tickets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique ticket identifier |
| title | VARCHAR(255) | NOT NULL | Ticket title/subject |
| description | TEXT | NOT NULL | Detailed ticket description |
| status | VARCHAR(50) | NOT NULL, CHECK, DEFAULT 'Nova' | Ticket status (see enum) |
| priority | VARCHAR(50) | CHECK | Ticket priority (see enum) |
| creator_id | UUID | NOT NULL, FK → users(id) | User who created the ticket |
| assignee_id | UUID | FK → users(id) | Assigned technician |
| asset_id | UUID | FK → assets(id) | Related IT asset |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last update timestamp |
| resolved_at | TIMESTAMP WITH TIME ZONE | | Resolution timestamp |
| closed_at | TIMESTAMP WITH TIME ZONE | | Closure timestamp |

**Status Enum Values:**
- `Nova` - New
- `U radu` - In Progress
- `Na čekanju` - On Hold
- `Riješena` - Resolved
- `Zatvorena` - Closed

**Priority Enum Values:**
- `Niska` - Low
- `Srednja` - Medium
- `Visoka` - High
- `Hitna` - Urgent

**Indexes:**
- `idx_tickets_status` on (status)
- `idx_tickets_creator_id` on (creator_id)
- `idx_tickets_assignee_id` on (assignee_id)
- `idx_tickets_created_at` on (created_at DESC)

**Relationships:**
- References: users (creator_id, assignee_id), assets (asset_id)
- Referenced by: ticket_history, ticket_comments

---

### 3. Ticket History Table

**Purpose:** Audit trail for all ticket changes

**Table:** `ticket_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique history record identifier |
| ticket_id | UUID | NOT NULL, FK → tickets(id) | Reference to ticket |
| user_id | UUID | NOT NULL, FK → users(id) | User who made the change |
| action | VARCHAR(100) | NOT NULL | Action type (e.g., status_changed, assigned) |
| old_value | TEXT | | Previous value |
| new_value | TEXT | | New value |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Change timestamp |

**Indexes:**
- `idx_ticket_history_ticket_id` on (ticket_id, created_at DESC)

**Relationships:**
- References: tickets (ticket_id), users (user_id)

---

### 4. Ticket Comments Table

**Purpose:** Comments and discussions on tickets

**Table:** `ticket_comments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique comment identifier |
| ticket_id | UUID | NOT NULL, FK → tickets(id) | Reference to ticket |
| author_id | UUID | NOT NULL, FK → users(id) | Comment author |
| content | TEXT | NOT NULL | Comment text |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last edit timestamp |

**Indexes:**
- `idx_ticket_comments_ticket_id` on (ticket_id, created_at)

**Relationships:**
- References: tickets (ticket_id), users (author_id)

---

### 5. Announcement Categories Table

**Purpose:** Categories for organizing announcements

**Table:** `announcement_categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique category identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| description | TEXT | | Category description |
| color | VARCHAR(7) | | Hex color code for UI (e.g., #3B82F6) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |

**Indexes:**
- `idx_announcement_categories_name` on (name)

**Relationships:**
- Referenced by: announcements (category_id)

---

### 6. Announcements Table

**Purpose:** IT announcements and news CMS

**Table:** `announcements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique announcement identifier |
| title | VARCHAR(255) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Announcement content (can include HTML) |
| author_id | UUID | NOT NULL, FK → users(id) | Author (Tehničar or Administrator) |
| category_id | UUID | FK → announcement_categories(id) | Category |
| image_url | TEXT | | URL to announcement image |
| is_published | BOOLEAN | DEFAULT false | Publication status |
| published_at | TIMESTAMP WITH TIME ZONE | | Publication timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last update timestamp |
| deleted_at | TIMESTAMP WITH TIME ZONE | | Soft delete timestamp |

**Indexes:**
- `idx_announcements_is_published` on (is_published)
- `idx_announcements_published_at` on (published_at DESC)
- `idx_announcements_author_id` on (author_id)
- `idx_announcements_category_id` on (category_id)

**Relationships:**
- References: users (author_id), announcement_categories (category_id)

**Features:**
- Soft delete support via deleted_at column
- Draft/published workflow via is_published flag
- Image upload support (max 10MB per requirement 3.5)

---

### 7. Assets Table

**Purpose:** IT asset inventory management

**Table:** `assets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique asset identifier |
| name | VARCHAR(255) | NOT NULL | Asset name or description |
| type | VARCHAR(50) | NOT NULL, CHECK | Asset type (see enum) |
| status | VARCHAR(50) | NOT NULL, CHECK | Asset status (see enum) |
| serial_number | VARCHAR(100) | | Serial number |
| model | VARCHAR(100) | | Model name/number |
| manufacturer | VARCHAR(100) | | Manufacturer/vendor |
| location | VARCHAR(255) | | Physical or logical location |
| purchase_date | DATE | | Purchase date |
| warranty_expiry | DATE | | Warranty expiration date |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last update timestamp |

**Type Enum Values:**
- `Hardware` - Physical hardware (servers, workstations)
- `Software` - Software licenses
- `Network` - Network equipment (routers, switches)
- `Peripheral` - Peripherals (printers, monitors)

**Status Enum Values:**
- `Active` - Currently in use
- `Inactive` - Not in use
- `Maintenance` - Under maintenance
- `Retired` - Decommissioned

**Indexes:**
- `idx_assets_type` on (type)
- `idx_assets_status` on (status)
- `idx_assets_location` on (location)

**Relationships:**
- Referenced by: tickets (asset_id)

---

### 8. Workflow Rules Table

**Purpose:** Workflow automation rule definitions

**Table:** `workflow_rules`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique workflow rule identifier |
| name | VARCHAR(255) | NOT NULL | Rule name |
| description | TEXT | | Rule description |
| is_enabled | BOOLEAN | DEFAULT true | Rule active status |
| trigger_type | VARCHAR(100) | NOT NULL, CHECK | Trigger type (see enum) |
| trigger_config | JSONB | NOT NULL | Trigger-specific configuration |
| actions | JSONB | NOT NULL | Array of actions to execute |
| created_by | UUID | NOT NULL, FK → users(id) | User who created the rule |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last update timestamp |

**Trigger Type Enum Values:**
- `ticket_created` - When a ticket is created
- `ticket_status_changed` - When ticket status changes
- `time_scheduled` - Scheduled/cron-based
- `external_status_changed` - When external service status changes

**Trigger Config Examples (JSONB):**
```json
// ticket_status_changed
{
  "fromStatus": "Nova",
  "toStatus": "U radu"
}

// time_scheduled
{
  "cronExpression": "0 9 * * MON",
  "timezone": "Europe/Zagreb"
}
```

**Actions Examples (JSONB):**
```json
[
  {
    "type": "send_notification",
    "config": {
      "recipients": ["tehničar"],
      "message": "Nova karta kreirana"
    }
  },
  {
    "type": "assign_technician",
    "config": {
      "strategy": "least_loaded"
    }
  }
]
```

**Indexes:**
- `idx_workflow_rules_enabled` on (is_enabled)
- `idx_workflow_rules_trigger` on (trigger_type)

**Relationships:**
- References: users (created_by)
- Referenced by: workflow_executions (workflow_rule_id)

---

### 9. Workflow Executions Table

**Purpose:** Workflow execution history and logging

**Table:** `workflow_executions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique execution identifier |
| workflow_rule_id | UUID | NOT NULL, FK → workflow_rules(id) | Reference to workflow rule |
| trigger_data | JSONB | | Data about what triggered execution |
| status | VARCHAR(50) | NOT NULL, CHECK | Execution status (see enum) |
| error_message | TEXT | | Error message if failed |
| executed_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Execution timestamp |

**Status Enum Values:**
- `success` - All actions executed successfully
- `failure` - Execution failed
- `partial` - Some actions succeeded, some failed

**Indexes:**
- `idx_workflow_executions_rule` on (workflow_rule_id, executed_at DESC)
- `idx_workflow_executions_status` on (status)

**Relationships:**
- References: workflow_rules (workflow_rule_id)

---

### 10. Audit Logs Table

**Purpose:** Security auditing and activity logging

**Table:** `audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique audit log entry identifier |
| user_id | UUID | FK → users(id) | User who performed action (nullable) |
| action_type | VARCHAR(100) | NOT NULL | Action type (e.g., login, ticket_created) |
| resource_type | VARCHAR(100) | | Resource type affected |
| resource_id | UUID | | Resource identifier |
| details | JSONB | | Additional action details |
| ip_address | INET | | Client IP address |
| user_agent | TEXT | | Client user agent string |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Action timestamp |

**Common Action Types:**
- `login`, `logout`, `login_failed`
- `ticket_created`, `ticket_updated`, `ticket_status_changed`
- `user_created`, `user_role_changed`, `user_deactivated`
- `announcement_published`, `workflow_executed`

**Indexes:**
- `idx_audit_logs_user` on (user_id, created_at DESC)
- `idx_audit_logs_action` on (action_type)
- `idx_audit_logs_resource` on (resource_type, resource_id)
- `idx_audit_logs_created_at` on (created_at DESC)

**Relationships:**
- References: users (user_id) - nullable for deleted users

---

### 11. External Service Status Table

**Purpose:** Cache for external service status (e.g., GitHub Status API)

**Table:** `external_service_status`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique cache entry identifier |
| service_name | VARCHAR(100) | UNIQUE, NOT NULL | Service identifier |
| status | VARCHAR(50) | NOT NULL | Service status (e.g., operational, degraded, down) |
| status_data | JSONB | | Detailed status information |
| last_checked_at | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Last check timestamp |
| cached_until | TIMESTAMP WITH TIME ZONE | NOT NULL | Cache expiry timestamp |

**Cache TTL:** 5 minutes (per requirement 7.4)

**Indexes:**
- `idx_external_service_cache` on (service_name, cached_until)

**Supported Services:**
- GitHub Status API (githubstatus.com)
- Extensible for other services

---

## Entity Relationship Diagram

```
users
  ├─→ tickets (creator_id, assignee_id)
  ├─→ ticket_history (user_id)
  ├─→ ticket_comments (author_id)
  ├─→ announcements (author_id)
  ├─→ workflow_rules (created_by)
  └─→ audit_logs (user_id)

tickets
  ├─→ ticket_history (ticket_id)
  ├─→ ticket_comments (ticket_id)
  └─← assets (asset_id)

announcement_categories
  └─→ announcements (category_id)

workflow_rules
  └─→ workflow_executions (workflow_rule_id)
```

---

## Database Constraints Summary

### Primary Keys
- All tables use UUID primary keys
- Auto-generated via `uuid_generate_v4()`

### Foreign Keys
| From Table | Column | References | On Delete |
|------------|--------|------------|-----------|
| tickets | creator_id | users(id) | CASCADE |
| tickets | assignee_id | users(id) | SET NULL |
| tickets | asset_id | assets(id) | SET NULL |
| ticket_history | ticket_id | tickets(id) | CASCADE |
| ticket_history | user_id | users(id) | CASCADE |
| ticket_comments | ticket_id | tickets(id) | CASCADE |
| ticket_comments | author_id | users(id) | CASCADE |
| announcements | author_id | users(id) | CASCADE |
| announcements | category_id | announcement_categories(id) | SET NULL |
| workflow_rules | created_by | users(id) | CASCADE |
| workflow_executions | workflow_rule_id | workflow_rules(id) | CASCADE |
| audit_logs | user_id | users(id) | SET NULL |

### Check Constraints
- users.role: Valid role enum
- tickets.status: Valid status enum
- tickets.priority: Valid priority enum
- assets.type: Valid type enum
- assets.status: Valid status enum
- workflow_rules.trigger_type: Valid trigger type enum
- workflow_executions.status: Valid execution status enum

### Unique Constraints
- users.email
- announcement_categories.name
- external_service_status.service_name

---

## Indexes Summary

**Total Indexes:** 30+

**Performance Considerations:**
- All foreign keys are indexed
- Frequently filtered columns have indexes
- Timestamp columns have descending indexes for efficient ordering
- Composite indexes for common query patterns

---

## Triggers

### Automatic Updated_at Triggers
Tables with automatic `updated_at` maintenance:
- users
- tickets
- ticket_comments
- announcements
- workflow_rules
- assets

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Files

All migrations are located in `supabase/migrations/`:

1. `20240101000000_create_users_table.sql`
2. `20240101000003_create_announcements_tables.sql`
3. `20240101000004_create_assets_table.sql`
4. `20240102000000_create_tickets_tables.sql`
5. `20240102000000_create_workflow_tables.sql`
6. `20240103000000_create_audit_logs_and_external_service_status_tables.sql`

**Apply in this order** to respect dependencies.

---

## Security Considerations

### Password Storage
- Passwords stored as bcrypt hashes (SALT_ROUNDS=12)
- Never stored in plain text
- password_hash column size sufficient for bcrypt output

### Audit Trail
- All security-relevant actions logged to audit_logs
- IP address and user agent captured
- Immutable audit log (no updates/deletes)

### Soft Deletes
- Announcements support soft delete (deleted_at)
- User accounts can be deactivated (is_active)
- Preserves data integrity and audit trail

### Row Level Security (RLS)
- To be configured per application requirements
- Recommended policies:
  - Users can only read their own data
  - Tehničar can read all tickets
  - Administrator has full access
  - Public can read published announcements only

---

## Data Types Best Practices

### Timestamps
- All use `TIMESTAMP WITH TIME ZONE`
- Stored in UTC
- Formatted in Croatian locale (dd.MM.yyyy HH:mm) in frontend

### UUIDs
- v4 UUIDs for distributed system support
- Better for security (non-sequential)
- Better for replication and sharding

### JSONB
- Used for flexible configuration (workflows)
- Indexed and queryable
- Preferred over JSON for performance

### VARCHAR vs TEXT
- VARCHAR with length for constrained fields
- TEXT for unbounded content

---

## Performance Optimization

### Indexing Strategy
1. **Foreign keys:** All indexed for join performance
2. **Filter columns:** status, role, is_published, etc.
3. **Sort columns:** created_at with DESC for efficient pagination
4. **Composite indexes:** Where multiple columns commonly queried together

### Query Optimization
- Parameterized queries prevent SQL injection
- Select only needed columns
- Use LIMIT for pagination
- Use EXISTS instead of COUNT where appropriate

### Connection Pooling
- Backend configured with Supabase connection pooling
- Maximum connections managed by Supabase

---

## Backup and Maintenance

### Supabase Automated Backups
- Daily automated backups
- Point-in-time recovery (PITR)
- Managed by Supabase

### Recommended Maintenance
- Monitor slow queries via Supabase Dashboard
- Review audit_logs regularly
- Clean up old workflow_executions periodically
- Archive old tickets as needed

---

## Croatian Language Support

### Enum Values in Croatian
- All status values, roles, priorities use Croatian
- Examples: Nova, U radu, Riješena (ticket statuses)
- Consistent with requirement 12.1 (all UI in Croatian)

### Comments and Documentation
- Table and column comments in Croatian where appropriate
- Frontend displays all text in Croatian
- Date formatting: dd.MM.yyyy (Croatian format)

---

## Schema Version

- **Current Version:** 1.0
- **Last Updated:** 2024-01-03
- **Migration Count:** 6 files
- **Total Tables:** 11
- **Total Indexes:** 30+

---

## Additional Resources

- **Migration Guide:** See `backend/TASK_2_COMPLETE.md`
- **API Documentation:** See `docs/API.md`
- **External API Integration:** See `docs/EXTERNAL_API.md`
- **User Guide:** See `docs/USER_GUIDE.md`

---

## Database Connection

### Connection Details
- **URL:** From `SUPABASE_URL` environment variable
- **Service Key:** From `SUPABASE_SERVICE_KEY` environment variable
- **Backend Config:** `backend/src/config/database.js`

### Test Connection
```bash
cd backend
node test-connection.js
```

### Verify Schema
```bash
cd backend
node check-schema.js
```

---

**Last Updated:** November 17, 2026  
**Status:** ✅ Production Ready
