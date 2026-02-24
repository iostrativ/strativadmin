import type { ButtonColorConfig } from '@/types/database';
import type { CSSProperties } from 'react';

export function getButtonStyles(colorConfig?: ButtonColorConfig): CSSProperties {
  if (!colorConfig || colorConfig.mode === 'default') {
    return {};
  }

  const style: CSSProperties = {};
  if (colorConfig.backgroundColor) {
    style.backgroundColor = colorConfig.backgroundColor;
    style.borderColor = colorConfig.backgroundColor;
  }
  if (colorConfig.textColor) {
    style.color = colorConfig.textColor;
  }
  return style;
}

export function getButtonClassName(colorConfig?: ButtonColorConfig): string {
  if (colorConfig && colorConfig.mode === 'custom') {
    return 'hover:opacity-90 transition-opacity';
  }
  return '';
}
