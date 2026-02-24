import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Github, Palette, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { MediaPicker } from './MediaPicker';
import { SettingsPreview } from './SettingsPreview';

export function SiteSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const [showPreview, setShowPreview] = useState(true);

  const [formData, setFormData] = useState({
    site_name: '',
    tagline: '',
    logo_url: '',
    logo_height: 40,
    logo_offset_x: 0,
    logo_offset_y: 0,
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    background_color: '#ffffff',
    foreground_color: '#0a0a0a',
    muted_color: '#f1f5f9',
    muted_foreground_color: '#64748b',
    border_color: '#e2e8f0',
    button_text_color: '#ffffff',
    header_bg_color: 'transparent',
    header_text_color: '#0a0a0a',
    footer_bg_color: '#0a0a0a',
    footer_text_color: '#ffffff',
    email: '',
    phone: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    github_url: '',
    default_seo_title: '',
    default_seo_description: '',
    favicon_url: '',
    favicon_size: 32,
  });

  useEffect(() => {
    if (settings) {
      // Load logo layout from localStorage
      let logoSettings = { logo_height: 40, logo_offset_x: 0, logo_offset_y: 0 };
      let faviconSettings = { favicon_url: '', favicon_size: 32 };
      try {
        const saved = localStorage.getItem('strativ_logo_settings');
        if (saved) logoSettings = { ...logoSettings, ...JSON.parse(saved) };
      } catch { /* ignore */ }
      try {
        const savedFav = localStorage.getItem('strativ_favicon_settings');
        if (savedFav) faviconSettings = { ...faviconSettings, ...JSON.parse(savedFav) };
      } catch { /* ignore */ }

      setFormData({
        site_name: settings.site_name || '',
        tagline: settings.tagline || '',
        logo_url: settings.logo_url || '',
        logo_height: logoSettings.logo_height,
        logo_offset_x: logoSettings.logo_offset_x,
        logo_offset_y: logoSettings.logo_offset_y,
        primary_color: settings.primary_color || '#6366f1',
        secondary_color: settings.secondary_color || '#8b5cf6',
        accent_color: settings.accent_color || '#06b6d4',
        background_color: settings.background_color || '#ffffff',
        foreground_color: settings.foreground_color || '#0a0a0a',
        muted_color: settings.muted_color || '#f1f5f9',
        muted_foreground_color: settings.muted_foreground_color || '#64748b',
        border_color: settings.border_color || '#e2e8f0',
        button_text_color: settings.button_text_color || '#ffffff',
        header_bg_color: settings.header_bg_color || 'transparent',
        header_text_color: settings.header_text_color || '#0a0a0a',
        footer_bg_color: settings.footer_bg_color || '#0a0a0a',
        footer_text_color: settings.footer_text_color || '#ffffff',
        email: settings.email || '',
        phone: settings.phone || '',
        address: settings.address || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        linkedin_url: settings.linkedin_url || '',
        instagram_url: settings.instagram_url || '',
        github_url: settings.github_url || '',
        default_seo_title: settings.default_seo_title || '',
        default_seo_description: settings.default_seo_description || '',
        favicon_url: faviconSettings.favicon_url,
        favicon_size: faviconSettings.favicon_size,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        site_name: formData.site_name,
        tagline: formData.tagline || null,
        logo_url: formData.logo_url || null,
        primary_color: formData.primary_color || '#6366f1',
        secondary_color: formData.secondary_color || '#8b5cf6',
        accent_color: formData.accent_color || '#06b6d4',
        background_color: formData.background_color || '#ffffff',
        foreground_color: formData.foreground_color || '#0a0a0a',
        muted_color: formData.muted_color || '#f1f5f9',
        muted_foreground_color: formData.muted_foreground_color || '#64748b',
        border_color: formData.border_color || '#e2e8f0',
        button_text_color: formData.button_text_color || '#ffffff',
        header_bg_color: formData.header_bg_color || 'transparent',
        header_text_color: formData.header_text_color || '#0a0a0a',
        footer_bg_color: formData.footer_bg_color || '#0a0a0a',
        footer_text_color: formData.footer_text_color || '#ffffff',
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        facebook_url: formData.facebook_url || null,
        twitter_url: formData.twitter_url || null,
        linkedin_url: formData.linkedin_url || null,
        instagram_url: formData.instagram_url || null,
        github_url: formData.github_url || null,
        default_seo_title: formData.default_seo_title || null,
        default_seo_description: formData.default_seo_description || null,
      });

      // Save logo layout settings to localStorage (no DB columns needed)
      localStorage.setItem('strativ_logo_settings', JSON.stringify({
        logo_height: formData.logo_height,
        logo_offset_x: formData.logo_offset_x,
        logo_offset_y: formData.logo_offset_y,
      }));

      // Save favicon settings to localStorage
      localStorage.setItem('strativ_favicon_settings', JSON.stringify({
        favicon_url: formData.favicon_url,
        favicon_size: formData.favicon_size,
      }));

      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Configure your website settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={handleSubmit} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className={showPreview ? 'flex gap-6' : ''}>
      <div className={showPreview ? 'flex-1 min-w-0' : ''}>
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="colors">Colors & Theme</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic information about your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    placeholder="My Company"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Your company tagline"
                  />
                </div>
                <MediaPicker
                  label="Logo"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  description="Upload or choose your site logo"
                />
                <div className="space-y-2">
                  <Label htmlFor="logo_height" className="flex items-center justify-between">
                    <span>Logo Height (pixels)</span>
                    <span className="text-sm text-muted-foreground">{formData.logo_height}px</span>
                  </Label>
                  <Input
                    type="range"
                    id="logo_height"
                    min="20"
                    max="200"
                    step="5"
                    value={formData.logo_height}
                    onChange={(e) => setFormData({ ...formData, logo_height: parseInt(e.target.value) })}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo can overlap the header but maintains fixed positioning. Header height stays at 80px.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo_offset_x" className="flex items-center justify-between">
                      <span>Horizontal Offset</span>
                      <span className="text-sm text-muted-foreground">{formData.logo_offset_x}px</span>
                    </Label>
                    <Input
                      type="range"
                      id="logo_offset_x"
                      min="-50"
                      max="50"
                      step="1"
                      value={formData.logo_offset_x}
                      onChange={(e) => setFormData({ ...formData, logo_offset_x: parseInt(e.target.value) })}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Negative = left, Positive = right
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_offset_y" className="flex items-center justify-between">
                      <span>Vertical Offset</span>
                      <span className="text-sm text-muted-foreground">{formData.logo_offset_y}px</span>
                    </Label>
                    <Input
                      type="range"
                      id="logo_offset_y"
                      min="-50"
                      max="50"
                      step="1"
                      value={formData.logo_offset_y}
                      onChange={(e) => setFormData({ ...formData, logo_offset_y: parseInt(e.target.value) })}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Negative = up, Positive = down
                    </p>
                  </div>
                </div>

                {/* Favicon Section */}
                <div className="pt-4 border-t space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Favicon</h3>
                  <MediaPicker
                    label="Favicon Image"
                    value={formData.favicon_url}
                    onChange={(url) => setFormData({ ...formData, favicon_url: url })}
                    description="Upload or choose a favicon (recommended: square PNG, 32x32 or 64x64)"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Colors & Theme
                </CardTitle>
                <CardDescription>
                  Customize your website colors - changes apply instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Brand Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color" className="flex items-center justify-between">
                        <span>Primary Color</span>
                        <span className="text-xs text-muted-foreground">{formData.primary_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="primary_color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                          className="flex-1"
                          placeholder="#6366f1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Main brand color for buttons and highlights</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color" className="flex items-center justify-between">
                        <span>Secondary Color</span>
                        <span className="text-xs text-muted-foreground">{formData.secondary_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="secondary_color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                          className="flex-1"
                          placeholder="#8b5cf6"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Secondary brand color for accents</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent_color" className="flex items-center justify-between">
                        <span>Accent Color</span>
                        <span className="text-xs text-muted-foreground">{formData.accent_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="accent_color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                          className="flex-1"
                          placeholder="#06b6d4"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Accent color for special elements</p>
                    </div>
                  </div>
                </div>

                {/* Text & Background Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Text & Background</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="background_color" className="flex items-center justify-between">
                        <span>Background Color</span>
                        <span className="text-xs text-muted-foreground">{formData.background_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="background_color"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          className="flex-1"
                          placeholder="#ffffff"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Main background color</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foreground_color" className="flex items-center justify-between">
                        <span>Text Color</span>
                        <span className="text-xs text-muted-foreground">{formData.foreground_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="foreground_color"
                          value={formData.foreground_color}
                          onChange={(e) => setFormData({ ...formData, foreground_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.foreground_color}
                          onChange={(e) => setFormData({ ...formData, foreground_color: e.target.value })}
                          className="flex-1"
                          placeholder="#0a0a0a"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Main text color</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="muted_color" className="flex items-center justify-between">
                        <span>Muted Background</span>
                        <span className="text-xs text-muted-foreground">{formData.muted_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="muted_color"
                          value={formData.muted_color}
                          onChange={(e) => setFormData({ ...formData, muted_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.muted_color}
                          onChange={(e) => setFormData({ ...formData, muted_color: e.target.value })}
                          className="flex-1"
                          placeholder="#f1f5f9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Subtle background for cards</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="muted_foreground_color" className="flex items-center justify-between">
                        <span>Muted Text</span>
                        <span className="text-xs text-muted-foreground">{formData.muted_foreground_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="muted_foreground_color"
                          value={formData.muted_foreground_color}
                          onChange={(e) => setFormData({ ...formData, muted_foreground_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.muted_foreground_color}
                          onChange={(e) => setFormData({ ...formData, muted_foreground_color: e.target.value })}
                          className="flex-1"
                          placeholder="#64748b"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Subdued text color</p>
                    </div>
                  </div>
                </div>

                {/* Header & Footer Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Header & Footer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="header_bg_color" className="flex items-center justify-between">
                        <span>Header Background</span>
                        <span className="text-xs text-muted-foreground">{formData.header_bg_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="header_bg_color"
                          value={formData.header_bg_color === 'transparent' ? '#ffffff' : formData.header_bg_color}
                          onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.header_bg_color}
                          onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                          className="flex-1"
                          placeholder="transparent"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Use 'transparent' for see-through header</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="header_text_color" className="flex items-center justify-between">
                        <span>Header Text</span>
                        <span className="text-xs text-muted-foreground">{formData.header_text_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="header_text_color"
                          value={formData.header_text_color}
                          onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.header_text_color}
                          onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                          className="flex-1"
                          placeholder="#0a0a0a"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Header links and text color</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footer_bg_color" className="flex items-center justify-between">
                        <span>Footer Background</span>
                        <span className="text-xs text-muted-foreground">{formData.footer_bg_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="footer_bg_color"
                          value={formData.footer_bg_color}
                          onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.footer_bg_color}
                          onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                          className="flex-1"
                          placeholder="#0a0a0a"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Footer background color</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footer_text_color" className="flex items-center justify-between">
                        <span>Footer Text</span>
                        <span className="text-xs text-muted-foreground">{formData.footer_text_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="footer_text_color"
                          value={formData.footer_text_color}
                          onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.footer_text_color}
                          onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                          className="flex-1"
                          placeholder="#ffffff"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Footer text color</p>
                    </div>
                  </div>
                </div>

                {/* Other Colors */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Other Elements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="border_color" className="flex items-center justify-between">
                        <span>Border Color</span>
                        <span className="text-xs text-muted-foreground">{formData.border_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="border_color"
                          value={formData.border_color}
                          onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.border_color}
                          onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                          className="flex-1"
                          placeholder="#e2e8f0"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Border and divider color</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="button_text_color" className="flex items-center justify-between">
                        <span>Button Text Color</span>
                        <span className="text-xs text-muted-foreground">{formData.button_text_color}</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="button_text_color"
                          value={formData.button_text_color}
                          onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.button_text_color}
                          onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                          className="flex-1"
                          placeholder="#ffffff"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Text color for primary buttons</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Click "Save Changes" at the top to apply colors across your entire website. Changes take effect immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How visitors can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street&#10;City, State 12345"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Links
                </CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" /> Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter_url" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_url" className="flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub
                  </Label>
                  <Input
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/yourorg"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Default SEO Settings
                </CardTitle>
                <CardDescription>
                  Default meta tags for pages without custom SEO settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default_seo_title">Default SEO Title</Label>
                  <Input
                    id="default_seo_title"
                    value={formData.default_seo_title}
                    onChange={(e) => setFormData({ ...formData, default_seo_title: e.target.value })}
                    placeholder="My Company | Best Service Provider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 50-60 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_seo_description">Default SEO Description</Label>
                  <Textarea
                    id="default_seo_description"
                    value={formData.default_seo_description}
                    onChange={(e) => setFormData({ ...formData, default_seo_description: e.target.value })}
                    placeholder="Brief description of your company and services"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
      </div>

      {/* Live Preview Panel */}
      {showPreview && (
        <div className="w-[380px] shrink-0 sticky top-6 self-start">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Live Preview
          </div>
          <div className="h-[600px] border rounded-lg overflow-hidden shadow-sm">
            <SettingsPreview formData={formData} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
