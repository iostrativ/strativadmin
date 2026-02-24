import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PortfolioItem, PortfolioImage } from '@/types/database';

export function usePortfolioItems(publishedOnly = false) {
  return useQuery({
    queryKey: ['portfolio', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PortfolioItem[];
    },
  });
}

export function useFeaturedPortfolio() {
  return useQuery({
    queryKey: ['portfolio', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as PortfolioItem[];
    },
  });
}

export function usePortfolioItem(slug: string) {
  return useQuery({
    queryKey: ['portfolio-item', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as PortfolioItem;
    },
    enabled: !!slug,
  });
}

export function usePortfolioImages(portfolioId: string) {
  return useQuery({
    queryKey: ['portfolio-images', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PortfolioImage[];
    },
    enabled: !!portfolioId,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<PortfolioItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as PortfolioItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PortfolioItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-item', data.slug] });
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
