import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

interface SettingsPreviewProps {
  formData: {
    site_name: string;
    tagline: string;
    logo_url: string;
    logo_height: number;
    logo_offset_x: number;
    logo_offset_y: number;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    foreground_color: string;
    muted_color: string;
    muted_foreground_color: string;
    border_color: string;
    button_text_color: string;
    header_bg_color: string;
    header_text_color: string;
    footer_bg_color: string;
    footer_text_color: string;
    email: string;
    phone: string;
    address: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    github_url: string;
  };
}

export function SettingsPreview({ formData }: SettingsPreviewProps) {
  const headerBg = formData.header_bg_color === 'transparent'
    ? formData.background_color
    : formData.header_bg_color;

  const socialLinks = [
    { icon: Facebook, url: formData.facebook_url, label: 'Facebook' },
    { icon: Twitter, url: formData.twitter_url, label: 'Twitter' },
    { icon: Linkedin, url: formData.linkedin_url, label: 'LinkedIn' },
    { icon: Instagram, url: formData.instagram_url, label: 'Instagram' },
    { icon: Github, url: formData.github_url, label: 'GitHub' },
  ].filter(l => l.url);

  return (
    <div className="h-full flex flex-col bg-gray-100 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-gray-200 border-b flex items-center gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-[10px] text-gray-500 text-center">
          {formData.site_name || 'yoursite'}.com
        </div>
      </div>

      <div className="flex-1 overflow-auto" style={{ backgroundColor: formData.background_color }}>
        {/* Header Preview */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{
            backgroundColor: headerBg,
            borderColor: formData.border_color,
            color: formData.header_text_color,
          }}
        >
          <div className="flex items-center gap-2">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="Logo"
                style={{
                  height: `${Math.min(formData.logo_height, 36)}px`,
                  width: 'auto',
                  maxWidth: '80px',
                  transform: `translate(${formData.logo_offset_x * 0.5}px, ${formData.logo_offset_y * 0.5}px)`,
                }}
                className="object-contain"
              />
            ) : (
              <span className="text-sm font-bold" style={{ color: formData.primary_color }}>
                {formData.site_name || 'Site Name'}
              </span>
            )}
          </div>
          <div className="flex gap-3 text-[10px]" style={{ color: formData.muted_foreground_color }}>
            <span>Home</span>
            <span>About</span>
            <span>Services</span>
            <span>Contact</span>
          </div>
          <div
            className="text-[9px] px-2 py-1 rounded font-medium"
            style={{
              backgroundColor: formData.primary_color,
              color: formData.button_text_color,
            }}
          >
            Get Started
          </div>
        </div>

        {/* Hero Section Preview */}
        <div
          className="px-6 py-10 text-center"
          style={{
            background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`,
            color: formData.button_text_color,
          }}
        >
          <h2 className="text-lg font-bold mb-1">{formData.site_name || 'Your Brand'}</h2>
          <p className="text-[11px] opacity-90 mb-3">
            {formData.tagline || 'Your tagline goes here'}
          </p>
          <div
            className="inline-block text-[10px] px-3 py-1.5 rounded font-medium"
            style={{
              backgroundColor: formData.button_text_color,
              color: formData.primary_color,
            }}
          >
            Learn More
          </div>
        </div>

        {/* Sample Content Section */}
        <div className="px-6 py-6" style={{ color: formData.foreground_color }}>
          <h3 className="text-sm font-bold mb-2">Sample Content</h3>
          <p className="text-[11px] mb-4" style={{ color: formData.muted_foreground_color }}>
            This preview shows how your color settings will look on the website.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {['Feature One', 'Feature Two', 'Feature Three'].map((title) => (
              <div
                key={title}
                className="p-3 rounded text-center"
                style={{
                  backgroundColor: formData.muted_color,
                  border: `1px solid ${formData.border_color}`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: formData.accent_color }}
                />
                <p className="text-[10px] font-medium" style={{ color: formData.foreground_color }}>
                  {title}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div
            className="rounded p-4 text-center"
            style={{
              backgroundColor: formData.primary_color,
              color: formData.button_text_color,
            }}
          >
            <p className="text-xs font-medium mb-2">Ready to get started?</p>
            <div
              className="inline-block text-[10px] px-3 py-1 rounded font-medium"
              style={{
                backgroundColor: formData.button_text_color,
                color: formData.primary_color,
              }}
            >
              Contact Us
            </div>
          </div>
        </div>

        {/* Footer Preview */}
        <div
          className="px-4 py-4"
          style={{
            backgroundColor: formData.footer_bg_color,
            color: formData.footer_text_color,
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold" style={{ color: formData.footer_text_color }}>
                {formData.site_name || 'Site Name'}
              </p>
              <p className="text-[9px] mt-1 opacity-70">
                {formData.tagline || 'Your tagline'}
              </p>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex gap-1">
                {socialLinks.map(s => (
                  <div
                    key={s.label}
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${formData.footer_text_color}15` }}
                  >
                    <s.icon className="w-3 h-3" style={{ color: formData.footer_text_color }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {(formData.email || formData.phone || formData.address) && (
            <div className="flex flex-wrap gap-3 text-[9px] opacity-70 mb-3">
              {formData.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5" /> {formData.email}
                </span>
              )}
              {formData.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> {formData.phone}
                </span>
              )}
              {formData.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> {formData.address}
                </span>
              )}
            </div>
          )}

          <div
            className="text-[8px] opacity-50 pt-2 text-center"
            style={{ borderTop: `1px solid ${formData.footer_text_color}20` }}
          >
            &copy; {new Date().getFullYear()} {formData.site_name || 'Site Name'}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
