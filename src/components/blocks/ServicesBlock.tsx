import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useServices, useFeaturedServices } from '@/hooks/useServices';
import { getTextStyles } from '@/lib/utils';

interface ServicesBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function ServicesBlock({ content, index }: ServicesBlockProps) {
  const featuredOnly = content.featuredOnly !== false;
  const { data: allServices } = useServices(true);
  const { data: featuredServices } = useFeaturedServices();
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;

  const services = featuredOnly ? featuredServices : allServices;

  if (!services?.length) return null;

  const limit = (content.limit as number) || services.length;
  const serviceIds = content.serviceIds as string[] | undefined;

  let filteredServices = services;

  if (serviceIds && serviceIds.length > 0) {
    filteredServices = services.filter(s => serviceIds.includes(s.id));
  }

  const displayServices = filteredServices.slice(0, limit);

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
          {displayServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + i * 0.1 }}
            >
              <Link to={`/services/${service.slug}`}>
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors h-full">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <div 
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: service.short_description || '' }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
