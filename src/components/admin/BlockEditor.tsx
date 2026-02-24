import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Video, AlignLeft, AlignCenter, AlignRight, Palette, Code, Plus, Trash2, Move, GripVertical, ChevronDown, ChevronRight, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MediaGrid } from './MediaGrid';
import { MediaUpload } from './MediaUpload';
import { FONT_FAMILIES, loadGoogleFont } from '@/lib/typography';
import type { PageSection, BlockType, ButtonColorConfig, NestedBlock, BlockLayout } from '@/types/database';
import { ButtonColorEditor } from './ButtonColorEditor';
import { BackgroundEditor, type BackgroundConfig } from './BackgroundEditor';
import type { AnimationConfig } from '@/lib/animations';
import { blockTypes as BLOCK_TYPES } from './visual-builder/BlockPalette';

// Reusable text color input component
function TextColorInput({ 
  value, 
  onChange, 
  label = "Color" 
}: { 
  value?: string; 
  onChange: (color: string) => void; 
  label?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex items-center">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div 
            className="w-6 h-6 rounded border border-input flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            style={{ backgroundColor: value || 'transparent' }}
          >
            {!value && <Palette className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Reusable styled text input component with Text/CSS/HTML modes
interface StyledTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colorValue?: string;
  onColorChange?: (color: string) => void;
  cssValue?: string;
  onCssChange?: (css: string) => void;
  htmlValue?: string;
  onHtmlChange?: (html: string) => void;
  placeholder?: string;
  multiline?: boolean;
  richText?: boolean;
}

type TextMode = 'text' | 'css' | 'html';

function StyledTextInput({
  label,
  value,
  onChange,
  colorValue,
  onColorChange,
  cssValue,
  onCssChange,
  htmlValue,
  onHtmlChange,
  placeholder,
  multiline = false,
  richText = false,
}: StyledTextInputProps) {
  // Determine mode based on stored values
  const getMode = (): TextMode => {
    if (htmlValue) return 'html';
    if (cssValue) return 'css';
    return 'text';
  };
  const [mode, setMode] = useState<TextMode>(getMode);
  const [showOptions, setShowOptions] = useState(false);

  const handleModeChange = (newMode: TextMode) => {
    // Clear other modes when switching
    if (newMode === 'text') {
      onCssChange?.('');
      onHtmlChange?.('');
    } else if (newMode === 'css') {
      onHtmlChange?.('');
    } else if (newMode === 'html') {
      onCssChange?.('');
    }
    setMode(newMode);
    setShowOptions(false);
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'css': return 'CSS';
      case 'html': return 'HTML';
      default: return 'Text';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {onColorChange && mode === 'text' && (
            <TextColorInput
              value={colorValue}
              onChange={onColorChange}
              label={`${label} Color`}
            />
          )}
          {(onCssChange || onHtmlChange) && (
            <div className="relative">
              <Button
                type="button"
                variant={mode !== 'text' ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowOptions(!showOptions)}
              >
                <Code className="h-3 w-3 mr-1" />
                {getModeLabel()}
              </Button>
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-md py-1 min-w-[100px]">
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${mode === 'text' ? 'bg-muted font-medium' : ''}`}
                    onClick={() => handleModeChange('text')}
                  >
                    Text
                  </button>
                  {onCssChange && (
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${mode === 'css' ? 'bg-muted font-medium' : ''}`}
                      onClick={() => handleModeChange('css')}
                    >
                      CSS Styles
                    </button>
                  )}
                  {onHtmlChange && (
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted ${mode === 'html' ? 'bg-muted font-medium' : ''}`}
                      onClick={() => handleModeChange('html')}
                    >
                      HTML Code
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {mode === 'html' ? (
        <div className="space-y-2">
          <Textarea
            value={htmlValue || ''}
            onChange={(e) => onHtmlChange?.(e.target.value)}
            placeholder={`<h1 style="font-size: 48px; color: white;">
  Your Title with 
  <span class="gradient-text">Animated Text</span>
</h1>

<style>
.gradient-text {
  background: linear-gradient(90deg, #ff0000, #ffffff);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s linear infinite;
}
@keyframes gradient {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
</style>`}
            rows={10}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Enter full HTML with inline styles and &lt;style&gt; tags for animations.
          </p>
        </div>
      ) : (
        <>
          {richText ? (
            <RichTextEditor
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
            />
          ) : multiline ? (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={3}
            />
          ) : (
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
          )}

          {mode === 'css' && onCssChange && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Custom CSS Styles</Label>
                {cssValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-xs"
                    onClick={() => onCssChange('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Textarea
                value={cssValue || ''}
                onChange={(e) => onCssChange(e.target.value)}
                placeholder="e.g., background: linear-gradient(90deg, #ff0000, #0000ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter CSS properties to style this text. Use semicolons to separate properties.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface BlockEditorProps {
  section: PageSection;
  onSave: (content: Record<string, unknown>) => void;
  onClose: () => void;
}

export function BlockEditor({ section, onSave, onClose }: BlockEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>(section.content);

  const handleSave = () => {
    onSave(content);
  };

  const updateField = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const renderEditor = () => {
    switch (section.block_type) {
      case 'hero':
        return <HeroEditor content={content} updateField={updateField} />;
      case 'rich_text':
        return <RichTextBlockEditor content={content} updateField={updateField} />;
      case 'image_text':
        return <ImageTextEditor content={content} updateField={updateField} />;
      case 'gallery':
        return <GalleryEditor content={content} updateField={updateField} />;
      case 'testimonials':
        return <DynamicBlockEditor content={content} updateField={updateField} blockType={section.block_type} />;
      case 'faq':
        return <FAQEditor content={content} updateField={updateField} />;
      case 'stats':
        return <StatsEditor content={content} updateField={updateField} />;
      case 'pricing':
        return <PricingEditor content={content} updateField={updateField} />;
      case 'cta':
        return <CTAEditor content={content} updateField={updateField} />;
      case 'embed':
        return <EmbedEditor content={content} updateField={updateField} />;
      case 'services':
      case 'portfolio':
      case 'team':
        return <DynamicBlockEditor content={content} updateField={updateField} blockType={section.block_type} />;
      case 'clients':
        return <ClientsEditor content={content} updateField={updateField} />;
      case 'timeline':
        return <TimelineEditor content={content} updateField={updateField} />;
      case 'values':
        return <ValuesEditor content={content} updateField={updateField} />;
      case 'story':
        return <StoryEditor content={content} updateField={updateField} />;
      case 'why_choose':
        return <WhyChooseEditor content={content} updateField={updateField} />;
      case 'contact_form':
        return <ContactFormEditor content={content} updateField={updateField} />;
      case 'contact_info':
        return <ContactInfoEditor content={content} updateField={updateField} />;
      case 'blog_grid':
        return <BlogGridEditor content={content} updateField={updateField} />;
      case 'category_filter':
        return <CategoryFilterEditor content={content} updateField={updateField} />;
      case 'button':
        return <ButtonBlockEditor content={content} updateField={updateField} />;
      case 'container':
        return <ContainerEditor content={content} updateField={updateField} />;
      default:
        return <p>Unknown block type</p>;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Edit {section.block_type.replace('_', ' ')} Block
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {renderEditor()}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hero Editor
function HeroEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Headline"
        value={(content.headline as string) || ''}
        onChange={(value) => updateField('headline', value)}
        colorValue={content._headlineColor as string | undefined}
        onColorChange={(color) => updateField('_headlineColor', color)}
        cssValue={content._headlineCss as string | undefined}
        onCssChange={(css) => updateField('_headlineCss', css)}
        htmlValue={content._headlineHtml as string | undefined}
        onHtmlChange={(html) => updateField('_headlineHtml', html)}
        placeholder="Main headline"
      />
      <StyledTextInput
        label="Subheadline"
        value={(content.subheadline as string) || ''}
        onChange={(value) => updateField('subheadline', value)}
        colorValue={content._subheadlineColor as string | undefined}
        onColorChange={(color) => updateField('_subheadlineColor', color)}
        cssValue={content._subheadlineCss as string | undefined}
        onCssChange={(css) => updateField('_subheadlineCss', css)}
        htmlValue={content._subheadlineHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subheadlineHtml', html)}
        placeholder="Supporting text"
        richText
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Primary Button Text</Label>
          <Input
            value={(content.primaryButtonText as string) || ''}
            onChange={(e) => updateField('primaryButtonText', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Primary Button URL</Label>
          <Input
            value={(content.primaryButtonUrl as string) || ''}
            onChange={(e) => updateField('primaryButtonUrl', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Secondary Button Text</Label>
          <Input
            value={(content.secondaryButtonText as string) || ''}
            onChange={(e) => updateField('secondaryButtonText', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Secondary Button URL</Label>
          <Input
            value={(content.secondaryButtonUrl as string) || ''}
            onChange={(e) => updateField('secondaryButtonUrl', e.target.value)}
          />
        </div>
      </div>

      {/* Button Styling */}
      {(content.primaryButtonText || content.secondaryButtonText) && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Button Styling</Label>
          {content.primaryButtonText && (
            <ButtonColorEditor
              label="Primary Button Colors"
              value={content._primaryButtonColor as ButtonColorConfig | undefined}
              onChange={(value) => updateField('_primaryButtonColor', value)}
            />
          )}
          {content.secondaryButtonText && (
            <ButtonColorEditor
              label="Secondary Button Colors"
              value={content._secondaryButtonColor as ButtonColorConfig | undefined}
              onChange={(value) => updateField('_secondaryButtonColor', value)}
            />
          )}
          <div className="space-y-2">
            <Label>Button Alignment</Label>
            <Select
              value={(content._buttonAlignment as string) || (content.alignment as string) || 'center'}
              onValueChange={(value) => updateField('_buttonAlignment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {content.primaryButtonText && content.secondaryButtonText && (
            <div className="space-y-2">
              <Label>Button Order</Label>
              <Select
                value={(content._buttonOrder as string) || 'primary-secondary'}
                onValueChange={(value) => updateField('_buttonOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary-secondary">Primary first</SelectItem>
                  <SelectItem value="secondary-primary">Secondary first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Background Section */}
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />

      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select
          value={(content.alignment as string) || 'center'}
          onValueChange={(value) => updateField('alignment', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Rich Text Block Editor
function RichTextBlockEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Heading"
        value={(content.heading as string) || ''}
        onChange={(value) => updateField('heading', value)}
        colorValue={content._headingColor as string | undefined}
        onColorChange={(color) => updateField('_headingColor', color)}
        cssValue={content._headingCss as string | undefined}
        onCssChange={(css) => updateField('_headingCss', css)}
        htmlValue={content._headingHtml as string | undefined}
        onHtmlChange={(html) => updateField('_headingHtml', html)}
        placeholder="Optional heading"
      />
      <StyledTextInput
        label="Featured Label"
        value={(content.featuredLabel as string) || ''}
        onChange={(value) => updateField('featuredLabel', value)}
        colorValue={content._featuredLabelColor as string | undefined}
        onColorChange={(color) => updateField('_featuredLabelColor', color)}
        cssValue={content._featuredLabelCss as string | undefined}
        onCssChange={(css) => updateField('_featuredLabelCss', css)}
        htmlValue={content._featuredLabelHtml as string | undefined}
        onHtmlChange={(html) => updateField('_featuredLabelHtml', html)}
        placeholder="Optional label above heading"
      />
      <StyledTextInput
        label="Content"
        value={(content.content as string) || ''}
        onChange={(value) => updateField('content', value)}
        colorValue={content._contentColor as string | undefined}
        onColorChange={(color) => updateField('_contentColor', color)}
        cssValue={content._contentCss as string | undefined}
        onCssChange={(css) => updateField('_contentCss', css)}
        htmlValue={content._contentHtml as string | undefined}
        onHtmlChange={(html) => updateField('_contentHtml', html)}
        placeholder="Start writing your content here..."
        richText
      />
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Image + Text Editor
function ImageTextEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const imageUrl = (content.imageUrl as string) || '';

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Section title"
      />
      <StyledTextInput
        label="Content"
        value={(content.content as string) || ''}
        onChange={(value) => updateField('content', value)}
        colorValue={content._contentColor as string | undefined}
        onColorChange={(color) => updateField('_contentColor', color)}
        cssValue={content._contentCss as string | undefined}
        onCssChange={(css) => updateField('_contentCss', css)}
        htmlValue={content._contentHtml as string | undefined}
        onHtmlChange={(html) => updateField('_contentHtml', html)}
        richText
      />
      <div className="space-y-2">
        <Label>Image</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMediaPicker(true)}
            className="flex-1"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose from Library
          </Button>
        </div>
        <Input
          value={imageUrl}
          onChange={(e) => updateField('imageUrl', e.target.value)}
          placeholder="Or enter image URL"
        />
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border">
            <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => updateField('imageUrl', '')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Image Alt Text</Label>
        <Input
          value={(content.imageAlt as string) || ''}
          onChange={(e) => updateField('imageAlt', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Image Position</Label>
        <Select
          value={(content.imagePosition as string) || 'left'}
          onValueChange={(value) => updateField('imagePosition', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <MediaGrid
                onSelect={(url) => {
                  updateField('imageUrl', url);
                  setShowMediaPicker(false);
                }}
                selectionMode
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                onUploadComplete={(url) => {
                  updateField('imageUrl', url);
                  setShowMediaPicker(false);
                }}
                multiple={false}
                accept="image/*"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Gallery Editor
function GalleryEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);
  const images = (content.images as Array<{ url: string; alt?: string; caption?: string }>) || [];

  const addImage = () => {
    updateField('images', [...images, { url: '', alt: '', caption: '' }]);
  };

  const updateImage = (index: number, field: string, value: string) => {
    const updated = images.map((img, i) => (i === index ? { ...img, [field]: value } : img));
    updateField('images', updated);
  };

  const removeImage = (index: number) => {
    updateField('images', images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Gallery title"
      />
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String(content.columns || 3)}
          onValueChange={(value) => updateField('columns', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            + Add Image
          </Button>
        </div>
        {images.map((image, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Image {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {image.url && (
              <div className="relative rounded overflow-hidden border">
                <img src={image.url} alt={image.alt || ''} className="w-full h-24 object-cover" />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setPickingForIndex(index);
                setShowMediaPicker(true);
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {image.url ? 'Change Image' : 'Choose from Library'}
            </Button>
            <Input
              placeholder="Or enter image URL"
              value={image.url}
              onChange={(e) => updateImage(index, 'url', e.target.value)}
            />
            <Input
              placeholder="Alt text"
              value={image.alt || ''}
              onChange={(e) => updateImage(index, 'alt', e.target.value)}
            />
          </div>
        ))}
      </div>

      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <MediaGrid
                onSelect={(url) => {
                  if (pickingForIndex !== null) {
                    updateImage(pickingForIndex, 'url', url);
                  }
                  setShowMediaPicker(false);
                  setPickingForIndex(null);
                }}
                selectionMode
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                onUploadComplete={(url) => {
                  if (pickingForIndex !== null) {
                    updateImage(pickingForIndex, 'url', url);
                  }
                  setShowMediaPicker(false);
                  setPickingForIndex(null);
                }}
                multiple={false}
                accept="image/*"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Testimonials Editor
function TestimonialsEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Section title"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="Optional subtitle"
      />
      <div className="space-y-2">
        <Label>Display Style</Label>
        <Select
          value={(content.displayStyle as string) || 'carousel'}
          onValueChange={(value) => updateField('displayStyle', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        Testimonials are automatically pulled from the Testimonials section in the CMS.
      </p>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// FAQ Editor
function FAQEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const items = (content.items as Array<{ question: string; answer: string }>) || [];

  const addItem = () => {
    updateField('items', [...items, { question: '', answer: '' }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    updateField('items', updated);
  };

  const removeItem = (index: number) => {
    updateField('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="FAQ section title"
      />
      <div className="space-y-3">
        <Label>FAQ Items</Label>
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Item {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => updateItem(index, 'question', e.target.value)}
            />
            <RichTextEditor
              placeholder="Answer"
              value={item.answer}
              onChange={(value) => updateItem(index, 'answer', value)}
              minHeight="80px"
            />
          </div>
        ))}
        <Button variant="outline" onClick={addItem} className="w-full">
          Add FAQ Item
        </Button>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Stats Editor
function StatsEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const items = (content.items as Array<{ value: string; label: string; suffix?: string }>) || [];

  const addItem = () => {
    updateField('items', [...items, { value: '0', label: 'Label', suffix: '' }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    updateField('items', updated);
  };

  const removeItem = (index: number) => {
    updateField('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title (optional)"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Stats section title"
      />
      <div className="space-y-3">
        <Label>Stats Items</Label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateItem(index, 'value', e.target.value)}
              className="w-24"
            />
            <Input
              placeholder="Suffix (+, %, etc.)"
              value={item.suffix || ''}
              onChange={(e) => updateItem(index, 'suffix', e.target.value)}
              className="w-20"
            />
            <Input
              placeholder="Label"
              value={item.label}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addItem} className="w-full">
          Add Stat
        </Button>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Pricing Editor
function PricingEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const plans = (content.plans as Array<{
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText?: string;
    buttonUrl?: string;
    isHighlighted?: boolean;
    _buttonColor?: ButtonColorConfig;
  }>) || [];

  const addPlan = () => {
    updateField('plans', [
      ...plans,
      { name: 'Plan', price: '$0', features: [], buttonText: 'Get Started', buttonUrl: '/contact' },
    ]);
  };

  const updatePlan = (index: number, field: string, value: unknown) => {
    const updated = plans.map((plan, i) => (i === index ? { ...plan, [field]: value } : plan));
    updateField('plans', updated);
  };

  const removePlan = (index: number) => {
    updateField('plans', plans.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Pricing section title"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="Optional subtitle"
      />
      <div className="space-y-4">
        <Label>Pricing Plans</Label>
        {plans.map((plan, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan {index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removePlan(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Plan name"
                value={plan.name}
                onChange={(e) => updatePlan(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Price"
                value={plan.price}
                onChange={(e) => updatePlan(index, 'price', e.target.value)}
              />
            </div>
            <Input
              placeholder="Period (e.g., /month)"
              value={plan.period || ''}
              onChange={(e) => updatePlan(index, 'period', e.target.value)}
            />
            <RichTextEditor
              placeholder="Description"
              value={plan.description || ''}
              onChange={(value) => updatePlan(index, 'description', value)}
              minHeight="60px"
            />
            <div className="space-y-2">
              <Label className="text-xs">Features (one per line)</Label>
              <Textarea
                value={plan.features.join('\n')}
                onChange={(e) => updatePlan(index, 'features', e.target.value.split('\n').filter(Boolean))}
                rows={4}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.isHighlighted || false}
                onCheckedChange={(checked) => updatePlan(index, 'isHighlighted', checked)}
              />
              <Label>Highlight this plan</Label>
            </div>
            <ButtonColorEditor
              label="Button Colors"
              value={plan._buttonColor}
              onChange={(value) => updatePlan(index, '_buttonColor', value)}
            />
          </div>
        ))}
        <Button variant="outline" onClick={addPlan} className="w-full">
          Add Pricing Plan
        </Button>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// CTA Editor
function CTAEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const bgImage = (content.backgroundImage as string) || '';

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="CTA title"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        richText
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={(content.buttonText as string) || ''}
            onChange={(e) => updateField('buttonText', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Button URL</Label>
          <Input
            value={(content.buttonUrl as string) || ''}
            onChange={(e) => updateField('buttonUrl', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Background Style</Label>
        <Select
          value={(content.backgroundStyle as string) || 'gradient'}
          onValueChange={(value) => updateField('backgroundStyle', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.backgroundStyle === 'image' && (
        <div className="space-y-2">
          <Label>Background Image</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMediaPicker(true)}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose from Library
          </Button>
          <Input
            value={bgImage}
            onChange={(e) => updateField('backgroundImage', e.target.value)}
            placeholder="Or enter image URL"
          />
          {bgImage && (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={bgImage} alt="Background preview" className="w-full h-32 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => updateField('backgroundImage', '')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Button Styling */}
      {content.buttonText && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Button Styling</Label>
          <ButtonColorEditor
            label="Button Colors"
            value={content._buttonColor as ButtonColorConfig | undefined}
            onChange={(value) => updateField('_buttonColor', value)}
          />
          <div className="space-y-2">
            <Label>Button Alignment</Label>
            <Select
              value={(content._buttonAlignment as string) || 'center'}
              onValueChange={(value) => updateField('_buttonAlignment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <MediaGrid
                onSelect={(url) => {
                  updateField('backgroundImage', url);
                  setShowMediaPicker(false);
                }}
                selectionMode
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                onUploadComplete={(url) => {
                  updateField('backgroundImage', url);
                  setShowMediaPicker(false);
                }}
                multiple={false}
                accept="image/*"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Embed Editor
function EmbedEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Embed Type</Label>
        <Select
          value={(content.embedType as string) || 'video'}
          onValueChange={(value) => updateField('embedType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="map">Map</SelectItem>
            <SelectItem value="custom">Custom HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content.embedType !== 'custom' ? (
        <div className="space-y-2">
          <Label>Embed URL</Label>
          <Input
            value={(content.embedUrl as string) || ''}
            onChange={(e) => updateField('embedUrl', e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Embed Code</Label>
          <Textarea
            value={(content.embedCode as string) || ''}
            onChange={(e) => updateField('embedCode', e.target.value)}
            rows={5}
            className="font-mono text-sm"
            placeholder="<iframe>...</iframe>"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Aspect Ratio</Label>
        <Select
          value={(content.aspectRatio as string) || '16:9'}
          onValueChange={(value) => updateField('aspectRatio', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">16:9</SelectItem>
            <SelectItem value="4:3">4:3</SelectItem>
            <SelectItem value="1:1">1:1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Clients Editor - inline logo management with per-logo height
function ClientsEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);

  const logos = (content.logos as Array<{ id: string; name: string; logo_url: string; website_url?: string; height?: number }>) || [];

  const addLogo = () => {
    const newLogo = {
      id: crypto.randomUUID(),
      name: '',
      logo_url: '',
      website_url: '',
      height: 48,
    };
    updateField('logos', [...logos, newLogo]);
  };

  const updateLogo = (index: number, field: string, value: unknown) => {
    const updated = [...logos];
    updated[index] = { ...updated[index], [field]: value };
    updateField('logos', updated);
  };

  const deleteLogo = (index: number) => {
    updateField('logos', logos.filter((_, i) => i !== index));
  };

  const moveLogo = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === logos.length - 1)) return;
    const updated = [...logos];
    const target = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    updateField('logos', updated);
  };

  const handleMediaSelect = (url: string) => {
    if (pickingForIndex !== null) {
      updateLogo(pickingForIndex, 'logo_url', url);
    }
    setShowMediaPicker(false);
    setPickingForIndex(null);
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Our Clients"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="Trusted by leading companies"
      />

      <div className="space-y-2">
        <Label>Display Style</Label>
        <Select
          value={(content.displayStyle as string) || 'grid'}
          onValueChange={(value) => updateField('displayStyle', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Client Logos ({logos.length})</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLogo}>
            + Add Logo
          </Button>
        </div>

        {logos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
            No logos added. Click "Add Logo" to get started.
          </p>
        )}

        <div className="space-y-3">
          {logos.map((logo, index) => (
            <div key={logo.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Logo {index + 1}{logo.name ? ` - ${logo.name}` : ''}
                </span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveLogo(index, 'up')} disabled={index === 0}>
                    ↑
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveLogo(index, 'down')} disabled={index === logos.length - 1}>
                    ↓
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteLogo(index)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Logo Image */}
              <div className="flex items-center gap-3">
                {logo.logo_url ? (
                  <div className="relative w-20 h-14 border rounded bg-muted/50 flex items-center justify-center overflow-hidden">
                    <img src={logo.logo_url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-14 border rounded border-dashed bg-muted/30 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setPickingForIndex(index);
                      setShowMediaPicker(true);
                    }}
                  >
                    {logo.logo_url ? 'Change Image' : 'Select Image'}
                  </Button>
                  <Input
                    value={logo.logo_url || ''}
                    onChange={(e) => updateLogo(index, 'logo_url', e.target.value)}
                    placeholder="Or paste image URL"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {/* Name */}
              <Input
                value={logo.name || ''}
                onChange={(e) => updateLogo(index, 'name', e.target.value)}
                placeholder="Client name"
                className="h-8 text-sm"
              />

              {/* Website URL */}
              <Input
                value={logo.website_url || ''}
                onChange={(e) => updateLogo(index, 'website_url', e.target.value)}
                placeholder="Website URL (optional)"
                className="h-8 text-sm"
              />

              {/* Height */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Height</Label>
                <Input
                  type="range"
                  min="20"
                  max="120"
                  step="2"
                  value={logo.height || 48}
                  onChange={(e) => updateLogo(index, 'height', parseInt(e.target.value))}
                  className="flex-1 h-6 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">{logo.height || 48}px</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Picker Dialog */}
      <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Logo Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="mt-4">
              <MediaGrid
                onSelect={handleMediaSelect}
                selectionMode
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                onUploadComplete={handleMediaSelect}
                multiple={false}
                accept="image/*"
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Dynamic Block Editor (Services, Portfolio, Team, Testimonials)
function DynamicBlockEditor({
  content,
  updateField,
  blockType,
}: {
  content: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
  blockType: string;
}) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Section title (optional)"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="Section subtitle (optional)"
      />

      {/* Display Style (not for testimonials/team/services) */}
      {(blockType === 'portfolio' || blockType === 'clients') && (
        <div className="space-y-2">
          <Label>Display Style</Label>
          <Select
            value={(content.displayStyle as string) || 'grid'}
            onValueChange={(value) => updateField('displayStyle', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
              {blockType === 'portfolio' && <SelectItem value="masonry">Masonry</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Featured Only Toggle */}
      {(blockType === 'services' || blockType === 'portfolio' || blockType === 'testimonials') && (
        <div className="flex items-center gap-2">
          <Switch
            checked={(content.featuredOnly as boolean) !== false}
            onCheckedChange={(checked) => updateField('featuredOnly', checked)}
          />
          <Label>Show featured only</Label>
        </div>
      )}

      {/* Limit */}
      {blockType !== 'clients' && (
        <div className="space-y-2">
          <Label>Limit (0 = show all)</Label>
          <Input
            type="number"
            value={(content.limit as number) || 0}
            onChange={(e) => updateField('limit', parseInt(e.target.value) || 0)}
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of items to display
          </p>
        </div>
      )}

      {/* Columns (Team only) */}
      {blockType === 'team' && (
        <div className="space-y-2">
          <Label>Columns</Label>
          <Select
            value={String((content.columns as number) || 4)}
            onValueChange={(value) => updateField('columns', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          Content is automatically pulled from the {blockType} section in the CMS.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          To select specific items, use the admin panel to manage {blockType}.
        </p>
      </div>

      {/* Background */}
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Timeline Editor
function TimelineEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const items = (content.items as Array<{ year: string; title: string; description: string }>) || [];

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addItem = () => {
    updateField('items', [...items, { year: '', title: '', description: '' }]);
    setEditingIndex(items.length);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField('items', newItems);
  };

  const deleteItem = (index: number) => {
    updateField('items', items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    updateField('items', newItems);
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Our Journey"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="Key milestones"
      />

      <div className="space-y-2">
        <Label>Timeline Items</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{item.year || 'New Item'} - {item.title || 'Untitled'}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    {editingIndex === index ? 'Close' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editingIndex === index && (
                <div className="space-y-2 mt-2">
                  <Input
                    placeholder="Year (e.g., 2020)"
                    value={item.year}
                    onChange={(e) => updateItem(index, 'year', e.target.value)}
                  />
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <RichTextEditor
                    placeholder="Description"
                    value={item.description}
                    onChange={(value) => updateItem(index, 'description', value)}
                    minHeight="80px"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={addItem} className="w-full">
          Add Timeline Item
        </Button>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Values Editor
function ValuesEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const iconOptions = [
    'target', 'heart', 'users', 'award', 'zap', 'shield',
    'trending-up', 'check-circle', 'star', 'lightbulb'
  ];

  const addItem = () => {
    updateField('items', [...items, { icon: 'target', title: '', description: '' }]);
    setEditingIndex(items.length);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField('items', newItems);
  };

  const deleteItem = (index: number) => {
    updateField('items', items.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Our Values"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="What we believe in"
      />
      <div className="space-y-2">
        <Label>Columns</Label>
        <Select
          value={String((content.columns as number) || 4)}
          onValueChange={(value) => updateField('columns', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
            <SelectItem value="4">4 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Values</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{item.title || 'Untitled Value'}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    {editingIndex === index ? 'Close' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editingIndex === index && (
                <div className="space-y-2 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Icon</Label>
                    <Select
                      value={item.icon}
                      onValueChange={(value) => updateItem(index, 'icon', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                  />
                  <RichTextEditor
                    placeholder="Description"
                    value={item.description}
                    onChange={(value) => updateItem(index, 'description', value)}
                    minHeight="60px"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={addItem} className="w-full">
          Add Value
        </Button>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Story Editor
function StoryEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const paragraphs = (content.paragraphs as string[]) || ['', '', ''];
  const stats = (content.stats as Record<string, string>) || {};

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = value;
    updateField('paragraphs', newParagraphs);
  };

  const addParagraph = () => {
    updateField('paragraphs', [...paragraphs, '']);
  };

  const removeParagraph = (index: number) => {
    updateField('paragraphs', paragraphs.filter((_, i) => i !== index));
  };

  const updateStat = (key: string, value: string) => {
    updateField('stats', { ...stats, [key]: value });
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Our Story"
      />

      <div className="space-y-2">
        <Label>Paragraphs</Label>
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <RichTextEditor
                value={paragraph}
                onChange={(value) => updateParagraph(index, value)}
                placeholder={`Paragraph ${index + 1}`}
                minHeight="80px"
              />
            </div>
            {paragraphs.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeParagraph(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addParagraph} className="w-full">
          Add Paragraph
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Stats (Optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Years Experience"
            value={stats.yearsExperience || ''}
            onChange={(e) => updateStat('yearsExperience', e.target.value)}
          />
          <Input
            placeholder="Projects Completed"
            value={stats.projectsCompleted || ''}
            onChange={(e) => updateStat('projectsCompleted', e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Add custom stats by typing key-value pairs (e.g., "10+" for years)
        </p>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Why Choose Editor
function WhyChooseEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const reasons = (content.reasons as string[]) || [];
  const stats = (content.stats as Record<string, string>) || {};

  const updateReasons = (value: string) => {
    updateField('reasons', value.split('\n').filter(Boolean));
  };

  const updateStat = (key: string, value: string) => {
    updateField('stats', { ...stats, [key]: value });
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Why Choose Us"
      />

      <div className="space-y-2">
        <Label>Reasons (one per line)</Label>
        <Textarea
          value={reasons.join('\n')}
          onChange={(e) => updateReasons(e.target.value)}
          rows={8}
          placeholder="Reason 1&#10;Reason 2&#10;Reason 3"
        />
      </div>

      <div className="space-y-2">
        <Label>Stats (Optional)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Client Satisfaction (e.g., 98%)"
            value={stats.clientSatisfaction || ''}
            onChange={(e) => updateStat('clientSatisfaction', e.target.value)}
          />
          <Input
            placeholder="Projects Completed (e.g., 150+)"
            value={stats.projectsCompleted || ''}
            onChange={(e) => updateStat('projectsCompleted', e.target.value)}
          />
          <Input
            placeholder="Happy Clients (e.g., 50+)"
            value={stats.happyClients || ''}
            onChange={(e) => updateStat('happyClients', e.target.value)}
          />
          <Input
            placeholder="Support (e.g., 24/7)"
            value={stats.supportAvailable || ''}
            onChange={(e) => updateStat('supportAvailable', e.target.value)}
          />
        </div>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Contact Form Editor
function ContactFormEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const [editingField, setEditingField] = useState<number | null>(null);
  const fields = (content.fields as Array<{
    id: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
  }>) || [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
    { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1234567890', required: false },
    { id: 'company', label: 'Company', type: 'text', placeholder: 'Your company', required: false },
    { id: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?', required: false },
    { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...', required: true },
  ];

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
    };
    updateField('fields', [...fields, newField]);
  };

  const updateFieldAtIndex = (index: number, key: string, value: unknown) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    updateField('fields', updatedFields);
  };

  const deleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    updateField('fields', updatedFields);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const updatedFields = [...fields];
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    updateField('fields', updatedFields);
  };

  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Send Us a Message"
      />
      <StyledTextInput
        label="Subtitle"
        value={(content.subtitle as string) || ''}
        onChange={(value) => updateField('subtitle', value)}
        colorValue={content._subtitleColor as string | undefined}
        onColorChange={(color) => updateField('_subtitleColor', color)}
        cssValue={content._subtitleCss as string | undefined}
        onCssChange={(css) => updateField('_subtitleCss', css)}
        htmlValue={content._subtitleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_subtitleHtml', html)}
        placeholder="We'll get back to you within 24 hours"
      />

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-base">Form Fields</Label>
          <Button type="button" size="sm" onClick={addField}>
            <Upload className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{field.label}</span>
                  <span className="text-xs text-muted-foreground">({field.type})</span>
                  {field.required && <span className="text-xs text-destructive">*Required</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingField(editingField === index ? null : index)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingField === index && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div className="space-y-1">
                    <Label className="text-xs">Field ID</Label>
                    <Input
                      value={field.id}
                      onChange={(e) => updateFieldAtIndex(index, 'id', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="field_name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateFieldAtIndex(index, 'label', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Field Label"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateFieldAtIndex(index, 'type', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Phone</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateFieldAtIndex(index, 'placeholder', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Enter placeholder..."
                    />
                  </div>
                  {field.type === 'select' && (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Options (comma-separated)</Label>
                      <Input
                        value={(field.options || []).join(', ')}
                        onChange={(e) => updateFieldAtIndex(index, 'options', e.target.value.split(',').map(o => o.trim()))}
                        className="h-8 text-sm"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateFieldAtIndex(index, 'required', checked)}
                    />
                    <Label className="text-xs">Required field</Label>
                  </div>
                </div>
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No fields yet. Click "Add Field" to create one.
            </p>
          )}
        </div>
      </div>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Contact Info Editor
function ContactInfoEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Contact Information"
      />
      <div className="flex items-center gap-2">
        <Switch
          checked={(content.showFromSettings as boolean) !== false}
          onCheckedChange={(checked) => updateField('showFromSettings', checked)}
        />
        <Label>Pull from Site Settings</Label>
      </div>
      {!(content.showFromSettings !== false) && (
        <>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={(content.email as string) || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="info@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={(content.phone as string) || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={(content.address as string) || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="123 Main St, City, Country"
            />
          </div>
        </>
      )}
      <p className="text-sm text-muted-foreground">
        {(content.showFromSettings !== false)
          ? 'Contact information will be pulled from Site Settings.'
          : 'Using custom contact information for this block.'}
      </p>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Blog Grid Editor
function BlogGridEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <StyledTextInput
        label="Title"
        value={(content.title as string) || ''}
        onChange={(value) => updateField('title', value)}
        colorValue={content._titleColor as string | undefined}
        onColorChange={(color) => updateField('_titleColor', color)}
        cssValue={content._titleCss as string | undefined}
        onCssChange={(css) => updateField('_titleCss', css)}
        htmlValue={content._titleHtml as string | undefined}
        onHtmlChange={(html) => updateField('_titleHtml', html)}
        placeholder="Latest Posts"
      />
      <div className="space-y-2">
        <Label>Layout</Label>
        <Select
          value={(content.layout as string) || 'grid'}
          onValueChange={(value) => updateField('layout', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Posts Per Page</Label>
        <Input
          type="number"
          value={(content.postsPerPage as number) || 9}
          onChange={(e) => updateField('postsPerPage', parseInt(e.target.value) || 9)}
          min={1}
          max={50}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Blog posts are automatically pulled from the Blog Posts section.
      </p>
      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}

// Button Block Editor
function ButtonBlockEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Button Text</Label>
        <Input
          value={(content.text as string) || ''}
          onChange={(e) => updateField('text', e.target.value)}
          placeholder="Click Me"
        />
      </div>
      <div className="space-y-2">
        <Label>Button URL</Label>
        <Input
          value={(content.url as string) || ''}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="/contact"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={(content.openInNewTab as boolean) || false}
          onCheckedChange={(checked) => updateField('openInNewTab', checked)}
        />
        <Label>Open in new tab</Label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Variant</Label>
          <Select
            value={(content.variant as string) || 'default'}
            onValueChange={(value) => updateField('variant', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (Filled)</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Size</Label>
          <Select
            value={(content.size as string) || 'default'}
            onValueChange={(value) => updateField('size', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select
          value={(content.alignment as string) || 'center'}
          onValueChange={(value) => updateField('alignment', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ButtonColorEditor
        label="Button Colors"
        value={content._buttonColor as ButtonColorConfig | undefined}
        onChange={(value) => updateField('_buttonColor', value)}
      />
    </div>
  );
}

// Exported panel version for use in visual builder sidebar (no Dialog wrapper)
export function BlockEditorPanel({
  blockType,
  content,
  updateField,
}: {
  blockType: BlockType;
  content: Record<string, unknown>;
  updateField: (key: string, value: unknown) => void;
}) {
  switch (blockType) {
    case 'hero':
      return <HeroEditor content={content} updateField={updateField} />;
    case 'rich_text':
      return <RichTextBlockEditor content={content} updateField={updateField} />;
    case 'image_text':
      return <ImageTextEditor content={content} updateField={updateField} />;
    case 'gallery':
      return <GalleryEditor content={content} updateField={updateField} />;
    case 'testimonials':
      return <DynamicBlockEditor content={content} updateField={updateField} blockType={blockType} />;
    case 'faq':
      return <FAQEditor content={content} updateField={updateField} />;
    case 'stats':
      return <StatsEditor content={content} updateField={updateField} />;
    case 'pricing':
      return <PricingEditor content={content} updateField={updateField} />;
    case 'cta':
      return <CTAEditor content={content} updateField={updateField} />;
    case 'embed':
      return <EmbedEditor content={content} updateField={updateField} />;
    case 'services':
    case 'portfolio':
    case 'team':
      return <DynamicBlockEditor content={content} updateField={updateField} blockType={blockType} />;
    case 'clients':
      return <ClientsEditor content={content} updateField={updateField} />;
    case 'timeline':
      return <TimelineEditor content={content} updateField={updateField} />;
    case 'values':
      return <ValuesEditor content={content} updateField={updateField} />;
    case 'story':
      return <StoryEditor content={content} updateField={updateField} />;
    case 'why_choose':
      return <WhyChooseEditor content={content} updateField={updateField} />;
    case 'contact_form':
      return <ContactFormEditor content={content} updateField={updateField} />;
    case 'contact_info':
      return <ContactInfoEditor content={content} updateField={updateField} />;
    case 'blog_grid':
      return <BlogGridEditor content={content} updateField={updateField} />;
    case 'category_filter':
      return <CategoryFilterEditor content={content} updateField={updateField} />;
    case 'button':
      return <ButtonBlockEditor content={content} updateField={updateField} />;
    case 'container':
      return <ContainerEditor content={content} updateField={updateField} />;
    default:
      return <p>Unknown block type</p>;
  }
}

// Category Filter Editor
function CategoryFilterEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={(content.style as string) || 'pills'}
          onValueChange={(value) => updateField('style', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pills">Pills</SelectItem>
            <SelectItem value="tabs">Tabs</SelectItem>
            <SelectItem value="dropdown">Dropdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={(content.showAll as boolean) !== false}
          onCheckedChange={(checked) => updateField('showAll', checked)}
        />
        <Label>Show "All Posts" option</Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Categories are automatically pulled from the Categories section.
      </p>
    </div>
  );
}

// Container Editor (for nested blocks)
function ContainerEditor({ content, updateField }: { content: Record<string, unknown>; updateField: (key: string, value: unknown) => void }) {
  const layout = (content._containerLayout as string) || 'flex';
  const direction = (content._direction as string) || 'column';
  const gap = (content._gap as number) || 16;
  const columns = (content._columns as number) || 2;
  const children = (content.children as NestedBlock[]) || [];
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [dragState, setDragState] = useState<{ id: string; type: 'move' | 'resize-e' | 'resize-w' | 'resize-se'; startX: number; startY: number; startLayout: BlockLayout } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Add a new nested block
  const addNestedBlock = useCallback((blockType: BlockType) => {
    const newBlock: NestedBlock = {
      id: crypto.randomUUID(),
      block_type: blockType,
      content: {},
      layout: {
        x: 0,
        y: children.length * 80,
        width: 100,
        height: 'auto',
        zIndex: children.length + 1,
      },
      is_visible: true,
      children: blockType === 'container' ? [] : undefined,
    };
    updateField('children', [...children, newBlock]);
    setShowAddBlock(false);
    setSelectedChildId(newBlock.id);
  }, [children, updateField]);

  // Update a nested block
  const updateNestedBlock = useCallback((id: string, updates: Partial<NestedBlock>) => {
    const updated = children.map(child => 
      child.id === id ? { ...child, ...updates } : child
    );
    updateField('children', updated);
  }, [children, updateField]);

  // Update nested block layout
  const updateNestedLayout = useCallback((id: string, layoutUpdates: Partial<BlockLayout>) => {
    const updated = children.map(child => 
      child.id === id ? { ...child, layout: { ...child.layout, ...layoutUpdates } } : child
    );
    updateField('children', updated);
  }, [children, updateField]);

  // Delete a nested block
  const deleteNestedBlock = useCallback((id: string) => {
    updateField('children', children.filter(c => c.id !== id));
    if (selectedChildId === id) setSelectedChildId(null);
  }, [children, updateField, selectedChildId]);

  // Move block up/down in order
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    const index = children.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      const newChildren = [...children];
      [newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]];
      updateField('children', newChildren);
    } else if (direction === 'down' && index < children.length - 1) {
      const newChildren = [...children];
      [newChildren[index], newChildren[index + 1]] = [newChildren[index + 1], newChildren[index]];
      updateField('children', newChildren);
    }
  }, [children, updateField]);

  // Handle mouse down for drag/resize
  const handleMouseDown = useCallback((e: React.MouseEvent, id: string, type: 'move' | 'resize-e' | 'resize-w' | 'resize-se') => {
    e.preventDefault();
    e.stopPropagation();
    const child = children.find(c => c.id === id);
    if (!child) return;
    setDragState({ id, type, startX: e.clientX, startY: e.clientY, startLayout: { ...child.layout } });
  }, [children]);

  // Handle mouse move for drag/resize
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || !canvasRef.current) return;
    
    const canvas = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;
    
    const { type, startLayout, id } = dragState;
    
    if (type === 'move') {
      // Convert px delta to percentage for x, keep px for y
      const newX = Math.max(0, Math.min(100 - startLayout.width, startLayout.x + (deltaX / canvas.width) * 100));
      const newY = Math.max(0, startLayout.y + deltaY);
      updateNestedLayout(id, { x: Math.round(newX), y: Math.round(newY) });
    } else if (type === 'resize-e') {
      // Resize from east (right)
      const newWidth = Math.max(10, Math.min(100 - startLayout.x, startLayout.width + (deltaX / canvas.width) * 100));
      updateNestedLayout(id, { width: Math.round(newWidth) });
    } else if (type === 'resize-w') {
      // Resize from west (left)
      const widthDelta = (deltaX / canvas.width) * 100;
      const newX = Math.max(0, startLayout.x + widthDelta);
      const newWidth = Math.max(10, startLayout.width - widthDelta);
      if (newX >= 0 && newWidth >= 10) {
        updateNestedLayout(id, { x: Math.round(newX), width: Math.round(newWidth) });
      }
    } else if (type === 'resize-se') {
      // Resize from southeast (bottom-right)
      const newWidth = Math.max(10, Math.min(100 - startLayout.x, startLayout.width + (deltaX / canvas.width) * 100));
      const newHeight = typeof startLayout.height === 'number' 
        ? Math.max(50, startLayout.height + deltaY)
        : Math.max(50, 100 + deltaY);
      updateNestedLayout(id, { width: Math.round(newWidth), height: Math.round(newHeight) });
    }
  }, [dragState, updateNestedLayout]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Add global mouse event listeners for drag operations
  useEffect(() => {
    if (!dragState) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragState || !canvasRef.current) return;
      
      const canvas = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      const { type, startLayout, id } = dragState;
      
      if (type === 'move') {
        const newX = Math.max(0, Math.min(100 - startLayout.width, startLayout.x + (deltaX / canvas.width) * 100));
        const newY = Math.max(0, startLayout.y + deltaY);
        updateNestedLayout(id, { x: Math.round(newX), y: Math.round(newY) });
      } else if (type === 'resize-e') {
        const newWidth = Math.max(10, Math.min(100 - startLayout.x, startLayout.width + (deltaX / canvas.width) * 100));
        updateNestedLayout(id, { width: Math.round(newWidth) });
      } else if (type === 'resize-w') {
        const widthDelta = (deltaX / canvas.width) * 100;
        const newX = Math.max(0, startLayout.x + widthDelta);
        const newWidth = Math.max(10, startLayout.width - widthDelta);
        if (newX >= 0 && newWidth >= 10) {
          updateNestedLayout(id, { x: Math.round(newX), width: Math.round(newWidth) });
        }
      } else if (type === 'resize-se') {
        const newWidth = Math.max(10, Math.min(100 - startLayout.x, startLayout.width + (deltaX / canvas.width) * 100));
        const newHeight = typeof startLayout.height === 'number' 
          ? Math.max(50, startLayout.height + deltaY)
          : Math.max(50, 100 + deltaY);
        updateNestedLayout(id, { width: Math.round(newWidth), height: Math.round(newHeight) });
      }
    };

    const handleGlobalMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, updateNestedLayout]);

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Container Block:</strong> Add blocks below and arrange them. Set Layout Type to "Absolute Position" for drag handles.
        </p>
      </div>

      {/* Layout Settings */}
      <Collapsible defaultOpen={true}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <span className="text-sm font-medium">Container Layout</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Layout Type</Label>
            <Select value={layout} onValueChange={(value) => updateField('_containerLayout', value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flex">Flexbox</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="absolute">Absolute Position</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {layout === 'flex' && (
            <div className="space-y-2">
              <Label className="text-xs">Direction</Label>
              <Select value={direction} onValueChange={(value) => updateField('_direction', value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Horizontal</SelectItem>
                  <SelectItem value="column">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {layout === 'grid' && (
            <div className="space-y-2">
              <Label className="text-xs">Columns</Label>
              <Select value={String(columns)} onValueChange={(value) => updateField('_columns', parseInt(value))}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Columns</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Gap: {gap}px</Label>
            <Slider value={[gap]} onValueChange={([v]) => updateField('_gap', v)} min={0} max={64} step={4} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Nested Blocks Canvas */}
      <div className="border rounded-lg overflow-visible">
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
          <span className="text-sm font-medium">Nested Blocks ({children.length})</span>
          <Button size="sm" variant="default" className="h-8 text-xs gap-1" onClick={() => setShowAddBlock(true)}>
            <Plus className="h-4 w-4" />
            Add Nested Block
          </Button>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="relative min-h-[300px] bg-muted/20 p-4 overflow-visible"
          style={{ cursor: dragState ? (dragState.type === 'move' ? 'grabbing' : 'ew-resize') : 'default' }}
          onClick={() => setSelectedChildId(null)}
        >
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              <Layers className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-base font-medium mb-1">No nested blocks yet</p>
              <p className="text-sm text-muted-foreground mb-3">Click the button above to add blocks</p>
              <Button size="sm" variant="default" className="gap-1" onClick={() => setShowAddBlock(true)}>
                <Plus className="h-4 w-4" />
                Add First Block
              </Button>
            </div>
          ) : (
            <div className={layout === 'absolute' ? 'relative min-h-[250px]' : layout === 'grid' ? `grid gap-2` : `flex ${direction === 'row' ? 'flex-row' : 'flex-col'} gap-2`} style={layout === 'grid' ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}}>
              {children.map((child, index) => (
                <div
                  key={child.id}
                  className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedChildId === child.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 bg-background'
                  } ${!child.is_visible ? 'opacity-40' : ''}`}
                  style={layout === 'absolute' ? {
                    position: 'absolute',
                    left: `${child.layout.x}%`,
                    top: `${child.layout.y}px`,
                    width: `${child.layout.width}%`,
                    minHeight: typeof child.layout.height === 'number' ? `${child.layout.height}px` : '60px',
                    zIndex: child.layout.zIndex,
                  } : {
                    width: layout === 'flex' && direction === 'row' ? `${child.layout.width}%` : '100%',
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedChildId(child.id); }}
                >
                  {/* Block type label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium capitalize">{child.block_type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
                  </div>

                  {/* Preview placeholder */}
                  <div className="h-8 bg-muted/50 rounded flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Block Preview</span>
                  </div>

                  {/* Move Handle (center top) */}
                  {layout === 'absolute' && (
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center transition-opacity z-20 ${
                        selectedChildId === child.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onMouseDown={(e) => handleMouseDown(e, child.id, 'move')}
                    >
                      <Move className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}

                  {/* Resize Handles */}
                  {(layout === 'absolute' || (layout === 'flex' && direction === 'row')) && (
                    <>
                      {/* East (right) resize */}
                      <div
                        className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-primary rounded cursor-ew-resize transition-opacity z-20 ${
                          selectedChildId === child.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, child.id, 'resize-e')}
                      />
                      {/* West (left) resize */}
                      <div
                        className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-primary rounded cursor-ew-resize transition-opacity z-20 ${
                          selectedChildId === child.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, child.id, 'resize-w')}
                      />
                    </>
                  )}

                  {/* Southeast (bottom-right) resize for absolute layout */}
                  {layout === 'absolute' && (
                    <div
                      className={`absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rounded-sm cursor-nwse-resize transition-opacity z-20 ${
                        selectedChildId === child.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      onMouseDown={(e) => handleMouseDown(e, child.id, 'resize-se')}
                    />
                  )}

                  {/* Quick actions */}
                  <div className={`absolute top-1 right-1 flex gap-1 transition-opacity ${
                    selectedChildId === child.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={(e) => { e.stopPropagation(); deleteNestedBlock(child.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Block Editor */}
      {selectedChild && (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium capitalize">{selectedChild.block_type.replace('_', ' ')} Settings</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedChildId(null)}>
              Close
            </Button>
          </div>

          {/* Position & Size */}
          {layout === 'absolute' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">X Position (%)</Label>
                <Input
                  type="number"
                  value={selectedChild.layout.x}
                  onChange={(e) => updateNestedLayout(selectedChild.id, { x: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  min={0}
                  max={100}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y Position (px)</Label>
                <Input
                  type="number"
                  value={selectedChild.layout.y}
                  onChange={(e) => updateNestedLayout(selectedChild.id, { y: parseFloat(e.target.value) || 0 })}
                  className="h-7 text-xs"
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Width (%)</Label>
                <Input
                  type="number"
                  value={selectedChild.layout.width}
                  onChange={(e) => updateNestedLayout(selectedChild.id, { width: parseFloat(e.target.value) || 10 })}
                  className="h-7 text-xs"
                  min={10}
                  max={100}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Height</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={typeof selectedChild.layout.height === 'number' ? selectedChild.layout.height : ''}
                    onChange={(e) => updateNestedLayout(selectedChild.id, { height: parseFloat(e.target.value) || 'auto' })}
                    className="h-7 text-xs flex-1"
                    placeholder="auto"
                    min={50}
                  />
                  <Button
                    size="sm"
                    variant={selectedChild.layout.height === 'auto' ? 'default' : 'outline'}
                    className="h-7 text-xs px-2"
                    onClick={() => updateNestedLayout(selectedChild.id, { height: 'auto' })}
                  >
                    Auto
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Width for flex row */}
          {layout === 'flex' && direction === 'row' && (
            <div className="space-y-1">
              <Label className="text-xs">Width (%)</Label>
              <Slider
                value={[selectedChild.layout.width]}
                onValueChange={([v]) => updateNestedLayout(selectedChild.id, { width: v })}
                min={10}
                max={100}
                step={5}
              />
              <span className="text-xs text-muted-foreground">{selectedChild.layout.width}%</span>
            </div>
          )}

          {/* Order controls */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => moveBlock(selectedChild.id, 'up')}
              disabled={children.findIndex(c => c.id === selectedChild.id) === 0}
            >
              Move Up
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => moveBlock(selectedChild.id, 'down')}
              disabled={children.findIndex(c => c.id === selectedChild.id) === children.length - 1}
            >
              Move Down
            </Button>
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Visible</Label>
            <Switch
              checked={selectedChild.is_visible}
              onCheckedChange={(checked) => updateNestedBlock(selectedChild.id, { is_visible: checked })}
            />
          </div>

          {/* Delete */}
          <Button
            size="sm"
            variant="destructive"
            className="w-full h-7 text-xs"
            onClick={() => deleteNestedBlock(selectedChild.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Block
          </Button>
        </div>
      )}

      {/* Add Block Dialog */}
      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock} modal={false}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-[100]">
          <DialogHeader>
            <DialogTitle>Add Nested Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {BLOCK_TYPES.filter(b => b.type !== 'container').map((block) => (
              <button
                key={block.type}
                onClick={() => addNestedBlock(block.type)}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <block.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-xs truncate">{block.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{block.description}</div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BackgroundEditor
        value={content._background as BackgroundConfig | undefined}
        onChange={(config) => updateField('_background', config)}
        defaultOpen={false}
      />
    </div>
  );
}
