import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { MediaGrid } from './MediaGrid';
import { MediaUpload } from './MediaUpload';

export interface BackgroundConfig {
  type: 'none' | 'color' | 'image' | 'video';
  // Color options
  colorType?: 'solid' | 'gradient';
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  opacity?: number;
  // Image options
  imageUrl?: string;
  imageOverlayOpacity?: number;
  imageHueRed?: number;
  imageHueGreen?: number;
  imageHueBlue?: number;
  // Video options
  videoUrl?: string;
  videoOverlayOpacity?: number;
  videoHueRed?: number;
  videoHueGreen?: number;
  videoHueBlue?: number;
  videoLoop?: 'infinite' | 'once' | 'twice' | 'custom';
  videoLoopCount?: number; // For custom loop count
}

interface BackgroundEditorProps {
  value?: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
  defaultOpen?: boolean;
}

const GRADIENT_DIRECTIONS = [
  { value: 'to-r', label: 'Left to Right' },
  { value: 'to-l', label: 'Right to Left' },
  { value: 'to-b', label: 'Top to Bottom' },
  { value: 'to-t', label: 'Bottom to Top' },
  { value: 'to-br', label: 'Top-Left to Bottom-Right' },
  { value: 'to-bl', label: 'Top-Right to Bottom-Left' },
  { value: 'to-tr', label: 'Bottom-Left to Top-Right' },
  { value: 'to-tl', label: 'Bottom-Right to Top-Left' },
];

