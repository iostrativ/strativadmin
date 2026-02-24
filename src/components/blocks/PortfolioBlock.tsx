import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePortfolioItems, useFeaturedPortfolio } from '@/hooks/usePortfolio';
import { getTextStyles } from '@/lib/utils';

interface PortfolioBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function PortfolioBlock({ content, index }: PortfolioBlockProps) {
  const featuredOnly = content.featuredOnly !== false;
  const { data: allPortfolio } = usePortfolioItems(true);
  const { data: featuredPortfolio } = useFeaturedPortfolio();
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;

  const portfolio = featuredOnly ? featuredPortfolio : allPortfolio;

  if (!portfolio?.length) return null;

  const limit = (content.limit as number) || 6;
  const portfolioIds = content.portfolioIds as string[] | undefined;

  let filteredPortfolio = portfolio;

  if (portfolioIds && portfolioIds.length > 0) {
    filteredPortfolio = portfolio.filter(p => portfolioIds.includes(p.id));
  }

  const items = filteredPortfolio.slice(0, limit);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {content.title && (
          <h2 
            className="text-3xl font-bold mb-4 text-center"
            style={getTextStyles(titleColor, titleCss)}
          >
            {content.title as string}
          </h2>
        )}
        {content.subtitle && (
          <p 
            className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
            style={getTextStyles(subtitleColor, subtitleCss)}
          >
            {content.subtitle as string}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + i * 0.1 }}
            >
              <Link to={`/portfolio/${item.slug}`}>
                <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-colors group">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {item.featured_image ? (
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p 
                      className="text-sm text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: item.short_description || '' }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
