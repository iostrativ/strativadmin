import { useEffect, useRef, useState } from 'react';
import type { PageSection, NestedBlock } from '@/types/database';
import type { AnimationConfig } from '@/lib/animations';
import { type TypographyConfig, generateTypographyCSS, loadGoogleFont } from '@/lib/typography';
import { AnimatedBlockWrapper } from './AnimatedBlockWrapper';
import { BackgroundRenderer, type BackgroundConfig } from '@/components/admin/BackgroundEditor';
import { getDefaultBlockDimensions } from '@/components/admin/visual-builder/defaultContent';
import { HeroBlock } from './HeroBlock';
import { RichTextBlock } from './RichTextBlock';
import { ImageTextBlock } from './ImageTextBlock';
import { FAQBlock } from './FAQBlock';
import { StatsBlock } from './StatsBlock';
import { CTABlock } from './CTABlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { ServicesBlock } from './ServicesBlock';
import { PortfolioBlock } from './PortfolioBlock';
import { TeamBlock } from './TeamBlock';
import { ClientsBlock } from './ClientsBlock';
import { TimelineBlock } from './TimelineBlock';
import { ValuesBlock } from './ValuesBlock';
import { StoryBlock } from './StoryBlock';
import { WhyChooseBlock } from './WhyChooseBlock';
import { ContactFormBlock } from './ContactFormBlock';
import { ContactInfoBlock } from './ContactInfoBlock';
import { BlogGridBlock } from './BlogGridBlock';
import { CategoryFilterBlock } from './CategoryFilterBlock';
import { PricingBlock } from './PricingBlock';
import { ButtonBlock } from './ButtonBlock';
import { ContainerBlock, NestedBlockRenderer } from './ContainerBlock';
import { InteractiveNestedBlock } from '@/components/admin/visual-builder/InteractiveNestedBlock';

interface BlockRendererProps {
  section: PageSection;
  index: number;
  isPreview?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  // Nested block interaction callbacks (for visual builder)
  selectedNestedBlockId?: string | null;
  onSelectNestedBlock?: (id: string) => void;
  onNestedLayoutChange?: (blockId: string, nestedId: string, layout: Partial<NestedBlock['layout']>) => void;
  // Parent block resize callback
  onBlockResize?: (blockId: string, height: number) => void;
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  rich_text: 'Rich Text',
  image_text: 'Image + Text',
  faq: 'FAQ',
  stats: 'Statistics',
  cta: 'Call to Action',
  testimonials: 'Testimonials',
  services: 'Services',
  portfolio: 'Portfolio',
  team: 'Team',
  clients: 'Clients',
  timeline: 'Timeline',
  values: 'Values',
  story: 'Story',
  why_choose: 'Why Choose Us',
  contact_form: 'Contact Form',
  contact_info: 'Contact Info',
  blog_grid: 'Blog Grid',
  category_filter: 'Category Filter',
  pricing: 'Pricing',
  button: 'Button',
  container: 'Container',
};

