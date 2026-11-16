# Requirements Document

## Introduction

FLOWOPS is a web-based IT Operations and Workflow Automation Platform that centralizes IT operations management, incident tracking, IT asset management, system monitoring, internal announcements, and workflow automation. The platform is designed for academic demonstration and real-world use cases, featuring a modern SaaS interface with Croatian-language user experience and role-based access control.

## Glossary

- **FLOWOPS_System**: The complete IT Operations and Workflow Automation Platform including frontend, backend, database, and external integrations
- **User**: Any person interacting with the platform (Posjetitelj, Registrirani korisnik, Tehničar, or Administrator)
- **Posjetitelj**: Visitor role with public access only
- **Registrirani_Korisnik**: Registered User role with access to own tickets and profile
- **Tehničar**: Technician/Editor role with access to assigned tickets and announcement management
- **Administrator**: Administrator role with full system access
- **Ticket**: An incident or support request record in the system
- **Announcement**: A news or information post published through the CMS
- **Workflow_Rule**: An automation rule with triggers and actions
- **Asset**: An IT asset tracked in the inventory system
- **Dashboard**: The main overview interface showing IT operations status
- **REST_API**: The versioned HTTP API endpoint at /api/v1
- **External_Service**: Third-party service status API (e.g., GitHub Status API)
- **Database**: Supabase PostgreSQL database instance
- **Backend**: Node.js server application handling business logic
- **Frontend**: React + Vite client application
- **Session**: An authenticated user's active connection to the system
- **Croatian_Locale**: Date, time, and text formatting appropriate for Croatian language users
- **Migration**: Database schema version control file
- **Authentication_Token**: JWT or session token for user authentication
- **Role**: Permission level assigned to a User (Posjetitelj, Registrirani_Korisnik, Tehničar, Administrator)

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to authenticate with the platform and have role-appropriate access, so that I can perform authorized operations securely.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE FLOWOPS_System SHALL authenticate the user and create a Session
2. WHEN a user submits invalid credentials, THE FLOWOPS_System SHALL reject the authentication attempt and return an error message in Croatian
3. THE FLOWOPS_System SHALL hash passwords using a secure algorithm before storage
4. WHEN a user's Session expires, THE FLOWOPS_System SHALL require re-authentication
5. THE FLOWOPS_System SHALL assign exactly one Role to each authenticated user
6. WHEN a user attempts an unauthorized action, THE FLOWOPS_System SHALL deny access and return an error message in Croatian
7. THE Backend SHALL verify Role permissions for every protected operation
8. THE FLOWOPS_System SHALL prevent users from self-assigning Administrator Role

### Requirement 2: Ticket Management

**User Story:** As a Registrirani_Korisnik, I want to create and track tickets for IT incidents, so that my issues are documented and resolved.

#### Acceptance Criteria

1. WHEN a Registrirani_Korisnik creates a Ticket, THE FLOWOPS_System SHALL store the Ticket with creator information, timestamp, and status
2. WHEN a Ticket is created, THE FLOWOPS_System SHALL assign status "Nova" (New)
3. THE FLOWOPS_System SHALL allow Registrirani_Korisnik to view their own Tickets
4. THE FLOWOPS_System SHALL allow Tehničar to view all assigned Tickets
5. THE FLOWOPS_System SHALL allow Administrator to view all Tickets
6. WHEN a Ticket is updated, THE FLOWOPS_System SHALL record the change in history with timestamp and user
7. WHEN a user adds a comment to a Ticket, THE FLOWOPS_System SHALL append the comment with timestamp and author
8. THE FLOWOPS_System SHALL support Ticket statuses: Nova, U radu, Na čekanju, Riješena, Zatvorena (New, In Progress, Waiting, Resolved, Closed)
9. WHEN a Tehničar is assigned to a Ticket, THE FLOWOPS_System SHALL record the assignment with timestamp
10. THE FLOWOPS_System SHALL prevent Registrirani_Korisnik from modifying Tickets they did not create

### Requirement 3: Announcement Content Management

**User Story:** As a Tehničar, I want to create and publish announcements, so that users are informed about IT operations news.

#### Acceptance Criteria

