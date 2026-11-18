# Implementation Plan: FlowOps Platform

## Overview

FlowOps is a comprehensive IT Operations and Workflow Automation Platform featuring ticket management, announcement CMS, IT asset tracking, workflow automation, and external service monitoring. The implementation uses React 18+ with Vite for the frontend and Node.js with Express for the backend, with Supabase PostgreSQL as the database. All UI text is in Croatian.

This implementation plan breaks down the development into logically ordered, testable tasks organized in waves for parallel execution where possible.

## Tasks

### Phase 1: Foundation & Setup

- [x] 1. Initialize project foundation
  - [x] 1.1 Configure frontend dependencies and Vite build
    - Install React 18+, React Router v6, Axios, React Hook Form, Zod, date-fns, Tailwind CSS, Lucide React
    - Configure Vite with proper dev server and build settings
    - Set up Tailwind CSS with custom design tokens
    - Create base HTML template with Croatian language attribute
    - _Requirements: 12.1, 14.1-14.3_
  
  - [x] 1.2 Configure backend dependencies and Express app
    - Install Express.js, Supabase JS Client, jsonwebtoken, bcrypt, express-validator, node-cron, axios
    - Create Express app structure with middleware pipeline
    - Configure CORS, JSON body parser, error handler
    - Set up environment variable loading
    - _Requirements: 9.1, 9.2, 11.4_
  
  - [x] 1.3 Set up Supabase project and connection
    - Create Supabase project instance
    - Configure database connection parameters
    - Create database configuration module in backend
    - Test connection from backend
    - _Requirements: 10.1_

- [x] 2. 

  - [x] 2.1 Create users table migration
    - Write migration for users table with id, email, password_hash, role, first_name, last_name, is_active, timestamps
    - Add indexes on email, role, is_active
    - Add CHECK constraint for role enum values
    - _Requirements: 10.3, 1.5_
  
  - [x] 2.2 Create tickets and ticket_history tables migration
    - Write migration for tickets table with foreign keys to users (creator, assignee)
    - Write migration for ticket_history table tracking all changes
    - Write migration for ticket_comments table
    - Add indexes on status, creator_id, assignee_id, created_at
    - _Requirements: 10.4, 2.1, 2.6_
  
  - [x] 2.3 Create announcements tables migration
    - Write migration for announcement_categories table
    - Write migration for announcements table with foreign keys to users and categories
    - Add indexes on is_published, published_at, author_id, category_id
    - _Requirements: 10.5, 3.1_
  
  - [x] 2.4 Create assets table migration
    - Write migration for assets table with type, status, location, serial_number fields
    - Add CHECK constraints for type and status enums
    - Add indexes on type, status, location
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 2.5 Create workflow tables migration
    - Write migration for workflow_rules table with trigger_config and actions as JSONB
    - Write migration for workflow_executions table tracking execution history
    - Add indexes on trigger_type, is_enabled, workflow_rule_id
    - _Requirements: 4.1, 4.5_
  
  - [x] 2.6 Create audit_logs and external_service_status tables migration
    - Write migration for audit_logs table with user_id, action_type, resource references
    - Write migration for external_service_status cache table
    - Add indexes on user_id, created_at, action_type, service_name
    - _Requirements: 16.1, 16.2, 7.4_

- [ ] 3. Checkpoint - Database foundation complete
  - Ensure all migrations apply successfully without errors
  - Verify all foreign key constraints work correctly
  - Verify all indexes are created
  - Ask the user if questions arise

### Phase 2: Authentication & User Management

- [x] 4. Backend authentication system
  - [x] 4.1 Implement password hashing and validation
    - Create auth utility functions using bcrypt with SALT_ROUNDS=12
    - Implement password validation with regex for complexity requirements
    - Write unit tests for password hashing and verification
    - _Requirements: 1.3, 11.5_
  
  - [x] 4.2 Implement JWT token generation and verification
    - Create JWT utilities for token generation with 24-hour expiry
    - Create JWT verification middleware extracting token from Authorization header
    - Implement token validation with signature verification
    - Handle expired tokens with appropriate error responses
    - _Requirements: 1.1, 1.4, 11.7_
  
  - [x] 4.3 Create authentication API endpoints
    - Implement POST /api/v1/auth/register endpoint with email/password validation
    - Implement POST /api/v1/auth/login endpoint with credential verification
    - Implement POST /api/v1/auth/logout endpoint (optional token blacklist)
    - Implement GET /api/v1/auth/me endpoint for current user profile
    - Return Croatian error messages for all authentication failures
    - _Requirements: 1.1, 1.2, 9.4, 9.5, 20.1_
  
  - [x] 4.4 Implement role-based access control middleware
    - Create RBAC middleware checking user role against allowed roles
    - Return 403 with Croatian error message for unauthorized access
    - Create permission helper utilities
    - _Requirements: 1.6, 1.7_

