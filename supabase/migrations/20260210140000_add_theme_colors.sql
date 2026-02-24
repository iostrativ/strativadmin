-- Migration: Add Theme Color System
-- Allows customization of primary, secondary, accent colors and more
-- Date: 2026-02-10

DO $$
BEGIN
  -- Add color fields to site_settings if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE site_settings
    ADD COLUMN primary_color VARCHAR(20) DEFAULT '#6366f1',
    ADD COLUMN secondary_color VARCHAR(20) DEFAULT '#8b5cf6',
    ADD COLUMN accent_color VARCHAR(20) DEFAULT '#06b6d4',
    ADD COLUMN background_color VARCHAR(20) DEFAULT '#ffffff',
    ADD COLUMN foreground_color VARCHAR(20) DEFAULT '#0a0a0a',
    ADD COLUMN muted_color VARCHAR(20) DEFAULT '#f1f5f9',
    ADD COLUMN muted_foreground_color VARCHAR(20) DEFAULT '#64748b',
    ADD COLUMN border_color VARCHAR(20) DEFAULT '#e2e8f0',
    ADD COLUMN button_text_color VARCHAR(20) DEFAULT '#ffffff',
    ADD COLUMN header_bg_color VARCHAR(20) DEFAULT 'transparent',
    ADD COLUMN header_text_color VARCHAR(20) DEFAULT '#0a0a0a',
    ADD COLUMN footer_bg_color VARCHAR(20) DEFAULT '#0a0a0a',
    ADD COLUMN footer_text_color VARCHAR(20) DEFAULT '#ffffff';

    COMMENT ON COLUMN site_settings.primary_color IS 'Primary brand color (hex format)';
    COMMENT ON COLUMN site_settings.secondary_color IS 'Secondary brand color (hex format)';
    COMMENT ON COLUMN site_settings.accent_color IS 'Accent/highlight color (hex format)';
    COMMENT ON COLUMN site_settings.background_color IS 'Main background color (hex format)';
    COMMENT ON COLUMN site_settings.foreground_color IS 'Main text color (hex format)';
    COMMENT ON COLUMN site_settings.muted_color IS 'Muted background color (hex format)';
    COMMENT ON COLUMN site_settings.muted_foreground_color IS 'Muted text color (hex format)';
    COMMENT ON COLUMN site_settings.border_color IS 'Border color (hex format)';
    COMMENT ON COLUMN site_settings.button_text_color IS 'Button text color (hex format)';
    COMMENT ON COLUMN site_settings.header_bg_color IS 'Header background color (hex format, transparent for see-through)';
    COMMENT ON COLUMN site_settings.header_text_color IS 'Header text/link color (hex format)';
    COMMENT ON COLUMN site_settings.footer_bg_color IS 'Footer background color (hex format)';
    COMMENT ON COLUMN site_settings.footer_text_color IS 'Footer text color (hex format)';
  END IF;
END $$;
