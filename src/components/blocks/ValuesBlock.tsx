import { motion } from 'framer-motion';
import {
  Target,
  Heart,
  Users,
  Award,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { getTextStyles } from '@/lib/utils';
import type { ValuesBlockContent } from '@/types/database';

interface ValuesBlockProps {
  content: ValuesBlockContent;
  index: number;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  target: Target,
  heart: Heart,
  users: Users,
  award: Award,
  zap: Zap,
  shield: Shield,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  star: Star,
  lightbulb: Lightbulb,
};

export function ValuesBlock({ content, index }: ValuesBlockProps) {
  const { title, subtitle, items, columns = 4 } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;
  const subtitleColor = (content as Record<string, unknown>)._subtitleColor as string | undefined;
  const subtitleCss = (content as Record<string, unknown>)._subtitleCss as string | undefined;

  if (!items || items.length === 0) return null;

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName.toLowerCase()] || Target;
    return Icon;
  };

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {title && (
            <h2 
              className="text-3xl font-bold mb-4 text-center"
              style={getTextStyles(titleColor, titleCss)}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p 
              className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
              style={getTextStyles(subtitleColor, subtitleCss)}
            >
              {subtitle}
            </p>
          )}

          <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
            {items.map((item, i) => {
              const Icon = getIcon(item.icon);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <div 
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
