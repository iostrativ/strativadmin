import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { usePageBySlug, usePageSections } from '@/hooks/usePages';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import type { Page } from '@/types/database';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

interface DynamicPageProps {
  page?: Page;
}

export default function DynamicPage({ page: pageProp }: DynamicPageProps = {}) {
  const { slug } = useParams<{ slug: string }>();
  const { data: fetchedPage, isLoading: pageLoading } = usePageBySlug(slug || '', {
    enabled: !pageProp,
  });

  const page = pageProp || fetchedPage;
  const { data: sections, isLoading: sectionsLoading } = usePageSections(page?.id || '');
  const { data: siteSettings } = useSiteSettings();
  const siteName = siteSettings?.site_name || 'Strativ';

  if ((pageLoading && !pageProp) || sectionsLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!page) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const visibleSections = sections?.filter((s) => s.is_visible) || [];

  return (
    <PublicLayout>
      <Helmet>
        <title>{page.seo_title ? page.seo_title.replace(/\{site_name\}/g, siteName) : `${page.title} | ${siteName}`}</title>
        {page.seo_description && (
          <meta name="description" content={page.seo_description} />
        )}
        {page.og_image && <meta property="og:image" content={page.og_image} />}
      </Helmet>

      {visibleSections.map((section, index) => (
        <BlockRenderer key={section.id} section={section} index={index} />
      ))}

      {visibleSections.length === 0 && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-muted-foreground">This page has no content yet.</p>
        </div>
      )}
    </PublicLayout>
  );
}
