# Barbershop Management System

## Overview

This is a modern full-stack barbershop management application built with React, TypeScript, Express, and PostgreSQL. The system provides real-time queue management, customer reviews, gallery showcase, and AI-powered chat functionality with multi-language support (English and Dutch).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom shadcn/ui styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Real-time Communication**: WebSocket server for live updates
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Strongly typed schema definitions in TypeScript
- **Migrations**: Automated database migrations via Drizzle Kit
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Authorization**: Role-based access control (admin/user roles)
- **Security**: HTTP-only cookies with secure session management

### Queue Management
- **Real-time Updates**: WebSocket-based live queue status
- **Analytics**: Queue performance tracking and reporting
- **Estimation**: Dynamic wait time calculations
- **Persistence**: Queue entries stored with completion tracking

### Review System
- **Customer Reviews**: Structured review collection with ratings
- **Display**: Carousel-based review showcase
- **Visibility Control**: Admin-controlled review visibility
- **Data Validation**: Zod schema validation for review data

### Gallery Management
- **Image Gallery**: Categorized gallery items with descriptions
- **Admin Controls**: CRUD operations for gallery management
- **Responsive Display**: Mobile-optimized carousel interface
- **Content Management**: Structured content with metadata

### AI Chat Integration
- **Chat Interface**: Real-time AI-powered customer support
- **Message History**: Persistent chat history per user
- **WebSocket Communication**: Live message delivery
- **Admin Monitoring**: Chat oversight and management tools

### Internationalization
- **Multi-language Support**: English and Dutch translations
- **Context-based Translation**: Hook-based translation system
- **Persistent Preferences**: LocalStorage-based language selection
- **Dynamic Content**: Runtime language switching

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OIDC provider validates credentials
3. Session created and stored in PostgreSQL
4. User object cached in application state
5. Role-based route protection applied

### Queue Management Flow
1. Admin updates queue status via admin panel
2. WebSocket broadcasts queue changes to all clients
3. Real-time UI updates reflect current queue state
4. Queue analytics collected for performance monitoring
5. Historical data stored for trend analysis

### Review Submission Flow
1. Customer submits review via form
2. Data validated using Zod schemas
3. Review stored in PostgreSQL with visibility controls
4. Admin can moderate and approve reviews
5. Approved reviews displayed in carousel interface

### Real-time Communication
1. WebSocket connection established on client load
2. Server broadcasts queue updates and chat messages
3. Client-side handlers update UI state reactively
4. Automatic reconnection on connection loss
5. Message queuing for offline resilience

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Passport.js
- **Database**: PostgreSQL via Neon serverless
- **Authentication**: Replit Auth, OpenID Connect
- **Real-time**: WebSocket (ws), custom WebSocket hooks

### Development Tools
- **Build System**: Vite with TypeScript support
- **Code Quality**: ESLint, TypeScript strict mode
- **Styling**: PostCSS, Autoprefixer
- **Development**: Hot module replacement, error boundaries

### External Services
- **Database Hosting**: Neon PostgreSQL serverless
- **Authentication**: Replit Auth OIDC provider
- **Asset Management**: Vite-based static asset handling
- **Session Storage**: PostgreSQL-backed session store

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: ESBuild bundles Node.js application
- **Assets**: Static assets served via Express
- **Database**: PostgreSQL migrations applied via Drizzle

### Environment Configuration
- **Environment Variables**: Database URL, session secrets, auth credentials
- **Build Process**: Separate client and server build steps
- **Asset Optimization**: Minification, tree-shaking, code splitting
- **Runtime**: Node.js production server with static file serving

### Scalability Considerations
- **Database**: Connection pooling with Neon serverless
- **Session Management**: PostgreSQL-backed sessions for horizontal scaling
- **WebSocket**: Single server instance with potential for clustering
- **Caching**: Query-level caching with React Query

## Changelog

```
Changelog:
- July 06, 2025. Initial setup with core features
- July 06, 2025. Implemented user requirements:
  - Moved admin login to separate /baas route for security
  - Updated language toggle to single button showing opposite flag
  - Made gallery carousel auto-sliding like reviews
  - Removed header section (gray background) from landing page
  - Added sample reviews and gallery data
  - Reviews section positioned at top below navigation
  - Queue section positioned below reviews
  - Multilingual support with persistent language selection
- July 07, 2025. Added business hours functionality:
  - Implemented Netherlands timezone business hours (10 AM - 7 PM, Monday-Saturday)
  - Added business status display in queue section with open/closed indicators
  - Real-time business hours checking with next opening time calculation
  - Updated WebSocket broadcasts to include business status
  - Enhanced queue status component with business hours information
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```