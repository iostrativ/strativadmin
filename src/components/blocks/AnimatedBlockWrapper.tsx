import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  generateVariants,
  generateTransition,
  defaultAnimationConfig,
  type AnimationConfig,
} from '@/lib/animations';

interface AnimatedBlockWrapperProps {
  children: React.ReactNode;
  animation?: AnimationConfig;
  index: number;
}

export function AnimatedBlockWrapper({ children, animation, index }: AnimatedBlockWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // If no animation config, use default fade-up with index-based delay (backward compat)
  const config: AnimationConfig = animation || {
    ...defaultAnimationConfig,
    delay: index * 0.1,
  };

  if (config.type === 'none') {
    return <>{children}</>;
  }

  const variants = generateVariants(config);
  const transition = generateTransition(config);

  const shouldAnimate = config.triggerOn === 'load' ? true : isInView;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
