import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { getTextStyles } from '@/lib/utils';
import type { WhyChooseBlockContent } from '@/types/database';

interface WhyChooseBlockProps {
  content: WhyChooseBlockContent;
  index: number;
}

export function WhyChooseBlock({ content, index }: WhyChooseBlockProps) {
  const { title, reasons, stats } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;

  if (!reasons || reasons.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <h2 
            className="text-3xl font-bold mb-12 text-center"
            style={getTextStyles(titleColor, titleCss)}
          >
            {title}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Reasons list */}
            <div className="space-y-4">
              {reasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{reason}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats grid */}
            {stats && Object.keys(stats).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="grid grid-cols-2 gap-6"
              >
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
                      className="bg-card border border-border rounded-lg p-6 text-center"
                    >
                      <div className="text-3xl font-bold text-primary mb-2">
                        {value}
                      </div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