- [x] 5. Frontend authentication system
  - [x] 5.1 Create authentication context and hooks
    - Implement AuthContext with user state, login, logout, register functions
    - Create useAuth hook for accessing auth context
    - Store JWT token in localStorage with automatic injection in API requests
    - Handle token expiry with automatic logout
    - _Requirements: 1.1, 1.4_
  
  - [x] 5.2 Build login and registration pages
    - Create LoginPage component with email/password form
    - Create RegisterPage component with email/password/name fields
    - Implement form validation with Zod schemas
    - Display validation errors in Croatian
    - Show loading states during authentication
    - _Requirements: 1.1, 1.2, 12.1, 12.6_
  
  - [x] 5.3 Create protected route components
    - Implement ProtectedRoute component checking authentication
    - Implement RoleRoute component checking role permissions
    - Redirect to login page when unauthenticated
    - Display Croatian error for unauthorized access attempts
    - _Requirements: 1.6, 1.7_

- [x] 6. User administration (Administrator only)
  - [x] 6.1 Create user management backend API
    - Implement GET /api/v1/users endpoint with pagination and role filtering
    - Implement PATCH /api/v1/users/:id/role endpoint for role changes
    - Implement PATCH /api/v1/users/:id/deactivate endpoint
    - Implement PATCH /api/v1/users/:id/reset-password endpoint
    - Prevent last Administrator from being deleted or role-changed
    - Log all user management actions to audit_logs
    - _Requirements: 5.1, 5.2, 5.3, 5.7, 5.8, 5.9_
  
  - [x] 6.2 Build user management UI
    - Create UserManagementPage displaying user list with role and status
    - Implement role change modal with confirmation
    - Implement user deactivation with confirmation dialog
    - Display all text in Croatian
    - Show success/error notifications for actions
    - _Requirements: 5.5, 5.9, 12.1_

- [ ] 7. Checkpoint - Authentication system complete
  - Test registration, login, logout workflows
  - Verify JWT tokens expire after 24 hours
  - Verify role-based access control prevents unauthorized actions
  - Test user administration functions as Administrator
  - Ask the user if questions arise

### Phase 3: Core Features - Tickets

- [x] 8. Ticket management backend
  - [x] 8.1 Create ticket data models and business logic
    - Implement ticket model with create, read, update methods
    - Implement ticket history model for change tracking
    - Implement ticket comments model
    - Ensure all timestamps are stored in UTC
    - _Requirements: 2.1, 2.6, 2.7_
  
  - [x] 8.2 Implement ticket CRUD API endpoints
    - Implement GET /api/v1/tickets with filtering (status, assignee, creator, date range)
    - Implement POST /api/v1/tickets (auto-assign status "Nova")
    - Implement GET /api/v1/tickets/:id with authorization check
    - Implement PUT /api/v1/tickets/:id with ownership validation
    - Implement PATCH /api/v1/tickets/:id/status for status changes
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 2.10, 17.1_
  
  - [x] 8.3 Implement ticket history and comments API
    - Implement GET /api/v1/tickets/:id/history returning chronological changes
    - Implement GET /api/v1/tickets/:id/comments with pagination
    - Implement POST /api/v1/tickets/:id/comments with author tracking
    - Record all ticket updates in ticket_history automatically
    - _Requirements: 2.6, 2.7, 2.9_

