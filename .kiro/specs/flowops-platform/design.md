# FlowOps Platform - Technical Design Document

## Overview

FlowOps is a comprehensive IT Operations and Workflow Automation Platform designed to centralize IT operations management, incident tracking, IT asset management, system monitoring, internal announcements, and workflow automation. The platform features a modern SaaS interface with Croatian-language user experience and role-based access control.

### Key Technical Characteristics

- **Frontend**: React 18+ with Vite build system
- **Backend**: Node.js REST API with Express.js
- **Database**: Supabase PostgreSQL with migrations
- **Authentication**: JWT-based with Supabase Auth
- **Localization**: Croatian (hr-HR) throughout UI
- **External Integration**: GitHub Status API or similar service status APIs
- **Visual Design**: Dark navy/charcoal theme with deep blue primary and purple accents

### Design Goals

1. **Role-Based Security**: Four distinct user roles with enforced permissions
2. **Workflow Automation**: Rule-based automation engine for IT operations
3. **Real-Time Updates**: Dashboard statistics refresh on data changes
4. **Demonstration Ready**: 25-minute demo workflow with seed data
5. **Maintainability**: Component-based architecture with clear separation of concerns
6. **Croatian User Experience**: Localized UI, dates, times, and error messages

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Frontend - React + Vite"
        UI[React Components]
        Router[React Router]
        State[Context + Hooks]
        i18n[i18n Croatian Locale]
    end
    
    subgraph "Backend - Node.js"
        API[Express REST API]
        Auth[Auth Middleware]
        BL[Business Logic]
        Workflow[Workflow Engine]
    end
    
    subgraph "Data Layer"
        Supabase[Supabase PostgreSQL]
        Storage[Supabase Storage]
    end
    
    subgraph "External Services"
        GitHub[GitHub Status API]
        Other[Other Status APIs]
    end
    
    Browser --> UI
    Mobile --> UI
    UI --> Router
    UI --> State
    UI --> i18n
    Router --> API
    State --> API
    API --> Auth
    Auth --> BL
    BL --> Workflow
    BL --> Supabase
    BL --> Storage
    Workflow --> Supabase
    BL --> GitHub
    BL --> Other
```

### Technology Stack

#### Frontend Stack
- **React 18+**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation
- **date-fns**: Date/time manipulation with Croatian locale
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

#### Backend Stack
- **Node.js 18+**: JavaScript runtime
- **Express.js**: Web application framework
- **Supabase JS Client**: Database and auth integration
- **jsonwebtoken**: JWT token handling
- **bcrypt**: Password hashing
- **express-validator**: Request validation
- **node-cron**: Scheduled workflow execution
- **axios**: External API integration

#### Database & Storage
- **Supabase PostgreSQL**: Relational database
- **Supabase Auth**: Authentication service
- **Supabase Storage**: File storage for announcement images
- **Supabase Realtime**: Optional real-time subscriptions

### Deployment Architecture

```mermaid
graph LR
    subgraph "Production Environment"
        LB[Load Balancer]
        FE1[Frontend Instance 1]
        FE2[Frontend Instance 2]
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        DB[(Supabase PostgreSQL)]
        Cache[Redis Cache]
    end
    
    Client[Clients] --> LB
    LB --> FE1
    LB --> FE2
    FE1 --> BE1
    FE1 --> BE2
    FE2 --> BE1
    FE2 --> BE2
    BE1 --> DB
    BE2 --> DB
    BE1 --> Cache
    BE2 --> Cache
```

## Components and Interfaces

### Frontend Component Architecture

```
src/
├── components/
│   ├── common/                  # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Notification.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Pagination.jsx
│   │   └── Badge.jsx
│   ├── layout/                  # Layout components
│   │   ├── AppLayout.jsx       # Main app container
│   │   ├── Navbar.jsx          # Top navigation
│   │   ├── Sidebar.jsx         # Side navigation
│   │   ├── Footer.jsx
│   │   └── MobileMenu.jsx
│   ├── announcements/           # Announcement feature
│   │   ├── AnnouncementList.jsx
│   │   ├── AnnouncementCard.jsx
│   │   ├── AnnouncementDetail.jsx
│   │   ├── AnnouncementForm.jsx
│   │   ├── AnnouncementFilters.jsx
│   │   └── CategoryBadge.jsx
│   ├── tickets/                 # Ticket feature
│   │   ├── TicketList.jsx
│   │   ├── TicketCard.jsx
│   │   ├── TicketDetail.jsx
│   │   ├── TicketForm.jsx
│   │   ├── TicketFilters.jsx
│   │   ├── TicketHistory.jsx
│   │   ├── TicketComments.jsx
│   │   └── StatusBadge.jsx
│   └── forms/                   # Form-specific components
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       ├── PasswordResetForm.jsx
│       └── UserProfileForm.jsx
├── pages/
│   ├── public/
│   │   ├── HomePage.jsx
│   │   └── PublicAnnouncementsPage.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ForgotPasswordPage.jsx
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── UserManagementPage.jsx
│   │   ├── WorkflowManagementPage.jsx
│   │   ├── AuditLogPage.jsx
│   │   └── SystemSettingsPage.jsx
│   └── profile/
│       ├── ProfilePage.jsx
│       └── MyTicketsPage.jsx
├── context/
│   ├── AuthContext.jsx          # Authentication state
│   ├── NotificationContext.jsx  # Toast notifications
│   └── ThemeContext.jsx         # Theme settings
├── hooks/
│   ├── useAuth.js               # Authentication hook
│   ├── useApi.js                # API request hook
│   ├── useTickets.js            # Ticket data hook
│   ├── useAnnouncements.js      # Announcement data hook
│   ├── useWorkflows.js          # Workflow data hook
│   └── useDebounce.js           # Debounce utility
├── services/
│   ├── api.js                   # Axios instance configuration
│   ├── authService.js           # Authentication API calls
│   ├── ticketService.js         # Ticket API calls
│   ├── announcementService.js   # Announcement API calls
│   ├── assetService.js          # Asset API calls
│   ├── workflowService.js       # Workflow API calls
│   ├── userService.js           # User management API calls
│   └── externalService.js       # External API integration
├── schemas/
│   ├── authSchemas.js           # Login, register validation
│   ├── ticketSchemas.js         # Ticket validation
│   ├── announcementSchemas.js   # Announcement validation
│   ├── assetSchemas.js          # Asset validation
│   └── workflowSchemas.js       # Workflow validation
├── routes/
│   ├── AppRoutes.jsx            # Main routing configuration
│   ├── ProtectedRoute.jsx       # Auth guard component
│   └── RoleRoute.jsx            # Role-based guard component
├── utils/
│   ├── dateFormatter.js         # Croatian date/time formatting
│   ├── validation.js            # Validation helpers
│   ├── constants.js             # App constants
│   └── permissions.js           # Role permission helpers
├── styles/
│   ├── index.css                # Global styles + Tailwind
│   └── themes.css               # Theme variables
├── locales/
│   └── hr.json                  # Croatian translations
├── App.jsx                      # Root component
└── main.jsx                     # Entry point
```

### Backend API Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Supabase configuration
│   │   ├── auth.js              # JWT configuration
│   │   └── external.js          # External API config
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── rbac.js              # Role-based access control
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Global error handler
│   │   └── rateLimiter.js       # Rate limiting
│   ├── routes/
│   │   ├── auth.routes.js       # Authentication endpoints
│   │   ├── tickets.routes.js    # Ticket endpoints
│   │   ├── announcements.routes.js
│   │   ├── assets.routes.js
│   │   ├── workflows.routes.js
│   │   ├── users.routes.js
│   │   ├── dashboard.routes.js
│   │   └── external.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── tickets.controller.js
│   │   ├── announcements.controller.js
│   │   ├── assets.controller.js
│   │   ├── workflows.controller.js
│   │   ├── users.controller.js
│   │   ├── dashboard.controller.js
│   │   └── external.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── tickets.service.js
│   │   ├── announcements.service.js
│   │   ├── assets.service.js
│   │   ├── workflows.service.js
│   │   ├── users.service.js
│   │   ├── audit.service.js
│   │   └── external.service.js
│   ├── models/                  # Data access layer
│   │   ├── user.model.js
│   │   ├── ticket.model.js
│   │   ├── announcement.model.js
│   │   ├── asset.model.js
│   │   ├── workflow.model.js
│   │   └── auditLog.model.js
│   ├── workflow-engine/
│   │   ├── engine.js            # Workflow execution engine
│   │   ├── triggers.js          # Trigger evaluators
│   │   ├── actions.js           # Action executors
│   │   └── scheduler.js         # Cron job scheduler
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
└── .env.example
```

