import { usePageBySlug } from '@/hooks/usePages';
import DynamicPage from './DynamicPage';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { data: page, isLoading } = usePageBySlug('home');

  if (isLoading) {
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
          <p className="text-muted-foreground mb-6">The home page hasn't been set up yet.</p>
          <Link to="/admin">
            <Button>Go to Admin Panel</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return <DynamicPage page={page} />;
}
