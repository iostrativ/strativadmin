import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Menu as MenuIcon,
  Briefcase,
  Users,
  BookOpen,
  Image,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Home,
  Info,
  Inbox,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  icon: any;
  label: string;
  href?: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  {
    icon: FileText,
    label: 'Pages',
    children: [
      { icon: FileText, label: 'All Pages', href: '/admin/pages' },
      { icon: Home, label: 'Home Page', href: '/admin/home' },
      { icon: Info, label: 'About Page', href: '/admin/about' },
      { icon: Layers, label: 'Services Page', href: '/admin/services-page' },
      { icon: Users, label: 'Team Page', href: '/admin/team-page' },
      { icon: MessageSquare, label: 'Contact Page', href: '/admin/contact-page' },
      { icon: BookOpen, label: 'Blog Page', href: '/admin/blog-page' },
    ],
  },
  { icon: MenuIcon, label: 'Menus', href: '/admin/menus' },
  { icon: Layers, label: 'Services', href: '/admin/services' },
  { icon: Briefcase, label: 'Portfolio', href: '/admin/portfolio' },
  { icon: Users, label: 'Team', href: '/admin/team' },
  { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
  { icon: MessageSquare, label: 'Submissions', href: '/admin/submissions' },
  { icon: Image, label: 'Media', href: '/admin/media' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-foreground"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <span className="ml-4 font-bold text-gradient">Admin Panel</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-sidebar z-50"
            >
              <SidebarContent
                items={sidebarItems}
                currentPath={location.pathname}
                collapsed={false}
                profile={profile}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed top-0 left-0 bottom-0 flex-col bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        <SidebarContent
          items={sidebarItems}
          currentPath={location.pathname}
          collapsed={collapsed}
          profile={profile}
          onSignOut={handleSignOut}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 p-1.5 rounded-full bg-transparent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300 pt-16 lg:pt-0',
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        )}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

interface SidebarContentProps {
  items: SidebarItem[];
  currentPath: string;
  collapsed: boolean;
  profile: { full_name?: string | null; email?: string | null; avatar_url?: string | null } | null;
  onSignOut: () => void;
}

function SidebarContent({
  items,
  currentPath,
  collapsed,
  profile,
  onSignOut,
}: SidebarContentProps) {
  // Load expanded items from localStorage or default to empty array
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sidebar-expanded');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever expandedItems changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(expandedItems));
  }, [expandedItems]);

  // Auto-expand parent if child is active
  useEffect(() => {
    items.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.href === currentPath);
        if (hasActiveChild && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [currentPath, items]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const renderMenuItem = (item: SidebarItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.href ? currentPath === item.href : false;
    const hasActiveChild = hasChildren && item.children!.some((child) => child.href === currentPath);

    if (hasChildren) {
      // Parent item with children
      return (
        <div key={item.label}>
          <button
            onClick={() => !collapsed && toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group',
              hasActiveChild
                ? 'bg-sidebar-primary/50 text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                {item.label}
              </div>
            )}
          </button>
          {!collapsed && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 mt-1 space-y-1 overflow-hidden"
            >
              {item.children!.map((child) => renderMenuItem(child, true))}
            </motion.div>
          )}
        </div>
      );
    }

    // Regular item or child item
    if (!item.href) return null;

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group',
          isChild && 'ml-6 text-sm',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <item.icon className={cn('h-5 w-5 shrink-0', collapsed && !isChild && 'mx-auto')} />
        {!collapsed && <span className={cn('font-medium', isChild && 'text-sm')}>{item.label}</span>}
        {collapsed && !isChild && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-sidebar-foreground">Admin</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto sidebar-scroll">
        {items.map((item) => renderMenuItem(item))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sidebar-accent-foreground font-medium">
                {profile?.full_name?.charAt(0) || 'A'}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || 'Admin User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile?.email}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onSignOut}
          className={cn(
            'w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'px-0' : ''
          )}
        >
          <LogOut className={cn('h-4 w-4', collapsed ? '' : 'mr-2')} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );
}
