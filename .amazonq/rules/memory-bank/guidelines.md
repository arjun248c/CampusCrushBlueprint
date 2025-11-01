# Campus Crush - Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All files use TypeScript with strict typing enabled
- **Interface Definitions**: Comprehensive interfaces for all data structures (IStorage, SidebarContextProps)
- **Type Inference**: Leverage TypeScript's type inference with explicit types where needed
- **Generic Types**: Use generics for reusable components and functions
- **Zod Integration**: Schema validation with Zod for runtime type checking

### Import Organization
- **Absolute Imports**: Use `@/` path aliases for internal imports
- **External First**: External library imports before internal imports
- **Grouped Imports**: Related imports grouped together (React hooks, UI components, utilities)
- **Type Imports**: Use `import type` for type-only imports

### Error Handling Patterns
- **Try-Catch Blocks**: Comprehensive error handling in all async operations
- **Structured Responses**: Consistent error response format with status codes and messages
- **Logging**: Console.error for server-side error logging with context
- **Validation**: Input validation using Zod schemas before processing

## Component Architecture

### React Component Structure
- **Functional Components**: All components use function declarations, not arrow functions
- **Props Interfaces**: Explicit TypeScript interfaces for all component props
- **Component Composition**: Extensive use of compound components (Sidebar system)
- **Forwardable Components**: Use `React.forwardRef` and `asChild` patterns for flexibility

### State Management Patterns
- **Custom Hooks**: Extract complex logic into custom hooks (useSidebar, useToast)
- **Context Providers**: React Context for shared state (SidebarContext)
- **Reducer Pattern**: Use useReducer for complex state logic (toast system)
- **Memoization**: React.useMemo and React.useCallback for performance optimization

### Component Naming
- **PascalCase**: All component names use PascalCase
- **Descriptive Names**: Clear, descriptive component names (SidebarMenuButton, ToasterToast)
- **Compound Naming**: Related components share prefixes (Sidebar*, SidebarMenu*)

## Database & Backend Patterns

### Database Schema Design
- **UUID Primary Keys**: Use `gen_random_uuid()` for all primary keys
- **Timestamp Tracking**: Standard `createdAt` and `updatedAt` fields
- **Soft Deletes**: Use status fields instead of hard deletes where appropriate
- **Indexing Strategy**: Strategic indexes on frequently queried columns

### ORM Usage (Drizzle)
- **Type-Safe Queries**: Leverage Drizzle's type safety for all database operations
- **Relation Definitions**: Explicit relations between tables using Drizzle relations
- **Schema Validation**: Zod schemas generated from Drizzle schemas
- **Transaction Support**: Use database transactions for multi-step operations

### API Design Patterns
- **RESTful Endpoints**: Standard REST conventions for all API routes
- **Rate Limiting**: Implement rate limiting on all sensitive endpoints
- **Authentication Middleware**: Consistent authentication checks using isAuthenticated
- **Input Validation**: Validate all inputs using Zod schemas before processing
- **Error Responses**: Standardized error response format with appropriate HTTP status codes

## Security & Privacy Implementation

### Authentication & Authorization
- **Session-Based Auth**: Use express-session with PostgreSQL storage
- **Replit Integration**: Leverage Replit's OAuth for user authentication
- **Route Protection**: Protect all sensitive routes with authentication middleware
- **User Context**: Extract user ID from request context consistently

### Privacy Protection
- **Data Anonymization**: Hash sensitive data (rater IDs, IP addresses, device fingerprints)
- **Salted Hashing**: Use environment-based salts for hashing operations
- **Minimal Data Exposure**: Only expose necessary user data in API responses
- **Abuse Prevention**: Track metadata for abuse detection without compromising privacy

## Styling & UI Conventions

### Tailwind CSS Usage
- **Utility Classes**: Extensive use of Tailwind utility classes
- **Responsive Design**: Mobile-first responsive design with breakpoint prefixes
- **Component Variants**: Use class-variance-authority for component variants
- **Custom Properties**: CSS custom properties for dynamic styling
- **Data Attributes**: Use data attributes for conditional styling

### Design System Integration
- **shadcn/ui Components**: Consistent use of shadcn/ui component library
- **Radix Primitives**: Build on Radix UI primitives for accessibility
- **Icon Usage**: Lucide React icons throughout the application
- **Theme Support**: Built-in dark/light theme support

## Development Workflow Standards

### File Organization
- **Feature-Based Structure**: Organize files by feature rather than file type
- **Shared Resources**: Common schemas and types in shared locations
- **Component Collocation**: Keep related components together
- **Hook Extraction**: Extract reusable logic into custom hooks

### Code Documentation
- **JSDoc Comments**: Document complex functions and interfaces
- **Type Annotations**: Comprehensive TypeScript type annotations
- **README Files**: Maintain documentation for setup and usage
- **Inline Comments**: Explain complex business logic with inline comments

### Performance Considerations
- **Lazy Loading**: Implement lazy loading for large components
- **Memoization**: Use React.memo, useMemo, and useCallback appropriately
- **Bundle Optimization**: Tree-shaking and code splitting strategies
- **Database Optimization**: Efficient queries with proper indexing

## Testing & Quality Assurance

### Code Quality Tools
- **TypeScript Compiler**: Strict TypeScript checking enabled
- **ESLint Integration**: Code linting through Vite configuration
- **Type Safety**: Comprehensive type checking throughout the codebase

### Validation Patterns
- **Runtime Validation**: Zod schemas for all external data
- **Input Sanitization**: Validate and sanitize all user inputs
- **Business Logic Validation**: Implement business rules in validation layer

## Deployment & Environment

### Environment Configuration
- **Environment Variables**: Use environment variables for configuration
- **Development vs Production**: Different configurations for different environments
- **Database Migrations**: Use Drizzle Kit for schema migrations
- **Build Process**: Separate build processes for client and server

### Monitoring & Logging
- **Error Logging**: Comprehensive error logging on server side
- **Performance Monitoring**: Track API response times and database query performance
- **User Activity**: Log user actions for analytics and debugging