import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem } from '@/types/database';

export function useMenuItems(location: 'header' | 'footer' = 'header') {
  return useQuery({
    queryKey: ['menu-items', location],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_location', location)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Build tree structure for nested menus
      const items = data as MenuItem[];
      const rootItems = items.filter((item) => !item.parent_id);
      
      return rootItems.map((item) => ({
        ...item,
        children: items.filter((child) => child.parent_id === item.id),
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllMenuItems(location?: 'header' | 'footer') {
  return useQuery({
    queryKey: ['menu-items-all', location],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (location) {
        query = query.eq('menu_location', location);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MenuItem[];
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items-all'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items-all'] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items-all'] });
    },
  });
}

export function useReorderMenuItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; sort_order: number }>) => {
      const updates = items.map(({ id, sort_order }) =>
        supabase.from('menu_items').update({ sort_order }).eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items-all'] });
    },
  });
}
