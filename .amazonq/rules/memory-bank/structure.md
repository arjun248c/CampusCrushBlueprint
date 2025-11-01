# Campus Crush - Project Structure

## Directory Organization

### Root Level
```
camp_crush/
├── client/                 # React frontend application
├── server/                 # Express.js backend API
├── .amazonq/              # Amazon Q configuration and rules
├── schema.ts              # Shared database schema definitions
├── package.json           # Project dependencies and scripts
├── .replit                # Replit deployment configuration
└── design_guidelines.md   # Comprehensive UI/UX guidelines
```

### Client Architecture (`/client`)
```
client/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── Discovery.tsx  # Profile discovery interface
│   │   ├── Leaderboard.tsx # Rankings and leaderboard
│   │   ├── OnboardingFlow.tsx # User registration flow
│   │   ├── ProfileCard.tsx # Individual profile display
│   │   └── RatingInterface.tsx # Rating interaction UI
│   ├── hooks/            # Custom React hooks
│   │   ├── use-toast.ts  # Toast notification system
│   │   ├── use-mobile.tsx # Mobile detection
│   │   └── useAuth.ts    # Authentication management
│   ├── lib/              # Utility libraries
│   │   ├── authUtils.ts  # Authentication helpers
│   │   ├── queryClient.ts # React Query configuration
│   │   └── utils.ts      # General utilities
│   ├── pages/            # Main application pages
│   │   ├── Home.tsx      # Dashboard/main interface
│   │   ├── Landing.tsx   # Marketing landing page
│   │   ├── Profile.tsx   # User profile management
│   │   └── not-found.tsx # 404 error page
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind imports
└── index.html            # HTML template
```

### Server Architecture (`/server`)
```
server/
├── index.ts              # Express server entry point
├── routes.ts             # API route definitions
├── db.ts                 # Database connection and configuration
├── storage.ts            # File storage and image handling
├── replitAuth.ts         # Replit authentication integration
├── seed.ts               # Database seeding utilities
└── vite.ts               # Vite development server integration
```

## Core Components & Relationships

### Frontend Component Hierarchy
- **App.tsx**: Root component managing routing and global state
- **Pages**: Top-level route components (Home, Landing, Profile)
- **Feature Components**: Specialized components (Discovery, Leaderboard, RatingInterface)
- **UI Components**: Reusable design system components from shadcn/ui
- **Hooks**: Custom logic for authentication, mobile detection, and notifications

### Backend API Structure
- **Express Server**: RESTful API with session-based authentication
- **Database Layer**: Drizzle ORM with PostgreSQL for data persistence
- **Authentication**: Passport.js with Replit OAuth integration
- **File Storage**: Image upload and management system
- **Rate Limiting**: Express middleware for API protection

### Shared Resources
- **schema.ts**: Zod schemas and TypeScript types shared between client and server
- **Database Schema**: Drizzle ORM table definitions for users, ratings, and profiles

## Architectural Patterns

### Frontend Patterns
- **Component Composition**: Modular UI components with clear separation of concerns
- **Custom Hooks**: Reusable logic extraction for authentication and UI state
- **React Query**: Server state management with caching and synchronization
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

### Backend Patterns
- **RESTful API**: Standard HTTP methods for resource manipulation
- **Middleware Chain**: Express middleware for authentication, rate limiting, and error handling
- **Database Abstraction**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage

### Full-Stack Integration
- **Type Safety**: Shared TypeScript types between frontend and backend
- **API Client**: React Query for server state management and caching
- **Authentication Flow**: Session-based auth with Replit OAuth provider
- **Real-time Updates**: WebSocket integration for live leaderboard updates

## Configuration Files
- **package.json**: Unified dependency management for monorepo structure
- **vite.config.ts**: Frontend build configuration with React and TypeScript
- **tailwind.config.ts**: Tailwind CSS customization and theme configuration
- **drizzle.config.ts**: Database migration and schema management
- **tsconfig.json**: TypeScript compiler configuration for both client and server