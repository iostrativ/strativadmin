import { useState } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaGrid } from './MediaGrid';
import { MediaUpload } from './MediaUpload';

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  description?: string;
}

export function MediaPicker({ value, onChange, accept, label, description }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(value || '');
  const [manualUrl, setManualUrl] = useState(value || '');
  const [activeTab, setActiveTab] = useState('existing');

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onChange(url);
    setIsOpen(false);
  };

  const handleUploadComplete = (url: string) => {
    onChange(url);
    setIsOpen(false);
  };

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {/* Image Preview */}
      {value && (
        <div className="relative w-full h-40 rounded-lg border border-border overflow-hidden bg-muted">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              <ImageIcon className="h-4 w-4 mr-2" />
              {value ? 'Change Image' : 'Choose Image'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Media</DialogTitle>
              <DialogDescription>
                Choose an existing image from your media library, upload a new one, or paste a URL.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="existing">Media Library</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
                <TabsTrigger value="url">Paste URL</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="flex-1 overflow-y-auto mt-4">
                <MediaGrid
                  onSelect={handleSelect}
                  selectionMode={true}
                  selectedUrl={selectedUrl}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <MediaUpload
                  onUploadComplete={handleUploadComplete}
                  multiple={false}
                  accept={accept}
                />
              </TabsContent>

              <TabsContent value="url" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-url">Image URL</Label>
                  <Input
                    id="manual-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                </div>
                {manualUrl && (
                  <div className="relative w-full h-48 rounded-lg border border-border overflow-hidden bg-muted">
                    <img
                      src={manualUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <Button onClick={handleManualUrlSubmit} disabled={!manualUrl.trim()}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Use This URL
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {value && (
          <Button variant="outline" type="button" onClick={() => onChange('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Manual URL Input (always visible for quick paste) */}
      <Input
        type="url"
        placeholder="Or paste URL here..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
      />
    </div>
  );
}
