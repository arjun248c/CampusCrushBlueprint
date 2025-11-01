# Campus Crush - Technology Stack

## Programming Languages & Versions
- **TypeScript**: Primary language for both frontend and backend (v5.6.3)
- **JavaScript**: ES modules with Node.js runtime
- **CSS**: Tailwind CSS for styling with PostCSS processing
- **HTML**: React JSX templates

## Frontend Technology Stack

### Core Framework
- **React**: v18.3.1 - Component-based UI library
- **React DOM**: v18.3.1 - DOM rendering for React
- **Vite**: v5.4.20 - Fast build tool and development server

### UI & Styling
- **Tailwind CSS**: v3.4.17 - Utility-first CSS framework
- **shadcn/ui**: Radix UI-based component library
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Framer Motion**: v11.13.1 - Animation library
- **Lucide React**: v0.453.0 - Icon library

### State Management & Data Fetching
- **React Query (TanStack)**: v5.60.5 - Server state management
- **React Hook Form**: v7.55.0 - Form state management
- **Wouter**: v3.3.5 - Lightweight routing library

### Utilities
- **Zod**: v3.24.2 - Schema validation
- **date-fns**: v3.6.0 - Date manipulation
- **clsx**: v2.1.1 - Conditional className utility
- **class-variance-authority**: v0.7.1 - Component variant management

## Backend Technology Stack

### Runtime & Framework
- **Node.js**: v20 - JavaScript runtime
- **Express.js**: v4.21.2 - Web application framework
- **TypeScript**: Server-side type safety

### Database & ORM
- **PostgreSQL**: v16 - Primary database
- **Drizzle ORM**: v0.39.1 - Type-safe database toolkit
- **Drizzle Kit**: v0.31.4 - Database migrations and introspection
- **@neondatabase/serverless**: v0.10.4 - Serverless PostgreSQL driver

### Authentication & Security
- **Passport.js**: v0.7.0 - Authentication middleware
- **passport-local**: v1.0.0 - Local authentication strategy
- **express-session**: v1.18.1 - Session management
- **express-rate-limit**: v8.1.0 - Rate limiting middleware
- **connect-pg-simple**: v10.0.0 - PostgreSQL session store

### Additional Backend Libraries
- **openid-client**: v6.8.1 - OAuth/OpenID Connect client
- **ws**: v8.18.0 - WebSocket implementation
- **memoizee**: v0.4.17 - Function memoization
- **memorystore**: v1.6.7 - Memory-based session store

## Development Tools & Build System

### Build Tools
- **Vite**: Frontend bundling and development server
- **esbuild**: v0.25.0 - Fast JavaScript bundler for backend
- **tsx**: v4.20.5 - TypeScript execution for development

### Code Quality
- **TypeScript**: Static type checking
- **ESLint**: Code linting (configured via Vite)
- **Prettier**: Code formatting (implicit)

### Development Dependencies
- **@types/***: TypeScript definitions for all major libraries
- **@vitejs/plugin-react**: v4.7.0 - React support for Vite
- **autoprefixer**: v10.4.20 - CSS vendor prefixing
- **postcss**: v8.4.47 - CSS processing

## Deployment & Infrastructure

### Platform
- **Replit**: Primary hosting and development environment
- **Node.js 20**: Runtime environment
- **PostgreSQL 16**: Database service

### Configuration
- **Environment**: Development and production modes
- **Ports**: 5000 (backend), 3000 (frontend development)
- **Build Process**: Vite build + esbuild bundling
- **Process Management**: npm scripts for development and production

## Development Commands

### Primary Commands
```bash
npm run dev          # Start development server (both frontend and backend)
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

### Development Workflow
1. **Development**: `npm run dev` starts both Vite dev server and Express API
2. **Type Checking**: Continuous TypeScript compilation and checking
3. **Database**: Drizzle Kit for schema management and migrations
4. **Hot Reload**: Vite HMR for frontend, tsx for backend auto-restart

## Package Management
- **npm**: Primary package manager
- **package-lock.json**: Dependency version locking
- **Monorepo Structure**: Single package.json for both frontend and backend
- **ES Modules**: Modern JavaScript module system throughout

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES2020+ support)
- **Mobile**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Core functionality works without JavaScript