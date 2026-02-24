import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getTextStyles } from '@/lib/utils';

interface FAQBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function FAQBlock({ content, index }: FAQBlockProps) {
  const items = (content.items as Array<{ question: string; answer: string }>) || [];
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {content.title && (
            <h2 
              className="text-3xl font-bold mb-8 text-center"
              style={getTextStyles(titleColor, titleCss)}
            >
              {content.title as string}
            </h2>
          )}
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-semibold">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
