import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useTestimonials, useFeaturedTestimonials } from '@/hooks/useTestimonials';
import { getTextStyles } from '@/lib/utils';

interface TestimonialsBlockProps {
  content: Record<string, unknown>;
  index: number;
}

export function TestimonialsBlock({ content, index }: TestimonialsBlockProps) {
  const featuredOnly = content.featuredOnly !== false;
  const { data: allTestimonials } = useTestimonials(true);
  const { data: featuredTestimonials } = useFeaturedTestimonials();
  const titleColor = content._titleColor as string | undefined;
  const titleCss = content._titleCss as string | undefined;
  const subtitleColor = content._subtitleColor as string | undefined;
  const subtitleCss = content._subtitleCss as string | undefined;

  const testimonials = featuredOnly ? featuredTestimonials : allTestimonials;

  if (!testimonials?.length) return null;

  const limit = (content.limit as number) || testimonials.length;
  const testimonialIds = content.testimonialIds as string[] | undefined;

  let filteredTestimonials = testimonials;

  if (testimonialIds && testimonialIds.length > 0) {
    filteredTestimonials = testimonials.filter(t => testimonialIds.includes(t.id));
  }

  const displayTestimonials = filteredTestimonials.slice(0, limit);

  return (
    <section className="py-16 bg-muted/30">
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
          {displayTestimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + i * 0.1 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < testimonial.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              )}
              <div 
                className="text-muted-foreground mb-4"
                dangerouslySetInnerHTML={{ __html: `"${testimonial.content}"` }}
              />
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.author_avatar || undefined} />
                  <AvatarFallback>{testimonial.author_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.author_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.author_role}
                    {testimonial.author_company && ` at ${testimonial.author_company}`}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