- [x] 9. Ticket management frontend
  - [x] 9.1 Create ticket list components
    - Build TicketList component with status badges in Croatian
    - Build TicketCard component displaying title, status, priority, timestamps
    - Implement TicketFilters component with status, assignee, date range filters
    - Format all dates using Croatian locale (dd.MM.yyyy HH:mm)
    - _Requirements: 2.3, 2.4, 2.5, 12.2, 12.3, 17.1_
  
  - [x] 9.2 Create ticket detail and form components
    - Build TicketDetail component showing full ticket information
    - Build TicketForm component for creation and editing
    - Implement validation with Zod schemas
    - Display Croatian labels and validation errors
    - Show loading skeletons during data fetch
    - _Requirements: 2.1, 2.10, 12.6, 15.8_
  
  - [x] 9.3 Implement ticket history and comments UI
    - Build TicketHistory component showing timeline of changes
    - Build TicketComments component with comment list and form
    - Format timestamps in Croatian locale
    - Show author names for all comments and changes
    - _Requirements: 2.6, 2.7, 12.2_

- [ ] 10. Checkpoint - Ticket system complete
  - Test creating tickets as Registrirani_Korisnik
  - Verify tickets start with status "Nova"
  - Verify Registrirani_Korisnik can only view own tickets
  - Verify Tehničar can view assigned tickets
  - Verify Administrator can view all tickets
  - Test filtering tickets by status and date range
  - Ask the user if questions arise

### Phase 4: Core Features - Announcements

- [x] 11. Announcement CMS backend ✅
  - [x] 11.1 Create announcement data models ✅
    - ✅ Implement announcement model with create, read, update, soft-delete methods
    - ✅ Implement announcement_categories model
    - ✅ Validate image URLs and file formats
    - _Requirements: 3.1, 3.5_
  
  - [x] 11.2 Implement announcement CRUD API endpoints ✅
    - ✅ Implement GET /api/v1/announcements with category filtering (published only for non-Tehničar)
    - ✅ Implement POST /api/v1/announcements (Tehničar and Administrator only)
    - ✅ Implement PUT /api/v1/announcements/:id with ownership check for Tehničar
    - ✅ Implement PATCH /api/v1/announcements/:id/publish
    - ✅ Implement DELETE /api/v1/announcements/:id (soft delete with deleted_at timestamp)
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 17.2_
  
  - [x] 11.3 Implement announcement categories API ✅
    - ✅ Implement GET /api/v1/announcements/categories
    - ✅ Implement POST /api/v1/announcements/categories (Administrator only)
    - ✅ Implement PUT /api/v1/announcements/categories/:id (Administrator only)
    - ✅ Implement DELETE /api/v1/announcements/categories/:id (Administrator only)
    - _Requirements: 3.2_

- [ ] 12. Announcement CMS frontend
  - [ ] 12.1 Create announcement display components
    - Build AnnouncementList component with category badges and images
    - Build AnnouncementCard component with publish date formatting
    - Build AnnouncementDetail component for full content view
    - Display announcements in reverse chronological order
    - Format timestamps in Croatian locale
    - _Requirements: 3.3, 3.9, 3.10, 12.2_
  
  - [x] 12.2 Create announcement management UI (Tehničar/Administrator)
    - Build AnnouncementForm component with title, content, category, image fields
    - Implement image upload validation (format and size ≤ 10MB)
    - Build publish/unpublish toggle
    - Display Croatian labels and validation errors
    - Show success notifications on publish
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 12.1, 12.6_
  
  - [x] 12.3 Implement announcement filtering
    - Build AnnouncementFilters component with category and author filters
    - Update list view when filters change
    - Display filter controls in Croatian
    - _Requirements: 17.2_

- [ ] 13. Checkpoint - Announcement system complete
  - Test creating announcements as Tehničar
  - Verify unpublished announcements not visible to non-Tehničar
  - Test publishing announcements
  - Verify published announcements visible to all users
  - Test image upload validation
  - Test soft delete functionality
  - Ask the user if questions arise

### Phase 5: Dashboard & Statistics

- [x] 14. Dashboard backend API
  - [x] 14.1 Implement dashboard statistics endpoint
    - Implement GET /api/v1/dashboard/stats calculating ticket counts by status
    - Calculate announcement counts (total and published)
    - Calculate asset counts by status
    - Filter statistics based on user role (own tickets for Registrirani_Korisnik, etc.)
    - Cache statistics for 30 seconds to reduce database load
    - _Requirements: 6.1, 6.2, 6.8, 6.9_
  
  - [x] 14.2 Implement recent activity endpoint
    - Implement GET /api/v1/dashboard/recent-activity
    - Return recent ticket changes, new announcements
    - Filter activity based on user role
    - _Requirements: 6.3_

