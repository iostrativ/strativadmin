import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  isActive: boolean;
}

export function DropZone({ id, isActive }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isActive
          ? isOver
            ? 'h-16 bg-primary/20 border-2 border-dashed border-primary rounded-lg mx-4 flex items-center justify-center'
            : 'h-3 mx-4'
          : 'h-0'
      }`}
    >
      {isActive && isOver && (
        <span className="text-xs text-primary font-medium">Drop here</span>
      )}
    </div>
  );
}