### Key Component Interfaces

#### Frontend - AuthContext

```javascript
// AuthContext provides authentication state
interface AuthContextValue {
  user: User | null;              // Current authenticated user
  role: Role | null;              // User role
  isAuthenticated: boolean;        // Auth status
  isLoading: boolean;             // Loading state
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData) => Promise<void>;
}
```

#### Frontend - API Service

```javascript
// Base API service with auth token injection
class ApiService {
  constructor(baseURL = '/api/v1');
  setAuthToken(token);
  clearAuthToken();
  get(url, config);
  post(url, data, config);
  put(url, data, config);
  patch(url, data, config);
  delete(url, config);
}
```

#### Backend - Auth Middleware

```javascript
// JWT verification middleware
function authMiddleware(req, res, next) {
  // Extract JWT from Authorization header
  // Verify token signature
  // Attach user to req.user
  // Call next() or return 401
}

// Role-based access control middleware
function rbacMiddleware(allowedRoles) {
  return (req, res, next) => {
    // Check if req.user.role is in allowedRoles
    // Call next() or return 403
  }
}
```

#### Backend - Workflow Engine

```javascript
// Workflow execution engine interface
class WorkflowEngine {
  // Evaluate if trigger conditions are met
  evaluateTrigger(trigger, context);
  
  // Execute workflow actions
  executeActions(actions, context);
  
  // Schedule time-based workflows
  scheduleWorkflow(workflow);
  
  // Process event-driven workflows
  processEvent(eventType, eventData);
}
```

## Data Models

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Posjetitelj', 'Registrirani_Korisnik', 'Tehničar', 'Administrator')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### Tickets Table

```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena')),
  priority VARCHAR(50) CHECK (priority IN ('Niska', 'Srednja', 'Visoka', 'Hitna')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_creator ON tickets(creator_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
```

#### Ticket History Table

```sql
CREATE TABLE ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_history_ticket ON ticket_history(ticket_id, created_at DESC);
```

#### Ticket Comments Table

```sql
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id, created_at);
```

#### Announcement Categories Table

```sql
CREATE TABLE announcement_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),  -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Announcements Table

```sql
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

CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_category ON announcements(category_id);
```

#### Assets Table

```sql
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

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_location ON assets(location);
```

#### Workflow Rules Table

```sql
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

CREATE INDEX idx_workflow_rules_enabled ON workflow_rules(is_enabled);
CREATE INDEX idx_workflow_rules_trigger ON workflow_rules(trigger_type);
```

#### Workflow Executions Table

```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_rule_id UUID NOT NULL REFERENCES workflow_rules(id) ON DELETE CASCADE,
  trigger_data JSONB,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failure', 'partial')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_executions_rule ON workflow_executions(workflow_rule_id, executed_at DESC);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
```

#### Audit Log Table

```sql
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

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

#### External Service Status Cache Table

```sql
CREATE TABLE external_service_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  status_data JSONB,
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cached_until TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_external_service_cache ON external_service_status(service_name, cached_until);
```

### Entity Relationships

```mermaid
erDiagram
    users ||--o{ tickets : creates
    users ||--o{ tickets : assigned_to
    users ||--o{ announcements : authors
    users ||--o{ workflow_rules : creates
    users ||--o{ audit_logs : performs
    users ||--o{ ticket_comments : writes
    
    tickets ||--o{ ticket_history : has
    tickets ||--o{ ticket_comments : has
    tickets }o--|| assets : relates_to
    
    announcements }o--|| announcement_categories : belongs_to
    
    workflow_rules ||--o{ workflow_executions : executes
```

### Data Model TypeScript Interfaces

```typescript
// User model
interface User {
  id: string;
  email: string;
  role: 'Posjetitelj' | 'Registrirani_Korisnik' | 'Tehničar' | 'Administrator';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket model
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'Nova' | 'U radu' | 'Na čekanju' | 'Riješena' | 'Zatvorena';
  priority?: 'Niska' | 'Srednja' | 'Visoka' | 'Hitna';
  creatorId: string;
  assigneeId?: string;
  assetId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// Announcement model
interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId?: string;
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Asset model
interface Asset {
  id: string;
  name: string;
  type: 'Hardware' | 'Software' | 'Network' | 'Peripheral';
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  location?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workflow Rule model
interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  triggerType: 'ticket_created' | 'ticket_status_changed' | 'time_scheduled' | 'external_status_changed';
  triggerConfig: TriggerConfig;
  actions: WorkflowAction[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TriggerConfig {
  // For ticket_status_changed
  fromStatus?: string;
  toStatus?: string;
  
  // For time_scheduled
  cronExpression?: string;
  
  // For external_status_changed
  serviceName?: string;
  statusCondition?: string;
}

interface WorkflowAction {
  type: 'send_notification' | 'update_ticket_status' | 'assign_technician' | 'create_announcement';
  config: ActionConfig;
}

interface ActionConfig {
  // For send_notification
  recipientRole?: string;
  messageTemplate?: string;
  
  // For update_ticket_status
  newStatus?: string;
  
  // For assign_technician
  technicianId?: string;
  assignmentStrategy?: 'round_robin' | 'least_loaded' | 'specific';
  
  // For create_announcement
  announcementTitle?: string;
  announcementContent?: string;
  categoryId?: string;
}
```

## API Design

### REST API Endpoints

All endpoints are prefixed with `/api/v1`.

#### Authentication Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

**POST /api/v1/auth/register**
- **Description**: Register new user
- **Access**: Public
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "Ivan",
    "lastName": "Horvat"
  }
  ```
- **Response 201**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "Registrirani_Korisnik",
      "firstName": "Ivan",
      "lastName": "Horvat"
    },
    "token": "jwt-token"
  }
  ```
- **Response 400**: Validation errors

**POST /api/v1/auth/login**
- **Description**: Authenticate user
- **Access**: Public
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response 200**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "Registrirani_Korisnik"
    },
    "token": "jwt-token"
  }
  ```
- **Response 401**: Invalid credentials

**GET /api/v1/auth/me**
- **Description**: Get current user profile
- **Access**: Authenticated
- **Response 200**:
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "Registrirani_Korisnik",
    "firstName": "Ivan",
    "lastName": "Horvat",
    "createdAt": "2024-01-15T10:30:00Z"
  }
  ```

#### Ticket Endpoints

```
GET    /api/v1/tickets
POST   /api/v1/tickets
GET    /api/v1/tickets/:id
PUT    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id/status
GET    /api/v1/tickets/:id/history
GET    /api/v1/tickets/:id/comments
POST   /api/v1/tickets/:id/comments
```

**GET /api/v1/tickets**
- **Description**: List tickets with filtering and pagination
- **Access**: Registrirani_Korisnik (own tickets), Tehničar (assigned), Administrator (all)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `status`: Filter by status
  - `assigneeId`: Filter by assignee
  - `creatorId`: Filter by creator
  - `fromDate`: Filter by creation date (ISO 8601)
  - `toDate`: Filter by creation date (ISO 8601)
- **Response 200**:
  ```json
  {
    "tickets": [
      {
        "id": "uuid",
        "title": "Server nije dostupan",
        "description": "Web server ne odgovara na zahtjeve",
        "status": "Nova",
        "priority": "Visoka",
        "creatorId": "uuid",
        "assigneeId": null,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
  ```

**POST /api/v1/tickets**
- **Description**: Create new ticket
- **Access**: Registrirani_Korisnik, Tehničar, Administrator
- **Request**:
  ```json
  {
    "title": "Server nije dostupan",
    "description": "Web server ne odgovara na zahtjeve",
    "priority": "Visoka",
    "assetId": "uuid-optional"
  }
  ```
- **Response 201**:
  ```json
  {
    "id": "uuid",
    "title": "Server nije dostupan",
    "description": "Web server ne odgovara na zahtjeve",
    "status": "Nova",
    "priority": "Visoka",
    "creatorId": "uuid",
    "createdAt": "2024-01-15T10:30:00Z"
  }
  ```

