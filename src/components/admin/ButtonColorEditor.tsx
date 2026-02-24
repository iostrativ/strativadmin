import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import type { ButtonColorConfig } from '@/types/database';

interface ButtonColorEditorProps {
  label: string;
  value?: ButtonColorConfig;
  onChange: (value: ButtonColorConfig) => void;
}

export function ButtonColorEditor({ label, value, onChange }: ButtonColorEditorProps) {
  const config: ButtonColorConfig = value || { mode: 'default' };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
      <Label className="text-sm font-semibold">{label}</Label>

      <RadioGroup
        value={config.mode}
        onValueChange={(mode) => onChange({ ...config, mode: mode as 'default' | 'custom' })}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id={`${label}-default`} />
          <Label htmlFor={`${label}-default`} className="font-normal cursor-pointer text-sm">
            Use site default colors
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id={`${label}-custom`} />
          <Label htmlFor={`${label}-custom`} className="font-normal cursor-pointer text-sm">
            Custom colors
          </Label>
        </div>
      </RadioGroup>

      {config.mode === 'custom' && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <Label className="text-xs">Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.backgroundColor || '#6366f1'}
                onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                className="w-10 h-8 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={config.backgroundColor || '#6366f1'}
                onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                placeholder="#6366f1"
                className="flex-1 h-8 text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Text</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.textColor || '#ffffff'}
                onChange={(e) => onChange({ ...config, textColor: e.target.value })}
                className="w-10 h-8 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={config.textColor || '#ffffff'}
                onChange={(e) => onChange({ ...config, textColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1 h-8 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
