import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getButtonStyles, getButtonClassName } from '@/lib/buttonStyles';
import type { ButtonColorConfig } from '@/types/database';

interface ButtonBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function ButtonBlock({ content, index }: ButtonBlockProps) {
  const text = (content.text as string) || 'Button';
  const url = (content.url as string) || '#';
  const variant = (content.variant as 'default' | 'outline' | 'secondary' | 'ghost' | 'link') || 'default';
  const size = (content.size as 'default' | 'sm' | 'lg') || 'default';
  const alignment = (content.alignment as string) || 'center';
  const openInNewTab = (content.openInNewTab as boolean) || false;
  const buttonColor = content._buttonColor as ButtonColorConfig | undefined;

  const alignClass =
    alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';

  const linkProps = openInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex ${alignClass}`}
        >
          <Link to={url} {...linkProps}>
            <Button
              size={size}
              variant={buttonColor?.mode === 'custom' ? 'default' : variant}
              style={getButtonStyles(buttonColor)}
              className={getButtonClassName(buttonColor)}
            >
              {text}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