- [x] 15. Dashboard frontend
  - [x] 15.1 Build dashboard layout and statistics cards
    - Create DashboardPage as main entry point
    - Build StatCard components displaying ticket counts, announcement counts
    - Use Croatian labels for all statistics
    - Implement auto-refresh every 60 seconds
    - Show loading skeletons during data fetch
    - _Requirements: 6.1, 6.2, 6.7, 15.8_
  
  - [x] 15.2 Build recent announcements widget
    - Display 5 most recent published announcements
    - Format timestamps in Croatian locale
    - Link to full announcement detail
    - _Requirements: 6.3, 12.2_
  
  - [x] 15.3 Implement role-based dashboard content
    - Show public data only for Posjetitelj
    - Show own tickets + published announcements for Registrirani_Korisnik
    - Show full statistics and external service status for Tehničar/Administrator
    - _Requirements: 6.8, 6.9_

- [ ] 16. Checkpoint - Dashboard complete
  - Verify ticket counts match actual database counts
  - Test dashboard loads within 2 seconds
  - Verify Posjetitelj sees only public information
  - Verify role-appropriate content for each role
  - Test auto-refresh functionality
  - Ask the user if questions arise

### Phase 6: IT Asset Management

- [x] 17. Asset management backend
  - [x] 17.1 Create asset data model
    - Implement asset model with CRUD operations
    - Validate type enum (Hardware, Software, Network, Peripheral)
    - Validate status enum (Active, Inactive, Maintenance, Retired)
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 17.2 Implement asset CRUD API endpoints
    - Implement GET /api/v1/assets with filtering by type, status, location
    - Implement POST /api/v1/assets (Tehničar and Administrator only)
    - Implement PUT /api/v1/assets/:id
    - Implement DELETE /api/v1/assets/:id (Administrator only)
    - _Requirements: 8.4, 8.5, 17.3_
  
  - [x] 17.3 Implement asset-ticket linking
    - Add assetId foreign key handling in ticket create/update
    - Implement endpoint to get tickets linked to specific asset
    - _Requirements: 8.6, 8.7_

- [x] 18. Asset management frontend
  - [x] 18.1 Create asset list and detail components
    - Build AssetList component with type and status badges
    - Build AssetCard component
    - Build AssetDetail component showing all asset information
    - Display linked tickets in asset detail view
    - _Requirements: 8.7, 8.9_
  
  - [x] 18.2 Create asset form and filters
    - Build AssetForm component with all asset fields
    - Implement validation with Zod schemas
    - Build AssetFilters component for type, status, location filtering
    - Display Croatian labels and validation errors
    - _Requirements: 8.1, 8.4, 8.8, 8.10, 12.1_

- [ ] 19. Checkpoint - Asset management complete
  - Test creating assets as Tehničar
  - Test linking assets to tickets
  - Verify asset-ticket relationships display correctly
  - Test filtering assets by type and status
  - Verify Administrator can delete assets
  - Ask the user if questions arise

### Phase 7: Workflow Automation Engine

- [ ] 20. Workflow engine core
  - [x] 20.1 Implement workflow trigger evaluators
    - Create TriggerEvaluator for ticket_created trigger
    - Create TriggerEvaluator for ticket_status_changed trigger
    - Create TriggerEvaluator for time_scheduled trigger using node-cron
    - Create TriggerEvaluator for external_status_changed trigger
    - _Requirements: 4.2_
  
  - [x] 20.2 Implement workflow action executors
    - Create ActionExecutor for send_notification action
    - Create ActionExecutor for update_ticket_status action
    - Create ActionExecutor for assign_technician action with strategies (least_loaded, round_robin, specific)
    - Create ActionExecutor for create_announcement action
    - _Requirements: 4.3_
  
  - [x] 20.3 Build workflow execution engine
    - Create WorkflowEngine class orchestrating trigger evaluation and action execution
    - Implement processEvent method for event-driven workflows
    - Implement scheduleWorkflows method for time-based workflows
    - Log all executions to workflow_executions table with status and error messages
    - Ensure workflow failures don't crash system
    - _Requirements: 4.4, 4.5, 4.7_
  
  - [x] 20.4 Implement circular dependency detection
    - Create dependency graph builder analyzing workflow rules
    - Implement cycle detection algorithm
    - Prevent activation of workflows with circular dependencies
    - _Requirements: 4.8_