1. WHEN a Tehničar creates an Announcement, THE FLOWOPS_System SHALL store the Announcement with author, timestamp, category, and content
2. THE FLOWOPS_System SHALL support Announcement categories defined by Administrator
3. WHEN an Announcement is published, THE FLOWOPS_System SHALL make it visible to all users with appropriate Role permissions
4. THE FLOWOPS_System SHALL allow Announcement to include images
5. WHEN a Tehničar uploads an image for an Announcement, THE FLOWOPS_System SHALL validate the image format and size
6. THE FLOWOPS_System SHALL allow Tehničar to edit unpublished Announcements
7. THE FLOWOPS_System SHALL allow Administrator to edit any Announcement
8. WHEN an Announcement is deleted, THE FLOWOPS_System SHALL mark it as deleted and preserve it in the Database
9. THE FLOWOPS_System SHALL display Announcements in reverse chronological order on the Dashboard
10. WHEN a user views an Announcement, THE FLOWOPS_System SHALL display timestamps in Croatian_Locale format

### Requirement 4: Workflow Automation

**User Story:** As an Administrator, I want to define workflow automation rules, so that repetitive IT operations are automated based on triggers.

#### Acceptance Criteria

1. WHEN an Administrator creates a Workflow_Rule, THE FLOWOPS_System SHALL store the rule with trigger conditions and actions
2. THE FLOWOPS_System SHALL support trigger types: Ticket status change, Ticket creation, Time-based schedule, External_Service status change
3. THE FLOWOPS_System SHALL support action types: Send notification, Update Ticket status, Assign Tehničar, Create Announcement
4. WHEN a trigger condition is met, THE FLOWOPS_System SHALL execute the associated actions within 60 seconds
5. WHEN a Workflow_Rule executes, THE FLOWOPS_System SHALL log the execution with timestamp, trigger, and result
6. THE FLOWOPS_System SHALL allow Administrator to enable or disable Workflow_Rules
7. WHEN a Workflow_Rule execution fails, THE FLOWOPS_System SHALL log the error and continue system operation
8. THE FLOWOPS_System SHALL prevent creation of Workflow_Rules with circular dependencies
9. THE FLOWOPS_System SHALL allow Administrator to test a Workflow_Rule without activating it
10. THE FLOWOPS_System SHALL display Workflow_Rule execution history in the admin interface

### Requirement 5: User Administration

**User Story:** As an Administrator, I want to manage user accounts and roles, so that I can control system access and permissions.

#### Acceptance Criteria

1. WHEN an Administrator creates a user account, THE FLOWOPS_System SHALL assign a default Role of Registrirani_Korisnik
2. THE FLOWOPS_System SHALL allow Administrator to change a user's Role
3. THE FLOWOPS_System SHALL allow Administrator to deactivate a user account
4. WHEN a user account is deactivated, THE FLOWOPS_System SHALL terminate active Sessions for that user
5. THE FLOWOPS_System SHALL display a list of all users with their current Role and account status
6. THE FLOWOPS_System SHALL allow Administrator to reset a user's password
7. WHEN an Administrator modifies user permissions, THE FLOWOPS_System SHALL log the change with timestamp and administrator identity
8. THE FLOWOPS_System SHALL prevent deletion of the last Administrator account
9. THE FLOWOPS_System SHALL require Administrator Role to access user administration functions
10. THE FLOWOPS_System SHALL display user management interface in Croatian

### Requirement 6: Dashboard and Operations Overview

**User Story:** As a user, I want to view a dashboard with IT operations overview, so that I understand current system status and activities.

#### Acceptance Criteria

1. WHEN a user accesses the Dashboard, THE FLOWOPS_System SHALL display statistics appropriate to their Role
2. THE FLOWOPS_System SHALL display real-time Ticket counts by status on the Dashboard
3. THE FLOWOPS_System SHALL display recent Announcements on the Dashboard
4. THE FLOWOPS_System SHALL display External_Service status on the Dashboard
5. WHEN Dashboard statistics are requested, THE Backend SHALL calculate values from current Database state
6. THE FLOWOPS_System SHALL refresh Dashboard statistics when data changes
7. THE FLOWOPS_System SHALL display Dashboard timestamps in Croatian_Locale format
8. THE FLOWOPS_System SHALL display different Dashboard content based on user Role
9. WHEN a Posjetitelj accesses the Dashboard, THE FLOWOPS_System SHALL display only public information
10. THE FLOWOPS_System SHALL load Dashboard data within 2 seconds under normal conditions

### Requirement 7: External Service Integration

**User Story:** As a user, I want to see external service status information, so that I can understand if third-party services affecting our operations are functioning.

