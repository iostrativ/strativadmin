import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Type, Bold, Italic, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type TypographyConfig,
  type TypographyStyle,
  FONT_FAMILIES,
  loadGoogleFont,
} from '@/lib/typography';

interface TypographyEditorProps {
  typography?: TypographyConfig;
  onChange: (typography: TypographyConfig) => void;
}

function StyleControls({
  label,
  style,
  onChange,
  defaultFontSize,
}: {
  label: string;
  style: TypographyStyle;
  onChange: (style: TypographyStyle) => void;
  defaultFontSize: number;
}) {
  const updateStyle = (key: keyof TypographyStyle, value: unknown) => {
    onChange({ ...style, [key]: value });
  };

  const handleFontChange = (fontFamily: string) => {
    if (fontFamily && fontFamily !== '__default') {
      loadGoogleFont(fontFamily);
      updateStyle('fontFamily', fontFamily);
    } else {
      updateStyle('fontFamily', undefined);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>

      {/* Font Family */}
      <Select
        value={style.fontFamily || '__default'}
        onValueChange={handleFontChange}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Default font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map(f => (
            <SelectItem key={f.value} value={f.value}>
              <span style={f.value !== '__default' ? { fontFamily: `'${f.value}', sans-serif` } : undefined}>
                {f.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-[10px] text-muted-foreground">Size</span>
          <span className="text-[10px] text-muted-foreground">
            {style.fontSize || defaultFontSize}px
          </span>
        </div>
        <Slider
          value={[style.fontSize || defaultFontSize]}
          onValueChange={([val]) => updateStyle('fontSize', val)}
          min={10}
          max={label === 'Heading' ? 80 : 40}
          step={1}
          className="py-0.5"
        />
      </div>

      {/* Bold / Italic / Underline */}
      <div className="flex gap-1">
        <Button
          variant={style.fontWeight === 'bold' ? 'default' : 'outline'}
          size="icon"
          className="h-7 w-7"
          onClick={() => updateStyle('fontWeight', style.fontWeight === 'bold' ? 'normal' : 'bold')}
          title="Bold"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          variant={style.fontStyle === 'italic' ? 'default' : 'outline'}
          size="icon"
          className="h-7 w-7"
          onClick={() => updateStyle('fontStyle', style.fontStyle === 'italic' ? 'normal' : 'italic')}
          title="Italic"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          variant={style.textDecoration === 'underline' ? 'default' : 'outline'}
          size="icon"
          className="h-7 w-7"
          onClick={() => updateStyle('textDecoration', style.textDecoration === 'underline' ? 'none' : 'underline')}
          title="Underline"
        >
          <Underline className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function TypographyEditor({ typography, onChange }: TypographyEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const config: TypographyConfig = typography || {};

  // Load fonts that are already selected when component mounts
  useEffect(() => {
    if (config.heading?.fontFamily) loadGoogleFont(config.heading.fontFamily);
    if (config.body?.fontFamily) loadGoogleFont(config.body.fontFamily);
  }, []);

  const updateSection = (section: 'heading' | 'body', style: TypographyStyle) => {
    onChange({ ...config, [section]: style });
  };

  const hasCustomization = config.heading || config.body;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Type className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium">Typography</span>
          {hasCustomization && (
            <span className="text-xs text-muted-foreground">(customized)</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="p-3 pt-0 space-y-4 border-t">
          <StyleControls
            label="Heading"
            style={config.heading || {}}
            onChange={(style) => updateSection('heading', style)}
            defaultFontSize={36}
          />

          <div className="border-t" />

          <StyleControls
            label="Body Text"
            style={config.body || {}}
            onChange={(style) => updateSection('body', style)}
            defaultFontSize={16}
          />

          {/* Reset button */}
          {hasCustomization && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => onChange({})}
            >
              Reset to defaults
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
