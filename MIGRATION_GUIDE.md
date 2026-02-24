# Migration Guide: Lovable to Standalone Supabase

## Why Move?
Lovable's free tier doesn't provide direct database access. Supabase's free tier gives you full control.

## Steps to Migrate

### 1. Create New Supabase Project
1. Go to https://supabase.com
2. Sign up (free)
3. Create a new project
4. Wait for it to initialize (2-3 minutes)

### 2. Get Your New Credentials
Once ready, go to **Project Settings > API**:
- Copy **Project URL** → This is your `VITE_SUPABASE_URL`
- Copy **anon/public key** → This is your `VITE_SUPABASE_PUBLISHABLE_KEY`
- Copy **Project Reference** → This is your `VITE_SUPABASE_PROJECT_ID`

### 3. Update .env File
Replace your current .env with the new credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-new-project-ref"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
```

### 4. Export Data from Lovable Supabase

I'll create a script to export your current data (users, roles, pages, services, portfolio, etc.)

### 5. Apply Migrations to New Database

In your new Supabase project:
1. Go to **SQL Editor**
2. Run each migration file in order
3. Tables will be created with RLS policies

### 6. Import Your Data

Run the import script to populate the new database.

## Benefits of This Approach
✅ Full control over your database
✅ Direct SQL Editor access
✅ No vendor lock-in
✅ Still completely free
✅ Can apply all migrations easily
✅ Easier to move to self-hosted later (Phase 6)
