import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Move,
  Settings,
  Copy,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  BlockType,
  NestedBlock,
  BlockLayout,
  BlockAnimation,
  AnimationType,
  AnimationEasing,
} from '@/types/database';

// Animation presets
const ANIMATION_TYPES: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'slide-down', label: 'Slide Down' },
  { value: 'slide-left', label: 'Slide Left' },
  { value: 'slide-right', label: 'Slide Right' },
  { value: 'zoom-in', label: 'Zoom In' },
  { value: 'zoom-out', label: 'Zoom Out' },
  { value: 'flip', label: 'Flip' },
  { value: 'rotate', label: 'Rotate' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' },
];

const ANIMATION_EASINGS: { value: AnimationEasing; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
];

const BLOCK_TYPES: { value: BlockType; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'image_text', label: 'Image + Text' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'faq', label: 'FAQ' },
  { value: 'stats', label: 'Stats' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'services', label: 'Services' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'team', label: 'Team' },
  { value: 'clients', label: 'Client Logos' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'values', label: 'Values' },
  { value: 'story', label: 'Story' },
  { value: 'why_choose', label: 'Why Choose Us' },
  { value: 'contact_form', label: 'Contact Form' },
  { value: 'contact_info', label: 'Contact Info' },
  { value: 'blog_grid', label: 'Blog Grid' },
  { value: 'button', label: 'Button' },
  { value: 'container', label: 'Container (Nested)' },
];

// Default animation
const DEFAULT_ANIMATION: BlockAnimation = {
  type: 'fade',
  duration: 0.5,
  delay: 0,
  easing: 'ease-out',
  trigger: 'on-scroll',
};

// Default layout
const DEFAULT_LAYOUT: BlockLayout = {
  x: 0,
  y: 0,
  width: 100,
  height: 'auto',
  zIndex: 1,
};

interface VisualBlockBuilderProps {
  blocks: NestedBlock[];
  onChange: (blocks: NestedBlock[]) => void;
  onEditBlock?: (block: NestedBlock) => void;
}

