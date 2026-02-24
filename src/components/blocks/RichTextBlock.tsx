import { motion } from 'framer-motion';

interface RichTextBlockProps {
  content: Record<string, unknown>;
  index: number;
}

// Helper to render styled text with HTML, CSS, or plain text modes
function renderStyledText(
  text: string | undefined,
  options: {
    htmlContent?: string;
    cssContent?: string;
    colorValue?: string;
    className?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'span' | 'p';
  }
) {
  if (!text && !options.htmlContent) return null;

  const { htmlContent, cssContent, colorValue, className = '', tag = 'span' } = options;

  // HTML mode takes precedence
  if (htmlContent) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  // CSS mode
  if (cssContent) {
    const Tag = tag;
    return (
      <Tag
        className={className}
        style={parseCssToStyle(cssContent)}
      >
        {text}
      </Tag>
    );
  }

  // Plain text mode
  const Tag = tag;
  return (
    <Tag
      className={className}
      style={colorValue ? { color: colorValue } : undefined}
    >
      {text}
    </Tag>
  );
}

// Parse CSS string to React style object
function parseCssToStyle(css: string): React.CSSProperties {
  const style: Record<string, string> = {};
  const declarations = css.split(';').filter(Boolean);
  
  declarations.forEach(declaration => {
    const [property, value] = declaration.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      style[camelProperty] = value;
    }
  });
  
  return style as React.CSSProperties;
}

export function RichTextBlock({ content, index }: RichTextBlockProps) {
  const heading = content.heading as string | undefined;
  const featuredLabel = content.featuredLabel as string | undefined;
  const richContent = content.content as string | undefined;
  const contentHtml = content._contentHtml as string | undefined;
  const contentCss = content._contentCss as string | undefined;
  const contentColor = content._contentColor as string | undefined;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Featured Label */}
          {(featuredLabel || content._featuredLabelHtml) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              {renderStyledText(featuredLabel, {
                htmlContent: content._featuredLabelHtml as string | undefined,
                cssContent: content._featuredLabelCss as string | undefined,
                colorValue: content._featuredLabelColor as string | undefined,
                className: "text-sm font-semibold text-primary uppercase tracking-wider",
                tag: 'span',
              })}
            </motion.div>
          )}

          {/* Heading */}
          {(heading || content._headingHtml) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.05 }}
              className="mb-8"
            >
              {renderStyledText(heading, {
                htmlContent: content._headingHtml as string | undefined,
                cssContent: content._headingCss as string | undefined,
                colorValue: content._headingColor as string | undefined,
                className: "text-3xl md:text-4xl font-bold",
                tag: 'h2',
              })}
            </motion.div>
          )}

          {/* Rich Text Content */}
          {(richContent || contentHtml) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              {contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <div 
                  className="prose prose-lg dark:prose-invert"
                  style={contentCss ? parseCssToStyle(contentCss) : contentColor ? { color: contentColor } : undefined}
                  dangerouslySetInnerHTML={{ __html: richContent || '' }}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