export function BackgroundEditor({ value, onChange, defaultOpen = false }: BackgroundEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const config: BackgroundConfig = value || { type: 'none' };

  const updateConfig = (updates: Partial<BackgroundConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaType === 'image') {
      updateConfig({ imageUrl: url, videoUrl: undefined });
    } else {
      updateConfig({ videoUrl: url, imageUrl: undefined });
    }
    setShowMediaPicker(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between" type="button">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Background</span>
            {config.type !== 'none' && (
              <span className="text-xs text-muted-foreground capitalize">
                ({config.type === 'color' ? (config.colorType || 'solid') : config.type})
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <RadioGroup
            value={config.type}
            onValueChange={(value: BackgroundConfig['type']) => {
              const newConfig: BackgroundConfig = { type: value };
              if (value === 'color') {
                newConfig.colorType = 'solid';
                newConfig.color = '#000000';
                newConfig.opacity = 100;
              } else if (value === 'image') {
                newConfig.imageOverlayOpacity = 50;
              } else if (value === 'video') {
                newConfig.videoOverlayOpacity = 50;
                newConfig.videoLoop = 'infinite';
              }
              onChange(newConfig);
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="bg-none" />
              <Label htmlFor="bg-none" className="font-normal cursor-pointer">None</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="color" id="bg-color" />
              <Label htmlFor="bg-color" className="font-normal cursor-pointer">Color</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image" id="bg-image" />
              <Label htmlFor="bg-image" className="font-normal cursor-pointer">Image</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="video" id="bg-video" />
              <Label htmlFor="bg-video" className="font-normal cursor-pointer">Video</Label>
            </div>
          </RadioGroup>

          {/* Color Options */}
          {config.type === 'color' && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Color Type</Label>
                <Select
                  value={config.colorType || 'solid'}
                  onValueChange={(value: 'solid' | 'gradient') => updateConfig({ colorType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.colorType === 'solid' && (
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={config.color || '#000000'}
                        onChange={(e) => updateConfig({ color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer border"
                      />
                    </div>
                    <Input
                      value={config.color || '#000000'}
                      onChange={(e) => updateConfig({ color: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {config.colorType === 'gradient' && (
                <>
                  <div className="space-y-2">
                    <Label>Gradient Direction</Label>
                    <Select
                      value={config.gradientDirection || 'to-r'}
                      onValueChange={(value) => updateConfig({ gradientDirection: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_DIRECTIONS.map((dir) => (
                          <SelectItem key={dir.value} value={dir.value}>
                            {dir.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>From Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.gradientFrom || '#000000'}
                          onChange={(e) => updateConfig({ gradientFrom: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border"
                        />
                        <Input
                          value={config.gradientFrom || '#000000'}
                          onChange={(e) => updateConfig({ gradientFrom: e.target.value })}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>To Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.gradientTo || '#ffffff'}
                          onChange={(e) => updateConfig({ gradientTo: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border"
                        />
                        <Input
                          value={config.gradientTo || '#ffffff'}
                          onChange={(e) => updateConfig({ gradientTo: e.target.value })}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Gradient Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div
                      className="h-12 rounded-lg border"
                      style={{
                        background: `linear-gradient(${getGradientAngle(config.gradientDirection || 'to-r')}, ${config.gradientFrom || '#000000'}, ${config.gradientTo || '#ffffff'})`,
                      }}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Opacity: {config.opacity ?? 100}%</Label>
                <Slider
                  value={[config.opacity ?? 100]}
                  onValueChange={([value]) => updateConfig({ opacity: value })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          )}

          {/* Image Options */}
          {config.type === 'image' && (
            <div className="space-y-3 mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaType('image');
                    setShowMediaPicker(true);
                  }}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose from Library
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Or enter URL</Label>
                <Input
                  value={config.imageUrl || ''}
                  onChange={(e) => updateConfig({ imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {config.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={config.imageUrl}
                    alt="Background preview"
                    className="w-full h-32 object-cover"
                    style={{ opacity: getVisibilityStyles(config.imageOverlayOpacity ?? 50).mediaOpacity }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${getVisibilityStyles(config.imageOverlayOpacity ?? 50).overlayOpacity})` }}
                  />
                  {/* Color hue overlays in preview */}
                  {(config.imageHueRed ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(255, 0, 0, ${(config.imageHueRed ?? 0) / 100})` }}
                    />
                  )}
                  {(config.imageHueGreen ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(0, 255, 0, ${(config.imageHueGreen ?? 0) / 100})` }}
                    />
                  )}
                  {(config.imageHueBlue ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(0, 0, 255, ${(config.imageHueBlue ?? 0) / 100})` }}
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => updateConfig({ imageUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label>Visibility: {config.imageOverlayOpacity ?? 50}%</Label>
                <Slider
                  value={[config.imageOverlayOpacity ?? 50]}
                  onValueChange={([value]) => updateConfig({ imageOverlayOpacity: value })}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  0% = transparent, 50% = normal, 100% = fully dark
                </p>
              </div>
              
              {/* Color Hue Controls */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-medium">Color Hue Overlay</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <Label className="text-xs w-16">Red: {config.imageHueRed ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.imageHueRed ?? 0]}
                    onValueChange={([value]) => updateConfig({ imageHueRed: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <Label className="text-xs w-16">Green: {config.imageHueGreen ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.imageHueGreen ?? 0]}
                    onValueChange={([value]) => updateConfig({ imageHueGreen: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <Label className="text-xs w-16">Blue: {config.imageHueBlue ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.imageHueBlue ?? 0]}
                    onValueChange={([value]) => updateConfig({ imageHueBlue: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-blue-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add color tint overlays. 0% = no effect.
                </p>
              </div>
            </div>
          )}

          {/* Video Options */}
          {config.type === 'video' && (
            <div className="space-y-3 mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMediaType('video');
                    setShowMediaPicker(true);
                  }}
                  className="flex-1"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Choose from Library
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Or enter URL</Label>
                <Input
                  value={config.videoUrl || ''}
                  onChange={(e) => updateConfig({ videoUrl: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              {config.videoUrl && (
                <div className="relative rounded-lg overflow-hidden border bg-muted">
                  <video
                    src={config.videoUrl}
                    className="w-full h-32 object-cover"
                    style={{ opacity: getVisibilityStyles(config.videoOverlayOpacity ?? 50).mediaOpacity }}
                    muted
                    loop
                    playsInline
                  />
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${getVisibilityStyles(config.videoOverlayOpacity ?? 50).overlayOpacity})` }}
                  />
                  {/* Color hue overlays in preview */}
                  {(config.videoHueRed ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(255, 0, 0, ${(config.videoHueRed ?? 0) / 100})` }}
                    />
                  )}
                  {(config.videoHueGreen ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(0, 255, 0, ${(config.videoHueGreen ?? 0) / 100})` }}
                    />
                  )}
                  {(config.videoHueBlue ?? 0) > 0 && (
                    <div
                      className="absolute inset-0 mix-blend-multiply pointer-events-none"
                      style={{ backgroundColor: `rgba(0, 0, 255, ${(config.videoHueBlue ?? 0) / 100})` }}
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => updateConfig({ videoUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label>Visibility: {config.videoOverlayOpacity ?? 50}%</Label>
                <Slider
                  value={[config.videoOverlayOpacity ?? 50]}
                  onValueChange={([value]) => updateConfig({ videoOverlayOpacity: value })}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  0% = transparent, 50% = normal, 100% = fully dark
                </p>
              </div>
              
              {/* Color Hue Controls for Video */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-medium">Color Hue Overlay</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <Label className="text-xs w-16">Red: {config.videoHueRed ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.videoHueRed ?? 0]}
                    onValueChange={([value]) => updateConfig({ videoHueRed: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <Label className="text-xs w-16">Green: {config.videoHueGreen ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.videoHueGreen ?? 0]}
                    onValueChange={([value]) => updateConfig({ videoHueGreen: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500" />
                    <Label className="text-xs w-16">Blue: {config.videoHueBlue ?? 0}%</Label>
                  </div>
                  <Slider
                    value={[config.videoHueBlue ?? 0]}
                    onValueChange={([value]) => updateConfig({ videoHueBlue: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-blue-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Add color tint overlays. 0% = no effect.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Video Playback</Label>
                <Select
                  value={config.videoLoop || 'infinite'}
                  onValueChange={(value: 'infinite' | 'once' | 'twice' | 'custom') => updateConfig({ videoLoop: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infinite">Loop Infinitely</SelectItem>
                    <SelectItem value="once">Play Once</SelectItem>
                    <SelectItem value="twice">Play Twice</SelectItem>
                    <SelectItem value="custom">Custom Loop Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.videoLoop === 'custom' && (
                <div className="space-y-2">
                  <Label>Number of Loops</Label>
                  <Input
                    type="number"
                    value={config.videoLoopCount || 3}
                    onChange={(e) => updateConfig({ videoLoopCount: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={100}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>

      {/* Media Picker Dialog */}
      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select {mediaType === 'image' ? 'Image' : 'Video'}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <MediaGrid
                onSelect={handleMediaSelect}
                selectionMode={true}
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                onUploadComplete={(url) => {
                  handleMediaSelect(url);
                }}
                multiple={false}
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}

// Helper function to convert Tailwind gradient direction to CSS angle
function getGradientAngle(direction: string): string {
  const angles: Record<string, string> = {
    'to-r': '90deg',
    'to-l': '270deg',
    'to-b': '180deg',
    'to-t': '0deg',
    'to-br': '135deg',
    'to-bl': '225deg',
    'to-tr': '45deg',
    'to-tl': '315deg',
  };
  return angles[direction] || '90deg';
}

// Helper function to calculate media opacity and overlay darkness from visibility value
// 0% = transparent (invisible), 50% = normal (fully visible), 100% = fully dark
function getVisibilityStyles(visibility: number): { mediaOpacity: number; overlayOpacity: number } {
  const value = visibility ?? 50;
  // 0-50: media fades in from invisible to fully visible
  const mediaOpacity = Math.min(value * 2, 100) / 100;
  // 50-100: overlay fades in from transparent to fully dark
  const overlayOpacity = Math.max(0, (value - 50) * 2) / 100;
  return { mediaOpacity, overlayOpacity };
}

// Helper function to generate inline background styles from config
export function getBackgroundStyles(config?: BackgroundConfig): React.CSSProperties {
  if (!config || config.type === 'none') {
    return {};
  }

  if (config.type === 'color') {
    const opacity = (config.opacity ?? 100) / 100;
    
    if (config.colorType === 'gradient') {
      const from = config.gradientFrom || '#000000';
      const to = config.gradientTo || '#ffffff';
      const angle = getGradientAngle(config.gradientDirection || 'to-r');
      return {
        background: `linear-gradient(${angle}, ${hexToRgba(from, opacity)}, ${hexToRgba(to, opacity)})`,
      };
    } else {
      return {
        backgroundColor: hexToRgba(config.color || '#000000', opacity),
      };
    }
  }

  return {};
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

// Component to render the background (for blocks to use)
export function BackgroundRenderer({ config }: { config?: BackgroundConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playCountRef = useRef(0);
  const [shouldPlay, setShouldPlay] = useState(true);

  // Reset play count when video URL changes
  useEffect(() => {
    playCountRef.current = 0;
    setShouldPlay(true);
  }, [config?.videoUrl]);

  const handleVideoEnded = () => {
    if (!config || config.videoLoop === 'infinite') return;
    
    playCountRef.current += 1;
    
    const maxLoops = config.videoLoop === 'once' ? 1 
      : config.videoLoop === 'twice' ? 2 
      : config.videoLoopCount || 3;
    
    if (playCountRef.current < maxLoops) {
      // Play again
      videoRef.current?.play();
    } else {
      // Stop playing
      setShouldPlay(false);
    }
  };

  if (!config || config.type === 'none') {
    return null;
  }

  if (config.type === 'color') {
    return (
      <div
        className="absolute inset-0"
        style={getBackgroundStyles(config)}
      />
    );
  }

  if (config.type === 'image' && config.imageUrl) {
    const { mediaOpacity, overlayOpacity } = getVisibilityStyles(config.imageOverlayOpacity ?? 50);
    const redHue = config.imageHueRed ?? 0;
    const greenHue = config.imageHueGreen ?? 0;
    const blueHue = config.imageHueBlue ?? 0;
    
    return (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.imageUrl})`, opacity: mediaOpacity }}
        />
        {overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          />
        )}
        {/* Color hue overlays */}
        {redHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(255, 0, 0, ${redHue / 100})` }}
          />
        )}
        {greenHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(0, 255, 0, ${greenHue / 100})` }}
          />
        )}
        {blueHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(0, 0, 255, ${blueHue / 100})` }}
          />
        )}
      </>
    );
  }

  if (config.type === 'video' && config.videoUrl) {
    const { mediaOpacity, overlayOpacity } = getVisibilityStyles(config.videoOverlayOpacity ?? 50);
    const isInfiniteLoop = !config.videoLoop || config.videoLoop === 'infinite';
    const redHue = config.videoHueRed ?? 0;
    const greenHue = config.videoHueGreen ?? 0;
    const blueHue = config.videoHueBlue ?? 0;
    
    return (
      <>
        {shouldPlay && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop={isInfiniteLoop}
            playsInline
            onEnded={!isInfiniteLoop ? handleVideoEnded : undefined}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: mediaOpacity }}
          >
            <source src={config.videoUrl} type="video/mp4" />
          </video>
        )}
        {overlayOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          />
        )}
        {/* Color hue overlays */}
        {redHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(255, 0, 0, ${redHue / 100})` }}
          />
        )}
        {greenHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(0, 255, 0, ${greenHue / 100})` }}
          />
        )}
        {blueHue > 0 && (
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={{ backgroundColor: `rgba(0, 0, 255, ${blueHue / 100})` }}
          />
        )}
      </>
    );
  }

  return null;
}
