import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Trash2, Copy, Check, FileImage, CheckCircle2, Video, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMediaAssets, useDeleteMedia } from '@/hooks/useMedia';
import { toast } from 'sonner';

interface MediaGridProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
  selectedUrl?: string;
}

export function MediaGrid({ onSelect, selectionMode = false, selectedUrl }: MediaGridProps) {
  const { data: assets, isLoading } = useMediaAssets();
  const deleteMedia = useDeleteMedia();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (asset: typeof assets extends (infer T)[] | undefined ? T : never) => {
    if (!asset) return;
    try {
      await deleteMedia.mutateAsync(asset);
      toast.success('Media deleted successfully');
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredAssets = assets?.filter((asset) =>
    asset.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {(assets?.length || 0) > 0 && (
        <Input
          type="text"
          placeholder="Search media..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredAssets?.map((asset, index) => {
          const isSelected = selectionMode && selectedUrl === asset.url;

          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`bg-card rounded-lg border overflow-hidden group cursor-pointer ${
                isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
              }`}
              onClick={() => selectionMode && onSelect?.(asset.url)}
            >
              <div className="aspect-square bg-muted relative">
                {asset.file_type?.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                  />
                ) : asset.file_type?.startsWith('video/') ? (
                  <div className="w-full h-full relative">
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {selectionMode && isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-6 w-6 text-primary fill-current" />
                  </div>
                )}
                {!selectionMode && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(asset.url, asset.id);
                      }}
                    >
                      {copiedId === asset.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{asset.filename}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(asset)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate" title={asset.filename}>
                  {asset.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(asset.file_size)}
                </p>
              </div>
            </motion.div>
          );
        })}
        {filteredAssets?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? 'No media files found.' : 'No media files yet. Upload your first image.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
