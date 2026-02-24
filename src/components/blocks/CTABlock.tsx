import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getButtonStyles, getButtonClassName } from '@/lib/buttonStyles';
import { getTextStyles } from '@/lib/utils';
import type { ButtonColorConfig } from '@/types/database';

interface CTABlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function CTABlock({ content, index }: CTABlockProps) {
  const bgStyle = (content.backgroundStyle as string) || 'gradient';
  const buttonColor = content._buttonColor as ButtonColorConfig | undefined;
  const buttonAlignment = (content._buttonAlignment as string) || 'center';
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const titleHtml = content._titleHtml as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;
  const subtitleHtml = content._subtitleHtml as string | undefined;

  const alignClass =
    buttonAlignment === 'left' ? 'text-left' : buttonAlignment === 'right' ? 'text-right' : 'text-center';

  return (
    <section
      className={`py-20 ${
        bgStyle === 'gradient'
          ? 'bg-gradient-primary text-white'
          : bgStyle === 'image' && content.backgroundImage
          ? 'relative text-white'
          : 'bg-primary text-primary-foreground'
      }`}
      style={
        bgStyle === 'image' && content.backgroundImage
          ? { backgroundImage: `url(${content.backgroundImage})`, backgroundSize: 'cover' }
          : undefined
      }
    >
      {bgStyle === 'image' && content.backgroundImage && (
        <div className="absolute inset-0 bg-black/60" />
      )}
      <div className={`container mx-auto px-4 ${alignClass} relative z-10`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {titleHtml ? (
            <div 
              className="text-3xl md:text-4xl font-bold mb-4"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={getTextStyles(titleColor, titleCss)}
            >
              {content.title as string}
            </h2>
          )}
          {(content.subtitle || subtitleHtml) && (
            subtitleHtml ? (
              <div 
                className={`text-xl opacity-90 mb-8 ${buttonAlignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
                dangerouslySetInnerHTML={{ __html: subtitleHtml }}
              />
            ) : (
              <div 
                className={`text-xl opacity-90 mb-8 ${buttonAlignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
                style={getTextStyles(subtitleColor, subtitleCss)}
                dangerouslySetInnerHTML={{ __html: content.subtitle as string }}
              />
            )
          )}
          {content.buttonText && (
            <Link to={(content.buttonUrl as string) || '#'}>
              <Button
                size="lg"
                variant={buttonColor?.mode === 'custom' ? 'default' : 'secondary'}
                style={getButtonStyles(buttonColor)}
                className={`text-lg px-8 ${getButtonClassName(buttonColor)}`}
              >
                {content.buttonText as string}
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