- [ ] 21. Workflow management backend API
  - [ ] 21.1 Implement workflow CRUD endpoints
    - Implement GET /api/v1/workflows (Administrator only)
    - Implement POST /api/v1/workflows with validation and circular dependency check
    - Implement PUT /api/v1/workflows/:id
    - Implement DELETE /api/v1/workflows/:id
    - Implement PATCH /api/v1/workflows/:id/toggle for enable/disable
    - _Requirements: 4.1, 4.6_
  
  - [ ] 21.2 Implement workflow testing and execution history
    - Implement POST /api/v1/workflows/:id/test for dry-run testing
    - Implement GET /api/v1/workflows/:id/executions showing execution history
    - _Requirements: 4.9, 4.10_

- [ ] 22. Workflow management frontend
  - [ ] 22.1 Build workflow list and detail components
    - Create WorkflowManagementPage displaying all workflow rules
    - Build WorkflowCard component with enable/disable toggle
    - Display trigger type and action count
    - _Requirements: 4.10, 12.1_
  
  - [ ] 22.2 Create workflow rule form
    - Build WorkflowForm component with trigger type selection
    - Build dynamic trigger config inputs based on trigger type
    - Build dynamic action builder with multiple action types
    - Implement validation with Zod schemas
    - Display Croatian labels and validation errors
    - _Requirements: 4.1, 4.2, 4.3, 12.1_
  
  - [ ] 22.3 Build workflow testing UI
    - Add "Test Workflow" button in workflow detail view
    - Display test results with executed actions log
    - Show success/failure status in Croatian
    - _Requirements: 4.9_

- [ ] 23. Checkpoint - Workflow automation complete
  - Test creating workflow rule with ticket_created trigger
  - Verify workflow executes when trigger condition met
  - Test each action type (notification, status update, assignment, announcement)
  - Verify execution logging in database
  - Test circular dependency detection
  - Test workflow dry-run functionality
  - Ask the user if questions arise

### Phase 8: External API Integration

- [ ] 24. External service integration
  - [ ] 24.1 Implement GitHub Status API integration
    - Create GitHubStatusService class fetching from githubstatus.com API
    - Parse JSON response extracting status indicator and description
    - Handle API errors gracefully with fallback messages in Croatian
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 24.2 Implement external service caching
    - Create ExternalServiceManager with 5-minute cache TTL
    - Store cached status in external_service_status table
    - Return cached data when available and not expired
    - _Requirements: 7.4_
  
  - [ ] 24.3 Implement external service polling
    - Create scheduled poller running every 5 minutes
    - Update cache with fresh data
    - Trigger workflow engine events on status changes
    - Log all API interactions for monitoring
    - _Requirements: 7.6, 7.10_
  
  - [ ] 24.4 Create external service API endpoint
    - Implement GET /api/v1/external/status returning all external service statuses
    - Validate API responses before processing
    - Handle unavailable services with cached or default values
    - _Requirements: 7.5, 7.7, 7.8, 7.9_

- [ ] 25. External service frontend
  - [ ] 25.1 Build external service status widget
    - Create ExternalServiceStatus component for dashboard
    - Display service name, status indicator, last checked time
    - Use color coding for operational/degraded/down statuses
    - Format timestamps in Croatian locale
    - _Requirements: 6.4, 12.2_

- [ ] 26. Checkpoint - External integration complete
  - Verify GitHub Status API fetches correctly
  - Test caching behavior (no API call within 5 minutes)
  - Verify graceful error handling when API unavailable
  - Test external service widget display on dashboard
  - Ask the user if questions arise

### Phase 9: UI Components & Layout

- [ ] 27. Common UI components
  - [ ] 27.1 Build reusable form components
    - Create Button component with primary, secondary, outline variants
    - Create Input component with validation error display
    - Create Select component for dropdowns
    - Create Textarea component
    - All components use Croatian labels
    - _Requirements: 12.6, 15.2_
  
  - [ ] 27.2 Build feedback components
    - Create Modal component with overlay and close button
    - Create Notification toast component for success/error messages
    - Create LoadingSkeleton component for loading states
    - Create ErrorBoundary component catching React errors
    - Display all messages in Croatian
    - _Requirements: 14.5, 14.6, 14.7, 15.7, 15.8, 20.5_
  
  - [ ] 27.3 Build data display components
    - Create Card component with hover effects
    - Create Badge component for status indicators
    - Create Pagination component
    - Create Table component with sorting
    - _Requirements: 14.8, 14.9_

