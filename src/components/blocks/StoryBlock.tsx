import { motion } from 'framer-motion';
import { getTextStyles } from '@/lib/utils';
import type { StoryBlockContent } from '@/types/database';

interface StoryBlockProps {
  content: StoryBlockContent;
  index: number;
}

export function StoryBlock({ content, index }: StoryBlockProps) {
  const { title, paragraphs, stats } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;

  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Story text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 
              className="text-3xl font-bold mb-6"
              style={getTextStyles(titleColor, titleCss)}
            >
              {title}
            </h2>
            <div className="space-y-4">
              {paragraphs.map((paragraph, i) => (
                <div 
                  key={i} 
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          </motion.div>

          {/* Stats overlay */}
          {stats && Object.keys(stats).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-primary text-white rounded-xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-8">
                  {Object.entries(stats).map(([key, value], i) => {
                    if (!value) return null;

                    // Convert camelCase to Title Case
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 + i * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-4xl font-bold mb-2">{value}</div>
                        <div className="text-sm opacity-90">{label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
