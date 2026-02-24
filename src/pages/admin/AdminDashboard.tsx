import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PagesList } from '@/components/admin/PagesList';
import { PageBuilder } from '@/components/admin/PageBuilder';
import { VisualPageBuilder } from '@/components/admin/visual-builder/VisualPageBuilder';
import { ServicesManager } from '@/components/admin/ServicesManager';
import { PortfolioManager } from '@/components/admin/PortfolioManager';
import { BlogManager } from '@/components/admin/BlogManager';
import { TeamManager } from '@/components/admin/TeamManager';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { MenuManager } from '@/components/admin/MenuManager';
import { SubmissionsManager } from '@/components/admin/SubmissionsManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { SiteSettings } from '@/components/admin/SiteSettings';
import { motion } from 'framer-motion';
import { FileText, Briefcase, BookOpen, MessageSquare, Users, Layers } from 'lucide-react';
import { usePages } from '@/hooks/usePages';
import { usePortfolioItems } from '@/hooks/usePortfolio';
import { useBlogPosts } from '@/hooks/useBlog';
import { useContactSubmissions, useUnreadSubmissionsCount } from '@/hooks/useContactSubmissions';
import { useServices } from '@/hooks/useServices';
import { useTeamMembers } from '@/hooks/useTeam';

function DashboardHome() {
  const { data: pages } = usePages();
  const { data: portfolio } = usePortfolioItems();
  const { data: posts } = useBlogPosts();
  const { data: submissions } = useContactSubmissions();
  const { data: unreadCount } = useUnreadSubmissionsCount();
  const { data: services } = useServices();
  const { data: team } = useTeamMembers();

  const stats = [
    { label: 'Pages', value: pages?.length || 0, icon: FileText, color: 'bg-blue-500' },
    { label: 'Services', value: services?.length || 0, icon: Layers, color: 'bg-purple-500' },
    { label: 'Portfolio', value: portfolio?.length || 0, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Blog Posts', value: posts?.length || 0, icon: BookOpen, color: 'bg-orange-500' },
    { label: 'Team Members', value: team?.length || 0, icon: Users, color: 'bg-pink-500' },
    { label: 'Messages', value: submissions?.length || 0, icon: MessageSquare, color: 'bg-red-500', badge: unreadCount },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your CMS dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-6 relative"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            {stat.badge && stat.badge > 0 && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                {stat.badge}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
        <div className="prose prose-sm text-muted-foreground">
          <p>Welcome to your CMS! Here's how to get started:</p>
          <ol className="space-y-2 mt-4">
            <li><strong>Pages:</strong> Create and manage your website pages with the block-based editor.</li>
            <li><strong>Services:</strong> Add your service offerings to display on the website.</li>
            <li><strong>Portfolio:</strong> Showcase your projects and case studies.</li>
            <li><strong>Blog:</strong> Write and publish blog posts to engage your audience.</li>
            <li><strong>Settings:</strong> Configure your site name, logo, and contact information.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Routes>
      {/* Visual Builder routes - full screen, no AdminLayout */}
      <Route path="builder/:pageId" element={<VisualPageBuilder />} />
      <Route path="builder/slug/:slug" element={<VisualPageBuilder />} />

      {/* All other admin routes wrapped in AdminLayout */}
      <Route path="*" element={
        <AdminLayout>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="pages" element={<PagesList />} />
            <Route path="pages/:pageId" element={<PageBuilder />} />
            <Route path="pages/slug/:slug" element={<PageBuilder />} />
        <Route path="home" element={<Navigate to="/admin/pages/slug/home" replace />} />
        <Route path="about" element={<Navigate to="/admin/pages/slug/about" replace />} />
        <Route path="services-page" element={<Navigate to="/admin/pages/slug/services" replace />} />
        <Route path="team-page" element={<Navigate to="/admin/pages/slug/team" replace />} />
        <Route path="contact-page" element={<Navigate to="/admin/pages/slug/contact" replace />} />
        <Route path="blog-page" element={<Navigate to="/admin/pages/slug/blog" replace />} />
        <Route path="services" element={<ServicesManager />} />
        <Route path="portfolio" element={<PortfolioManager />} />
        <Route path="blog" element={<BlogManager />} />
        <Route path="team" element={<TeamManager />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="menus" element={<MenuManager />} />
        <Route path="contact" element={<ContactManager />} />
        <Route path="submissions" element={<SubmissionsManager />} />
            <Route path="settings" element={<SiteSettings />} />
          </Routes>
        </AdminLayout>
      } />
    </Routes>
  );
}