**PUT /api/v1/tickets/:id**
- **Description**: Update ticket
- **Access**: Creator (own), Tehničar (assigned), Administrator (all)
- **Request**:
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "priority": "Srednja",
    "assigneeId": "uuid"
  }
  ```
- **Response 200**: Updated ticket object

**PATCH /api/v1/tickets/:id/status**
- **Description**: Change ticket status
- **Access**: Tehničar, Administrator
- **Request**:
  ```json
  {
    "status": "U radu"
  }
  ```
- **Response 200**: Updated ticket object

**GET /api/v1/tickets/:id/comments**
- **Description**: Get ticket comments
- **Access**: Creator, Assignee, Administrator
- **Response 200**:
  ```json
  {
    "comments": [
      {
        "id": "uuid",
        "ticketId": "uuid",
        "authorId": "uuid",
        "content": "Provjerit ću server logs",
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ]
  }
  ```

**POST /api/v1/tickets/:id/comments**
- **Description**: Add comment to ticket
- **Access**: Creator, Assignee, Tehničar, Administrator
- **Request**:
  ```json
  {
    "content": "Provjerit ću server logs"
  }
  ```
- **Response 201**: Created comment object

#### Announcement Endpoints

```
GET    /api/v1/announcements
POST   /api/v1/announcements
GET    /api/v1/announcements/:id
PUT    /api/v1/announcements/:id
DELETE /api/v1/announcements/:id
PATCH  /api/v1/announcements/:id/publish
GET    /api/v1/announcement-categories
POST   /api/v1/announcement-categories
```

**GET /api/v1/announcements**
- **Description**: List published announcements
- **Access**: Public (published only), Tehničar/Administrator (all)
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Items per page
  - `categoryId`: Filter by category
  - `authorId`: Filter by author
- **Response 200**:
  ```json
  {
    "announcements": [
      {
        "id": "uuid",
        "title": "Planirano održavanje sustava",
        "content": "U subotu 20.1. između 02:00 i 06:00...",
        "authorId": "uuid",
        "categoryId": "uuid",
        "imageUrl": "https://...",
        "publishedAt": "2024-01-15T09:00:00Z",
        "category": {
          "id": "uuid",
          "name": "Održavanje",
          "color": "#3B82F6"
        }
      }
    ],
    "pagination": { ... }
  }
  ```

**POST /api/v1/announcements**
- **Description**: Create announcement
- **Access**: Tehničar, Administrator
- **Request**:
  ```json
  {
    "title": "Planirano održavanje sustava",
    "content": "U subotu 20.1. između 02:00 i 06:00...",
    "categoryId": "uuid",
    "imageUrl": "https://..."
  }
  ```
- **Response 201**: Created announcement object

**PATCH /api/v1/announcements/:id/publish**
- **Description**: Publish announcement
- **Access**: Tehničar, Administrator
- **Response 200**: Published announcement object

#### Asset Endpoints

```
GET    /api/v1/assets
POST   /api/v1/assets
GET    /api/v1/assets/:id
PUT    /api/v1/assets/:id
DELETE /api/v1/assets/:id
```

**GET /api/v1/assets**
- **Description**: List assets with filtering
- **Access**: Tehničar, Administrator
- **Query Parameters**:
  - `page`, `limit`: Pagination
  - `type`: Filter by asset type
  - `status`: Filter by status
  - `location`: Filter by location
- **Response 200**:
  ```json
  {
    "assets": [
      {
        "id": "uuid",
        "name": "Dell PowerEdge R740",
        "type": "Hardware",
        "status": "Active",
        "serialNumber": "SN12345",
        "location": "Server soba A",
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ],
    "pagination": { ... }
  }
  ```

**POST /api/v1/assets**
- **Description**: Create asset
- **Access**: Tehničar, Administrator
- **Request**:
  ```json
  {
    "name": "Dell PowerEdge R740",
    "type": "Hardware",
    "status": "Active",
    "serialNumber": "SN12345",
    "location": "Server soba A",
    "notes": "Glavni web server"
  }
  ```
- **Response 201**: Created asset object

#### Workflow Endpoints

```
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/:id
PUT    /api/v1/workflows/:id
DELETE /api/v1/workflows/:id
PATCH  /api/v1/workflows/:id/toggle
POST   /api/v1/workflows/:id/test
GET    /api/v1/workflows/:id/executions
```

**GET /api/v1/workflows**
- **Description**: List workflow rules
- **Access**: Administrator
- **Response 200**:
  ```json
  {
    "workflows": [
      {
        "id": "uuid",
        "name": "Auto-assign high priority tickets",
        "description": "Automatically assign Tehničar to high priority tickets",
        "isEnabled": true,
        "triggerType": "ticket_created",
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ]
  }
  ```

**POST /api/v1/workflows**
- **Description**: Create workflow rule
- **Access**: Administrator
- **Request**:
  ```json
  {
    "name": "Auto-assign high priority tickets",
    "description": "Automatically assign Tehničar to high priority tickets",
    "triggerType": "ticket_created",
    "triggerConfig": {
      "priority": "Visoka"
    },
    "actions": [
      {
        "type": "assign_technician",
        "config": {
          "assignmentStrategy": "least_loaded"
        }
      }
    ]
  }
  ```
- **Response 201**: Created workflow object

**POST /api/v1/workflows/:id/test**
- **Description**: Test workflow without activating
- **Access**: Administrator
- **Request**:
  ```json
  {
    "testData": {
      "ticketId": "uuid"
    }
  }
  ```
- **Response 200**:
  ```json
  {
    "result": "success",
    "actionsExecuted": 2,
    "logs": ["Action 1: Assigned to user X", "Action 2: Sent notification"]
  }
  ```

#### User Management Endpoints

```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id/role
PATCH  /api/v1/users/:id/deactivate
PATCH  /api/v1/users/:id/reset-password
```

**GET /api/v1/users**
- **Description**: List users
- **Access**: Administrator
- **Query Parameters**: `role`, `isActive`, `page`, `limit`
- **Response 200**:
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "ivan@example.com",
        "role": "Tehničar",
        "firstName": "Ivan",
        "lastName": "Horvat",
        "isActive": true,
        "createdAt": "2024-01-05T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
  ```

**PATCH /api/v1/users/:id/role**
- **Description**: Change user role
- **Access**: Administrator
- **Request**:
  ```json
  {
    "role": "Tehničar"
  }
  ```
- **Response 200**: Updated user object

#### Dashboard Endpoints

```
GET    /api/v1/dashboard/stats
GET    /api/v1/dashboard/recent-activity
```

**GET /api/v1/dashboard/stats**
- **Description**: Get dashboard statistics
- **Access**: Authenticated (role-based content)
- **Response 200**:
  ```json
  {
    "tickets": {
      "total": 156,
      "byStatus": {
        "Nova": 23,
        "U radu": 45,
        "Na čekanju": 12,
        "Riješena": 56,
        "Zatvorena": 20
      }
    },
    "announcements": {
      "total": 34,
      "published": 28
    },
    "assets": {
      "total": 89,
      "byStatus": {
        "Active": 67,
        "Inactive": 10,
        "Maintenance": 8,
        "Retired": 4
      }
    },
    "externalServices": [
      {
        "name": "GitHub",
        "status": "operational",
        "lastChecked": "2024-01-15T12:00:00Z"
      }
    ]
  }
  ```

#### External Service Endpoints

```
GET    /api/v1/external/status
```

**GET /api/v1/external/status**
- **Description**: Get external service status
- **Access**: Authenticated
- **Response 200**:
  ```json
  {
    "services": [
      {
        "name": "GitHub",
        "status": "operational",
        "description": "All systems operational",
        "lastChecked": "2024-01-15T12:00:00Z"
      }
    ]
  }
  ```

### API Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nevažeći unos podataka",
    "details": [
      {
        "field": "email",
        "message": "Email adresa nije važeća"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (e.g., duplicate email)
- `INTERNAL_ERROR`: Server error

## Authentication and Authorization

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API
    participant Supabase
    
    Client->>Frontend: Enter credentials
    Frontend->>API: POST /api/v1/auth/login
    API->>Supabase: Verify credentials
    Supabase-->>API: User data
    API->>API: Generate JWT
    API-->>Frontend: JWT + User data
    Frontend->>Frontend: Store JWT in memory/localStorage
    Frontend->>API: Request with Authorization header
    API->>API: Verify JWT
    API->>API: Check role permissions
    API-->>Frontend: Protected resource
```

### JWT Token Structure

```javascript
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "Registrirani_Korisnik",
    "iat": 1642241234,
    "exp": 1642327634  // 24 hours
  }
}
```

### Role-Based Access Control Matrix

| Resource | Posjetitelj | Registrirani_Korisnik | Tehničar | Administrator |
|----------|-------------|----------------------|----------|---------------|
| **Authentication** |
| Register | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ |
| View Profile | - | ✓ (own) | ✓ (own) | ✓ (own) |
| **Announcements** |
| View Published | ✓ | ✓ | ✓ | ✓ |
| Create | - | - | ✓ | ✓ |
| Edit | - | - | ✓ (own) | ✓ (all) |
| Publish | - | - | ✓ | ✓ |
| Delete | - | - | - | ✓ |
| **Tickets** |
| View | - | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Create | - | ✓ | ✓ | ✓ |
| Edit | - | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Change Status | - | - | ✓ (assigned) | ✓ (all) |
| Comment | - | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Assign Tehničar | - | - | ✓ | ✓ |
| **Assets** |
| View | - | - | ✓ | ✓ |
| Create | - | - | ✓ | ✓ |
| Edit | - | - | ✓ | ✓ |
| Delete | - | - | - | ✓ |
| **Workflows** |
| View | - | - | - | ✓ |
| Create | - | - | - | ✓ |
| Edit | - | - | - | ✓ |
| Delete | - | - | - | ✓ |
| Test | - | - | - | ✓ |
| **User Management** |
| View Users | - | - | - | ✓ |
| Change Roles | - | - | - | ✓ |
| Deactivate | - | - | - | ✓ |
| Reset Password | - | - | - | ✓ |
| **Audit Logs** |
| View | - | - | - | ✓ |
| **Dashboard** |
| Public Stats | ✓ | ✓ | ✓ | ✓ |
| Full Stats | - | ✓ | ✓ | ✓ |

### Authorization Implementation

#### Backend Middleware

```javascript
// middleware/rbac.js
const ROLE_HIERARCHY = {
  'Posjetitelj': 0,
  'Registrirani_Korisnik': 1,
  'Tehničar': 2,
  'Administrator': 3
};

function requireRole(minRole) {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[minRole]) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Nemate dozvolu za ovu akciju'
        }
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/tickets', authMiddleware, requireRole('Registrirani_Korisnik'), createTicket);
router.post('/workflows', authMiddleware, requireRole('Administrator'), createWorkflow);
```

#### Resource-Level Authorization

```javascript
// Check if user can access specific ticket
async function canAccessTicket(userId, userRole, ticketId) {
  const ticket = await getTicketById(ticketId);
  
  if (!ticket) return false;
  
  // Administrator can access all
  if (userRole === 'Administrator') return true;
  
  // Tehničar can access assigned tickets
  if (userRole === 'Tehničar' && ticket.assigneeId === userId) return true;
  
  // Registrirani_Korisnik can access own tickets
  if (userRole === 'Registrirani_Korisnik' && ticket.creatorId === userId) return true;
  
  return false;
}
```

### Security Measures

#### Password Security

```javascript
// Password hashing with bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Password requirements
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

#### SQL Injection Prevention

```javascript
// Use parameterized queries
const { data, error } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)  // Parameterized
  .single();

// NEVER: Direct string concatenation
// const query = `SELECT * FROM tickets WHERE id = '${ticketId}'`;  // VULNERABLE
```

#### XSS Prevention

```javascript
// Backend: Sanitize output
const sanitizeHtml = require('sanitize-html');

function sanitizeContent(content) {
  return sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {}
  });
}

// Frontend: Use React's built-in escaping
// JSX automatically escapes text content
<div>{userContent}</div>  // Safe

// Only use dangerouslySetInnerHTML for sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

#### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Authentication endpoints: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Previše pokušaja. Pokušajte ponovo kasnije.' } }
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// General API: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/v1', apiLimiter);
```

#### Session Management

```javascript
// Session expiry
const TOKEN_EXPIRY = '24h';

// Logout: Blacklist token (requires Redis or similar)
async function logout(token) {
  const decoded = jwt.decode(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  // Store in blacklist until token would expire
  await redis.setex(`blacklist:${token}`, expiresIn, '1');
}

// Verify token not blacklisted
async function isTokenBlacklisted(token) {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
}
```

## Workflow Automation Logic

### Workflow Engine Architecture

```mermaid
graph TB
    subgraph "Event Sources"
        TicketEvent[Ticket Events]
        TimeEvent[Scheduled Time]
        ExtEvent[External Service Events]
    end
    
    subgraph "Workflow Engine"
        Dispatcher[Event Dispatcher]
        Evaluator[Trigger Evaluator]
        Executor[Action Executor]
        Logger[Execution Logger]
    end
    
    subgraph "Actions"
        Notify[Send Notification]
        UpdateTicket[Update Ticket]
        AssignTech[Assign Tehničar]
        CreateAnn[Create Announcement]
    end
    
    TicketEvent --> Dispatcher
    TimeEvent --> Dispatcher
    ExtEvent --> Dispatcher
    
    Dispatcher --> Evaluator
    Evaluator --> Executor
    Executor --> Logger
    
    Executor --> Notify
    Executor --> UpdateTicket
    Executor --> AssignTech
    Executor --> CreateAnn
```

### Trigger Types

#### 1. Ticket Created Trigger

```javascript
{
  "triggerType": "ticket_created",
  "triggerConfig": {
    "priority": "Visoka",  // Optional: filter by priority
    "status": "Nova"        // Optional: filter by status
  }
}
```

**Evaluation**: When a new ticket is created, check if priority and status match config.

#### 2. Ticket Status Changed Trigger

```javascript
{
  "triggerType": "ticket_status_changed",
  "triggerConfig": {
    "fromStatus": "Nova",
    "toStatus": "U radu"
  }
}
```

**Evaluation**: When ticket status changes, check if transition matches fromStatus → toStatus.

#### 3. Time Scheduled Trigger

```javascript
{
  "triggerType": "time_scheduled",
  "triggerConfig": {
    "cronExpression": "0 9 * * 1"  // Every Monday at 9 AM
  }
}
```

**Evaluation**: Use node-cron to schedule execution based on cron expression.

#### 4. External Status Changed Trigger

```javascript
{
  "triggerType": "external_status_changed",
  "triggerConfig": {
    "serviceName": "GitHub",
    "statusCondition": "degraded"  // Trigger when status becomes degraded
  }
}
```

**Evaluation**: When external service status is polled and changes, check if new status matches condition.

### Action Types

#### 1. Send Notification Action

```javascript
{
  "type": "send_notification",
  "config": {
    "recipientRole": "Tehničar",  // Or specific userId
    "messageTemplate": "Novi ticket visoke prioritete: {{ticket.title}}"
  }
}
```

**Execution**: 
- Resolve template variables
- Find users with specified role
- Send notification (email, in-app, etc.)

#### 2. Update Ticket Status Action

```javascript
{
  "type": "update_ticket_status",
  "config": {
    "newStatus": "U radu"
  }
}
```

**Execution**:
- Update ticket status
- Record in ticket history

#### 3. Assign Tehničar Action

```javascript
{
  "type": "assign_technician",
  "config": {
    "assignmentStrategy": "least_loaded",  // or "round_robin", "specific"
    "technicianId": "uuid"  // For "specific" strategy
  }
}
```

**Execution**:
- **least_loaded**: Assign to Tehničar with fewest active tickets
- **round_robin**: Cycle through available Tehničar
- **specific**: Assign to specified Tehničar

#### 4. Create Announcement Action

```javascript
{
  "type": "create_announcement",
  "config": {
    "announcementTitle": "Sistemski problem detektiran",
    "announcementContent": "Ticket {{ticket.id}}: {{ticket.title}}",
    "categoryId": "uuid",
    "autoPublish": false
  }
}
```

**Execution**:
- Resolve template variables
- Create announcement in database
- Optionally publish immediately

### Workflow Engine Implementation

```javascript
// workflow-engine/engine.js
class WorkflowEngine {
  constructor(db) {
    this.db = db;
    this.triggers = new TriggerRegistry();
    this.actions = new ActionRegistry();
  }
  
  // Process an event
  async processEvent(eventType, eventData) {
    // Find workflows matching this event type
    const workflows = await this.db
      .from('workflow_rules')
      .select('*')
      .eq('is_enabled', true)
      .eq('trigger_type', eventType);
    
    for (const workflow of workflows) {
      // Evaluate if trigger conditions match
      const shouldExecute = await this.evaluateTrigger(
        workflow.trigger_config,
        eventData
      );
      
      if (shouldExecute) {
        await this.executeWorkflow(workflow, eventData);
      }
    }
  }
  
  // Evaluate trigger conditions
  async evaluateTrigger(triggerConfig, eventData) {
    // For ticket_created
    if (triggerConfig.priority && eventData.priority !== triggerConfig.priority) {
      return false;
    }
    
    // For ticket_status_changed
    if (triggerConfig.fromStatus && eventData.oldStatus !== triggerConfig.fromStatus) {
      return false;
    }
    if (triggerConfig.toStatus && eventData.newStatus !== triggerConfig.toStatus) {
      return false;
    }
    
    return true;
  }
  
  // Execute workflow actions
  async executeWorkflow(workflow, eventData) {
    const executionId = await this.logExecutionStart(workflow.id);
    
    try {
      for (const action of workflow.actions) {
        await this.executeAction(action, eventData);
      }
      
      await this.logExecutionSuccess(executionId);
    } catch (error) {
      await this.logExecutionFailure(executionId, error.message);
      throw error;
    }
  }
  
  // Execute individual action
  async executeAction(action, context) {
    const handler = this.actions.get(action.type);
    
    if (!handler) {
      throw new Error(`Unknown action type: ${action.type}`);
    }
    
    await handler.execute(action.config, context);
  }
  
  // Schedule time-based workflows
  scheduleWorkflows() {
    const cron = require('node-cron');
    
    // Load all time-based workflows
    this.db
      .from('workflow_rules')
      .select('*')
      .eq('is_enabled', true)
      .eq('trigger_type', 'time_scheduled')
      .then(workflows => {
        workflows.forEach(workflow => {
          const { cronExpression } = workflow.trigger_config;
          
          cron.schedule(cronExpression, async () => {
            await this.executeWorkflow(workflow, { type: 'scheduled' });
          });
        });
      });
  }
}
```

### Circular Dependency Detection

```javascript
// Detect circular dependencies in workflow rules
function detectCircularDependencies(workflows) {
  const graph = buildDependencyGraph(workflows);
  const visited = new Set();
  const recursionStack = new Set();
  
  function hasCycle(workflowId) {
    visited.add(workflowId);
    recursionStack.add(workflowId);
    
    const dependencies = graph[workflowId] || [];
    
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (hasCycle(depId)) return true;
      } else if (recursionStack.has(depId)) {
        return true;  // Cycle detected
      }
    }
    
    recursionStack.delete(workflowId);
    return false;
  }
  
  for (const workflowId in graph) {
    if (!visited.has(workflowId)) {
      if (hasCycle(workflowId)) {
        return true;
      }
    }
  }
  
  return false;
}

function buildDependencyGraph(workflows) {
  const graph = {};
  
  workflows.forEach(workflow => {
    // If workflow creates tickets that trigger other workflows, add dependency
    workflow.actions.forEach(action => {
      if (action.type === 'update_ticket_status') {
        // Find workflows triggered by this status change
        const dependentWorkflows = workflows.filter(w => 
          w.trigger_type === 'ticket_status_changed' &&
          w.trigger_config.fromStatus === action.config.newStatus
        );
        
        graph[workflow.id] = dependentWorkflows.map(w => w.id);
      }
    });
  });
  
  return graph;
}
```

## External API Integration

### GitHub Status API Integration

```javascript
// services/external.service.js
const axios = require('axios');

class ExternalServiceManager {
  constructor() {
    this.services = {
      github: new GitHubStatusService(),
      // Add more services as needed
    };
  }
  
  async getServiceStatus(serviceName) {
    const service = this.services[serviceName.toLowerCase()];
    
    if (!service) {
      throw new Error(`Unknown service: ${serviceName}`);
    }
    
    // Check cache first
    const cached = await this.getCachedStatus(serviceName);
    if (cached && cached.cachedUntil > new Date()) {
      return cached.statusData;
    }
    
    // Fetch fresh status
    const status = await service.fetchStatus();
    
    // Cache for 5 minutes
    await this.cacheStatus(serviceName, status, 5 * 60);
    
    return status;
  }
  
  async getCachedStatus(serviceName) {
    const { data } = await supabase
      .from('external_service_status')
      .select('*')
      .eq('service_name', serviceName)
      .single();
    
    return data;
  }
  
  async cacheStatus(serviceName, statusData, ttlSeconds) {
    const cachedUntil = new Date(Date.now() + ttlSeconds * 1000);
    
    await supabase
      .from('external_service_status')
      .upsert({
        service_name: serviceName,
        status: statusData.status,
        status_data: statusData,
        last_checked_at: new Date(),
        cached_until: cachedUntil
      });
  }
}

class GitHubStatusService {
  constructor() {
    this.apiUrl = 'https://www.githubstatus.com/api/v2/status.json';
  }
  
  async fetchStatus() {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 5000,
        headers: { 'User-Agent': 'FlowOps-Platform' }
      });
      
      return {
        name: 'GitHub',
        status: response.data.status.indicator,  // none, minor, major, critical
        description: response.data.status.description,
        lastUpdated: response.data.page.updated_at
      };
    } catch (error) {
      console.error('GitHub Status API error:', error);
      
      return {
        name: 'GitHub',
        status: 'unknown',
        description: 'Status nedostupan',
        error: error.message
      };
    }
  }
}

// Poll external services periodically
function startExternalServicePolling(intervalMinutes = 5) {
  const manager = new ExternalServiceManager();
  
  setInterval(async () => {
    const services = ['github'];  // Add more as configured
    
    for (const serviceName of services) {
      try {
        const status = await manager.getServiceStatus(serviceName);
        
        // Trigger workflow if status changed
        if (status.status === 'degraded' || status.status === 'major') {
          await workflowEngine.processEvent('external_status_changed', {
            serviceName,
            status: status.status
          });
        }
      } catch (error) {
        console.error(`Failed to poll ${serviceName}:`, error);
      }
    }
  }, intervalMinutes * 60 * 1000);
}
```

### Rate Limiting External APIs

```javascript
class RateLimitedService {
  constructor(maxRequestsPerMinute) {
    this.maxRequests = maxRequestsPerMinute;
    this.requests = [];
  }
  
  async throttle() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length >= this.maxRequests) {
      // Wait until oldest request expires
      const waitTime = this.requests[0] - oneMinuteAgo;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
  
  async makeRequest(requestFn) {
    await this.throttle();
    return await requestFn();
  }
}
```

## Croatian Localization

### i18n Strategy

#### Frontend Localization Structure

```javascript
// locales/hr.json
{
  "auth": {
    "login": "Prijava",
    "logout": "Odjava",
    "register": "Registracija",
    "email": "Email adresa",
    "password": "Lozinka",
    "forgotPassword": "Zaboravili ste lozinku?",
    "loginButton": "Prijavite se",
    "registerButton": "Registrirajte se"
  },
  "nav": {
    "dashboard": "Nadzorna ploča",
    "tickets": "Tiketi",
    "announcements": "Objave",
    "assets": "Imovina",
    "workflows": "Tijekovi rada",
    "users": "Korisnici",
    "profile": "Profil",
    "settings": "Postavke"
  },
  "tickets": {
    "title": "Tiketi",
    "createNew": "Novi tiket",
    "myTickets": "Moji tiketi",
    "allTickets": "Svi tiketi",
    "ticketDetails": "Detalji tiketa",
    "status": {
      "Nova": "Nova",
      "U radu": "U radu",
      "Na čekanju": "Na čekanju",
      "Riješena": "Riješena",
      "Zatvorena": "Zatvorena"
    },
    "priority": {
      "Niska": "Niska",
      "Srednja": "Srednja",
      "Visoka": "Visoka",
      "Hitna": "Hitna"
    },
    "fields": {
      "title": "Naslov",
      "description": "Opis",
      "status": "Status",
      "priority": "Prioritet",
      "assignee": "Dodijeljeno",
      "creator": "Kreirao",
      "createdAt": "Kreirano",
      "updatedAt": "Ažurirano"
    }
  },
  "announcements": {
    "title": "Objave",
    "createNew": "Nova objava",
    "publish": "Objavi",
    "unpublish": "Ukloni objavu",
    "edit": "Uredi",
    "delete": "Obriši",
    "category": "Kategorija"
  },
  "common": {
    "save": "Spremi",
    "cancel": "Odustani",
    "delete": "Obriši",
    "edit": "Uredi",
    "create": "Kreiraj",
    "search": "Pretraži",
    "filter": "Filtriraj",
    "loading": "Učitavanje...",
    "noData": "Nema podataka",
    "error": "Greška",
    "success": "Uspjeh",
    "confirm": "Potvrdi",
    "actions": "Akcije"
  },
  "errors": {
    "required": "Ovo polje je obavezno",
    "invalidEmail": "Nevažeća email adresa",
    "passwordTooShort": "Lozinka mora imati najmanje 8 znakova",
    "passwordMismatch": "Lozinke se ne podudaraju",
    "loginFailed": "Prijava nije uspjela. Provjerite svoje podatke.",
    "networkError": "Greška u povezivanju. Provjerite internet vezu.",
    "serverError": "Greška na poslužitelju. Pokušajte ponovo kasnije.",
    "unauthorized": "Nemate dozvolu za ovu akciju",
    "notFound": "Resurs nije pronađen"
  },
  "validation": {
    "emailInvalid": "Unesite važeću email adresu",
    "passwordTooShort": "Lozinka mora imati najmanje 8 znakova",
    "fieldRequired": "{{field}} je obavezno polje"
  }
}
```

#### i18n Hook Implementation

```javascript
// hooks/useTranslation.js
import { createContext, useContext } from 'react';
import hr from '../locales/hr.json';

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const t = (key) => {
    const keys = key.split('.');
    let value = hr;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined) return key;
    }
    
    return value;
  };
  
  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

// Usage in components
function LoginForm() {
  const { t } = useTranslation();
  
  return (
    <form>
      <h2>{t('auth.login')}</h2>
      <input placeholder={t('auth.email')} />
      <input type="password" placeholder={t('auth.password')} />
      <button>{t('auth.loginButton')}</button>
    </form>
  );
}
```

### Date and Time Formatting

```javascript
// utils/dateFormatter.js
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';

export function formatDate(date) {
  return format(parseISO(date), 'dd.MM.yyyy', { locale: hr });
}

export function formatTime(date) {
  return format(parseISO(date), 'HH:mm', { locale: hr });
}

export function formatDateTime(date) {
  return format(parseISO(date), 'dd.MM.yyyy HH:mm', { locale: hr });
}

export function formatRelativeTime(date) {
  const { formatDistanceToNow } = require('date-fns');
  return formatDistanceToNow(parseISO(date), {
    addSuffix: true,
    locale: hr
  });
}

// Usage
formatDate('2024-01-15T10:30:00Z');  // "15.01.2024"
formatTime('2024-01-15T10:30:00Z');  // "10:30"
formatDateTime('2024-01-15T10:30:00Z');  // "15.01.2024 10:30"
formatRelativeTime('2024-01-15T10:30:00Z');  // "prije 2 sata"
```

### Backend Error Messages

```javascript
// Backend error messages in Croatian
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Nevažeći unos podataka',
  AUTHENTICATION_ERROR: 'Prijava nije uspjela',
  AUTHORIZATION_ERROR: 'Nemate dozvolu za ovu akciju',
  NOT_FOUND: 'Resurs nije pronađen',
  DUPLICATE_EMAIL: 'Email adresa već postoji',
  INVALID_PASSWORD: 'Nevažeća lozinka',
  PASSWORD_TOO_SHORT: 'Lozinka mora imati najmanje 8 znakova',
  REQUIRED_FIELD: 'Ovo polje je obavezno',
  INVALID_STATUS: 'Nevažeći status',
  TICKET_NOT_FOUND: 'Tiket nije pronađen',
  ANNOUNCEMENT_NOT_FOUND: 'Objava nije pronađena',
  USER_NOT_FOUND: 'Korisnik nije pronađen',
  WORKFLOW_CIRCULAR_DEPENDENCY: 'Otkrivena kružna ovisnost u tijeku rada'
};

function getErrorMessage(code) {
  return ERROR_MESSAGES[code] || 'Nepoznata greška';
}
```

## Visual Design System

### Color Palette

```css
/* styles/themes.css */
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;  /* Deep Blue - Primary */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Secondary Colors - Purple Accents */
  --color-secondary-50: #faf5ff;
  --color-secondary-100: #f3e8ff;
  --color-secondary-200: #e9d5ff;
  --color-secondary-300: #d8b4fe;
  --color-secondary-400: #c084fc;
  --color-secondary-500: #a855f7;  /* Purple - Secondary */
  --color-secondary-600: #9333ea;
  --color-secondary-700: #7e22ce;
  --color-secondary-800: #6b21a8;
  --color-secondary-900: #581c87;
  
  /* Neutral Colors - Dark Theme */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;  /* Charcoal */
  --color-neutral-800: #1e293b;  /* Dark Navy */
  --color-neutral-900: #0f172a;  /* Darkest Navy - Background */
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Background Colors */
  --bg-primary: var(--color-neutral-900);
  --bg-secondary: var(--color-neutral-800);
  --bg-tertiary: var(--color-neutral-700);
  
  /* Text Colors */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  /* Border Colors */
  --border-primary: var(--color-neutral-700);
  --border-secondary: var(--color-neutral-600);
}
```

### Typography

```css
/* Typography System */
:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
}
```

### Spacing System

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
}
```

### Component Styles

#### Button Styles

```css
/* Button Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

/* Button Variants */
.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
}

