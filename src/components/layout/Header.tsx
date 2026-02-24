import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { cn } from '@/lib/utils';

function getLogoSettings() {
  try {
    const saved = localStorage.getItem('strativ_logo_settings');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { logo_height: 40, logo_offset_x: 0, logo_offset_y: 0 };
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { data: menuItems } = useMenuItems('header');
  const { data: settings } = useSiteSettings();
  const logoSettings = getLogoSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = menuItems || [
    { id: '1', label: 'Home', url: '/' },
    { id: '2', label: 'About', url: '/about' },
    { id: '3', label: 'Services', url: '/services' },
    { id: '4', label: 'Portfolio', url: '/portfolio' },
    { id: '5', label: 'Blog', url: '/blog' },
    { id: '6', label: 'Contact', url: '/contact' },
  ];

  const headerBg = settings?.header_bg_color || 'transparent';
  const headerText = settings?.header_text_color || '';

  const headerStyle: React.CSSProperties = isScrolled
    ? {
        backgroundColor: headerBg === 'transparent' ? undefined : headerBg,
        color: headerText || undefined,
      }
    : {
        backgroundColor: headerBg !== 'transparent' ? headerBg : undefined,
        color: headerText || undefined,
      };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? headerBg === 'transparent' ? 'bg-background/95 backdrop-blur-md shadow-md' : 'backdrop-blur-md shadow-md'
          : 'bg-transparent'
      )}
      style={headerStyle}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 relative z-10">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name}
                style={{
                  height: `${logoSettings.logo_height || 40}px`,
                  width: 'auto',
                  maxWidth: '200px',
                  transform: `translate(${logoSettings.logo_offset_x || 0}px, ${logoSettings.logo_offset_y || 0}px)`,
                }}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-gradient">
                {settings?.site_name || 'Strativ'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                href={item.url || '#'}
                isActive={location.pathname === item.url}
              >
                {item.label}
                {item.children && item.children.length > 0 && (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button asChild className="bg-gradient-primary hover:opacity-90">
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.url || '#'}
                  className={cn(
                    'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    location.pathname === item.url
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild className="mt-4 bg-gradient-primary">
                <Link to="/contact">Get Started</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors inline-flex items-center',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="header-indicator"
          className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
        />
      )}
    </Link>
  );
}
