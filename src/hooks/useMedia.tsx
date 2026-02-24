import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MediaAsset } from '@/types/database';

export function useMediaAssets() {
  return useQuery({
    queryKey: ['media-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaAsset[];
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      userId,
    }: {
      file: File;
      userId: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create media asset record
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          filename: file.name,
          url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MediaAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: MediaAsset) => {
      // Extract file path from URL
      const urlParts = asset.url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('media').remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });
}