#### Acceptance Criteria

1. THE FLOWOPS_System SHALL integrate with at least one External_Service status API
2. WHEN the External_Service API is queried, THE Backend SHALL make an HTTP request and parse JSON response
3. WHEN the External_Service API returns an error, THE Backend SHALL log the error and display a fallback message in Croatian
4. THE FLOWOPS_System SHALL cache External_Service status data for up to 5 minutes
5. THE FLOWOPS_System SHALL display External_Service status on the Dashboard
6. WHEN External_Service status changes to degraded or down, THE FLOWOPS_System SHALL update the display within 60 seconds of next poll
7. THE Backend SHALL validate External_Service API responses before processing
8. THE FLOWOPS_System SHALL handle External_Service API rate limits gracefully
9. WHEN External_Service API is unavailable, THE FLOWOPS_System SHALL continue operating with cached or default values
10. THE FLOWOPS_System SHALL log all External_Service API interactions for monitoring

### Requirement 8: IT Asset Management

**User Story:** As a Tehničar, I want to track IT assets in inventory, so that I maintain accurate records of organizational IT resources.

#### Acceptance Criteria

1. WHEN a Tehničar creates an Asset record, THE FLOWOPS_System SHALL store the Asset with identification, type, location, and status
2. THE FLOWOPS_System SHALL support Asset types: Hardware, Software, Network, Peripheral
3. THE FLOWOPS_System SHALL support Asset statuses: Active, Inactive, Maintenance, Retired
4. THE FLOWOPS_System SHALL allow Tehničar to update Asset information
5. THE FLOWOPS_System SHALL allow Administrator to delete Asset records
6. THE FLOWOPS_System SHALL link Assets to Tickets when relevant
7. WHEN an Asset is linked to a Ticket, THE FLOWOPS_System SHALL display the relationship in both Asset and Ticket views
8. THE FLOWOPS_System SHALL allow filtering Assets by type, status, and location
9. THE FLOWOPS_System SHALL display Asset inventory list with pagination
10. THE FLOWOPS_System SHALL display Asset management interface in Croatian

### Requirement 9: REST API Design

**User Story:** As a Frontend developer, I want a well-structured REST API, so that I can build client applications efficiently.

#### Acceptance Criteria

1. THE REST_API SHALL expose all endpoints under /api/v1 path prefix
2. THE REST_API SHALL return responses in JSON format
3. THE REST_API SHALL use HTTP status codes appropriately (200 success, 400 client error, 401 unauthorized, 403 forbidden, 404 not found, 500 server error)
4. WHEN a REST_API request is malformed, THE Backend SHALL return HTTP 400 with error details in JSON
5. WHEN a REST_API request is unauthorized, THE Backend SHALL return HTTP 401 with error message
6. THE REST_API SHALL validate all input data on the server side
7. THE REST_API SHALL sanitize input to prevent SQL injection attacks
8. THE REST_API SHALL sanitize output to prevent XSS attacks
9. THE REST_API SHALL require Authentication_Token for protected endpoints
10. THE REST_API SHALL document all endpoints, parameters, and responses in API.md

### Requirement 10: Database Schema and Migrations

**User Story:** As a developer, I want a well-designed relational database with migration support, so that schema changes are tracked and deployable.

#### Acceptance Criteria

1. THE Database SHALL use Supabase PostgreSQL
2. THE FLOWOPS_System SHALL manage schema changes through Migration files
3. THE Database SHALL store Users table with columns: id, email, password_hash, role, created_at, updated_at, is_active
4. THE Database SHALL store Tickets table with foreign key to Users for creator and assignee
5. THE Database SHALL store Announcements table with foreign key to Users for author
6. THE Database SHALL store Assets table with identification and tracking fields
7. THE Database SHALL store Workflow_Rules table with trigger and action definitions
8. THE Database SHALL store Audit_Log table recording user actions with timestamp and details
9. THE Database SHALL enforce referential integrity through foreign key constraints
10. THE Database SHALL index frequently queried columns for performance

### Requirement 11: Security Requirements

**User Story:** As a security-conscious user, I want the platform to protect against common vulnerabilities, so that my data is secure.

#### Acceptance Criteria

