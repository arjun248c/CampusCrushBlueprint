# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization and fill details:
   - **Name**: Campus Crush
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Wait 2-3 minutes for project creation

## 2. Get Connection Details

### Database URL
1. Go to **Settings** > **Database**
2. Scroll to **Connection string**
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your database password

### API Keys
1. Go to **Settings** > **API**
2. Copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep secret!)

## 3. Update Environment Variables

Create `.env` file:
```env
# Supabase Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other Configuration
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=development
PORT=5000
RATING_SALT=campus_crush_salt_2024
```

## 4. Setup Database Schema

```bash
# Install dependencies
npm install

# Push schema to Supabase
npm run db:push

# Seed with sample data
npm run db:seed
```

## 5. Enable Real-time (Optional)

1. Go to **Database** > **Replication**
2. Enable replication for tables:
   - `ratings`
   - `users`
   - `leaderboards`

## 6. Row Level Security (RLS)

For production, enable RLS:

1. Go to **Authentication** > **Policies**
2. Enable RLS on all tables
3. Create policies based on your auth requirements

## 7. Start Development

```bash
npm run dev
```

Your app will be running with:
- ✅ Supabase PostgreSQL database
- ✅ Real-time leaderboard updates
- ✅ Connection pooling
- ✅ Auto-scaling
- ✅ Built-in monitoring

## Supabase Dashboard Features

- **Table Editor**: View/edit data directly
- **SQL Editor**: Run custom queries
- **API Docs**: Auto-generated API documentation
- **Logs**: Real-time application logs
- **Monitoring**: Database performance metrics