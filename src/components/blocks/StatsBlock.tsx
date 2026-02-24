import { motion } from 'framer-motion';
import { getTextStyles } from '@/lib/utils';

interface StatsBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function StatsBlock({ content, index }: StatsBlockProps) {
  const items = (content.items as Array<{ value: string; label: string; suffix?: string }>) || [];
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {content.title && (
          <h2 
            className="text-3xl font-bold mb-12 text-center"
            style={getTextStyles(titleColor, titleCss)}
          >
            {content.title as string}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary">
                {item.value}{item.suffix}
              </div>
              <div className="text-muted-foreground mt-2">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