1. THE Backend SHALL validate all user input before processing
2. THE Backend SHALL use parameterized queries to prevent SQL injection
3. THE Frontend SHALL sanitize displayed data to prevent XSS attacks
4. THE Backend SHALL enforce HTTPS for all connections in production
5. THE FLOWOPS_System SHALL store passwords as hashed values using bcrypt or similar algorithm
6. THE Backend SHALL implement rate limiting on authentication endpoints to prevent brute force attacks
7. THE Backend SHALL validate Authentication_Token on every protected request
8. THE FLOWOPS_System SHALL log security-relevant events to Audit_Log
9. THE Backend SHALL return generic error messages to clients to avoid information leakage
10. THE FLOWOPS_System SHALL expire inactive Sessions after 24 hours

### Requirement 12: User Interface and Localization

**User Story:** As a Croatian user, I want the interface in Croatian with appropriate formatting, so that I can use the platform naturally.

#### Acceptance Criteria

1. THE Frontend SHALL display all UI text, forms, validation messages, and notifications in Croatian
2. THE Frontend SHALL format dates using Croatian_Locale format (dd.mm.yyyy)
3. THE Frontend SHALL format times using 24-hour format
4. THE Frontend SHALL display error messages in Croatian
5. THE Frontend SHALL display success notifications in Croatian
6. THE Frontend SHALL use Croatian labels for form fields
7. THE Frontend SHALL use Croatian text for buttons and navigation
8. THE Frontend SHALL display validation errors in Croatian
9. THE Frontend SHALL use Croatian month and day names in date pickers
10. THE Frontend SHALL maintain English for technical identifiers in code and database

### Requirement 13: Responsive Design

**User Story:** As a user on different devices, I want the interface to adapt to my screen size, so that I can use the platform on desktop, tablet, or mobile.

#### Acceptance Criteria

1. THE Frontend SHALL display correctly on desktop screens (1920x1080 and above)
2. THE Frontend SHALL display correctly on tablet screens (768x1024)
3. THE Frontend SHALL display correctly on mobile screens (375x667 minimum)
4. WHEN screen width is below 768 pixels, THE Frontend SHALL switch to mobile layout
5. THE Frontend SHALL make navigation accessible on mobile devices through a menu
6. THE Frontend SHALL ensure all interactive elements are touch-friendly on mobile devices
7. THE Frontend SHALL prevent horizontal scrolling on any screen size
8. THE Frontend SHALL maintain readability of text on all screen sizes
9. THE Frontend SHALL stack form fields vertically on mobile screens
10. THE Frontend SHALL display data tables with horizontal scrolling on small screens

### Requirement 14: Visual Design

**User Story:** As a user, I want a modern and professional interface, so that the platform feels polished and trustworthy.

#### Acceptance Criteria

1. THE Frontend SHALL use a dark navy or charcoal background color
2. THE Frontend SHALL use deep blue as the primary color
3. THE Frontend SHALL use subtle purple accents for secondary elements
4. THE Frontend SHALL maintain WCAG 2.1 AA contrast ratios for text
5. THE Frontend SHALL display loading states during asynchronous operations
6. WHEN an operation fails, THE Frontend SHALL display error states with clear messaging
7. WHEN an operation succeeds, THE Frontend SHALL display success notifications
8. THE Frontend SHALL use consistent spacing and typography throughout
9. THE Frontend SHALL display icons for common actions
10. THE Frontend SHALL animate transitions between states smoothly

### Requirement 15: Component Architecture

**User Story:** As a Frontend developer, I want a component-based architecture, so that the application is maintainable and reusable.

#### Acceptance Criteria

1. THE Frontend SHALL organize components into folders by feature (announcements, tickets, common, forms, layout)
2. THE Frontend SHALL implement reusable common components for buttons, inputs, cards, and modals
3. THE Frontend SHALL separate page components from feature components
4. THE Frontend SHALL use React hooks for state management
5. THE Frontend SHALL use context providers for global state when appropriate
6. THE Frontend SHALL validate form inputs using schema validation
7. THE Frontend SHALL handle errors gracefully with error boundaries
8. THE Frontend SHALL implement loading skeletons for better perceived performance
9. THE Frontend SHALL follow consistent naming conventions for components
10. THE Frontend SHALL document complex components with code comments

### Requirement 16: Activity Logging

