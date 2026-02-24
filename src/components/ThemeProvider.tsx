import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply theme colors as HSL CSS variables (used by Tailwind)
    if (settings.primary_color) {
      const hsl = hexToHSL(settings.primary_color);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--secondary', hexToHSL(settings.secondary_color));
    }
    if (settings.accent_color) {
      root.style.setProperty('--accent', hexToHSL(settings.accent_color));
    }
    if (settings.background_color) {
      root.style.setProperty('--background', hexToHSL(settings.background_color));
    }
    if (settings.foreground_color) {
      root.style.setProperty('--foreground', hexToHSL(settings.foreground_color));
    }
    if (settings.muted_color) {
      root.style.setProperty('--muted', hexToHSL(settings.muted_color));
    }
    if (settings.muted_foreground_color) {
      root.style.setProperty('--muted-foreground', hexToHSL(settings.muted_foreground_color));
    }
    if (settings.border_color) {
      root.style.setProperty('--border', hexToHSL(settings.border_color));
      root.style.setProperty('--input', hexToHSL(settings.border_color));
    }

    // Update button text / primary-foreground
    if (settings.button_text_color) {
      root.style.setProperty('--primary-foreground', hexToHSL(settings.button_text_color));
      root.style.setProperty('--secondary-foreground', hexToHSL(settings.button_text_color));
    }

    // Update gradient CSS variables so .bg-gradient-primary / .text-gradient work
    const primaryHex = settings.primary_color || '#6366f1';
    const secondaryHex = settings.secondary_color || '#8b5cf6';
    root.style.setProperty(
      '--gradient-primary',
      `linear-gradient(135deg, ${primaryHex} 0%, ${secondaryHex} 100%)`
    );

    // Update glow shadow
    if (settings.primary_color) {
      const hsl = hexToHSL(settings.primary_color);
      root.style.setProperty('--shadow-glow', `0 0 40px hsl(${hsl} / 0.3)`);
    }

    // Header & footer colors as hex for direct use in components
    root.style.setProperty('--primary-hex', primaryHex);
    root.style.setProperty('--secondary-hex', secondaryHex);
    root.style.setProperty('--button-text-hex', settings.button_text_color || '#ffffff');
    root.style.setProperty('--header-bg-hex', settings.header_bg_color || 'transparent');
    root.style.setProperty('--header-text-hex', settings.header_text_color || '#0a0a0a');
    root.style.setProperty('--footer-bg-hex', settings.footer_bg_color || '#0a0a0a');
    root.style.setProperty('--footer-text-hex', settings.footer_text_color || '#ffffff');

    // Apply favicon from localStorage (resize via canvas for actual size control)
    try {
      const savedFav = localStorage.getItem('strativ_favicon_settings');
      if (savedFav) {
        const { favicon_url, favicon_size } = JSON.parse(savedFav);
        if (favicon_url) {
          const size = favicon_size || 32;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, size, size);
              const dataUrl = canvas.toDataURL('image/png');
              let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
              if (link) link.remove();
              link = document.createElement('link');
              link.rel = 'icon';
              link.type = 'image/png';
              link.href = dataUrl;
              document.head.appendChild(link);
            }
          };
          img.src = favicon_url;
        }
      }
    } catch { /* ignore */ }
  }, [settings]);

  return <>{children}</>;
}

// Helper function to convert hex to HSL format for CSS variables
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}
