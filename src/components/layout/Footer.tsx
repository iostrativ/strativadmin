import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useMenuItems } from '@/hooks/useMenuItems';

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: footerMenu } = useMenuItems('footer');

  const footerBg = settings?.footer_bg_color || '#0a0a0a';
  const footerText = settings?.footer_text_color || '#ffffff';

  const socialLinks = [
    { icon: Facebook, url: settings?.facebook_url, label: 'Facebook' },
    { icon: Twitter, url: settings?.twitter_url, label: 'Twitter' },
    { icon: Linkedin, url: settings?.linkedin_url, label: 'LinkedIn' },
    { icon: Instagram, url: settings?.instagram_url, label: 'Instagram' },
    { icon: Github, url: settings?.github_url, label: 'GitHub' },
  ].filter((link) => link.url);

  const quickLinks = [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Services', url: '/services' },
    { label: 'Portfolio', url: '/portfolio' },
    { label: 'Blog', url: '/blog' },
    { label: 'Contact', url: '/contact' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms of Service', url: '/terms' },
  ];

  return (
    <footer style={{ backgroundColor: footerBg, color: footerText }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-gradient">
                {settings?.site_name || 'Strativ'}
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: `${footerText}b3` }}>
              {settings?.tagline || 'Transforming ideas into digital reality. We build software solutions that drive business growth.'}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  style={{ backgroundColor: `${footerText}1a`, color: footerText }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    to={link.url}
                    className="hover:text-primary transition-colors text-sm"
                    style={{ color: `${footerText}b3` }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              {settings?.email && (
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-primary transition-colors text-sm"
                    style={{ color: `${footerText}b3` }}
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-primary transition-colors text-sm"
                    style={{ color: `${footerText}b3` }}
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm" style={{ color: `${footerText}b3` }}>
                    {settings.address}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Stay Updated</h3>
            <p className="text-sm mb-4" style={{ color: `${footerText}b3` }}>
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:border-primary text-sm"
                style={{
                  backgroundColor: `${footerText}1a`,
                  borderColor: `${footerText}33`,
                  color: footerText,
                  border: `1px solid ${footerText}33`,
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: `1px solid ${footerText}1a` }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: `${footerText}80` }}>
              &copy; {new Date().getFullYear()} {settings?.site_name || 'Strativ'}. All rights reserved.
            </p>
            <div className="flex gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.url}
                  to={link.url}
                  className="hover:text-primary transition-colors text-sm"
                  style={{ color: `${footerText}80` }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
