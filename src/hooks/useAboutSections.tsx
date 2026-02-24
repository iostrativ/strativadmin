import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AboutSection, AboutValue, AboutTimeline } from '@/types/database';

// =============================================
// ABOUT SECTIONS HOOKS
// =============================================

export function useAboutSections() {
  return useQuery({
    queryKey: ['about-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*');

      if (error) throw error;
      return data as AboutSection[];
    },
  });
}

export function useAboutSection(sectionType: string) {
  return useQuery({
    queryKey: ['about-section', sectionType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .eq('section_type', sectionType)
        .single();

      if (error) throw error;
      return data as AboutSection;
    },
    enabled: !!sectionType,
  });
}

export function useUpdateAboutSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionType, content, isVisible }: {
      sectionType: string;
      content: Record<string, unknown>;
      isVisible?: boolean
    }) => {
      const updateData: any = { content, updated_at: new Date().toISOString() };
      if (isVisible !== undefined) {
        updateData.is_visible = isVisible;
      }

      const { data, error } = await supabase
        .from('about_sections')
        .update(updateData)
        .eq('section_type', sectionType)
        .select()
        .single();

      if (error) throw error;
      return data as AboutSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-sections'] });
    },
  });
}

// =============================================
// ABOUT VALUES HOOKS
// =============================================

export function useAboutValues() {
  return useQuery({
    queryKey: ['about-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_values')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as AboutValue[];
    },
  });
}

export function useCreateAboutValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: Omit<AboutValue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('about_values')
        .insert(value)
        .select()
        .single();

      if (error) throw error;
      return data as AboutValue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
}

export function useUpdateAboutValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AboutValue> & { id: string }) => {
      const { data, error } = await supabase
        .from('about_values')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AboutValue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
}

export function useDeleteAboutValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_values')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
}

export function useReorderAboutValues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: AboutValue[]) => {
      const updates = values.map((value, index) => ({
        id: value.id,
        sort_order: index,
      }));

      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('about_values')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
}

// =============================================
// ABOUT TIMELINE HOOKS
// =============================================

export function useAboutTimeline() {
  return useQuery({
    queryKey: ['about-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_timeline')
        .select('*')
        .order('sort_order', { ascending: true});

      if (error) throw error;
      return data as AboutTimeline[];
    },
  });
}

export function useCreateAboutTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<AboutTimeline, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('about_timeline')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as AboutTimeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-timeline'] });
    },
  });
}

export function useUpdateAboutTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AboutTimeline> & { id: string }) => {
      const { data, error } = await supabase
        .from('about_timeline')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AboutTimeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-timeline'] });
    },
  });
}

export function useDeleteAboutTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-timeline'] });
    },
  });
}

export function useReorderAboutTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: AboutTimeline[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('about_timeline')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-timeline'] });
    },
  });
}
