import type { CSSProperties } from 'react';

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
}

export interface TypographyConfig {
  heading?: TypographyStyle;
  body?: TypographyStyle;
}

export const FONT_FAMILIES = [
  { value: '__default', label: 'Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'PT Sans', label: 'PT Sans' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville' },
] as const;

// Track loaded fonts to avoid duplicate link tags
const loadedFonts = new Set<string>();

export function loadGoogleFont(fontFamily: string) {
  if (!fontFamily || loadedFonts.has(fontFamily)) return;

  const formatted = fontFamily.replace(/\s+/g, '+');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${formatted}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
}

function buildCSSRule(style: TypographyStyle): string {
  const rules: string[] = [];
  if (style.fontFamily && style.fontFamily !== '__default') {
    rules.push(`font-family: '${style.fontFamily}', sans-serif !important`);
  }
  if (style.fontSize) {
    rules.push(`font-size: ${style.fontSize}px !important`);
  }
  if (style.fontWeight) {
    rules.push(`font-weight: ${style.fontWeight} !important`);
  }
  if (style.fontStyle) {
    rules.push(`font-style: ${style.fontStyle} !important`);
  }
  if (style.textDecoration && style.textDecoration !== 'none') {
    rules.push(`text-decoration: ${style.textDecoration} !important`);
  }
  return rules.join('; ');
}

export function generateTypographyCSS(blockId: string, config: TypographyConfig): string {
  const rules: string[] = [];
  const sel = `#typo-${blockId}`;

  if (config.heading) {
    const headingCSS = buildCSSRule(config.heading);
    if (headingCSS) {
      rules.push(`${sel} h1, ${sel} h2, ${sel} h3, ${sel} h4 { ${headingCSS}; }`);
    }
  }

  if (config.body) {
    const bodyCSS = buildCSSRule(config.body);
    if (bodyCSS) {
      rules.push(`${sel} p, ${sel} span:not(.lucide), ${sel} li, ${sel} td { ${bodyCSS}; }`);
    }
  }

  return rules.join('\n');
}
