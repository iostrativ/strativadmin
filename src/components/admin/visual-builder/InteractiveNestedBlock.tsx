import { useState, useRef, useCallback } from 'react';
import { Move } from 'lucide-react';
import type { NestedBlock } from '@/types/database';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

interface InteractiveNestedBlockProps {
  block: NestedBlock;
  index: number;
  parentLayout: 'flex' | 'grid' | 'absolute'; // Kept for API compatibility but always uses absolute
  isSelected: boolean;
  onSelect: (id: string) => void;
  onLayoutChange: (id: string, layout: Partial<NestedBlock['layout']>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function InteractiveNestedBlock({
  block,
  index,
  parentLayout,
  isSelected,
  onSelect,
  onLayoutChange,
  containerRef,
}: InteractiveNestedBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Handle move start
  const handleMoveStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const startX = block.layout?.x ?? 0;
    const startY = block.layout?.y ?? 0;
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;
      
      // Convert pixel delta to percentage for X
      const deltaXPercent = (deltaX / containerRect.width) * 100;
      
      const newX = Math.max(0, Math.min(100 - (block.layout?.width ?? 100), startX + deltaXPercent));
      const newY = Math.max(0, startY + deltaY);

      onLayoutChange(block.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [block.id, block.layout, containerRef, onLayoutChange]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    // Capture initial values at drag start
    const startX = block.layout?.x ?? 0;
    const startY = block.layout?.y ?? 0;
    const startWidth = block.layout?.width ?? 100;
    const startHeight = typeof block.layout?.height === 'number' ? block.layout.height : 100;
    const startClientX = e.clientX;
    const startClientY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;

      // Convert pixel delta to percentage for width
      const deltaWidthPercent = (deltaX / containerRect.width) * 100;
      
      let updates: Partial<NestedBlock['layout']> = {};

      if (corner.includes('e')) {
        updates.width = Math.max(10, Math.min(100, startWidth + deltaWidthPercent));
      }
      if (corner.includes('w')) {
        const newWidth = Math.max(10, Math.min(100, startWidth - deltaWidthPercent));
        const newX = Math.max(0, startX + deltaWidthPercent);
        updates.width = newWidth;
        updates.x = newX;
      }
      if (corner.includes('s')) {
        updates.height = Math.max(50, startHeight + deltaY);
      }
      if (corner.includes('n')) {
        const newHeight = Math.max(50, startHeight - deltaY);
        const newY = Math.max(0, startY + deltaY);
        updates.height = newHeight;
        updates.y = newY;
      }

      onLayoutChange(block.id, updates);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [block.id, block.layout, containerRef, onLayoutChange]);

  // Calculate position style - Interactive mode always uses absolute positioning
  // Use minHeight instead of height so the border wraps the actual content
  const blockHeight = typeof block.layout?.height === 'number' ? block.layout.height : 0;
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${block.layout?.x ?? 0}%`,
    top: `${block.layout?.y ?? 0}px`,
    width: `${block.layout?.width ?? 100}%`,
    height: blockHeight > 0 ? `${blockHeight}px` : '60px',
    zIndex: block.layout?.zIndex || 10,
  };

  return (
    <div
      ref={blockRef}
      style={positionStyle}
      className={`group/nested ${
        isSelected
          ? 'ring-1 ring-blue-500 bg-blue-50/50'
          : 'hover:ring-1 hover:ring-blue-300'
      } ${isDragging || isResizing ? 'cursor-grabbing opacity-70' : 'cursor-pointer'}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {/* Move handle - top center */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white rounded p-1 cursor-move shadow transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
        }`}
        onMouseDown={handleMoveStart}
        title="Drag to move"
      >
        <Move className="h-3 w-3" />
      </div>

      {/* Corner resize handles - small circles */}
      {/* Top-left */}
      <div
        className={`absolute -top-1 -left-1 z-50 w-2.5 h-2.5 bg-blue-500 rounded-full cursor-nw-resize shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      
      {/* Top-right */}
      <div
        className={`absolute -top-1 -right-1 z-50 w-2.5 h-2.5 bg-blue-500 rounded-full cursor-ne-resize shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      
      {/* Bottom-left */}
      <div
        className={`absolute -bottom-1 -left-1 z-50 w-2.5 h-2.5 bg-blue-500 rounded-full cursor-sw-resize shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
      
      {/* Bottom-right */}
      <div
        className={`absolute -bottom-1 -right-1 z-50 w-2.5 h-2.5 bg-blue-500 rounded-full cursor-se-resize shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />

      {/* Edge resize handles - thin lines, only show on hover/select */}
      {/* Top edge */}
      <div
        className={`absolute top-0 left-4 right-4 h-px z-40 bg-blue-400 cursor-n-resize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-70'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      
      {/* Bottom edge */}
      <div
        className={`absolute bottom-0 left-4 right-4 h-px z-40 bg-blue-400 cursor-s-resize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-70'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      
      {/* Left edge */}
      <div
        className={`absolute top-4 bottom-4 left-0 w-px z-40 bg-blue-400 cursor-w-resize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-70'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      
      {/* Right edge */}
      <div
        className={`absolute top-4 bottom-4 right-0 w-px z-40 bg-blue-400 cursor-e-resize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-70'
        }`}
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />

      {/* Block label - show on hover/select */}
      <div className={`absolute -top-5 left-0 z-30 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded shadow-sm transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover/nested:opacity-100'
      }`}>
        {block.block_type.replace('_', ' ')}
      </div>

      {/* Size indicator when resizing */}
      {isResizing && (
        <div className="absolute bottom-1 right-1 z-50 px-1.5 py-0.5 text-[10px] font-mono bg-black/80 text-white rounded">
          {Math.round(block.layout?.width ?? 100)}% × {blockHeight === 0 ? 'auto' : `${blockHeight}px`}
        </div>
      )}

      {/* Position indicator when dragging */}
      {isDragging && (
        <div className="absolute bottom-1 right-1 z-50 px-1.5 py-0.5 text-[10px] font-mono bg-black/80 text-white rounded">
          X: {Math.round(block.layout?.x ?? 0)}%, Y: {Math.round(block.layout?.y ?? 0)}px
        </div>
      )}

      {/* The actual block content */}
      <div className="pointer-events-none">
        <BlockRenderer
          section={{
            id: block.id,
            page_id: '',
            block_type: block.block_type,
            content: block.content,
            sort_order: 0,
            is_visible: block.is_visible,
            created_at: '',
            updated_at: '',
          }}
          index={index}
        />
      </div>
    </div>
  );
}
