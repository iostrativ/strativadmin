import { motion } from 'framer-motion';
import { getTextStyles } from '@/lib/utils';
import type { TimelineBlockContent } from '@/types/database';

interface TimelineBlockProps {
  content: TimelineBlockContent;
  index: number;
}

export function TimelineBlock({ content, index }: TimelineBlockProps) {
  const { title, subtitle, items } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;
  const subtitleColor = (content as Record<string, unknown>)._subtitleColor as string | undefined;
  const subtitleCss = (content as Record<string, unknown>)._subtitleCss as string | undefined;

  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="max-w-4xl mx-auto"
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

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline items */}
            <div className="space-y-12">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.1 }}
                  className={`relative flex items-center ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Year badge */}
                  <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm z-10 shadow-lg">
                    {item.year}
                  </div>

                  {/* Content */}
                  <div
                    className={`ml-28 md:ml-0 md:w-5/12 ${
                      i % 2 === 0 ? 'md:text-right md:pr-16' : 'md:pl-16'
                    }`}
                  >
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <div 
                        className="text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
