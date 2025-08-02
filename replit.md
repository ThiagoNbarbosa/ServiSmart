# MAFFENG Work Order Management Dashboard

## Overview
Intelligent Work Order Management Dashboard designed for engineering teams, featuring advanced data import, comprehensive reporting, and streamlined maintenance tracking with enhanced collaboration tools.

## Key Technologies
- **Frontend**: React/TypeScript with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Authentication**: Mock implementation (to be replaced)
- **Real-time**: WebSocket integration

## Project Architecture
```
/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and helpers
├── server/              # Backend Express server
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema definitions
└── attached_assets/     # User uploaded files

```

## User Preferences
- Language: Portuguese (BR) for UI text
- Communication: Clear, concise technical explanations
- Code Style: TypeScript with strict typing
- Development Approach: Incremental improvements with working demos

## Recent Changes (January 2025)

### Completed Features
1. **Team Information CRUD** (Priority 1.1)
   - ✅ Added MemberDetailsModal component for viewing complete member information
   - ✅ Fixed TypeScript errors in team-information.tsx
   - ✅ Connected all CRUD operations to backend API
   - ✅ Form validation with proper error handling

2. **UX/UI Improvements** (Priority 1.2) 
   - ✅ Added proper error handling with toast notifications
   - ✅ Implemented loading states across all components
   - ✅ Fixed date formatting errors in RecentActivity
   - ✅ Fixed toLowerCase errors in Management page
   - ✅ Added error state displays

3. **Mock Data Removal** (Priority 1.3 - In Progress)
   - ✅ Removed fallback mock data from RecentActivity
   - ✅ Removed fallback mock data from TechnicianPerformance  
   - ✅ Removed fallback mock data from TrendChart
   - 🔄 Need to update Reports page to use real data

### Known Issues
- Authentication is still using mock implementation
- Reports page still uses static mock data
- Some LSP diagnostics in server files need attention

## Development Guidelines

### Frontend Development
- Always use TypeScript with proper type definitions
- Use TanStack Query for all API calls
- Implement proper loading and error states
- Use Shadcn/ui components consistently
- Follow the existing component structure

### Backend Development
- Use Drizzle ORM for all database operations
- Implement proper error handling in routes
- Use the storage interface pattern
- Validate input data with Zod schemas

### Database Schema
- Users table includes team member information
- Work orders with full lifecycle tracking
- Notifications and chat messages
- Dashboard filters for user preferences

## Next Steps (Roadmap)

### Priority 2 - Sprint Curto (1-2 weeks)
1. **Authentication System**
   - Replace mock auth with JWT-based system
   - Implement login/logout flow
   - Add route protection middleware
   - Create professional login page

2. **Work Order Management**
   - Complete CRUD for work orders
   - Advanced filtering and search
   - Status workflow implementation
   - Assignment strategies

3. **System Configuration**
   - User preferences page
   - System settings
   - Dashboard customization

### Priority 3 - Médio Prazo (3-4 weeks)
1. **Reporting System**
   - Dynamic report generation
   - Excel/PDF export
   - Advanced charts and metrics
   - Performance analytics

2. **Advanced User Management**
   - Role-based permissions
   - User hierarchy
   - Team organization

3. **Technical Improvements**
   - Automated testing
   - Performance optimization
   - API documentation
   - Structured logging

## Deployment Notes
- Application runs on port 5000
- PostgreSQL database configured via DATABASE_URL
- WebSocket support enabled
- Vite dev server with HMR

## Important Commands
```bash
npm run dev         # Start development server
npm run db:push     # Push schema changes to database
npm run build       # Build for production
```