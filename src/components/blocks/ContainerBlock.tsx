import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { NestedBlock } from '@/types/database';
import { BlockRenderer } from './BlockRenderer';
import type { PageSection } from '@/types/database';
import { generateVariants, generateTransition, type AnimationConfig, defaultAnimationConfig } from '@/lib/animations';

// Hook to detect mobile viewport
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

interface ContainerBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function ContainerBlock({ content, index }: ContainerBlockProps) {
  const children = (content.children as NestedBlock[]) || [];
  const layout = content._containerLayout as 'flex' | 'grid' | 'absolute' || 'flex';
  const gap = (content._gap as number) || 16;
  const direction = (content._direction as 'row' | 'column') || 'column';
  const columns = (content._columns as number) || 2;
  const alignItems = (content._alignItems as string) || 'stretch';
  const justifyContent = (content._justifyContent as string) || 'flex-start';
  const isMobile = useIsMobile();

  // On mobile, force nested blocks to stack vertically (override absolute positioning)
  const effectiveLayout = isMobile && layout === 'absolute' ? 'flex' : layout;
  const effectiveDirection = isMobile && layout === 'absolute' ? 'column' : direction;

  const containerStyle: React.CSSProperties = 
    effectiveLayout === 'grid'
      ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }
      : effectiveLayout === 'absolute'
      ? {
          position: 'relative',
          height: '200px',
        }
      : {
          display: 'flex',
          flexDirection: effectiveDirection,
          gap: `${gap}px`,
          alignItems,
          justifyContent,
        };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div style={containerStyle}>
          {children.map((child, childIndex) => (
            <NestedBlockRenderer
              key={child.id}
              block={child}
              index={index + childIndex * 0.1}
              parentLayout={effectiveLayout}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface NestedBlockRendererProps {
  block: NestedBlock;
  index: number;
  parentLayout?: 'flex' | 'grid' | 'absolute';
}

export function NestedBlockRenderer({ block, index, parentLayout }: NestedBlockRendererProps) {
  const isMobile = useIsMobile();
  
  // On mobile, force to flex layout instead of absolute
  const effectiveParentLayout = isMobile && parentLayout === 'absolute' ? 'flex' : parentLayout;
  
  // Get animation config from block content or use default
  const animation = (block.content._animation as AnimationConfig) || defaultAnimationConfig;
  const variants = generateVariants(animation);
  const transition = generateTransition(animation);

  // Convert nested block to PageSection format for BlockRenderer
  const section: PageSection = {
    id: block.id,
    page_id: '',
    block_type: block.block_type,
    content: {
      ...block.content,
      // Include animation config in content for inner blocks
      _animation: animation,
    },
    sort_order: 0,
    is_visible: block.is_visible,
    created_at: '',
    updated_at: '',
  };

  // Style for positioned layout - use same default as InteractiveNestedBlock
  // On mobile (effectiveParentLayout is 'flex'), stack blocks vertically with full width
  const blockHeight = typeof block.layout?.height === 'number' ? block.layout.height : 0;
  const positionStyle: React.CSSProperties =
    effectiveParentLayout === 'absolute'
      ? {
          position: 'absolute',
          left: `${block.layout.x}%`,
          top: `${block.layout.y}px`,
          width: `${block.layout.width}%`,
          height: blockHeight > 0 ? `${blockHeight}px` : '60px',
          zIndex: block.layout.zIndex || 1,
        }
      : {
          // Flex/mobile layout: stack vertically with full width
          position: 'relative',
          width: '100%',
          marginBottom: '16px',
        };

  if (!block.is_visible) return null;

  const triggerOnScroll = animation.triggerOn === 'scroll';

  // Container blocks render their children
  if (block.block_type === 'container') {
    return (
      <motion.div
        style={positionStyle}
        variants={variants}
        initial="hidden"
        whileInView={triggerOnScroll ? 'visible' : undefined}
        animate={!triggerOnScroll ? 'visible' : undefined}
        transition={transition}
        viewport={{ once: true, margin: '-100px' }}
      >
        <ContainerBlock
          content={{ ...block.content, children: block.children }}
          index={index}
        />
      </motion.div>
    );
  }

  // Regular blocks
  return (
    <motion.div
      style={positionStyle}
      variants={variants}
      initial="hidden"
      whileInView={triggerOnScroll ? 'visible' : undefined}
      animate={!triggerOnScroll ? 'visible' : undefined}
      transition={transition}
      viewport={{ once: true, margin: '-100px' }}
    >
      <BlockRenderer section={section} index={index} />
    </motion.div>
  );
}

export default ContainerBlock;
