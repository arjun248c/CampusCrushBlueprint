# Campus Crush - Web Configuration

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   - Web App: http://localhost:5000

## Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Environment Variables

Required variables in `.env`:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SESSION_SECRET` - Session encryption secret
- `PORT` - Server port (default: 5000)

## Web-Only Features

- Single server serves both API and frontend
- Integrated Vite development server
- Production static file serving
- Real-time WebSocket connections
- Session-based authentication
- Responsive web design