# 🚀 Complete Database Setup Guide

Since Lovable's free tier doesn't provide direct database access, this guide will help you migrate to your own free Supabase instance with **full control**.

## 📋 Prerequisites

- A web browser
- Your current Lovable project (for exporting data)

## 🎯 Migration Steps

### Step 1: Export Your Current Data

1. Open the file: **export-data.html** in your web browser
2. Click the **"Export All Data"** button
3. A file named `lovable-export-YYYY-MM-DD.json` will download automatically
4. **Save this file** - you'll need it in Step 4

---

### Step 2: Create Your New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up if you don't have an account)
3. Create a new organization (if you don't have one)
4. Click **"New Project"**
5. Fill in:
   - **Name**: `strativadmin` (or any name you want)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free (includes 500MB database, 1GB file storage)
6. Click **"Create new project"**
7. Wait 2-3 minutes for initialization

---

### Step 3: Set Up Your Database Schema

1. In your new Supabase project, go to the **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: **complete-setup.sql** from your project folder
4. Copy **all 1,200+ lines** of SQL
5. Paste into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. Wait for completion - you should see **"Success. No rows returned"**

This creates:
- ✅ All 23 database tables
- ✅ Row Level Security (RLS) policies
- ✅ Storage bucket for media files
- ✅ Auto-admin assignment for first user
- ✅ Seed data for Home and About pages

---

### Step 4: Import Your Existing Data

1. In your Supabase project, go to **Settings > API** (left sidebar)
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
3. Open the file: **import-data.html** in your web browser
4. Paste your **Project URL** and **anon key**
5. Click **"Select Export File"** and choose your downloaded JSON from Step 1
6. Click **"Import Data"**
7. Wait for the import to complete (usually 1-2 minutes)

You should see:
```
✅ Import Complete!
Successful: XX tables
Failed: 0 tables
Skipped: X tables
```

---

### Step 5: Update Your Project Configuration

1. Open your `.env` file in the project root
2. Replace the old values with your new Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID="your-new-project-ref"
VITE_SUPABASE_PUBLISHABLE_KEY="your-new-anon-key"
VITE_SUPABASE_URL="https://your-new-project-ref.supabase.co"
```

3. Save the file

---

### Step 6: Restart and Test

1. Stop your development server (if running)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Open your app in the browser
4. Go to `/auth` and **Sign Up** with a new account
5. The **first user is automatically assigned as admin**
6. After signing up, you'll be redirected to `/admin`

---

### Step 7: Upload Your Media Files

Since Supabase Storage links can't be migrated automatically, you'll need to re-upload images:

1. Go to `/admin/media` in your CMS
2. Re-upload your images (logos, portfolio images, etc.)
3. Update references in:
   - Site Settings (logo)
   - Portfolio items (featured images)
   - Team members (avatars)
   - Blog posts (featured images)

---

## ✅ What's Working Now

After migration, you have:

1. ✅ **Full database access** via Supabase dashboard
2. ✅ **All existing data** imported (users, pages, services, portfolio, blog, etc.)
3. ✅ **Home & About page editors** working with pre-populated content
4. ✅ **Contact form** with phone and company fields
5. ✅ **Login redirect** to admin panel fixed
6. ✅ **Free tier** with plenty of resources:
   - 500MB database
   - 1GB file storage
   - 50,000 monthly active users
   - 2GB bandwidth

## 🎉 You're All Set!

Your CMS is now running on your own Supabase instance with full control. You can:

- ✅ Access SQL Editor anytime
- ✅ Create database backups
- ✅ Add custom functions
- ✅ View real-time logs
- ✅ Manage storage buckets
- ✅ Upgrade to paid plan when needed

---

## 🔧 Troubleshooting

### Issue: "Failed to import table X"
**Solution**: Check the error message. Usually it's due to foreign key constraints. Run the import again - it will skip existing records.

### Issue: "Can't access admin panel"
**Solution**: Make sure you signed up as a new user on the new database. The first user becomes admin automatically.

### Issue: "Images not showing"
**Solution**: Re-upload images to the new Supabase storage via `/admin/media`.

### Issue: "Getting 401 errors"
**Solution**: Double-check your `.env` file has the correct new credentials and restart the dev server.

---

## 📚 Next Steps

Now that your database is migrated, you can proceed with:

1. **Phase 3**: Preview feature (WordPress-like side panel)
2. **Phase 4**: Color customization system
3. **Phase 6**: Self-hosted backend migration (when you're ready for your VPS)

---

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase project logs (Logs section in dashboard)
3. Verify RLS policies are enabled
4. Ensure your `.env` file is correct