.btn-secondary {
  background-color: var(--color-secondary-500);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-600);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
}

.btn-outline:hover {
  background-color: var(--bg-secondary);
}
```

#### Card Styles

```css
.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: var(--spacing-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.card-hover {
  transition: all 0.2s;
}

.card-hover:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  border-color: var(--color-primary-500);
}
```

#### Input Styles

```css
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input::placeholder {
  color: var(--text-muted);
}
```

#### Badge Styles

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: 9999px;
}

.badge-success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.badge-warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.badge-error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.badge-info {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}
```

### Responsive Design

```css
/* Tailwind CSS Breakpoints */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

/* Mobile-first approach */
.container {
  width: 100%;
  padding: var(--spacing-4);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--spacing-8);
  }
}

/* Mobile menu */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s;
  }
  
  .sidebar.open {
    left: 0;
  }
}
```

### Loading States

```jsx
// LoadingSkeleton component
function LoadingSkeleton({ className }) {
  return (
    <div className={`animate-pulse bg-neutral-700 rounded ${className}`} />
  );
}

// Usage for ticket list
function TicketListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card">
          <LoadingSkeleton className="h-6 w-3/4 mb-2" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Note on PBT Applicability**: Property-based testing is applied selectively in FlowOps. PBT is suitable for business logic (validation, authorization rules, data transformations), but NOT for UI rendering, database CRUD operations, or external API polling. The properties below focus on testable business logic.

### Property 1: Password Storage Security

*For any* password provided during user registration or password change, the stored value in the database SHALL be a bcrypt hash, never plaintext.

**Validates: Requirements 1.3**

### Property 2: Single Role Assignment

*For any* user account created in the system, the user SHALL have exactly one role assigned from the set {Posjetitelj, Registrirani_Korisnik, Tehničar, Administrator}.

**Validates: Requirements 1.5**

### Property 3: Authorization Enforcement

*For any* user with role R attempting action A where A is not permitted for R, the system SHALL deny access and return a 403 error with Croatian error message.

**Validates: Requirements 1.6**

### Property 4: Administrator Self-Assignment Prevention

*For any* non-Administrator user attempting to change their own role to Administrator, the system SHALL reject the request.

**Validates: Requirements 1.8**

### Property 5: New Ticket Status

*For any* newly created ticket, regardless of input parameters, the system SHALL assign initial status "Nova".

**Validates: Requirements 2.2**

### Property 6: Ticket Ownership Access Control

*For any* Registrirani_Korisnik user U and ticket T, user U can access ticket T if and only if U is the creator of T, U is assigned to T (as Tehničar), or U has Administrator role.

**Validates: Requirements 2.3, 2.4**

### Property 7: Ticket History Logging

*For any* ticket update operation (status change, assignment, field modification), the system SHALL create a ticket_history entry with timestamp, user_id, action, old_value, and new_value.

**Validates: Requirements 2.6**

### Property 8: Comment Attribution

*For any* comment added to a ticket, the system SHALL store the comment with author_id and created_at timestamp populated.

**Validates: Requirements 2.7**

### Property 9: Ticket Status Validation

*For any* ticket status update, the new status SHALL be one of {Nova, U radu, Na čekanju, Riješena, Zatvorena}, otherwise the update SHALL be rejected.

**Validates: Requirements 2.8**

### Property 10: Ticket Modification Authorization

*For any* Registrirani_Korisnik user U attempting to modify ticket T where U is not the creator of T and U is not a Tehničar or Administrator, the modification SHALL be denied.

**Validates: Requirements 2.10**

### Property 11: Announcement Required Fields

*For any* announcement created, the system SHALL store it with author_id, created_at timestamp, title, and content populated (all non-null).

**Validates: Requirements 3.1**

### Property 12: Published Announcement Visibility

*For any* announcement A where is_published is true, all authenticated users SHALL be able to view A (subject to role-appropriate filtering).

**Validates: Requirements 3.3**

### Property 13: Announcement Image Validation

*For any* image file uploaded for an announcement, the system SHALL validate the file format (jpeg, png, gif, webp) and size (≤ 10MB), rejecting files that don't meet criteria.

**Validates: Requirements 3.5**

### Property 14: Soft Delete Preservation

*For any* announcement deleted, the system SHALL set deleted_at timestamp and preserve the record in the database (not hard delete).

**Validates: Requirements 3.8**

### Property 15: Chronological Announcement Ordering

*For any* set of announcements displayed on the dashboard, they SHALL be ordered by published_at timestamp in descending order (most recent first).

**Validates: Requirements 3.9**

### Property 16: Croatian Date Formatting

*For any* date-time value displayed in the UI, the date component SHALL be formatted as dd.MM.yyyy and time as HH:mm (24-hour format), following Croatian locale conventions.

**Validates: Requirements 3.10, 6.7, 12.2, 12.3**

### Property 17: Workflow Rule Structure

*For any* workflow rule created, it SHALL contain a valid trigger_type from the enumerated set and a non-empty actions array, otherwise creation SHALL be rejected.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 18: Workflow Execution Logging

*For any* workflow rule execution (successful or failed), the system SHALL create a workflow_executions record with workflow_rule_id, status, executed_at, and error_message (if failed).

**Validates: Requirements 4.5**

### Property 19: Workflow Failure Isolation

*For any* workflow rule execution that throws an error, the error SHALL be logged and the system SHALL continue normal operation (no cascade failure).

**Validates: Requirements 4.7**

### Property 20: Workflow Circular Dependency Detection

*For any* set of workflow rules where rule A's actions could trigger rule B and rule B's actions could trigger rule A (directly or transitively), the system SHALL detect the circular dependency and prevent activation.

**Validates: Requirements 4.8**

### Property 21: Default User Role

*For any* user account created without explicit role specification, the system SHALL assign role Registrirani_Korisnik by default.

**Validates: Requirements 5.1**

### Property 22: Session Termination on Deactivation

*For any* active user session where the associated user account is deactivated, the session SHALL be terminated and subsequent requests with that session token SHALL be rejected.

**Validates: Requirements 5.4**

### Property 23: Permission Change Auditing

*For any* user permission modification (role change, account activation/deactivation), the system SHALL create an audit_logs entry with user_id, action_type, timestamp, and administrator who made the change.

**Validates: Requirements 5.7**

### Property 24: Last Administrator Protection

*For any* administrator account where it is the only remaining account with Administrator role, deletion or role change SHALL be prevented with appropriate error message.

**Validates: Requirements 5.8**

### Property 25: Admin Function Authorization

*For any* user management endpoint (role change, deactivation, password reset), only users with Administrator role SHALL have access; all other roles SHALL receive 403 error.

**Validates: Requirements 5.9**

### Property 26: Role-Based Dashboard Statistics

*For any* user requesting dashboard statistics, the returned data SHALL be filtered according to their role: Posjetitelj sees public data only, Registrirani_Korisnik sees own tickets + public announcements, Tehničar sees assigned tickets, Administrator sees all data.

**Validates: Requirements 6.1, 6.8, 6.9**

### Property 27: Ticket Count Accuracy

*For any* dashboard statistics request, the ticket counts by status SHALL match the actual count of tickets in each status in the database at the time of the request.

**Validates: Requirements 6.2**

### Property 28: External Service Error Handling

*For any* external service API call that fails (network error, timeout, invalid response), the system SHALL log the error and return cached data or a fallback Croatian error message to the user.

**Validates: Requirements 7.3**

### Property 29: External Service Caching

*For any* external service status query within 5 minutes of a previous query, the system SHALL return cached data without making a new HTTP request to the external API.

**Validates: Requirements 7.4**

### Property 30: External Service Response Validation

*For any* external service API response, the system SHALL validate the JSON structure matches expected schema before processing; invalid responses SHALL be rejected and logged.

**Validates: Requirements 7.7**

### Property 31: External Service Unavailability Resilience

*For any* external service API unavailable scenario (network down, service down), the system SHALL continue normal operation using cached data or default values, not crash or block.

**Validates: Requirements 7.9**

### Property 32: External API Interaction Logging

*For any* external service API call made, the system SHALL log the request with timestamp, service name, and response status for monitoring purposes.

**Validates: Requirements 7.10**

### Property 33: JSON Response Format

*For any* successful API response from REST endpoints, the response SHALL be valid JSON with appropriate content-type header.

**Validates: Requirements 9.2**

### Property 34: HTTP Status Code Correctness

*For any* API endpoint response, the HTTP status code SHALL be: 200 for successful retrieval, 201 for successful creation, 400 for client input errors, 401 for authentication failure, 403 for authorization failure, 404 for resource not found, 500 for server errors.

**Validates: Requirements 9.3**

### Property 35: Input Validation on Server

*For any* API request with a request body, all input fields SHALL be validated on the server side according to defined schemas before processing; invalid input SHALL return 400 with validation errors in Croatian.

**Validates: Requirements 9.6, 11.1**

### Property 36: SQL Injection Prevention

*For any* database query constructed by the backend, parameterized queries or ORM methods SHALL be used; direct string concatenation of user input into SQL SHALL never occur.

**Validates: Requirements 9.7, 11.2**

### Property 37: XSS Prevention

*For any* user-generated content displayed in the UI, the content SHALL be sanitized or escaped to prevent script injection; React's automatic escaping is used for text, and sanitize-html is used for rich content.

**Validates: Requirements 9.8, 11.3**

### Property 38: Filter Result Correctness

*For any* list endpoint with filter parameters (tickets by status, announcements by category, assets by type), the returned results SHALL match ALL specified filter criteria; no items outside the filter SHALL be included.

**Validates: Requirements 17.1, 17.2, 17.3**

### Property 39: Error Message Localization

*For any* error response returned to the client, the error message SHALL be in Croatian language, matching the user's interface language.

**Validates: Requirements 20.1, 20.2, 20.4, 20.8**

### Property 40: Error Response Structure

*For any* error response from the API, it SHALL follow the standard structure: `{ error: { code: string, message: string, details?: array } }` where code is an enum value and message is Croatian text.

**Validates: Requirements 20.5**

## Testing Strategy

### Property-Based Testing

**Library**: fast-check (JavaScript/TypeScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each property test MUST reference its design document property number
- Tag format: `Feature: flowops-platform, Property {number}: {property title}`

**Applicable Properties**:
Properties 1-40 listed above should be implemented as property-based tests where the business logic is testable independently of infrastructure (database, external APIs, UI rendering).

**Implementation Approach**:
```javascript
// Example: Property 5 - New Ticket Status
import fc from 'fast-check';