- [ ] 28. Layout components
  - [ ] 28.1 Build main app layout
    - Create AppLayout component with navbar, sidebar, and content area
    - Create Navbar component with user menu and logout button
    - Create Sidebar component with navigation links based on user role
    - Implement mobile menu for responsive design
    - All navigation labels in Croatian
    - _Requirements: 12.1, 12.7, 13.5_
  
  - [ ] 28.2 Implement responsive design
    - Add responsive breakpoints for mobile (375px), tablet (768px), desktop (1920px)
    - Switch to mobile layout below 768px width
    - Stack form fields vertically on mobile
    - Make all interactive elements touch-friendly
    - Prevent horizontal scrolling
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7, 13.9_

- [ ] 29. Checkpoint - UI components complete
  - Verify all components follow design system (colors, spacing, typography)
  - Test responsive design on mobile, tablet, desktop sizes
  - Verify mobile navigation works correctly
  - Test error boundaries catch and display errors
  - Ask the user if questions arise

### Phase 10: Croatian Localization

- [ ] 30. Implement i18n system
  - [ ] 30.1 Create Croatian translation file
    - Create locales/hr.json with all UI text translations
    - Include auth, navigation, tickets, announcements, assets, workflows, users sections
    - Include common terms (save, cancel, delete, edit, create, search, filter, loading, error, success)
    - Include validation error messages
    - _Requirements: 12.1, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [ ] 30.2 Build translation context and hook
    - Create TranslationProvider context
    - Create useTranslation hook with t() function
    - Support nested key lookup (e.g., "auth.login")
    - _Requirements: 12.1_
  
  - [ ] 30.3 Implement Croatian date formatting
    - Create dateFormatter utility using date-fns with Croatian locale
    - Implement formatDate (dd.MM.yyyy), formatTime (HH:mm), formatDateTime functions
    - Implement formatRelativeTime for "prije X sati" format
    - Apply throughout all components displaying dates
    - _Requirements: 12.2, 12.3, 12.9_

- [ ] 31. Apply localization throughout UI
  - [ ] 31.1 Localize all pages and components
    - Replace all hardcoded English text with t() function calls
    - Verify all form labels, buttons, navigation use Croatian
    - Verify all validation errors display in Croatian
    - Verify all notifications display in Croatian
    - _Requirements: 12.1, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 32. Checkpoint - Localization complete
  - Verify all UI text is in Croatian
  - Verify dates format as dd.MM.yyyy
  - Verify times format as HH:mm (24-hour)
  - Verify validation errors in Croatian
  - Verify success/error notifications in Croatian
  - Ask the user if questions arise

### Phase 11: Advanced Features & Polish

- [ ] 33. Activity logging and audit trail
  - [ ] 33.1 Implement audit logging middleware
    - Create auditLogger middleware capturing user actions
    - Log authentication attempts, role changes, ticket status changes, workflow executions
    - Store timestamp, user identity, action type, affected resource, result
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  
  - [ ] 33.2 Create audit log viewing API and UI
    - Implement GET /api/v1/audit-logs with filtering by date, user, action type (Administrator only)
    - Create AuditLogPage displaying audit entries in reverse chronological order
    - Display all fields in Croatian
    - _Requirements: 16.7, 16.8, 16.9_

- [ ] 34. Error handling and validation
  - [ ] 34.1 Implement comprehensive backend error handling
    - Create global error handler middleware
    - Map errors to appropriate HTTP status codes
    - Return structured error responses with Croatian messages
    - Log all errors for debugging
    - Distinguish client errors (4xx) from server errors (5xx)
    - _Requirements: 20.3, 20.4, 20.7, 20.8, 20.10_
  
  - [ ] 34.2 Implement frontend error handling
    - Add error states to all API requests
    - Display field-specific validation errors
    - Display network error messages in Croatian
    - Handle server errors gracefully
    - Never expose technical details to users
    - _Requirements: 20.1, 20.2, 20.5, 20.6, 20.7_
  
  - [ ] 34.3 Add input validation everywhere
    - Validate all API request bodies on server with express-validator
    - Use Zod schemas for frontend form validation
    - Sanitize inputs to prevent SQL injection
    - Sanitize outputs to prevent XSS attacks
    - Return validation errors with field names in Croatian
    - _Requirements: 9.6, 11.1, 11.2, 11.3, 20.1_

