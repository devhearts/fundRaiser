# Fundraising Platform - Technical Documentation

## Overview

A fundraising platform that enables users to create and manage fundraising events, share them via links, and collect contributions. The application features public and private event visibility, progress tracking, and contribution management. Built with a focus on trust, transparency, and emotional connection inspired by platforms like GoFundMe and Kickstarter.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query for server state
- **UI Components:** Radix UI primitives with shadcn/ui styling system
- **Styling:** Tailwind CSS with custom design tokens
- **Build Tool:** Vite

**Design System:**
- Color palette emphasizes trust (green), reliability (blue), and urgency (yellow)
- Typography uses Inter for UI elements and Open Sans for body text
- Responsive grid layouts with mobile-first approach
- Custom hover and active elevation states for interactive elements

**Key Frontend Patterns:**
- Component-based architecture with reusable UI primitives
- Custom hooks for mobile detection and toast notifications
- Context-based authentication state management
- Form validation using React Hook Form with Zod schemas

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless driver)
- **Build:** esbuild for production bundling

**Data Layer:**
- In-memory storage implementation (MemStorage) currently used for development
- Database schema defined with Drizzle ORM ready for PostgreSQL integration
- Type-safe database operations with TypeScript inference

**API Design:**
- RESTful endpoints prefixed with `/api`
- JSON request/response format
- Request logging middleware for debugging
- Error handling middleware with status code mapping

**Core Data Models:**

1. **Events Table:**
   - Unique identifiers, title, description
   - Goal and current amount tracking
   - Optional cover image, location, deadline
   - Public/private visibility flag
   - Organizer information (name, email)
   - Status field (active, completed, upcoming)

2. **Contributions Table:**
   - Event association via foreign key relationship
   - Donor information with anonymity option
   - Amount tracking
   - Pledge vs completed contribution status
   - Optional messages from donors

### Authentication System

**Current Implementation:**
- Mock authentication using localStorage for development
- Context-based auth state (AuthContext)
- Protected routes with redirect logic
- User object contains id, name, and email

**Production Considerations:**
- Needs integration with proper authentication service
- Session management with connect-pg-simple package available
- JWT or session-based authentication to be implemented

### Storage Interface

**Abstraction Pattern:**
- IStorage interface defines contract for data operations
- MemStorage provides in-memory implementation for development
- Designed for easy swap to database-backed storage (Drizzle + PostgreSQL)

**Key Operations:**
- Event CRUD: create, read, update, list all events
- Contribution management: create, read, list by event
- Type-safe with Zod validation schemas

## External Dependencies

### Third-Party Services

**UI Component Library:**
- Radix UI - Headless, accessible component primitives
- shadcn/ui - Pre-styled components built on Radix
- Extensive component set: dialogs, dropdowns, forms, navigation, tables, etc.

**Development Tools:**
- Replit-specific plugins for runtime error overlay and dev tooling
- TypeScript for type safety across frontend and backend

**Database & ORM:**
- Neon Serverless PostgreSQL driver
- Drizzle ORM with Drizzle Kit for migrations
- Drizzle-Zod for schema-to-validation integration

**Utilities:**
- date-fns for date formatting and manipulation
- class-variance-authority (CVA) for component variant styling
- clsx and tailwind-merge for conditional CSS classes
- nanoid for unique ID generation

### Asset Management

**Images:**
- Stock images stored in `attached_assets/stock_images/`
- Categories include: community charity, medical fundraising, environmental conservation, disaster relief
- Imported via Vite's asset handling with `@assets` alias

### Development Environment

- Vite dev server with HMR
- TypeScript strict mode enabled
- Path aliases configured: `@/` for client, `@shared/` for shared code, `@assets/` for assets
- ESM module format throughout the project