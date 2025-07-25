# Dashboard OS Preventiva - Project Overview

## Overview

This is a full-stack web application for managing preventive maintenance work orders (OS - Ordens de Serviço). The system provides an intelligent dashboard for tracking and managing maintenance operations with real-time metrics, Excel import capabilities, internal chat, automated alerts, and a TV mode for engineering teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration with OpenID Connect
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Real-time**: WebSocket support for live updates

## Key Components

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Library**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with development plugins for Replit integration

### Major Features Implemented (Latest Updates)

- **Excel/CSV Import System**: Full support for PREVENTIVAS template
  - Supports Excel (.xlsx, .xls) and CSV (.csv) files
  - Robust parsing with error handling and validation
  - Standard column mapping (OS, Descrição, Equipamento, Local, Data, Prioridade, Técnico)
  - Real-time notifications for import success/errors
  - Date parsing and priority validation

- **Team Information Page**: Complete responsive layout
  - 8-card grid design with member profiles
  - Integration with team management API
  - Action buttons for edit/view/delete operations

- **Dashboard Intelligence**: 
  - TV Mode for engineering team room display
  - Auto-refresh with configurable intervals (30s, 1min, 5min)
  - Real-time metrics and status distribution
  - WebSocket support for live updates

### Backend Architecture

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage
- **File Upload**: Multer for handling Excel file uploads
- **Authentication**: Passport.js with OpenID Connect strategy

### Database Schema

The database uses PostgreSQL with the following main entities:
- **Users**: Core user management with Replit Auth integration
- **Technicians**: Technical staff management
- **Contracts**: Client contract management
- **Work Orders**: Main entity for maintenance tasks
- **Work Order Checklist**: Task checklist items
- **Chat Messages**: Internal communication per work order
- **Notifications**: System notifications and alerts
- **Dashboard Filters**: User-specific dashboard preferences
- **Sessions**: Session storage for authentication

## Data Flow

1. **Authentication Flow**: 
   - Users authenticate via Replit Auth (OpenID Connect)
   - Sessions stored in PostgreSQL with connect-pg-simple
   - User data synchronized with local user table

2. **Dashboard Data Flow**:
   - Real-time metrics fetched via REST API
   - WebSocket connections for live updates
   - Auto-refresh capabilities with configurable intervals
   - TV mode for large display monitoring

3. **Work Order Management**:
   - Excel import functionality for bulk work order creation
   - CRUD operations via REST endpoints
   - Real-time status updates
   - Internal chat system per work order

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with Neon compatibility
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **passport** and **openid-client**: Authentication handling
- **multer**: File upload processing
- **ExcelJS**: Excel file parsing and generation

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **recharts**: Chart and visualization library

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

### Development Mode
- Uses Vite dev server with HMR
- Express server runs with `tsx` for TypeScript execution
- WebSocket support for real-time features
- Development-specific Replit plugins for enhanced debugging

### Production Build
- Frontend built with Vite to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Static file serving from Express
- Environment variables for database and authentication configuration

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OpenID Connect issuer URL
- `REPLIT_DOMAINS`: Allowed domains for OIDC

### Database Setup
- Drizzle migrations in `./migrations` directory
- Schema defined in `./shared/schema.ts`
- Database push command: `npm run db:push`

The application emphasizes real-time collaboration, intuitive user experience, and comprehensive maintenance workflow management while maintaining type safety throughout the full stack.

## Recent Development Progress

### January 25, 2025
- **Database Migration**: Successfully migrated to Supabase with all required tables
- **Excel Import Implementation**: Complete PREVENTIVAS template support with CSV/Excel parsing
- **Data Validation**: Robust error handling and data validation for imported work orders
- **Authentication Fix**: Development middleware implemented for seamless testing
- **Sample Data**: Created technicians and contracts for testing import functionality
- **System Analysis**: Complete functional analysis performed with gap identification and prioritization matrix
- **Pattern Import System**: Added CSV import for technicians, elaborators, and contracts with PADRÃO.csv format
- **Real Template Integration**: Reorganized Excel import to match actual PREVENTIVAS file structure with 13 columns including Responsável, CONTRATO, OS, TÉCNICO, STATUS, etc.

### System Status
- ✅ **Database**: Fully operational on Supabase
- ✅ **Authentication**: Working with development fallback
- ✅ **Excel Import**: Functional with PREVENTIVAS template
- ✅ **Dashboard**: All metrics and charts operational
- ✅ **Team Management**: Complete with responsive design
- 🔄 **Next Priority**: Complete CRUD operations for team members and technicians