- [ ] 35. Security hardening
  - [ ] 35.1 Implement rate limiting
    - Add rate limiter to authentication endpoints (5 requests per 15 minutes)
    - Add rate limiter to general API endpoints (100 requests per 15 minutes)
    - Return Croatian error message when rate limit exceeded
    - _Requirements: 11.6_
  
  - [ ] 35.2 Enhance authentication security
    - Implement password complexity validation on registration
    - Hash all passwords with bcrypt SALT_ROUNDS=12
    - Implement session expiry after 24 hours
    - Validate JWT signatures on all protected requests
    - _Requirements: 1.3, 11.5, 11.7, 11.11_
  
  - [ ] 35.3 Implement security best practices
    - Use parameterized queries for all database operations
    - Sanitize all user-generated content before display
    - Enforce HTTPS in production configuration
    - Return generic error messages to avoid information leakage
    - Log all security-relevant events to audit log
    - _Requirements: 11.2, 11.3, 11.4, 11.8, 11.9_

- [ ] 36. Performance optimization
  - [ ] 36.1 Optimize frontend performance
    - Implement code splitting for routes with React.lazy
    - Memoize expensive components with React.memo
    - Debounce search inputs with useDebounce hook
    - Lazy load images in announcements
    - _Requirements: 6.10, 17.4_
  
  - [ ] 36.2 Optimize backend performance
    - Add database indexes to all frequently queried columns (already in migrations)
    - Implement query optimization (select specific columns, avoid N+1)
    - Cache dashboard statistics for 30 seconds
    - Use connection pooling for database
    - _Requirements: 10.10_

- [ ] 37. Checkpoint - Advanced features complete
  - Test audit log captures all specified actions
  - Verify error handling displays Croatian messages
  - Test rate limiting on authentication endpoints
  - Verify input validation prevents invalid data
  - Test performance optimizations (lazy loading, memoization)
  - Ask the user if questions arise

### Phase 12: Documentation & Demo Preparation

- [ ] 38. Create seed data for demonstration
  - [ ] 38.1 Write seed.sql with Croatian demo data
    - Create 5 demo users (1 Administrator, 1 Tehničar, 3 Registrirani_Korisnik)
    - Create 10 demo tickets in various statuses with Croatian titles/descriptions
    - Create 5 demo announcements with Croatian content
    - Create 8 demo assets (servers, printers, etc.)
    - Create 3 demo workflow rules
    - Create demo announcement categories
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [ ] 38.2 Create 25-minute demo workflow guide
    - Document step-by-step demo script covering all roles
    - Include Registrirani_Korisnik workflow (create ticket, view own tickets, add comment)
    - Include Tehničar workflow (assign ticket, change status, create announcement, manage assets)
    - Include Administrator workflow (create workflow rule, manage users, view audit log, check external status)
    - Include mobile responsive demonstration
    - _Requirements: 19.7, 19.9_

- [ ] 39. Complete documentation
  - [ ] 39.1 Write API documentation
    - Document all REST API endpoints in docs/API.md
    - Include request/response formats, authentication requirements, error codes
    - Document all query parameters for filtering
    - _Requirements: 9.10, 18.1, 18.6_
  
  - [ ] 39.2 Write database documentation
    - Document all database tables in docs/DATABASE.md
    - Include column descriptions, data types, foreign keys
    - Add entity-relationship diagram or table descriptions
    - _Requirements: 18.2, 18.7_
  
  - [ ] 39.3 Write external API documentation
    - Document GitHub Status API integration in docs/EXTERNAL_API.md
    - Include API endpoints, authentication, error handling
    - Document caching strategy
    - _Requirements: 18.3, 18.8_
  
  - [ ] 39.4 Write installation guide
    - Document prerequisites in docs/INSTALLATION.md
    - Include environment variable setup
    - Document database migration steps
    - Document seed data loading
    - Include deployment instructions
    - _Requirements: 18.4, 18.9, 19.9_
  
  - [ ] 39.5 Write user guide
    - Document user workflows in docs/USER_GUIDE.md for each role
    - Include screenshots or descriptions of key features
    - Document common tasks (create ticket, publish announcement, etc.)
    - _Requirements: 18.5, 18.10_