describe('Feature: flowops-platform, Property 5: New Ticket Status', () => {
  it('assigns status "Nova" to all newly created tickets', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 255 }),
          description: fc.string({ minLength: 1 }),
          priority: fc.constantFrom('Niska', 'Srednja', 'Visoka', 'Hitna'),
          creatorId: fc.uuid()
        }),
        async (ticketData) => {
          const ticket = await createTicket(ticketData);
          expect(ticket.status).toBe('Nova');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

**Framework**: Jest with React Testing Library

**Coverage Goals**:
- Utility functions: 90%+
- React components: 80%+
- Business logic: 90%+

**Test Organization**:
```
tests/
├── unit/
│   ├── components/
│   │   ├── Button.test.jsx
│   │   ├── TicketCard.test.jsx
│   │   └── AnnouncementForm.test.jsx
│   ├── utils/
│   │   ├── dateFormatter.test.js
│   │   ├── validation.test.js
│   │   └── permissions.test.js
│   ├── services/
│   │   ├── authService.test.js
│   │   ├── ticketService.test.js
│   │   └── workflowEngine.test.js
│   └── hooks/
│       ├── useAuth.test.js
│       └── useTickets.test.js
```

**Example Unit Tests**:

```javascript
// components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});

// utils/dateFormatter.test.js
import { formatDate, formatDateTime } from './dateFormatter';

describe('dateFormatter', () => {
  it('formats date in Croatian format', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('15.01.2024');
  });
  
  it('formats date and time in Croatian format', () => {
    expect(formatDateTime('2024-01-15T10:30:00Z')).toBe('15.01.2024 10:30');
  });
});
```

### Integration Testing

**Framework**: Jest + Supertest (backend), Cypress (end-to-end)

**Focus Areas**:
- API endpoint workflows
- Authentication flows
- Workflow engine execution
- Database operations

**Example Integration Test**:

```javascript
// tests/integration/tickets.test.js
const request = require('supertest');
const app = require('../../src/app');
const { setupTestDatabase, teardownTestDatabase } = require('../helpers/database');

describe('Tickets API', () => {
  let authToken;
  let userId;
  
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user and get auth token
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  describe('POST /api/v1/tickets', () => {
    it('creates ticket with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test ticket',
          description: 'Test description',
          priority: 'Visoka'
        })
        .expect(201);
      
      expect(response.body).toMatchObject({
        title: 'Test ticket',
        description: 'Test description',
        priority: 'Visoka',
        status: 'Nova',
        creatorId: userId
      });
    });
    
    it('returns 400 with invalid data', async () => {
      await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '',  // Invalid: empty title
          description: 'Test'
        })
        .expect(400);
    });
    
    it('returns 401 without auth token', async () => {
      await request(app)
        .post('/api/v1/tickets')
        .send({
          title: 'Test',
          description: 'Test'
        })
        .expect(401);
    });
  });
});
```

### End-to-End Testing

**Framework**: Cypress

**Test Scenarios**:
1. User registration and login
2. Create and manage tickets
3. Publish announcements (Tehničar role)
4. Configure workflows (Administrator role)
5. Mobile responsive behavior

**Example E2E Test**:

```javascript
// cypress/e2e/ticket-workflow.cy.js
describe('Ticket Management Workflow', () => {
  beforeEach(() => {
    // Login as Registrirani_Korisnik
    cy.login('user@example.com', 'password');
  });
  
  it('creates, views, and comments on ticket', () => {
    // Navigate to tickets page
    cy.visit('/tickets');
    cy.contains('Moji tiketi').should('be.visible');
    
    // Create new ticket
    cy.contains('Novi tiket').click();
    cy.get('[name="title"]').type('Server nije dostupan');
    cy.get('[name="description"]').type('Web server ne odgovara na zahtjeve');
    cy.get('[name="priority"]').select('Visoka');
    cy.contains('button', 'Kreiraj').click();
    
    // Verify ticket created
    cy.contains('Tiket uspješno kreiran').should('be.visible');
    cy.contains('Server nije dostupan').should('be.visible');
    
    // Open ticket detail
    cy.contains('Server nije dostupan').click();
    cy.contains('Nova').should('be.visible');
    
    // Add comment
    cy.get('[name="comment"]').type('Problem i dalje postoji');
    cy.contains('button', 'Dodaj komentar').click();
    cy.contains('Problem i dalje postoji').should('be.visible');
  });
});
```

## Error Handling

### Frontend Error Handling

```javascript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Nešto je pošlo po zlu</h2>
          <p>Molimo osvježite stranicu ili se vratite na početnu stranicu.</p>
          <button onClick={() => window.location.href = '/'}>
            Početna stranica
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// API error handling
async function handleApiRequest(requestFn) {
  try {
    const response = await requestFn();
    return { data: response.data, error: null };
  } catch (error) {
    if (error.response) {
      // Server responded with error
      return {
        data: null,
        error: {
          message: error.response.data.error.message,
          code: error.response.data.error.code,
          status: error.response.status
        }
      };
    } else if (error.request) {
      // Network error
      return {
        data: null,
        error: {
          message: 'Greška u povezivanju. Provjerite internet vezu.',
          code: 'NETWORK_ERROR'
        }
      };
    } else {
      // Other error
      return {
        data: null,
        error: {
          message: 'Nepoznata greška',
          code: 'UNKNOWN_ERROR'
        }
      };
    }
  }
}
```

### Backend Error Handling

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Nevažeći unos podataka',
        details: err.details
      }
    });
  }
  
  // Authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Nevažeći token za autentifikaciju'
      }
    });
  }
  
  // Authorization errors
  if (err.name === 'AuthorizationError') {
    return res.status(403).json({
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Nemate dozvolu za ovu akciju'
      }
    });
  }
  
  // Database errors
  if (err.code === '23505') {  // PostgreSQL unique violation
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resurs već postoji'
      }
    });
  }
  
  // Default server error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Greška na poslužitelju'
    }
  });
}

