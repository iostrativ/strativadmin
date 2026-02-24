import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import type { PageSection, NestedBlock } from '@/types/database';

interface SortableBlockProps {
  section: PageSection;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  // Nested block interaction
  selectedNestedBlockId?: string | null;
  onSelectNestedBlock?: (id: string) => void;
  onNestedLayoutChange?: (blockId: string, nestedId: string, layout: Partial<NestedBlock['layout']>) => void;
  // Parent block resize
  onBlockResize?: (blockId: string, height: number) => void;
}

export function SortableBlock({ 
  section, 
  index, 
  isSelected, 
  onSelect,
  selectedNestedBlockId,
  onSelectNestedBlock,
  onNestedLayoutChange,
  onBlockResize,
}: SortableBlockProps) {
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
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${!section.is_visible ? 'opacity-40' : ''}`}
    >
      {/* Drag handle */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDragging ? 'opacity-100' : ''
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="bg-background border rounded-md p-1 cursor-grab active:cursor-grabbing shadow-sm">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <BlockRenderer
        section={section}
        index={index}
        isPreview
        isSelected={isSelected}
        onSelect={onSelect}
        selectedNestedBlockId={selectedNestedBlockId}
        onSelectNestedBlock={onSelectNestedBlock}
        onNestedLayoutChange={onNestedLayoutChange}
        onBlockResize={onBlockResize}
      />
    </div>
  );
}
