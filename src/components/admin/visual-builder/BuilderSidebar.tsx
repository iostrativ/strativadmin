import { useState, useCallback } from 'react';
import { Eye, EyeOff, Trash2, GripVertical, ChevronLeft, Layers, ChevronUp, ChevronDown, Plus, Boxes, ChevronRight, X, Move, Maximize2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BlockPalette, blockTypes } from './BlockPalette';
import { BlockEditorPanel } from '@/components/admin/BlockEditor';
import { AnimationEditor } from './AnimationEditor';
import { TypographyEditor } from './TypographyEditor';
import { getDefaultContent, getDefaultBlockDimensions } from './defaultContent';
import type { AnimationConfig } from '@/lib/animations';
import type { TypographyConfig } from '@/lib/typography';
import type { PageSection, BlockType, NestedBlock } from '@/types/database';

// Nested Blocks Editor - allows adding child blocks to any block
function NestedBlocksEditor({ 
  content, 
  updateField 
}: { 
  content: Record<string, unknown>; 
  updateField: (key: string, value: unknown) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  
  const children = (content.children as NestedBlock[]) || [];
  const editingChild = children.find(c => c.id === editingChildId);

  const addNestedBlock = useCallback((blockType: BlockType) => {
    // Get default dimensions for this block type (same as if it were a parent block)
    const defaultDimensions = getDefaultBlockDimensions(blockType);
    const defaultContent = getDefaultContent(blockType);
    
    // Calculate the Y position for new block (place below existing blocks)
    let newY = 0;
    children.forEach(child => {
      const childY = child.layout?.y ?? 0;
      const childHeight = typeof child.layout?.height === 'number' && child.layout.height > 0 
        ? child.layout.height 
        : getDefaultBlockDimensions(child.block_type).height;
      const bottom = childY + childHeight;
      if (bottom > newY) newY = bottom;
    });
    newY += 10; // Add gap between blocks
    
    const newBlock: NestedBlock = {
      id: crypto.randomUUID(),
      block_type: blockType,
      content: defaultContent,
      layout: {
        x: 0,
        y: newY,
        width: defaultDimensions.width,
        height: defaultDimensions.height,
        zIndex: children.length + 1,
      },
      is_visible: true,
      children: blockType === 'container' ? [] : undefined,
    };
    
    // Update children and auto-expand parent height
    const newChildren = [...children, newBlock];
    updateField('children', newChildren);
    
    // Calculate and set minimum height for parent (newY + new block height + padding)
    const requiredHeight = newY + defaultDimensions.height + 30;
    const currentHeight = content._height as number | undefined;
    if (!currentHeight || requiredHeight > currentHeight) {
      updateField('_height', requiredHeight);
    }
    
    setShowAddDialog(false);
    setEditingChildId(newBlock.id);
  }, [children, updateField, content._height]);

  const updateNestedBlock = useCallback((id: string, updates: Partial<NestedBlock>) => {
    const updated = children.map(child => 
      child.id === id ? { ...child, ...updates } : child
    );
    updateField('children', updated);
  }, [children, updateField]);

  const updateNestedContent = useCallback((id: string, key: string, value: unknown) => {
    const updated = children.map(child => 
      child.id === id ? { ...child, content: { ...child.content, [key]: value } } : child
    );
    updateField('children', updated);
  }, [children, updateField]);

  const updateNestedLayout = useCallback((id: string, layoutUpdates: Partial<NestedBlock['layout']>) => {
    const updated = children.map(child => 
      child.id === id ? { ...child, layout: { ...child.layout, ...layoutUpdates } } : child
    );
    updateField('children', updated);
  }, [children, updateField]);

  const deleteNestedBlock = useCallback((id: string) => {
    updateField('children', children.filter(c => c.id !== id));
    if (editingChildId === id) setEditingChildId(null);
  }, [children, updateField, editingChildId]);

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

  const getBlockLabel = (type: BlockType) => {
    const block = blockTypes.find(b => b.type === type);
    return block?.label || type.replace('_', ' ');
  };

  const getBlockIcon = (type: BlockType) => {
    const block = blockTypes.find(b => b.type === type);
    return block?.icon;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-10 px-3 font-medium bg-card border rounded-lg hover:bg-accent"
        >
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            <span>Nested Blocks</span>
            {children.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {children.length}
              </span>
            )}
          </div>
          <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {/* Editing a nested block */}
        {editingChild ? (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setEditingChildId(null)}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
              <span className="text-xs font-medium capitalize">
                {getBlockLabel(editingChild.block_type)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => deleteNestedBlock(editingChild.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Block-specific editor */}
            <BlockEditorPanel
              blockType={editingChild.block_type}
              content={editingChild.content as Record<string, unknown>}
              updateField={(key, value) => updateNestedContent(editingChild.id, key, value)}
            />

            {/* Layout Controls */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Position & Size</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">X Position (%)</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editingChild.layout?.x ?? 0}
                    onChange={(e) => updateNestedLayout(editingChild.id, { x: parseFloat(e.target.value) || 0 })}
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Y Position (px)</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editingChild.layout?.y ?? 0}
                    onChange={(e) => updateNestedLayout(editingChild.id, { y: parseFloat(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Width (%)</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editingChild.layout?.width ?? 100}
                    onChange={(e) => updateNestedLayout(editingChild.id, { width: parseFloat(e.target.value) || 100 })}
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Height (px, 0=auto)</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editingChild.layout?.height ?? 0}
                    onChange={(e) => updateNestedLayout(editingChild.id, { height: parseFloat(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Z-Index</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs"
                    value={editingChild.layout?.zIndex ?? 0}
                    onChange={(e) => updateNestedLayout(editingChild.id, { zIndex: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Animation Controls for nested block */}
            <div className="pt-2">
              <AnimationEditor
                animation={(editingChild.content as Record<string, unknown>)._animation as AnimationConfig | undefined}
                onChange={(animation) => updateNestedContent(editingChild.id, '_animation', animation)}
              />
            </div>

            {/* Order controls */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={() => moveBlock(editingChild.id, 'up')}
                disabled={children.findIndex(c => c.id === editingChild.id) === 0}
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                Move Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={() => moveBlock(editingChild.id, 'down')}
                disabled={children.findIndex(c => c.id === editingChild.id) === children.length - 1}
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Move Down
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* List of nested blocks */}
            {children.length > 0 ? (
              <div className="space-y-1">
                {children.map((child, index) => {
                  const Icon = getBlockIcon(child.block_type);
                  return (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setEditingChildId(child.id)}
                    >
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        {Icon && <Icon className="h-3 w-3 text-primary" />}
                      </div>
                      <span className="flex-1 text-xs font-medium truncate capitalize">
                        {getBlockLabel(child.block_type)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">#{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNestedBlock(child.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No nested blocks yet
              </div>
            )}

            {/* Add block button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Nested Block
            </Button>
          </>
        )}

        {/* Add Block Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Nested Block</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {blockTypes.filter(b => b.type !== 'container').map((block) => (
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
      </CollapsibleContent>
    </Collapsible>
  );
}

interface BuilderSidebarProps {
  sections: PageSection[];
  selectedBlockId: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectBlock: (id: string | null) => void;
  onAddBlock: (type: BlockType) => void;
  onDeleteBlock: (id: string) => void;
  onToggleVisibility: (section: PageSection) => void;
  onUpdateContent: (sectionId: string, key: string, value: unknown) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onReorder: (sections: PageSection[]) => void;
}

export function BuilderSidebar({
  sections,
  selectedBlockId,
  activeTab,
  onTabChange,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onToggleVisibility,
  onUpdateContent,
  onMoveUp,
  onMoveDown,
  onReorder,
}: BuilderSidebarProps) {
  const selectedSection = sections.find(s => s.id === selectedBlockId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const newSections = [...sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);
      onReorder(newSections);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
        <div className="px-3 pt-3 shrink-0">
          <TabsList className="w-full">
            <TabsTrigger value="blocks" className="flex-1 text-xs">Blocks</TabsTrigger>
            <TabsTrigger value="layers" className="flex-1 text-xs">
              Layers
              {sections.length > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">({sections.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex-1 text-xs">
              Editor
              {selectedSection && (
                <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Blocks Tab - Palette only */}
        <TabsContent value="blocks" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Add Block
              </h3>
              <BlockPalette onAddBlock={onAddBlock} />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Layers Tab - Block list */}
        <TabsContent value="layers" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              {sections.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {sections.map((section, index) => (
                        <SortableLayerItem
                          key={section.id}
                          section={section}
                          index={index}
                          totalSections={sections.length}
                          isSelected={selectedBlockId === section.id}
                          onSelect={() => {
                            onSelectBlock(section.id);
                            onTabChange('editor');
                          }}
                          onMoveUp={() => onMoveUp(index)}
                          onMoveDown={() => onMoveDown(index)}
                          onToggleVisibility={() => onToggleVisibility(section)}
                          onDelete={() => onDeleteBlock(section.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Layers className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm text-center">
                    No blocks yet. Add blocks from the Blocks tab.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Editor Tab */}
        <TabsContent value="editor" className="flex-1 mt-0 min-h-0 overflow-y-auto">
          <div>
            <div className="p-3 pb-8">
              {selectedSection ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          onSelectBlock(null);
                          onTabChange('layers');
                        }}
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                        Back
                      </Button>
                      <span className="text-sm font-medium capitalize">
                        {selectedSection.block_type.replace('_', ' ')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteBlock(selectedSection.id)}
                      title="Delete block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <BlockEditorPanel
                    blockType={selectedSection.block_type}
                    content={selectedSection.content as Record<string, unknown>}
                    updateField={(key, value) => onUpdateContent(selectedSection.id, key, value)}
                  />

                  {/* Nested Blocks Editor - Available for all block types */}
                  <NestedBlocksEditor
                    content={selectedSection.content as Record<string, unknown>}
                    updateField={(key, value) => onUpdateContent(selectedSection.id, key, value)}
                  />

                  {/* Typography Controls */}
                  <TypographyEditor
                    typography={(selectedSection.content as Record<string, unknown>)._typography as TypographyConfig | undefined}
                    onChange={(typography) => onUpdateContent(selectedSection.id, '_typography', typography)}
                  />

                  {/* Animation Controls */}
                  <AnimationEditor
                    animation={(selectedSection.content as Record<string, unknown>)._animation as AnimationConfig | undefined}
                    onChange={(animation) => onUpdateContent(selectedSection.id, '_animation', animation)}
                  />

                  {/* Delete block section at bottom */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => onDeleteBlock(selectedSection.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Block
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p className="text-sm text-center">
                    Click on a block in the preview or layers list to edit it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sortable layer item component
interface SortableLayerItemProps {
  section: PageSection;
  index: number;
  totalSections: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

function SortableLayerItem({
  section,
  index,
  totalSections,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onDelete,
}: SortableLayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const blockInfo = blockTypes.find(b => b.type === section.block_type);
  const Icon = blockInfo?.icon || GripVertical;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-muted border border-transparent'
      } ${!section.is_visible ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <span className="text-[10px] text-muted-foreground w-4 text-center shrink-0">
        {index + 1}
      </span>
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="flex-1 truncate text-xs font-medium capitalize">
        {section.block_type.replace('_', ' ')}
      </span>
      <div className="flex items-center gap-0.5">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalSections - 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
        >
          {section.is_visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
