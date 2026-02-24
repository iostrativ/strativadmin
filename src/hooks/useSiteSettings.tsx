import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SiteSettings } from '@/types/database';

const defaultSettings: SiteSettings = {
  id: '',
  site_name: 'Strativ',
  tagline: 'Transforming Ideas into Digital Reality',
  logo_url: null,
  email: 'contact@strativ.io',
  phone: '',
  address: '',
  facebook_url: null,
  twitter_url: null,
  linkedin_url: null,
  instagram_url: null,
  github_url: null,
  default_seo_title: 'Strativ - Software Development & IT Consulting',
  default_seo_description: 'Expert software development, web applications, mobile apps, and IT consulting services. Transform your business with cutting-edge technology solutions.',
  created_at: '',
  updated_at: '',
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as SiteSettings) || defaultSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as SiteSettings;
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .insert(settings)
          .select()
          .single();

        if (error) throw error;
        return data as SiteSettings;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
