import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Building, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePortfolioItem, usePortfolioImages } from '@/hooks/usePortfolio';
import { format } from 'date-fns';

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = usePortfolioItem(slug || '');
  const { data: images } = usePortfolioImages(project?.id || '');
  const { data: siteSettings } = useSiteSettings();
  const siteName = siteSettings?.site_name || 'Strativ';

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!project) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Link to="/portfolio">
            <Button>Back to Portfolio</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>{project.title} | {siteName}</title>
        <meta name="description" content={project.short_description || ''} />
        {project.featured_image && (
          <meta property="og:image" content={project.featured_image} />
        )}
      </Helmet>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Link to="/portfolio">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">
                {project.short_description}
              </p>
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {project.client && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{project.client}</span>
                  </div>
                )}
                {project.industry && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{project.industry}</span>
                  </div>
                )}
                {project.completed_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(project.completed_at), 'MMMM yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {project.featured_image ? (
                <img
                  src={project.featured_image}
                  alt={project.title}
                  className="w-full rounded-xl shadow-2xl"
                />
              ) : (
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {project.highlights && project.highlights.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Key Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{highlight}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      {project.content && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {images && images.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-video bg-muted rounded-lg overflow-hidden"
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || ''}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Like What You See?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can create something amazing for you too.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start a Project
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
