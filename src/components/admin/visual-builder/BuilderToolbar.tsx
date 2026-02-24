import { ArrowLeft, Eye, EyeOff, Save, Loader2, Monitor, Tablet, Smartphone, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Page } from '@/types/database';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';

interface BuilderToolbarProps {
  page: Page;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  previewDevice: PreviewDevice;
  customWidth?: number;
  customHeight?: number;
  onSave: () => void;
  onTogglePublish: () => void;
  onDeviceChange: (device: PreviewDevice) => void;
  onCustomSizeChange?: (width: number, height: number) => void;
}

export function BuilderToolbar({
  page,
  hasUnsavedChanges,
  isSaving,
  previewDevice,
  customWidth = 1024,
  customHeight = 768,
  onSave,
  onTogglePublish,
  onDeviceChange,
  onCustomSizeChange,
}: BuilderToolbarProps) {
  const navigate = useNavigate();
  const [localWidth, setLocalWidth] = useState(customWidth);
  const [localHeight, setLocalHeight] = useState(customHeight);

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/pages')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-sm">{page.title}</h1>
          {page.is_system_page && (
            <Badge variant="secondary" className="text-[10px]">System</Badge>
          )}
          <span className="text-xs text-muted-foreground">/{page.slug}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center border rounded-md mr-2">
          <Button
            variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onDeviceChange('desktop')}
            title="Desktop (100%)"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onDeviceChange('tablet')}
            title="Tablet (768px)"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onDeviceChange('mobile')}
            title="Mobile (375px)"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={previewDevice === 'custom' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                title="Custom resolution"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Custom Resolution</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Width (px)</Label>
                    <Input
                      type="number"
                      value={localWidth}
                      onChange={(e) => setLocalWidth(parseInt(e.target.value) || 320)}
                      min={320}
                      max={2560}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height (px)</Label>
                    <Input
                      type="number"
                      value={localHeight}
                      onChange={(e) => setLocalHeight(parseInt(e.target.value) || 480)}
                      min={320}
                      max={1600}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      onCustomSizeChange?.(localWidth, localHeight);
                      onDeviceChange('custom');
                    }}
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Common sizes: 1920×1080, 1366×768, 1280×720
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePublish}
        >
          {page.is_published ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1" />
              Publish
            </>
          )}
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className="gap-1"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {hasUnsavedChanges ? 'Save' : 'Saved'}
        </Button>
      </div>
    </div>
  );
}
