# Campus Crush - Supabase Setup

A college-focused social rating platform with Supabase backend and real-time features.

## Prerequisites

- Node.js 20+
- Supabase account
- npm or yarn

## Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for database to be ready

2. **Get Connection Details**
   - Go to Settings > Database
   - Copy the connection string
   - Go to Settings > API
   - Copy the Project URL and anon key

## Environment Setup

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file**
   ```env
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   SUPABASE_URL=https://[project-ref].supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SESSION_SECRET=your-super-secret-session-key-here
   NODE_ENV=development
   PORT=5000
   RATING_SALT=campus_crush_salt_2024
   ```

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Push database schema**
   ```bash
   npm run db:push
   ```

3. **Seed database with sample data**
   ```bash
   npm run db:seed
   ```

## Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Frontend: http://localhost:5000
   - API: http://localhost:5000/api

## Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run check` - TypeScript type checking

## Technology Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **Supabase** - Database and real-time features
- **Passport.js** - Authentication

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
│   ├── db.ts       # Database connection
│   ├── storage.ts  # Data access layer
│   ├── routes.ts   # API routes
│   └── seed.ts     # Database seeding
├── schema.ts        # Database schema
└── package.json     # Dependencies
```

## Key Features

- **Anonymous Rating System** - Rate peers anonymously
- **Profile Discovery** - Find and browse student profiles
- **Real-time Leaderboards** - Live rankings with Supabase real-time
- **College-based** - Scoped to individual colleges
- **Privacy-focused** - Minimal data exposure
- **Type-safe** - Full TypeScript coverage
- **Scalable** - Supabase handles 1-2K users easily

## Development Notes

- Database uses UUID primary keys
- All ratings are anonymized with salted hashes
- Real-time updates for leaderboards
- Rate limiting implemented for API protection
- Comprehensive error handling and validation
- Supabase connection pooling and auto-scaling