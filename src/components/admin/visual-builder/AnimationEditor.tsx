import { useState } from 'react';
import { ChevronDown, ChevronUp, Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  type AnimationConfig,
  defaultAnimationConfig,
  generateVariants,
  generateTransition,
  supportsDirection,
  getSpeedPreset,
  ANIMATION_TYPES,
  DIRECTIONS,
  EASINGS,
  TRIGGERS,
  SPEED_PRESETS,
} from '@/lib/animations';

const DIRECTION_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
} as const;

interface AnimationEditorProps {
  animation?: AnimationConfig;
  onChange: (animation: AnimationConfig) => void;
}

export function AnimationEditor({ animation, onChange }: AnimationEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const config: AnimationConfig = animation || defaultAnimationConfig;

  const updateConfig = (key: keyof AnimationConfig, value: unknown) => {
    onChange({ ...config, [key]: value } as AnimationConfig);
  };

  const handlePreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const variants = generateVariants(config);
  const transition = generateTransition(config);
  const showDirection = supportsDirection(config.type);
  const currentSpeed = getSpeedPreset(config.duration);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Play className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium">Animation</span>
          {config.type !== 'none' && (
            <span className="text-xs text-muted-foreground capitalize">
              ({config.type}{showDirection && config.direction ? ` ${config.direction}` : ''})
            </span>
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
          {/* Preview */}
          {config.type !== 'none' && (
            <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-center min-h-[60px]">
              <motion.div
                key={previewKey}
                initial="hidden"
                animate="visible"
                variants={variants}
                transition={transition}
                className="bg-primary/20 text-primary text-xs font-medium px-4 py-2 rounded-md"
              >
                Preview Animation
              </motion.div>
            </div>
          )}

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Select
              value={config.type}
              onValueChange={(value) => updateConfig('type', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.type !== 'none' && (
            <>
              {/* Direction - now for all types except 'none' */}
              {showDirection && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Direction</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {DIRECTIONS.map(d => {
                      const DirIcon = DIRECTION_ICONS[d.value as keyof typeof DIRECTION_ICONS];
                      return (
                        <button
                          key={d.value}
                          onClick={() => updateConfig('direction', d.value)}
                          className={`flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                            config.direction === d.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <DirIcon className="h-3 w-3" />
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speed Presets */}
              <div className="space-y-1.5">
                <Label className="text-xs">Speed</Label>
                <div className="grid grid-cols-3 gap-1">
                  {SPEED_PRESETS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateConfig('duration', s.duration)}
                      className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                        currentSpeed === s.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration (fine-tune) */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs">Duration (fine-tune)</Label>
                  <span className="text-xs text-muted-foreground">{config.duration}s</span>
                </div>
                <Slider
                  value={[config.duration]}
                  onValueChange={([val]) => updateConfig('duration', val)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="py-1"
                />
              </div>

              {/* Delay */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-xs">Delay</Label>
                  <span className="text-xs text-muted-foreground">{config.delay}s</span>
                </div>
                <Slider
                  value={[config.delay]}
                  onValueChange={([val]) => updateConfig('delay', val)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="py-1"
                />
              </div>

              {/* Easing */}
              <div className="space-y-1.5">
                <Label className="text-xs">Easing</Label>
                <Select
                  value={config.easing}
                  onValueChange={(value) => updateConfig('easing', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EASINGS.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger */}
              <div className="space-y-1.5">
                <Label className="text-xs">Trigger</Label>
                <Select
                  value={config.triggerOn}
                  onValueChange={(value) => updateConfig('triggerOn', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handlePreview}
              >
                <Play className="h-3 w-3 mr-1" />
                Preview Animation
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