module.exports = errorHandler;
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Split routes and components
   ```javascript
   const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
   const TicketsPage = lazy(() => import('./pages/TicketsPage'));
   ```

2. **Memoization**: Prevent unnecessary re-renders
   ```javascript
   const MemoizedTicketCard = React.memo(TicketCard);
   ```

3. **Debouncing**: Debounce search inputs
   ```javascript
   const debouncedSearch = useDebounce(searchTerm, 300);
   ```

4. **Image Optimization**: Lazy load images, use WebP format

### Backend Optimization

1. **Database Indexing**: Index frequently queried columns (already in schema)

2. **Query Optimization**: Use select specific columns, avoid N+1 queries
   ```javascript
   // Good: Single query with join
   const tickets = await supabase
     .from('tickets')
     .select('*, creator:users!creator_id(first_name, last_name)')
     .eq('status', 'Nova');
   
   // Bad: N+1 query problem
   const tickets = await supabase.from('tickets').select('*');
   for (const ticket of tickets) {
     ticket.creator = await supabase.from('users').select('*').eq('id', ticket.creator_id);
   }
   ```

3. **Caching**: Cache expensive operations (external API calls, dashboard stats)

4. **Connection Pooling**: Use connection pooling for database

## Deployment Considerations

### Environment Variables

