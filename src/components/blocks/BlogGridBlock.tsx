import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { usePublishedPosts } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import { getTextStyles } from '@/lib/utils';
import type { BlogGridBlockContent } from '@/types/database';

interface BlogGridBlockProps {
  content: BlogGridBlockContent;
  index: number;
}

export function BlogGridBlock({ content, index }: BlogGridBlockProps) {
  const { title, layout = 'grid', postsPerPage = 9, categoryFilter } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;
  const { data: posts } = usePublishedPosts();
  const [currentPage, setCurrentPage] = useState(1);

  if (!posts || posts.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            No blog posts available yet.
          </div>
        </div>
      </section>
    );
  }

  // Filter by category if specified
  const filteredPosts = categoryFilter
    ? posts.filter((post) => post.category?.slug === categoryFilter)
    : posts;

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const gridClass = layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-8';

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {title && (
            <h2 
              className="text-3xl font-bold mb-12 text-center"
              style={getTextStyles(titleColor, titleCss)}
            >
              {title}
            </h2>
          )}

          <div className={gridClass}>
            {paginatedPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className={layout === 'list' ? 'flex gap-6 items-start' : ''}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block h-full"
                >
                  <div className={`bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-colors h-full flex flex-col ${layout === 'list' ? 'flex-row' : ''}`}>
                    {post.featured_image && (
                      <div className={`bg-muted overflow-hidden ${layout === 'list' ? 'w-64 flex-shrink-0' : 'aspect-video'}`}>
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      {post.category && (
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {post.publish_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(post.publish_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        {post.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{post.author.full_name || post.author.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-primary font-medium">
                        Read More
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