- [ ] 40. Final testing and demo preparation
  - [ ] 40.1 End-to-end testing
    - Test complete user registration and login flow
    - Test ticket creation, assignment, status change workflow
    - Test announcement creation and publishing workflow
    - Test workflow automation with real triggers
    - Test mobile responsive layout
    - _Requirements: 13.1-13.10, 19.7_
  
  - [ ] 40.2 Demo rehearsal
    - Load seed data
    - Walk through 25-minute demo script
    - Verify all features demonstrated work smoothly
    - Time each section to ensure 25-minute target
    - _Requirements: 19.7, 19.8_

- [ ] 41. Final checkpoint - Project complete
  - Verify all requirements are implemented
  - Verify all documentation is complete
  - Verify seed data loads correctly
  - Verify 25-minute demo workflow executes successfully
  - Verify all UI text is in Croatian
  - Ask the user if questions arise

## Notes

- **Optional Tasks**: Tasks marked with `*` are optional and can be skipped for faster MVP. However, there are NO optional tasks in this implementation plan - all tasks are required for complete feature delivery.
- **Requirements Traceability**: Each task explicitly references requirements from requirements.md for verification.
- **Testing Strategy**: While property-based testing is valuable, it's not explicitly called out in sub-tasks. Focus on integration testing at checkpoints and end-to-end testing in Phase 12.
- **Checkpoints**: Regular checkpoint tasks ensure incremental validation. Use these to verify the system works before proceeding to the next phase.
- **Croatian Localization**: Croatian text is integrated throughout development, not added as a final step.
- **Security First**: Authentication, authorization, input validation, and security hardening are built in from the start.
- **Incremental Development**: The task order builds foundation first (database, auth), then core features (tickets, announcements), then advanced features (workflows, assets), then polish (UI, localization, documentation).

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2"]
    },
    {
      "id": 1,
      "tasks": ["1.3", "2.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6"]
    },
    {
      "id": 3,
      "tasks": ["4.1", "4.2"]
    },
    {
      "id": 4,
      "tasks": ["4.3", "4.4", "5.1"]
    },
    {
      "id": 5,
      "tasks": ["5.2", "5.3", "6.1"]
    },
    {
      "id": 6,
      "tasks": ["6.2", "8.1"]
    },
    {
      "id": 7,
      "tasks": ["8.2", "8.3", "11.1"]
    },
    {
      "id": 8,
      "tasks": ["9.1", "11.2", "11.3"]
    },
    {
      "id": 9,
      "tasks": ["9.2", "9.3", "12.1", "14.1"]
    },
    {
      "id": 10,
      "tasks": ["12.2", "12.3", "14.2", "17.1"]
    },
    {
      "id": 11,
      "tasks": ["15.1", "15.2", "17.2", "17.3"]
    },
    {
      "id": 12,
      "tasks": ["15.3", "18.1", "20.1", "20.2"]
    },
    {
      "id": 13,
      "tasks": ["18.2", "20.3", "20.4"]
    },
    {
      "id": 14,
      "tasks": ["21.1", "21.2", "24.1"]
    },
    {
      "id": 15,
      "tasks": ["22.1", "22.2", "24.2", "24.3"]
    },
    {
      "id": 16,
      "tasks": ["22.3", "24.4", "27.1"]
    },
    {
      "id": 17,
      "tasks": ["25.1", "27.2", "27.3"]
    },
    {
      "id": 18,
      "tasks": ["28.1", "28.2", "30.1"]
    },
    {
      "id": 19,
      "tasks": ["30.2", "30.3"]
    },
    {
      "id": 20,
      "tasks": ["31.1", "33.1"]
    },
    {
      "id": 21,
      "tasks": ["33.2", "34.1", "34.2"]
    },
    {
      "id": 22,
      "tasks": ["34.3", "35.1", "35.2"]
    },
    {
      "id": 23,
      "tasks": ["35.3", "36.1", "36.2"]
    },
    {
      "id": 24,
      "tasks": ["38.1", "38.2", "39.1"]
    },
    {
      "id": 25,
      "tasks": ["39.2", "39.3", "39.4", "39.5"]
    },
    {
      "id": 26,
      "tasks": ["40.1", "40.2"]
    }
  ]
}
```
