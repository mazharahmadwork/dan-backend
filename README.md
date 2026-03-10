# World Opinion Index

**Status:** In Development  
**Version:** 0.1.0  
**Last Updated:** February 2026

## 📊 Project Overview

World Opinion Index is a KYC-verified platform designed to provide unbiased, unfiltered opinion gathering on global events. The platform ensures voting integrity through identity verification while maintaining user privacy and delivering real-time insights into public opinion.

### Core Objectives

- Provide a transparent mechanism for global opinion polling
- Ensure one verified person equals one vote through KYC verification
- Deliver unfiltered, real-time voting results
- Support both public and private event polling
- Enable organizational white-labeling and custom branding

---

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL

### Key Dependencies
- JWT for authentication
- bcrypt for password hashing
- KYC provider integration
- Email verification system

---

## 📁 Project Structure

```
world-opinion-index/
├── controllers/          # Request handlers and business logic
│   ├── categories/      # Category management controllers
│   ├── countries/       # Country data controllers
│   ├── organizations/   # Organization management controllers
│   └── users/          # User authentication and management
├── models/              # Database models and schemas
├── routes/              # API route definitions
├── services/            # Business logic layer
├── types/               # TypeScript type definitions
└── middleware/          # Express middleware (auth, validation, error handling)
```

---

## 🗄️ Database Architecture

### Core Entities

**USERS**
- User identity and authentication management
- Email-based verification
- Country association for demographic tracking
- Password security with bcrypt hashing
- Verification status tracking

**COUNTRIES**
- Geographic reference data
- ISO code standardization for international support

**ORGANIZATIONS**
- Multi-tenant organization support
- Ownership and member management
- Active status tracking
- White-label capabilities

**CATEGORIES**
- Hierarchical event categorization system
- Parent-child relationships for organized event classification

**EVENTS**
- Event creation and management
- Public/private visibility controls
- Time-bound voting periods (start_date, end_date)
- Category classification
- Creator attribution
- White-label support

**EVENT_OPTIONS**
- Customizable voting options per event
- Flexible option descriptions

**VOTES**
- User voting records with uniqueness constraints
- Event and option tracking
- Country-level aggregation
- Anonymous voting support
- Timestamp tracking for analytics

