import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableBlock } from './SortableBlock';
import type { PageSection, NestedBlock } from '@/types/database';
import type { PreviewDevice } from './BuilderToolbar';

interface BuilderPreviewProps {
  sections: PageSection[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  previewDevice: PreviewDevice;
  customWidth?: number;
  customHeight?: number;
  isDraggingFromPalette: boolean;
  // Nested block interaction
  selectedNestedBlockId?: string | null;
  onSelectNestedBlock?: (id: string) => void;
  onNestedLayoutChange?: (blockId: string, nestedId: string, layout: Partial<NestedBlock['layout']>) => void;
  // Parent block resize
  onBlockResize?: (blockId: string, height: number) => void;
}

const deviceWidths: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
  custom: '100%', // Will be overridden
};

// Calculate effective width for responsive checks
export function getEffectiveWidth(device: PreviewDevice, customWidth?: number): number {
  switch (device) {
    case 'mobile': return 375;
    case 'tablet': return 768;
    case 'custom': return customWidth || 1024;
    default: return 1920; // desktop
  }
}

export function BuilderPreview({
  sections,
  selectedBlockId,
  onSelectBlock,
  previewDevice,
  customWidth,
  customHeight,
  isDraggingFromPalette,
  selectedNestedBlockId,
  onSelectNestedBlock,
  onNestedLayoutChange,
  onBlockResize,
}: BuilderPreviewProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'preview-drop-area' });

  const sectionIds = sections.map(s => s.id);
  
  // Calculate the actual width to use
  const actualWidth = previewDevice === 'custom' && customWidth 
    ? `${customWidth}px` 
    : deviceWidths[previewDevice];
  
  const effectiveWidthPx = getEffectiveWidth(previewDevice, customWidth);

  return (
    <div className="h-full bg-muted/30 overflow-auto flex justify-center">
      <div
        className="bg-background min-h-full transition-all duration-300"
        style={{
          width: actualWidth,
          maxWidth: '100%',
          height: previewDevice === 'custom' && customHeight ? `${customHeight}px` : undefined,
          minHeight: previewDevice === 'custom' && customHeight ? `${customHeight}px` : '100%',
          boxShadow: previewDevice !== 'desktop' ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
        }}
        data-preview-width={effectiveWidthPx}
      >
        <div ref={setDropRef} className="min-h-full">
          {sections.length === 0 ? (
            <div
              className={`flex items-center justify-center min-h-[50vh] text-muted-foreground transition-colors ${
                isDraggingFromPalette && isOver ? 'bg-primary/5 border-2 border-dashed border-primary rounded-lg m-4' : ''
              }`}
            >
              <div className="text-center">
                {isDraggingFromPalette ? (
                  <>
                    <p className="text-lg font-medium mb-2 text-primary">Drop block here</p>
                    <p className="text-sm">Release to add the block to your page.</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No blocks yet</p>
                    <p className="text-sm">Add blocks from the sidebar to start building your page.</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {sections.map((section, index) => (
                <SortableBlock
                  key={section.id}
                  section={section}
                  index={index}
                  isSelected={selectedBlockId === section.id}
                  onSelect={onSelectBlock}
                  selectedNestedBlockId={selectedNestedBlockId}
                  onSelectNestedBlock={onSelectNestedBlock}
                  onNestedLayoutChange={onNestedLayoutChange}
                  onBlockResize={onBlockResize}
                />
              ))}

              {/* Drop zone at the bottom when dragging from palette */}
              {isDraggingFromPalette && (
                <div
                  className={`h-16 mx-4 mb-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                    isOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'
                  }`}
                >
                  <span className="text-xs text-muted-foreground">Drop here to add at end</span>
                </div>
              )}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
