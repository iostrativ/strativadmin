import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { HomeSection, HomeStat } from '@/types/database';

// =============================================
// HOME SECTIONS HOOKS
// =============================================

export function useHomeSections() {
  return useQuery({
    queryKey: ['home-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*');

      if (error) throw error;
      return data as HomeSection[];
    },
  });
}

export function useHomeSection(sectionType: string) {
  return useQuery({
    queryKey: ['home-section', sectionType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_sections')
        .select('*')
        .eq('section_type', sectionType)
        .single();

      if (error) throw error;
      return data as HomeSection;
    },
    enabled: !!sectionType,
  });
}

export function useUpdateHomeSection() {
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
        .from('home_sections')
        .update(updateData)
        .eq('section_type', sectionType)
        .select()
        .single();

      if (error) throw error;
      return data as HomeSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
    },
  });
}

// =============================================
// HOME STATS HOOKS
// =============================================

export function useHomeStats() {
  return useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_stats')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as HomeStat[];
    },
  });
}

export function useCreateHomeStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stat: Omit<HomeStat, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('home_stats')
        .insert(stat)
        .select()
        .single();

      if (error) throw error;
      return data as HomeStat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useUpdateHomeStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HomeStat> & { id: string }) => {
      const { data, error } = await supabase
        .from('home_stats')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as HomeStat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useDeleteHomeStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('home_stats')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useReorderHomeStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stats: HomeStat[]) => {
      const updates = stats.map((stat, index) => ({
        id: stat.id,
        sort_order: index,
      }));

      // Update each stat's sort order
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('home_stats')
          .update({ sort_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}
