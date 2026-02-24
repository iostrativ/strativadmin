import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ContactSubmission } from '@/types/database';

export function useContactSubmissions() {
  return useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });
}

export function useUnreadSubmissionsCount() {
  return useQuery({
    queryKey: ['contact-submissions', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
  });
}

export function useCreateContactSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: Omit<ContactSubmission, 'id' | 'is_read' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert(submission)
        .select()
        .single();

      if (error) throw error;
      return data as ContactSubmission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    },
  });
}

export function useMarkSubmissionRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .update({ is_read })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ContactSubmission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    },
  });
}

export function useDeleteContactSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    },
  });
}