```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.flowops.example.com/api/v1

# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/flowops
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
SUPABASE_SERVICE_KEY=your-service-key
GITHUB_STATUS_API=https://www.githubstatus.com/api/v2/status.json
NODE_ENV=production
PORT=3000
```

### Build and Deployment

```bash
# Frontend build
npm run build
# Output: dist/ directory

# Backend
npm start
# Runs Node.js server on PORT

# Database migrations
npx supabase db push
```

### Monitoring and Logging

1. **Application Logs**: Use Winston or similar logging library
2. **Error Tracking**: Integrate Sentry for error monitoring
3. **Performance Monitoring**: Use New Relic or similar APM tool
4. **Database Monitoring**: Monitor query performance, connection pool

## Demonstration Workflow (25 Minutes)

### Demo Script

**Minute 0-3: Introduction & Overview**
- Show landing page with Croatian interface
- Explain FlowOps purpose and features

**Minute 3-8: User Journey - Registrirani_Korisnik**
- Register new user account
- Login with credentials
- Navigate dashboard (limited view)
- Create new ticket: "Server ne radi"
- View "Moji tiketi" list
- Add comment to ticket

**Minute 8-14: Tehničar Workflow**
- Logout and login as Tehničar
- View assigned tickets (or all unassigned)
- Assign ticket to self
- Change ticket status: Nova → U radu
- View ticket history (automatic logging)
- Create announcement: "Planirano održavanje"
- Publish announcement
- Manage IT asset: Add server to inventory
- Link asset to ticket

