-- Migration: Add logo_height to site_settings
-- This allows users to customize logo size while keeping header height fixed
-- Date: 2026-02-10

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'logo_height'
  ) THEN
    ALTER TABLE site_settings
    ADD COLUMN logo_height INTEGER DEFAULT 40 CHECK (logo_height > 0 AND logo_height <= 200);

    COMMENT ON COLUMN site_settings.logo_height IS 'Logo height in pixels (min: 1, max: 200). Logo can overlap header but position stays fixed.';
  END IF;
END $$;
