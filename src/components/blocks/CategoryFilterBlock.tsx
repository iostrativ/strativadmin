import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useBlog';
import { Button } from '@/components/ui/button';
import type { CategoryFilterBlockContent } from '@/types/database';

interface CategoryFilterBlockProps {
  content: CategoryFilterBlockContent;
  index: number;
  onCategoryChange?: (categorySlug: string | null) => void;
}

export function CategoryFilterBlock({ content, index, onCategoryChange }: CategoryFilterBlockProps) {
  const { style = 'pills', showAll = true } = content;
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!categories || categories.length === 0) return null;

  const handleCategoryClick = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    if (onCategoryChange) {
      onCategoryChange(categorySlug);
    }
  };

  const renderPills = () => (
    <div className="flex flex-wrap justify-center gap-2">
      {showAll && (
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => handleCategoryClick(null)}
          className="rounded-full"
        >
          All Posts
        </Button>
      )}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.slug ? 'default' : 'outline'}
          onClick={() => handleCategoryClick(category.slug)}
          className="rounded-full"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className="border-b border-border">
      <div className="flex flex-wrap gap-1">
        {showAll && (
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              selectedCategory === null
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All Posts
          </button>
        )}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              selectedCategory === category.slug
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderDropdown = () => (
    <div className="max-w-xs mx-auto">
      <select
        value={selectedCategory || ''}
        onChange={(e) => handleCategoryClick(e.target.value || null)}
        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {showAll && <option value="">All Posts</option>}
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {style === 'pills' && renderPills()}
          {style === 'tabs' && renderTabs()}
          {style === 'dropdown' && renderDropdown()}
        </motion.div>
      </div>
    </section>
  );
}
