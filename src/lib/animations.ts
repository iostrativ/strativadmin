import type { Variants, Transition } from 'framer-motion';

export interface AnimationConfig {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  triggerOn: 'load' | 'scroll';
}

export const defaultAnimationConfig: AnimationConfig = {
  type: 'fade',
  direction: 'up',
  duration: 0.6,
  delay: 0,
  easing: 'ease-out',
  triggerOn: 'scroll',
};

export const ANIMATION_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'flip', label: 'Flip' },
  { value: 'rotate', label: 'Rotate' },
] as const;

export const DIRECTIONS = [
  { value: 'up', label: 'Up' },
  { value: 'down', label: 'Down' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const;

export const EASINGS = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
] as const;

export const TRIGGERS = [
  { value: 'load', label: 'On Page Load' },
  { value: 'scroll', label: 'On Scroll Into View' },
] as const;

export const SPEED_PRESETS = [
  { value: 'slow', label: 'Slow', duration: 1.2 },
  { value: 'normal', label: 'Normal', duration: 0.6 },
  { value: 'fast', label: 'Fast', duration: 0.3 },
] as const;

// Which animation types support direction
export function supportsDirection(type: string): boolean {
  return ['fade', 'slide', 'zoom', 'bounce', 'flip', 'rotate'].includes(type);
}

function getSlideOffset(direction: string, distance = 60): { x?: number; y?: number } {
  switch (direction) {
    case 'up': return { y: distance };
    case 'down': return { y: -distance };
    case 'left': return { x: distance };
    case 'right': return { x: -distance };
    default: return { y: distance };
  }
}

function getEasingValue(easing: string): number[] | undefined {
  switch (easing) {
    case 'ease': return [0.25, 0.1, 0.25, 1];
    case 'ease-in': return [0.42, 0, 1, 1];
    case 'ease-out': return [0, 0, 0.58, 1];
    case 'ease-in-out': return [0.42, 0, 0.58, 1];
    default: return undefined; // spring uses different config
  }
}

export function generateVariants(config: AnimationConfig): Variants {
  if (config.type === 'none') {
    return { hidden: {}, visible: {} };
  }

  const dir = config.direction || 'up';
  const slideOffset = getSlideOffset(dir, 60);
  const smallOffset = getSlideOffset(dir, 30);

  switch (config.type) {
    case 'fade':
      return {
        hidden: { opacity: 0, ...smallOffset },
        visible: { opacity: 1, x: 0, y: 0 },
      };

    case 'slide':
      return {
        hidden: { opacity: 0, ...slideOffset },
        visible: { opacity: 1, x: 0, y: 0 },
      };

    case 'zoom': {
      // Zoom in from direction
      const zoomOffset = getSlideOffset(dir, 20);
      return {
        hidden: { opacity: 0, scale: 0.8, ...zoomOffset },
        visible: { opacity: 1, scale: 1, x: 0, y: 0 },
      };
    }

    case 'bounce': {
      // Bounce from direction
      const bounceOffset = getSlideOffset(dir, 40);
      return {
        hidden: { opacity: 0, scale: 0.95, ...bounceOffset },
        visible: { opacity: 1, scale: 1, x: 0, y: 0 },
      };
    }

    case 'flip': {
      // Flip axis based on direction
      const isHorizontal = dir === 'left' || dir === 'right';
      const flipSign = (dir === 'down' || dir === 'right') ? -1 : 1;
      if (isHorizontal) {
        return {
          hidden: { opacity: 0, rotateY: 90 * flipSign },
          visible: { opacity: 1, rotateY: 0 },
        };
      }
      return {
        hidden: { opacity: 0, rotateX: 90 * flipSign },
        visible: { opacity: 1, rotateX: 0 },
      };
    }

    case 'rotate': {
      // Rotate direction determines rotation sign and slight offset
      const rotateSign = (dir === 'right' || dir === 'down') ? 1 : -1;
      const rotateOffset = getSlideOffset(dir, 15);
      return {
        hidden: { opacity: 0, rotate: 10 * rotateSign, scale: 0.9, ...rotateOffset },
        visible: { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 },
      };
    }

    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
}

export function generateTransition(config: AnimationConfig): Transition {
  const base: Transition = {
    duration: config.duration,
    delay: config.delay,
  };

  if (config.easing === 'spring') {
    // Adjust spring params based on duration for speed feel
    const stiffness = Math.max(50, 200 / (config.duration || 0.6));
    return {
      ...base,
      type: 'spring',
      stiffness,
      damping: 15,
    };
  }

  if (config.type === 'bounce') {
    return {
      ...base,
      type: 'spring',
      stiffness: 300,
      damping: 12,
    };
  }

  return {
    ...base,
    ease: getEasingValue(config.easing),
  };
}

// Get the closest speed preset for a given duration
export function getSpeedPreset(duration: number): string {
  if (duration >= 0.9) return 'slow';
  if (duration <= 0.4) return 'fast';
  return 'normal';
}
