# Block System Migration Guide

## Overview

This guide covers the migration from the old custom section editors to the unified block system. All pages now use the same block-based editing interface.

## What Changed

### Before Migration
- **Home & About**: Custom editors with dedicated tables (home_sections, about_sections, home_stats, about_values, about_timeline)
- **Services, Team, Contact, Blog**: Hardcoded layouts with no admin control

### After Migration
- **All Pages**: Unified block system using page_sections table
- **Complete Control**: Add, remove, reorder, and configure any block on any page
- **WordPress-Like**: Familiar block-based editing experience

## Migration Steps

### 1. Run the Migration

The migration is **idempotent** - safe to run multiple times.

**Using Supabase CLI:**
```bash
supabase db push
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor
2. Open `supabase/migrations/20260210120000_convert_to_block_system.sql`
3. Run the migration

### 2. Verify Migration Success

Check the logs for these messages:
- ✅ "Home page migrated successfully with X blocks"
- ✅ "About page migrated successfully with X blocks"
- ✅ "Services page seeded successfully"
- ✅ "Team page seeded successfully"
- ✅ "Contact page seeded successfully"
- ✅ "Blog page seeded successfully"

### 3. Test All Pages

#### Public Pages
Visit each page and verify it displays correctly:
- [ ] **Home** (http://localhost:5173/) - Check hero, stats, services, portfolio, testimonials, clients, CTA
- [ ] **About** (http://localhost:5173/about) - Check hero, story, values, timeline, team, why choose
- [ ] **Services** (http://localhost:5173/services) - Check hero, services list, CTA
- [ ] **Team** (http://localhost:5173/team) - Check hero, team grid
- [ ] **Contact** (http://localhost:5173/contact) - Check hero, contact info, contact form
- [ ] **Blog** (http://localhost:5173/blog) - Check hero, category filter, blog grid

#### Admin Panel
Test block editing functionality:
- [ ] Navigate to **Admin > Pages** dropdown in sidebar
- [ ] Click **Home Page** - should open PageBuilder with all blocks
- [ ] Verify "System Page" badge appears
- [ ] Test **adding a new block** (click "+ Add Block")
- [ ] Test **reordering blocks** (drag & drop)
- [ ] Test **editing a block** (click block to edit)
- [ ] Test **toggling visibility** (eye icon)
- [ ] Test **deleting a block** (trash icon)
- [ ] Repeat for **About, Services, Team, Contact, Blog** pages

### 4. Test New Block Types

Try adding these new blocks to any page:

**Content Blocks:**
- [ ] **Timeline** - Add milestones with years
- [ ] **Values** - Company values with icons
- [ ] **Story** - Company story with stats overlay
- [ ] **Why Choose Us** - Reasons with statistics

**Interactive Blocks:**
- [ ] **Contact Form** - Full contact form with validation
- [ ] **Contact Info** - Display contact details from settings
- [ ] **Blog Grid** - Blog posts with pagination
- [ ] **Category Filter** - Filter posts by category

### 5. Test Block Configuration

For dynamic blocks (Services, Portfolio, Team, Testimonials):
- [ ] **Limit** - Set max number of items to display
- [ ] **Featured Only** - Toggle to show only featured items
- [ ] **Columns** - Change grid columns (Team block)
- [ ] **Specific Items** - Select individual items to show (if implemented)

## What Was Preserved

The migration **preserves all existing data**:
- ✅ All home page content (hero, stats, sections, CTA)
- ✅ All about page content (story, values, timeline, why choose)
- ✅ All services, portfolio, team members, blog posts
- ✅ All testimonials, clients, media files

## Old Tables (Backup)

These tables are kept as backup and NOT deleted:
- `home_sections`
- `home_stats`
- `about_sections`
- `about_values`
- `about_timeline`

**To drop them after verifying migration:**
```sql
DROP TABLE IF EXISTS home_sections CASCADE;
DROP TABLE IF EXISTS home_stats CASCADE;
DROP TABLE IF EXISTS about_sections CASCADE;
DROP TABLE IF EXISTS about_values CASCADE;
DROP TABLE IF EXISTS about_timeline CASCADE;
```

## Rollback Plan

If you need to revert the migration:

1. **Restore old React components:**
   - Restore `HomePageEditor.tsx` and `AboutPageEditor.tsx` from git history
   - Restore old `HomePage.tsx` and `AboutPage.tsx` components
   - Revert `AdminDashboard.tsx` and `AdminLayout.tsx` changes

2. **Run rollback script:**
   ```bash
   # In Supabase SQL Editor
   # Run: supabase/migrations/ROLLBACK_convert_to_block_system.sql
   ```

3. **Verify:**
   - Check that old editors work
   - Verify old tables still have data

## Troubleshooting

### Issue: Pages show "Page Not Found"
**Solution:** Run the migration - system pages weren't created

### Issue: Blocks not rendering
**Solution:** Check browser console for errors. Verify block types match database.

### Issue: Can't edit blocks
**Solution:** Clear browser cache, refresh page

### Issue: Migration fails
**Solution:** Check if tables exist. Migration is idempotent - safe to run again.

### Issue: Missing content after migration
**Solution:** Check old tables (home_sections, about_sections) - data should still be there. Re-run migration.

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for SQL errors
3. Verify database schema matches expected structure
4. Review migration SQL for any skipped steps

## Next Steps

After successful migration:
1. ✅ Test all functionality thoroughly
2. ✅ Train users on new block editing system
3. ✅ Create custom blocks as needed
4. ✅ Drop old backup tables (optional, after 1-2 weeks)
5. ✅ Celebrate! 🎉 You now have a fully flexible CMS!