**Minute 14-20: Administrator Workflow**
- Logout and login as Administrator
- View full dashboard with statistics
- Create workflow rule:
  - Trigger: Ticket status changed to "Riješena"
  - Action: Send notification to creator
- Test workflow with existing ticket
- View workflow execution history
- Manage users: Change user role
- View audit log (track role change)
- Check external service status (GitHub)

**Minute 20-24: Mobile Responsive & Features**
- Resize browser to mobile view
- Show responsive layout
- Demonstrate mobile navigation
- Show filtering tickets by status
- Demonstrate Croatian date/time formatting

**Minute 24-25: Conclusion**
- Summarize key features demonstrated
- Highlight Croatian localization
- Show technical documentation (README, API docs)
- Q&A

### Seed Data Requirements

```sql
-- Create demo users (passwords hashed with bcrypt)
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES
  ('admin@flowops.hr', '$2b$12$...', 'Administrator', 'Ana', 'Kovač'),
  ('tehnicar@flowops.hr', '$2b$12$...', 'Tehničar', 'Marko', 'Novak'),
  ('korisnik@flowops.hr', '$2b$12$...', 'Registrirani_Korisnik', 'Ivana', 'Horvat');

-- Create announcement categories
INSERT INTO announcement_categories (name, description, color) VALUES
  ('Održavanje', 'Planirano održavanje sustava', '#3B82F6'),
  ('Novosti', 'Novosti i ažuriranja', '#10B981'),
  ('Upozorenja', 'Važna upozorenja', '#F59E0B');

-- Create sample tickets
INSERT INTO tickets (title, description, status, priority, creator_id) VALUES
  ('Server ne radi', 'Web server ne odgovara na zahtjeve korisnika', 'Nova', 'Visoka', (SELECT id FROM users WHERE email = 'korisnik@flowops.hr')),
  ('Printer problem', 'Printer u uredu ne štampa', 'U radu', 'Srednja', (SELECT id FROM users WHERE email = 'korisnik@flowops.hr'));

-- Create sample announcements
INSERT INTO announcements (title, content, author_id, category_id, is_published, published_at) VALUES
  ('Dobrodošli u FlowOps', 'FlowOps je nova platforma za upravljanje IT operacijama...', 
   (SELECT id FROM users WHERE email = 'admin@flowops.hr'),
   (SELECT id FROM announcement_categories WHERE name = 'Novosti'),
   true, NOW());

-- Create sample assets
INSERT INTO assets (name, type, status, serial_number, location) VALUES
  ('Dell PowerEdge R740', 'Hardware', 'Active', 'SN12345', 'Server soba A'),
  ('HP LaserJet Pro', 'Peripheral', 'Active', 'SN67890', 'Ured 101');
```