function TypographyWrapper({
  children,
  blockId,
  typography,
}: {
  children: React.ReactNode;
  blockId: string;
  typography?: TypographyConfig;
}) {
  // Load Google Fonts when typography config has custom fonts
  useEffect(() => {
    if (typography?.heading?.fontFamily) loadGoogleFont(typography.heading.fontFamily);
    if (typography?.body?.fontFamily) loadGoogleFont(typography.body.fontFamily);
  }, [typography?.heading?.fontFamily, typography?.body?.fontFamily]);

  if (!typography || (!typography.heading && !typography.body)) {
    return <>{children}</>;
  }

  const css = generateTypographyCSS(blockId, typography);
  if (!css) return <>{children}</>;

  return (
    <div id={`typo-${blockId}`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </div>
  );
}

function BackgroundWrapper({
  children,
  background,
}: {
  children: React.ReactNode;
  background?: BackgroundConfig;
}) {
  if (!background || background.type === 'none') {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <BackgroundRenderer config={background} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function BlockRenderer({ 
  section, 
  index, 
  isPreview, 
  isSelected, 
  onSelect,
  selectedNestedBlockId,
  onSelectNestedBlock,
  onNestedLayoutChange,
  onBlockResize,
}: BlockRendererProps) {
  const content = section.content as Record<string, unknown>;
  const nestedContainerRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile viewport for responsive nested block layout
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Get block's custom height from content
  const blockHeight = content._height as number | undefined;
  
  // Get nested children (available for all block types)
  const nestedChildren = (content.children as NestedBlock[]) || [];
  const hasNestedChildren = nestedChildren.length > 0 && section.block_type !== 'container'; // Container handles its own children

  const blockElement = (() => {
    switch (section.block_type) {
      case 'hero':
        return <HeroBlock content={content} index={index} />;
      case 'rich_text':
        return <RichTextBlock content={content} index={index} />;
      case 'image_text':
        return <ImageTextBlock content={content} index={index} />;
      case 'faq':
        return <FAQBlock content={content} index={index} />;
      case 'stats':
        return <StatsBlock content={content} index={index} />;
      case 'cta':
        return <CTABlock content={content} index={index} />;
      case 'testimonials':
        return <TestimonialsBlock content={content} index={index} />;
      case 'services':
        return <ServicesBlock content={content} index={index} />;
      case 'portfolio':
        return <PortfolioBlock content={content} index={index} />;
      case 'team':
        return <TeamBlock content={content} index={index} />;
      case 'clients':
        return <ClientsBlock content={content} index={index} />;
      case 'timeline':
        return <TimelineBlock content={content as any} index={index} />;
      case 'values':
        return <ValuesBlock content={content as any} index={index} />;
      case 'story':
        return <StoryBlock content={content as any} index={index} />;
      case 'why_choose':
        return <WhyChooseBlock content={content as any} index={index} />;
      case 'contact_form':
        return <ContactFormBlock content={content as any} index={index} />;
      case 'contact_info':
        return <ContactInfoBlock content={content as any} index={index} />;
      case 'blog_grid':
        return <BlogGridBlock content={content as any} index={index} />;
      case 'category_filter':
        return <CategoryFilterBlock content={content as any} index={index} />;
      case 'pricing':
        return <PricingBlock content={content} index={index} />;
      case 'button':
        return <ButtonBlock content={content} index={index} />;
      case 'container':
        return <ContainerBlock content={content} index={index} />;
      default:
        return null;
    }
  })();

  if (!blockElement) return null;

  const typographyConfig = content._typography as TypographyConfig | undefined;
  const backgroundConfig = content._background as BackgroundConfig | undefined;

  // In preview mode with interactive handles, always use absolute layout for nested blocks
  const needsAbsoluteLayout = hasNestedChildren;
  const nestedLayout = 'absolute';

  // SINGLE height calculation function used by both preview and public modes
  const calculateRequiredNestedHeight = (): number => {
    if (!hasNestedChildren) return 0;
    let maxBottom = 0;
    nestedChildren.forEach(child => {
      const y = child.layout?.y ?? 0;
      const height = typeof child.layout?.height === 'number' && child.layout.height > 0 
        ? child.layout.height 
        : getDefaultBlockDimensions(child.block_type).height;
      const bottom = y + height;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    return maxBottom;
  };

  // Calculate effective height: user-set height or nested content needs + padding
  const nestedRequiredHeight = calculateRequiredNestedHeight();
  const effectiveHeight = blockHeight !== undefined 
    ? Math.max(blockHeight, nestedRequiredHeight + 30) 
    : (hasNestedChildren ? nestedRequiredHeight + 30 : undefined);

  // Handler for nested block layout changes
  const handleNestedLayoutChange = (nestedId: string, layout: Partial<NestedBlock['layout']>) => {
    onNestedLayoutChange?.(section.id, nestedId, layout);
  };
  
  // Combine main block with nested children
  // Nested container must OVERLAY on top of parent content, not stack below it
  // On mobile (public mode only), switch to stacked layout
  const useMobileLayout = !isPreview && isMobile;
  
  const combinedContent = (
    <div style={{ 
      position: 'relative', 
      minHeight: !useMobileLayout && effectiveHeight ? `${effectiveHeight}px` : undefined 
    }}>
      {/* Parent block content */}
      {blockElement}
      {/* Nested blocks overlay on top (desktop/preview) or stacked (mobile public) */}
      {hasNestedChildren && (
        <div 
          ref={nestedContainerRef}
          className="nested-children-wrapper"
          style={useMobileLayout ? {
            // Mobile public mode: stack blocks vertically
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px 0',
          } : { 
            // Desktop/preview mode: absolute overlay
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none', // Allow clicks to pass through to parent content
          }}
        >
          {nestedChildren.filter(child => child.is_visible !== false).map((child, childIndex) => (
            isPreview && onNestedLayoutChange ? (
              <InteractiveNestedBlock
                key={child.id}
                block={child}
                index={childIndex}
                parentLayout={nestedLayout}
                isSelected={selectedNestedBlockId === child.id}
                onSelect={onSelectNestedBlock || (() => {})}
                onLayoutChange={handleNestedLayoutChange}
                containerRef={nestedContainerRef}
              />
            ) : (
              // Public mode: absolute on desktop, flex on mobile
              <div key={child.id} style={{ pointerEvents: 'auto' }}>
                <NestedBlockRenderer
                  block={child}
                  index={childIndex}
                  parentLayout={useMobileLayout ? 'flex' : 'absolute'}
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );

  // Public mode: wrap in animated wrapper + typography + background
  if (!isPreview) {
    const animationConfig = content._animation as AnimationConfig | undefined;
    return (
      <BackgroundWrapper background={backgroundConfig}>
        <TypographyWrapper blockId={section.id} typography={typographyConfig}>
          <AnimatedBlockWrapper animation={animationConfig} index={index}>
            {combinedContent}
          </AnimatedBlockWrapper>
        </TypographyWrapper>
      </BackgroundWrapper>
    );
  }

  // Handle parent block resize
  const handleBlockResizeStart = (e: React.MouseEvent) => {
    if (!onBlockResize || !blockRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const startY = e.clientY;
    const startHeight = blockRef.current.getBoundingClientRect().height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(100, startHeight + deltaY);
      onBlockResize(section.id, newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Preview mode: wrap with selectable overlay + typography + background + resize handles
  return (
    <BackgroundWrapper background={backgroundConfig}>
      <TypographyWrapper blockId={section.id} typography={typographyConfig}>
        <div
          ref={blockRef}
          className={`relative group cursor-pointer transition-all ${
            isSelected
            ? 'ring-2 ring-primary ring-offset-2'
            : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1'
        }`}
          style={{ 
            height: effectiveHeight ? `${effectiveHeight}px` : undefined,
            // Remove minHeight, always use height for parent block
          }}
          onClick={(e) => {
          e.stopPropagation();
          onSelect?.(section.id);
        }}
      >
        {/* Block type label */}
        <div
          className={`absolute top-2 left-2 z-20 px-2 py-1 text-xs font-medium rounded shadow-sm transition-opacity ${
            isSelected
              ? 'bg-primary text-primary-foreground opacity-100'
              : 'bg-black/70 text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          {BLOCK_TYPE_LABELS[section.block_type] || section.block_type}
        </div>

        {/* Original block content */}
        <div className="pointer-events-none">
          {blockElement}
        </div>
        
        {/* Nested children - positioned absolutely within parent */}
        {hasNestedChildren && (
          <div 
            ref={nestedContainerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            {nestedChildren.filter(child => child.is_visible !== false).map((child, childIndex) => (
              onNestedLayoutChange ? (
                <div key={child.id} className="pointer-events-auto">
                  <InteractiveNestedBlock
                    block={child}
                    index={childIndex}
                    parentLayout={nestedLayout}
                    isSelected={selectedNestedBlockId === child.id}
                    onSelect={onSelectNestedBlock || (() => {})}
                    onLayoutChange={handleNestedLayoutChange}
                    containerRef={blockRef}
                  />
                </div>
              ) : (
                <NestedBlockRenderer
                  key={child.id}
                  block={child}
                  index={childIndex}
                  parentLayout={nestedLayout}
                />
              )
            ))}
          </div>
        )}

        {/* Parent resize handles - show when selected or hovered */}
        {isPreview && onBlockResize && (
          <>
            {/* Bottom center handle */}
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-50 cursor-s-resize pointer-events-auto transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={handleBlockResizeStart}
              title="Drag to resize height"
            >
              <div className="w-12 h-3 bg-primary rounded-full flex items-center justify-center shadow-md">
                <div className="w-6 h-0.5 bg-white rounded-full" />
              </div>
            </div>
            
            {/* Bottom-right corner handle */}
            <div
              className={`absolute -bottom-1.5 -right-1.5 z-50 w-3 h-3 bg-primary rounded-full cursor-se-resize pointer-events-auto shadow-md transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={handleBlockResizeStart}
              title="Drag to resize"
            />
            
            {/* Bottom-left corner handle */}
            <div
              className={`absolute -bottom-1.5 -left-1.5 z-50 w-3 h-3 bg-primary rounded-full cursor-sw-resize pointer-events-auto shadow-md transition-opacity ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onMouseDown={handleBlockResizeStart}
              title="Drag to resize"
            />
          </>
        )}
        
        {/* Nested blocks indicator badge */}
        {hasNestedChildren && (
          <div className="absolute top-2 right-2 z-20 px-2 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded">
            {nestedChildren.length} nested
          </div>
        )}
      </div>
    </TypographyWrapper>
    </BackgroundWrapper>
  );
}
