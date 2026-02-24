import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { usePortfolioItems } from '@/hooks/usePortfolio';

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolioItems(true);
  const [filter, setFilter] = useState<string>('all');

  // Get unique industries for filtering
  const industries = Array.from(
    new Set((portfolio || []).map((p) => p.industry).filter(Boolean))
  );

  const filteredPortfolio = filter === 'all'
    ? portfolio
    : portfolio?.filter((p) => p.industry === filter);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Portfolio
            </h1>
            <p className="text-lg text-white/70">
              Explore our latest projects and see how we've helped businesses achieve their goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      {industries.length > 0 && (
        <section className="py-8 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-gradient-primary' : ''}
              >
                All Projects
              </Button>
              {industries.map((industry) => (
                <Button
                  key={industry}
                  variant={filter === industry ? 'default' : 'outline'}
                  onClick={() => setFilter(industry!)}
                  className={filter === industry ? 'bg-gradient-primary' : ''}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video rounded-t-2xl bg-muted" />
                  <div className="p-6 rounded-b-2xl bg-card border border-border">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPortfolio && filteredPortfolio.length > 0 ? (
            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPortfolio.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/portfolio/${project.slug}`}
                    className="group block overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all"
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      {project.featured_image ? (
                        <img
                          src={project.featured_image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-primary/10">
                          <Code2 className="h-12 w-12 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tech_stack?.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Client: {project.client}
                        </p>
                      )}
                      <p className="text-muted-foreground line-clamp-2">
                        {project.short_description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No projects available yet.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
