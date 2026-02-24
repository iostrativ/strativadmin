import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClientLogo } from '@/types/database';

export function useClientLogos(publishedOnly = false) {
  return useQuery({
    queryKey: ['client-logos', publishedOnly],
    queryFn: async () => {
      let query = supabase
        .from('client_logos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ClientLogo[];
    },
  });
}

export function useCreateClientLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logo: Omit<ClientLogo, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('client_logos')
        .insert(logo)
        .select()
        .single();

      if (error) throw error;
      return data as ClientLogo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-logos'] });
    },
  });
}

export function useDeleteClientLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_logos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-logos'] });
    },
  });
}
