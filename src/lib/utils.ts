import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CSSProperties } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert a CSS string to a React CSSProperties object
// Supports: "color: red; font-size: 16px; background: linear-gradient(...)"
export function parseCssToStyle(cssString?: string): CSSProperties | undefined {
  if (!cssString || !cssString.trim()) return undefined;

  const style: Record<string, string> = {};

  // Split by semicolons but handle cases where semicolons appear inside parentheses (e.g. gradients)
  const declarations = cssString.split(/;(?![^(]*\))/);

  for (const declaration of declarations) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;

    // Split on first colon only (value may contain colons, e.g. in URLs)
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const property = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (property && value) {
      // Convert kebab-case to camelCase (e.g., font-size -> fontSize)
      const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      style[camelCaseProperty] = value;
    }
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

// Merge color and CSS styles
export function getTextStyles(color?: string, css?: string): CSSProperties | undefined {
  const cssStyle = parseCssToStyle(css);
  const colorStyle = color ? { color } : undefined;

  if (!cssStyle && !colorStyle) return undefined;
  return { ...colorStyle, ...cssStyle };
}
