import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Page, PageSection } from '@/types/database';

export function usePages(publishedOnly = false) {
  return useQuery({
    queryKey: ['pages', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('pages')
        .select('*')
        .order('title', { ascending: true });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Page[];
    },
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!id,
  });
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: ['page-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!slug,
  });
}

// Admin version - fetches page by slug without requiring is_published
export function usePageBySlugAdmin(slug: string) {
  return useQuery({
    queryKey: ['page-slug-admin', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!slug,
  });
}

export function usePageById(id: string) {
  return useQuery({
    queryKey: ['page-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Page;
    },
    enabled: !!id,
  });
}

export function usePageSections(pageId: string) {
  return useQuery({
    queryKey: ['page-sections', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PageSection[];
    },
    enabled: !!pageId,
  });
}

export function useAllPageSections(pageId: string) {
  return useQuery({
    queryKey: ['page-sections-all', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PageSection[];
    },
    enabled: !!pageId,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pages')
        .insert(page)
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string }) => {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['page-id', data.id] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useCreatePageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: {
      page_id: string;
      block_type: string;
      content?: Record<string, unknown>;
      sort_order?: number;
      is_visible?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('page_sections')
        .insert({
          page_id: section.page_id,
          block_type: section.block_type,
          content: section.content as any,
          sort_order: section.sort_order,
          is_visible: section.is_visible,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PageSection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', data.page_id] });
      queryClient.invalidateQueries({ queryKey: ['page-sections-all', data.page_id] });
    },
  });
}

export function useUpdatePageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content, ...updates }: Partial<PageSection> & { id: string }) => {
      const updateData: any = { ...updates };
      if (content !== undefined) {
        updateData.content = content;
      }
      
      const { data, error } = await supabase
        .from('page_sections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PageSection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', data.page_id] });
      queryClient.invalidateQueries({ queryKey: ['page-sections-all', data.page_id] });
    },
  });
}

export function useDeletePageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pageId }: { id: string; pageId: string }) => {
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return pageId;
    },
    onSuccess: (pageId) => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageId] });
      queryClient.invalidateQueries({ queryKey: ['page-sections-all', pageId] });
    },
  });
}

export function useReorderPageSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sections,
      pageId,
    }: {
      sections: Array<{ id: string; sort_order: number }>;
      pageId: string;
    }) => {
      const updates = sections.map(({ id, sort_order }) =>
        supabase.from('page_sections').update({ sort_order }).eq('id', id)
      );

      await Promise.all(updates);
      return pageId;
    },
    onSuccess: (pageId) => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageId] });
      queryClient.invalidateQueries({ queryKey: ['page-sections-all', pageId] });
    },
  });
}