**User Story:** As an Administrator, I want to view activity logs, so that I can audit system usage and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a user performs a security-relevant action, THE Backend SHALL write an entry to Audit_Log
2. THE Audit_Log SHALL record: timestamp, user identity, action type, affected resource, and result
3. THE FLOWOPS_System SHALL log authentication attempts
4. THE FLOWOPS_System SHALL log Role changes
5. THE FLOWOPS_System SHALL log Ticket status changes
6. THE FLOWOPS_System SHALL log Workflow_Rule executions
7. THE FLOWOPS_System SHALL allow Administrator to view Audit_Log entries
8. THE FLOWOPS_System SHALL allow filtering Audit_Log by date range, user, and action type
9. THE FLOWOPS_System SHALL display Audit_Log entries in reverse chronological order
10. THE FLOWOPS_System SHALL retain Audit_Log entries for at least 90 days

### Requirement 17: Advanced Filtering

**User Story:** As a user viewing lists, I want to filter data by multiple criteria, so that I can find relevant information quickly.

#### Acceptance Criteria

1. THE FLOWOPS_System SHALL allow filtering Tickets by status, assignee, creator, and date range
2. THE FLOWOPS_System SHALL allow filtering Announcements by category, author, and date range
3. THE FLOWOPS_System SHALL allow filtering Assets by type, status, and location
4. WHEN a user applies filters, THE Frontend SHALL update the display within 1 second
5. THE FLOWOPS_System SHALL preserve filter selections during Session
6. THE FLOWOPS_System SHALL allow clearing all filters with one action
7. THE FLOWOPS_System SHALL display active filters visually
8. THE FLOWOPS_System SHALL update filter counts when data changes
9. THE Frontend SHALL display filter controls in Croatian
10. THE Backend SHALL validate filter parameters before querying Database

### Requirement 18: Documentation Requirements

**User Story:** As a developer or evaluator, I want comprehensive documentation, so that I can understand and maintain the system.

#### Acceptance Criteria

1. THE FLOWOPS_System SHALL include API.md documenting all REST_API endpoints
2. THE FLOWOPS_System SHALL include DATABASE.md documenting database schema with tables, columns, and relationships
3. THE FLOWOPS_System SHALL include EXTERNAL_API.md documenting External_Service integrations
4. THE FLOWOPS_System SHALL include INSTALLATION.md with setup instructions
5. THE FLOWOPS_System SHALL include USER_GUIDE.md with user instructions for each Role
6. THE API.md SHALL document request/response formats for each endpoint
7. THE DATABASE.md SHALL include an entity-relationship diagram or table descriptions
8. THE EXTERNAL_API.md SHALL document API endpoints used, authentication, and error handling
9. THE INSTALLATION.md SHALL include prerequisites, environment variables, and deployment steps
10. THE USER_GUIDE.md SHALL include screenshots or descriptions of key workflows

### Requirement 19: Demonstration Readiness

**User Story:** As a presenter, I want the platform demonstrable in 25 minutes with realistic data, so that I can showcase functionality effectively.

#### Acceptance Criteria

1. THE Database SHALL include seed data with example Users for each Role
2. THE Database SHALL include seed data with example Tickets in various statuses
3. THE Database SHALL include seed data with example Announcements
4. THE Database SHALL include seed data with example Assets
5. THE Database SHALL include seed data with example Workflow_Rules
6. THE seed data SHALL use Croatian text for realistic demonstration
7. THE FLOWOPS_System SHALL provide clear workflows for each Role demonstrable within 25 minutes
8. THE Frontend SHALL load seed data without additional configuration
9. THE INSTALLATION.md SHALL include instructions for loading seed data
10. THE seed data SHALL demonstrate key features: authentication, ticket management, announcements, workflow automation, and external service status

### Requirement 20: Error Handling

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to proceed.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE Frontend SHALL display the specific field error in Croatian
2. WHEN a network error occurs, THE Frontend SHALL display a connection error message in Croatian
3. WHEN a server error occurs, THE Backend SHALL log the error details and return a generic error message to the client
4. WHEN a Database operation fails, THE Backend SHALL roll back the transaction and return an error
5. THE Frontend SHALL display error messages in a consistent location and style
6. THE Frontend SHALL allow users to dismiss error messages
7. THE Frontend SHALL not expose technical details or stack traces to users
8. THE Backend SHALL distinguish between client errors (4xx) and server errors (5xx) appropriately
9. WHEN External_Service API fails, THE FLOWOPS_System SHALL continue operating and display cached or default data
10. THE FLOWOPS_System SHALL log all errors for debugging and monitoring
