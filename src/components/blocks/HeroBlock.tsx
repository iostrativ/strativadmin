import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getButtonStyles, getButtonClassName } from '@/lib/buttonStyles';
import { getTextStyles } from '@/lib/utils';
import type { ButtonColorConfig } from '@/types/database';

interface HeroBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function HeroBlock({ content, index }: HeroBlockProps) {
  const alignment = (content.alignment as string) || 'center';
  const textAlign = alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center';
  const itemsAlign = alignment === 'left' ? 'items-start' : alignment === 'right' ? 'items-end' : 'items-center';

  // Legacy background support (for backward compatibility)
  // If new _background is set, skip legacy background rendering (handled by BlockRenderer)
  const hasNewBackground = content._background && (content._background as { type?: string }).type !== 'none';
  const backgroundType = hasNewBackground ? 'none' : (content.backgroundType as string) || 'none';
  const backgroundImage = content.backgroundImage as string;
  const backgroundVideo = content.backgroundVideo as string;

  const primaryButtonColor = content._primaryButtonColor as ButtonColorConfig | undefined;
  const secondaryButtonColor = content._secondaryButtonColor as ButtonColorConfig | undefined;
  const buttonAlignment = (content._buttonAlignment as string) || alignment;
  const buttonOrder = (content._buttonOrder as string) || 'primary-secondary';
  const headlineColor = content._headlineColor as string | undefined;
  const headlineCss = content._headlineCss as string | undefined;
  const headlineHtml = content._headlineHtml as string | undefined;
  const subheadlineColor = content._subheadlineColor as string | undefined;
  const subheadlineCss = content._subheadlineCss as string | undefined;
  const subheadlineHtml = content._subheadlineHtml as string | undefined;

  const btnAlignClass =
    buttonAlignment === 'left' ? 'justify-start' : buttonAlignment === 'right' ? 'justify-end' : 'justify-center';

  const primaryBtn = content.primaryButtonText ? (
    <Link key="primary" to={(content.primaryButtonUrl as string) || '#'}>
      <Button
        size="lg"
        variant={primaryButtonColor?.mode === 'custom' ? 'default' : 'default'}
        style={getButtonStyles(primaryButtonColor)}
        className={getButtonClassName(primaryButtonColor)}
      >
        {content.primaryButtonText as string}
      </Button>
    </Link>
  ) : null;

  const secondaryBtn = content.secondaryButtonText ? (
    <Link key="secondary" to={(content.secondaryButtonUrl as string) || '#'}>
      <Button
        size="lg"
        variant={secondaryButtonColor?.mode === 'custom' ? 'default' : 'outline'}
        style={getButtonStyles(secondaryButtonColor)}
        className={getButtonClassName(secondaryButtonColor)}
      >
        {content.secondaryButtonText as string}
      </Button>
    </Link>
  ) : null;

  const buttons = buttonOrder === 'secondary-primary'
    ? [secondaryBtn, primaryBtn]
    : [primaryBtn, secondaryBtn];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Image */}
      {backgroundType === 'image' && backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </>
      )}

      {/* Background Video */}
      {backgroundType === 'video' && backgroundVideo && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''} flex flex-col ${itemsAlign}`}
        >
          {headlineHtml ? (
            <div 
              className={`text-4xl md:text-6xl font-bold mb-6 ${textAlign}`}
              dangerouslySetInnerHTML={{ __html: headlineHtml }}
            />
          ) : (
            <h1 
              className={`text-4xl md:text-6xl font-bold mb-6 ${textAlign}`}
              style={getTextStyles(headlineColor, headlineCss)}
            >
              {content.headline as string}
            </h1>
          )}
          {(content.subheadline || subheadlineHtml) && (
            subheadlineHtml ? (
              <div 
                className={`text-xl text-muted-foreground mb-8 ${textAlign}`}
                dangerouslySetInnerHTML={{ __html: subheadlineHtml }}
              />
            ) : (
              <div 
                className={`text-xl text-muted-foreground mb-8 ${textAlign}`}
                style={getTextStyles(subheadlineColor, subheadlineCss)}
                dangerouslySetInnerHTML={{ __html: content.subheadline as string }}
              />
            )
          )}
          <div className={`flex flex-wrap gap-4 ${btnAlignClass}`}>
            {buttons}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
