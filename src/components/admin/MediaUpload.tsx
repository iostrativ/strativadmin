import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadMedia } from '@/hooks/useMedia';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos

interface MediaUploadProps {
  onUploadComplete?: (url: string) => void;
  multiple?: boolean;
  accept?: string;
}

export function MediaUpload({ onUploadComplete, multiple = true, accept }: MediaUploadProps) {
  const uploadMedia = useUploadMedia();
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = '';
  };

  const handleFiles = async (files: File[]) => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }

    const filesToUpload = multiple ? files : files.slice(0, 1);

    for (const file of filesToUpload) {
      const isVideo = VIDEO_TYPES.includes(file.type);
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Allowed: Images (JPG, PNG, GIF, WebP, SVG) and Videos (MP4, WebM, OGG, MOV)`);
        continue;
      }

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        toast.error(`File too large: ${file.name}. Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      try {
        const asset = await uploadMedia.mutateAsync({ file, userId: user.id });
        toast.success(`Uploaded: ${file.name}`);
        if (onUploadComplete && asset) {
          onUploadComplete(asset.url);
        }
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="flex justify-center gap-4 mb-4">
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
        <Video className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium mb-2">
        Drop files here or click to upload
      </p>
      <p className="text-sm text-muted-foreground mb-1">
        Images: JPG, PNG, GIF, WebP, SVG (max 5MB)
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Videos: MP4, WebM, OGG, MOV (max 100MB)
      </p>
      <label>
        <input
          type="file"
          multiple={multiple}
          accept={accept || ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button asChild>
          <span className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </span>
        </Button>
      </label>
    </div>
  );
}
