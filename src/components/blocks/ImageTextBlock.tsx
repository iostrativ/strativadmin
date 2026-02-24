import { motion } from 'framer-motion';
import { getTextStyles } from '@/lib/utils';

interface ImageTextBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function ImageTextBlock({ content, index }: ImageTextBlockProps) {
  const imagePosition = (content.imagePosition as string) || 'left';
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const titleHtml = content._titleHtml as string | undefined;
  const contentColor = content._contentColor as string | undefined;
  const contentCss = content._contentCss as string | undefined;
  const contentHtml = content._contentHtml as string | undefined;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
          imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
        }`}>
          <motion.div
            initial={{ opacity: 0, x: imagePosition === 'left' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={imagePosition === 'right' ? 'lg:order-2' : ''}
          >
            <img
              src={(content.imageUrl as string) || '/placeholder.svg'}
              alt={(content.imageAlt as string) || ''}
              className="w-full rounded-xl shadow-lg"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: imagePosition === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className={imagePosition === 'right' ? 'lg:order-1' : ''}
          >
            {(content.title || titleHtml) && (
              titleHtml ? (
                <div 
                  className="text-3xl font-bold mb-4"
                  dangerouslySetInnerHTML={{ __html: titleHtml }}
                />
              ) : (
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={getTextStyles(titleColor, titleCss)}
                >
                  {content.title as string}
                </h2>
              )
            )}
            {contentHtml ? (
              <div 
                className="prose dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <div 
                className="prose dark:prose-invert"
                style={getTextStyles(contentColor, contentCss)}
                dangerouslySetInnerHTML={{ __html: content.content as string }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