export function VisualBlockBuilder({
  blocks,
  onChange,
  onEditBlock,
}: VisualBlockBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addBlockParentId, setAddBlockParentId] = useState<string | null>(null);
  const [showAnimationEditor, setShowAnimationEditor] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dragState, setDragState] = useState<{
    id: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    startLayout: BlockLayout;
    handle?: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle shift-click for multi-select
  const handleBlockClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      
      if (event.shiftKey) {
        // Multi-select with shift
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        });
      } else {
        // Single select
        setSelectedIds(new Set([id]));
      }
    },
    []
  );

  // Clear selection when clicking canvas
  const handleCanvasClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Find block by ID recursively
  const findBlock = useCallback(
    (id: string, blockList: NestedBlock[] = blocks): NestedBlock | null => {
      for (const block of blockList) {
        if (block.id === id) return block;
        if (block.children) {
          const found = findBlock(id, block.children);
          if (found) return found;
        }
      }
      return null;
    },
    [blocks]
  );

  // Update block by ID recursively
  const updateBlock = useCallback(
    (id: string, updates: Partial<NestedBlock>, blockList: NestedBlock[] = blocks): NestedBlock[] => {
      return blockList.map((block) => {
        if (block.id === id) {
          return { ...block, ...updates };
        }
        if (block.children) {
          return { ...block, children: updateBlock(id, updates, block.children) };
        }
        return block;
      });
    },
    [blocks]
  );

  // Delete block by ID
  const deleteBlock = useCallback(
    (id: string, blockList: NestedBlock[] = blocks): NestedBlock[] => {
      return blockList
        .filter((block) => block.id !== id)
        .map((block) => ({
          ...block,
          children: block.children ? deleteBlock(id, block.children) : undefined,
        }));
    },
    [blocks]
  );

  // Add block
  const addBlock = useCallback(
    (type: BlockType, parentId: string | null) => {
      const newBlock: NestedBlock = {
        id: crypto.randomUUID(),
        block_type: type,
        content: {},
        layout: { ...DEFAULT_LAYOUT },
        animation: { ...DEFAULT_ANIMATION },
        is_visible: true,
        children: type === 'container' ? [] : undefined,
      };

      if (parentId) {
        // Add as child
        onChange(
          updateBlock(parentId, {
            children: [...(findBlock(parentId)?.children || []), newBlock],
          })
        );
      } else {
        // Add to root
        onChange([...blocks, newBlock]);
      }

      setShowAddBlock(false);
      setAddBlockParentId(null);
      setSelectedIds(new Set([newBlock.id]));
    },
    [blocks, onChange, updateBlock, findBlock]
  );

  // Duplicate block
  const duplicateBlock = useCallback(
    (id: string) => {
      const block = findBlock(id);
      if (!block) return;

      const duplicateRecursive = (b: NestedBlock): NestedBlock => ({
        ...b,
        id: crypto.randomUUID(),
        children: b.children?.map(duplicateRecursive),
      });

      const duplicated = duplicateRecursive(block);
      duplicated.layout = {
        ...duplicated.layout,
        y: duplicated.layout.y + 5,
        x: duplicated.layout.x + 5,
      };

      onChange([...blocks, duplicated]);
    },
    [blocks, onChange, findBlock]
  );

  // Update animation for selected blocks
  const updateSelectedAnimation = useCallback(
    (animation: Partial<BlockAnimation>) => {
      let updated = blocks;
      selectedIds.forEach((id) => {
        const block = findBlock(id);
        if (block) {
          updated = updateBlock(id, {
            animation: { ...(block.animation || DEFAULT_ANIMATION), ...animation },
          }, updated);
        }
      });
      onChange(updated);
    },
    [blocks, selectedIds, findBlock, updateBlock, onChange]
  );

  // Handle drag start for move/resize
  const handleDragStart = useCallback(
    (id: string, type: 'move' | 'resize', handle: string, event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      const block = findBlock(id);
      if (!block) return;

      setDragState({
        id,
        type,
        startX: event.clientX,
        startY: event.clientY,
        startLayout: { ...block.layout },
        handle,
      });
    },
    [findBlock]
  );

  // Handle drag move
  useEffect(() => {
    if (!dragState || !containerRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const deltaX = ((event.clientX - dragState.startX) / containerRect.width) * 100;
      const deltaY = ((event.clientY - dragState.startY) / containerRect.height) * 100;

      let newLayout = { ...dragState.startLayout };

      if (dragState.type === 'move') {
        newLayout.x = Math.max(0, Math.min(100 - newLayout.width, dragState.startLayout.x + deltaX));
        newLayout.y = Math.max(0, dragState.startLayout.y + deltaY);
      } else if (dragState.type === 'resize') {
        const handle = dragState.handle || '';
        
        if (handle.includes('e')) {
          newLayout.width = Math.max(10, Math.min(100 - newLayout.x, dragState.startLayout.width + deltaX));
        }
        if (handle.includes('w')) {
          const newWidth = Math.max(10, dragState.startLayout.width - deltaX);
          newLayout.x = dragState.startLayout.x + (dragState.startLayout.width - newWidth);
          newLayout.width = newWidth;
        }
        if (handle.includes('s') && typeof newLayout.height === 'number') {
          newLayout.height = Math.max(10, dragState.startLayout.height as number + deltaY);
        }
      }

      onChange(updateBlock(dragState.id, { layout: newLayout }));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onChange, updateBlock]);

  // Get combined animation for selected blocks
  const getSelectedAnimation = (): BlockAnimation | null => {
    if (selectedIds.size === 0) return null;
    
    const firstId = Array.from(selectedIds)[0];
    const firstBlock = findBlock(firstId);
    return firstBlock?.animation || null;
  };

  // Render a block
  const renderBlock = (block: NestedBlock, depth: number = 0) => {
    const isSelected = selectedIds.has(block.id);
    const isHovered = hoveredId === block.id;
    const isContainer = block.block_type === 'container';

    return (
      <div
        key={block.id}
        className={cn(
          'absolute transition-shadow rounded-lg border-2 cursor-pointer',
          isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border',
          isHovered && !isSelected ? 'border-primary/50' : '',
          !block.is_visible && 'opacity-40',
          dragState?.id === block.id && 'cursor-grabbing'
        )}
        style={{
          left: `${block.layout.x}%`,
          top: `${block.layout.y}px`,
          width: `${block.layout.width}%`,
          minHeight: block.layout.height === 'auto' ? '80px' : `${block.layout.height}px`,
          zIndex: block.layout.zIndex || 1,
        }}
        onClick={(e) => handleBlockClick(block.id, e)}
        onMouseEnter={() => setHoveredId(block.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Block Header */}
        <div className="flex items-center justify-between p-2 bg-muted/80 backdrop-blur-sm rounded-t-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 cursor-move"
              onMouseDown={(e) => handleDragStart(block.id, 'move', '', e)}
            >
              <Move className="h-3 w-3" />
            </Button>
            <span className="text-xs font-medium">
              {BLOCK_TYPES.find((t) => t.value === block.block_type)?.label || block.block_type}
            </span>
            {isContainer && block.children && (
              <span className="text-xs text-muted-foreground">
                ({block.children.length} items)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(updateBlock(block.id, { is_visible: !block.is_visible }));
                  }}
                >
                  {block.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle visibility</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditBlock?.(block)}>
                  Edit Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedIds(new Set([block.id]));
                  setShowAnimationEditor(true);
                }}>
                  Animation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                {isContainer && (
                  <DropdownMenuItem
                    onClick={() => {
                      setAddBlockParentId(block.id);
                      setShowAddBlock(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Child Block
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    onChange(deleteBlock(block.id));
                    setSelectedIds((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(block.id);
                      return newSet;
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Block Content Preview */}
        <div className="p-4 min-h-[60px] bg-background/50">
          {isContainer ? (
            <div className="relative min-h-[100px] border border-dashed border-border rounded-lg">
              {block.children?.map((child) => renderBlock(child, depth + 1))}
              {(!block.children || block.children.length === 0) && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Drop blocks here or click + to add
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              {block.block_type.replace('_', ' ')} block
              {block.animation?.type !== 'none' && (
                <span className="ml-2 text-xs text-primary">
                  ({block.animation?.type})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && (
          <>
            {/* East handle */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-primary rounded cursor-ew-resize"
              onMouseDown={(e) => handleDragStart(block.id, 'resize', 'e', e)}
            />
            {/* West handle */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 bg-primary rounded cursor-ew-resize"
              onMouseDown={(e) => handleDragStart(block.id, 'resize', 'w', e)}
            />
            {/* Southeast handle */}
            <div
              className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rounded cursor-se-resize"
              onMouseDown={(e) => handleDragStart(block.id, 'resize', 'se', e)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setAddBlockParentId(null);
              setShowAddBlock(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Block
          </Button>
          {selectedIds.size > 0 && (
            <>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnimationEditor(true)}
              >
                Animation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedIds.forEach((id) => {
                    onChange(deleteBlock(id));
                  });
                  setSelectedIds(new Set());
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isPreviewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPreviewMode ? 'Stop Preview' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-muted/10 p-4"
        onClick={handleCanvasClick}
      >
        <div className="relative min-h-[600px]">
          {blocks.map((block) => renderBlock(block))}
          {blocks.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed border-border rounded-lg">
              <div className="text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No blocks yet</p>
                <Button
                  onClick={() => {
                    setAddBlockParentId(null);
                    setShowAddBlock(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add First Block
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-select hint */}
      <div className="p-2 border-t bg-muted/30 text-center">
        <span className="text-xs text-muted-foreground">
          Hold <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Shift</kbd> and click to select multiple blocks
        </span>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {addBlockParentId ? 'Add Child Block' : 'Add Block'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
            {BLOCK_TYPES.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => addBlock(type.value, addBlockParentId)}
              >
                <Layers className="h-6 w-6" />
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Animation Editor Dialog */}
      <Dialog open={showAnimationEditor} onOpenChange={setShowAnimationEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIds.size > 1
                ? `Animation (${selectedIds.size} blocks)`
                : 'Block Animation'}
            </DialogTitle>
          </DialogHeader>
          <AnimationEditor
            animation={getSelectedAnimation() || DEFAULT_ANIMATION}
            onChange={updateSelectedAnimation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Animation Editor Component
interface AnimationEditorProps {
  animation: BlockAnimation;
  onChange: (animation: Partial<BlockAnimation>) => void;
}

function AnimationEditor({ animation, onChange }: AnimationEditorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Animation Type</Label>
        <Select
          value={animation.type}
          onValueChange={(value: AnimationType) => onChange({ type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Trigger</Label>
        <Select
          value={animation.trigger}
          onValueChange={(value: 'on-load' | 'on-scroll' | 'on-hover') =>
            onChange({ trigger: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="on-load">On Page Load</SelectItem>
            <SelectItem value="on-scroll">On Scroll Into View</SelectItem>
            <SelectItem value="on-hover">On Hover</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Duration</Label>
          <span className="text-sm text-muted-foreground">{animation.duration}s</span>
        </div>
        <Slider
          value={[animation.duration]}
          onValueChange={([value]) => onChange({ duration: value })}
          min={0.1}
          max={3}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Delay</Label>
          <span className="text-sm text-muted-foreground">{animation.delay}s</span>
        </div>
        <Slider
          value={[animation.delay]}
          onValueChange={([value]) => onChange({ delay: value })}
          min={0}
          max={2}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>Easing</Label>
        <Select
          value={animation.easing}
          onValueChange={(value: AnimationEasing) => onChange({ easing: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ANIMATION_EASINGS.map((easing) => (
              <SelectItem key={easing.value} value={easing.value}>
                {easing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Stagger (for children)</Label>
          <span className="text-sm text-muted-foreground">{animation.stagger || 0}s</span>
        </div>
        <Slider
          value={[animation.stagger || 0]}
          onValueChange={([value]) => onChange({ stagger: value })}
          min={0}
          max={0.5}
          step={0.05}
        />
      </div>

      {/* Preview button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // Trigger animation preview
        }}
      >
        <Play className="h-4 w-4 mr-2" /> Preview Animation
      </Button>
    </div>
  );
}

export default VisualBlockBuilder;