**KYC_VERIFICATIONS**
- Document verification tracking
- Multiple document type support (passport, national ID, driver's license)
- Provider integration
- Status management (pending, verified, rejected)
- Secure document storage references

**ORGANIZATION_MEMBERS**
- User-organization relationship management
- Role-based access control

**EVENT_INVITATIONS**
- Private event access management
- Token-based invitation system
- Status tracking for acceptances

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- PostgreSQL v14 or higher
- Access to KYC provider credentials

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd world-opinion-index
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/world_opinion_index
DB_HOST=localhost
DB_PORT=5432
DB_NAME=world_opinion_index
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# KYC Provider
KYC_PROVIDER_API_KEY=your_kyc_provider_api_key
KYC_PROVIDER_URL=https://api.kycprovider.com
KYC_PROVIDER_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@worldopinionindex.com

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Database setup**
```bash
# Run migrations
npm run migrate

# Seed initial data (countries, default categories)
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 🔑 Core Features

### 1. KYC Verification System
- Secure identity verification before voting privileges
- Support for multiple document types
- Integration with third-party KYC providers
- Verification status tracking and notifications
- One verified identity = one vote per event

### 2. Event Management
- Create public or private events
- Hierarchical categorization
- Time-bound voting periods
- Custom voting options
- Organization-level white-labeling
- Creator ownership and permissions

### 3. Voting System
- Verified user voting with duplicate prevention
- Anonymous or attributed voting options
- Real-time vote counting and aggregation
- Country-level demographic tracking
- Support for invitation-only private events

### 4. Multi-Organization Support
- Organizations can create branded events
- Role-based access control (owner, admin, member)
- Member invitation and management
- Organization-specific analytics

### 5. Geographic Intelligence
- Country-based vote tracking
- International participation support
- Demographic insights while preserving individual privacy

---

## 📡 API Structure

### Authentication
```
POST   /api/users/register
POST   /api/users/login
POST   /api/users/verify-email
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/refresh-token
```

### KYC Verification
```
POST   /api/kyc/submit
GET    /api/kyc/status
PUT    /api/kyc/resubmit
POST   /api/kyc/webhook
```

### Events
```
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/results
GET    /api/events/category/:categoryId
```

### Voting
```
POST   /api/votes
GET    /api/votes/my-votes
GET    /api/events/:id/stats
DELETE /api/votes/:id
```

### Categories
```
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
```

### Organizations
```
GET    /api/organizations
GET    /api/organizations/:id
POST   /api/organizations
PUT    /api/organizations/:id
POST   /api/organizations/:id/members
DELETE /api/organizations/:id/members/:userId
```

### Countries
```
GET    /api/countries
GET    /api/countries/:id
```

---

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt (12 salt rounds minimum)
- Email verification for account activation

### Data Protection
- SQL injection prevention through parameterized queries
- XSS protection with input sanitization
- CORS configuration for controlled access
- Rate limiting on authentication endpoints
- Secure KYC document handling

### Privacy Measures
- Anonymous voting option
- Encrypted sensitive data storage
- Country-level aggregation (no individual vote exposure)
- GDPR-compliant data handling
- Secure KYC provider integration

---

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Database
npm run migrate          # Run database migrations
npm run migrate:rollback # Rollback last migration
npm run seed             # Seed database with initial data
npm run db:reset         # Reset database (rollback + migrate + seed)

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run end-to-end tests
```

---

## 🗺️ Development Roadmap

### Phase 1: Foundation (Current Phase)
- [x] Database schema design and ERD
- [x] Project structure setup
- [ ] Core authentication endpoints
- [ ] KYC provider integration
- [ ] Basic event CRUD operations
- [ ] User management system

### Phase 2: Core Voting Features
- [ ] Voting system implementation
- [ ] Real-time vote aggregation
- [ ] Event invitation system
- [ ] Email notification system
- [ ] Basic analytics dashboard

### Phase 3: Organization Features
- [ ] Organization management
- [ ] White-label customization
- [ ] Advanced role permissions
- [ ] Organization-specific analytics
- [ ] Member invitation workflows

### Phase 4: Advanced Features
- [ ] Advanced filtering and search
- [ ] Export functionality (CSV, PDF reports)
- [ ] Multi-language support
- [ ] Mobile-responsive design
- [ ] Enhanced security features

### Phase 5: Optimization & Scale
- [ ] Performance optimization
- [ ] Caching layer (Redis)
- [ ] Database query optimization
- [ ] Load testing and scaling
- [ ] Monitoring and logging infrastructure

---

## 📊 Testing Strategy

### Unit Tests
- Controller logic
- Service layer functions
- Utility functions
- Validation schemas

### Integration Tests
- API endpoint testing
- Database operations
- KYC provider integration
- Email service integration

### E2E Tests
- Complete user workflows
- Voting process
- KYC verification flow
- Event creation and management

### Target Coverage
- Minimum 80% code coverage
- 100% coverage for critical paths (auth, voting, KYC)

---

## 🔧 Configuration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### ESLint Rules
- Airbnb TypeScript style guide
- Prettier integration
- Custom rules for project conventions

---

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict type checking
- Avoid `any` type; use `unknown` when type is uncertain
- Properly type all function parameters and return values
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Naming Conventions
- **Files:** kebab-case (e.g., `user-controller.ts`)
- **Classes:** PascalCase (e.g., `UserService`)
- **Functions/Variables:** camelCase (e.g., `getUserById`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_VOTE_COUNT`)
- **Interfaces:** PascalCase with 'I' prefix (e.g., `IUserModel`)

### Code Organization
- One class/interface per file
- Group related functionality in modules
- Keep controllers thin, business logic in services
- Use dependency injection where appropriate

---

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `AUTH_INVALID_CREDENTIALS` - Invalid login credentials
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `KYC_NOT_VERIFIED` - User has not completed KYC verification
- `VOTE_DUPLICATE` - User has already voted on this event
- `EVENT_CLOSED` - Voting period has ended
- `PERMISSION_DENIED` - Insufficient permissions

---

## 📈 Monitoring & Logging

### Logging Levels
- **ERROR:** System errors, exceptions
- **WARN:** Warning conditions
- **INFO:** Informational messages
- **DEBUG:** Debug-level messages (development only)

### Key Metrics to Monitor
- API response times
- Database query performance
- KYC verification success rate
- Vote submission rate
- Error rates by endpoint
- User registration and verification funnel

---

## 🔐 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security audit completed
- [ ] Performance testing done

### Production Environment
- [ ] Use production database
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Enable rate limiting
- [ ] Set NODE_ENV=production

---

## 📞 Support & Contact

For project-related queries, contact:
- **Project Manager:** [Name/Email]
- **Lead Developer:** [Name/Email]
- **Technical Issues:** [Email/Slack Channel]

---

## 📄 License

**Proprietary** - All rights reserved. This code is the property of [Client Name] and is confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🔒 Confidentiality Notice

This repository contains proprietary and confidential information. All contributors must:
- Sign appropriate NDAs
- Follow data handling policies
- Not share code or documentation externally
- Report any security concerns immediately

---

**Last Updated:** February 2026  
**Repository Maintainer:** [Name]  
**Project Status:** Active Development
