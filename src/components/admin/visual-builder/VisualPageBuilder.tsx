import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  usePage,
  usePageBySlugAdmin,
  useAllPageSections,
  useCreatePageSection,
  useUpdatePageSection,
  useDeletePageSection,
  useReorderPageSections,
  useUpdatePage,
} from '@/hooks/usePages';
import type { PageSection, BlockType, NestedBlock } from '@/types/database';
import { BuilderToolbar, type PreviewDevice } from './BuilderToolbar';
import { BuilderSidebar } from './BuilderSidebar';
import { BuilderPreview } from './BuilderPreview';
import { getDefaultContent, getDefaultBlockDimensions } from './defaultContent';
import { blockTypes } from './BlockPalette';

export function VisualPageBuilder() {
  const { pageId, slug } = useParams<{ pageId?: string; slug?: string }>();
  const navigate = useNavigate();

  // Fetch page - use admin version for slug (no is_published filter)
  const { data: pageById, isLoading: pageByIdLoading } = usePage(pageId || '');
  const { data: pageBySlug, isLoading: pageBySlugLoading } = usePageBySlugAdmin(slug || '');

  const page = pageById || pageBySlug;
  const pageLoading = (!!pageId && pageByIdLoading) || (!!slug && pageBySlugLoading);
  const effectivePageId = page?.id || pageId || '';

  const { data: sections, isLoading: sectionsLoading } = useAllPageSections(effectivePageId);
  const createSection = useCreatePageSection();
  const updateSection = useUpdatePageSection();
  const deleteSection = useDeletePageSection();
  const reorderSections = useReorderPageSections();
  const updatePage = useUpdatePage();

  // Local state - ALL changes are local until save
  const [localSections, setLocalSections] = useState<PageSection[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedNestedBlockId, setSelectedNestedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('blocks');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(768);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Track which local sections are new (not yet in DB)
  const newSectionIdsRef = useRef<Set<string>>(new Set());
  // Track which sections were deleted locally
  const deletedSectionIdsRef = useRef<Set<string>>(new Set());
  // Track if initial data has been loaded (to prevent refetch overwriting local state)
  const initialDataLoadedRef = useRef(false);
  // Track if we've restored from session storage
  const restoredFromStorageRef = useRef(false);

  // Session storage key for this page's unsaved changes
  const storageKey = `builder-unsaved-${effectivePageId}`;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Reset initial data flag when page changes
  useEffect(() => {
    initialDataLoadedRef.current = false;
    restoredFromStorageRef.current = false;
    setLocalSections([]);
    setHasUnsavedChanges(false);
    newSectionIdsRef.current.clear();
    deletedSectionIdsRef.current.clear();
  }, [effectivePageId]);

  // Save unsaved changes to sessionStorage (backup for tab switches)
  useEffect(() => {
    if (hasUnsavedChanges && localSections.length > 0 && effectivePageId) {
      const dataToStore = {
        sections: localSections,
        newSectionIds: Array.from(newSectionIdsRef.current),
        deletedSectionIds: Array.from(deletedSectionIdsRef.current),
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      } catch (e) {
        console.warn('Failed to save to sessionStorage:', e);
      }
    }
  }, [localSections, hasUnsavedChanges, effectivePageId, storageKey]);

  // Sync sections from server (only on initial load, don't overwrite unsaved changes)
  // This MUST run before the restore effect
  useEffect(() => {
    if (sections) {
      // If we've already restored from storage, NEVER overwrite with server data
      if (restoredFromStorageRef.current) {
        return;
      }
      
      // Only sync if this is the initial load OR we don't have unsaved changes
      if (!initialDataLoadedRef.current) {
        // Check if we have stored data BEFORE setting from server
        try {
          const stored = sessionStorage.getItem(storageKey);
          if (stored) {
            const data = JSON.parse(stored);
            // If valid stored data exists, restore it instead of using server data
            if (data.timestamp && Date.now() - data.timestamp < 3600000 && data.sections?.length > 0) {
              setLocalSections(data.sections);
              newSectionIdsRef.current = new Set(data.newSectionIds || []);
              deletedSectionIdsRef.current = new Set(data.deletedSectionIds || []);
              setHasUnsavedChanges(true);
              initialDataLoadedRef.current = true;
              restoredFromStorageRef.current = true;
              toast.info('Restored unsaved changes');
              return;
            } else {
              // Clear stale data
              sessionStorage.removeItem(storageKey);
            }
          }
        } catch (e) {
          console.warn('Failed to check sessionStorage:', e);
        }
        
        // No stored data, use server data
        setLocalSections(sections);
        setHasUnsavedChanges(false);
        newSectionIdsRef.current.clear();
        deletedSectionIdsRef.current.clear();
        initialDataLoadedRef.current = true;
      } else if (!hasUnsavedChanges) {
        // Only sync from server if user doesn't have unsaved changes
        setLocalSections(sections);
        newSectionIdsRef.current.clear();
        deletedSectionIdsRef.current.clear();
      }
      // If hasUnsavedChanges is true, don't overwrite local state!
    }
  }, [sections, hasUnsavedChanges, storageKey]);

  // Warn on browser tab close / refresh / back navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onPopState = () => {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', onPopState);
    window.history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [hasUnsavedChanges]);

  // Handle block selection
  const handleSelectBlock = useCallback((id: string | null) => {
    setSelectedBlockId(id);
    if (id) {
      setActiveTab('editor');
    }
  }, []);

  // Handle add block - LOCAL ONLY, no DB write
  const handleAddBlock = useCallback((blockType: BlockType) => {
    const tempId = crypto.randomUUID();
    const defaultContent = getDefaultContent(blockType);
    const sortOrder = localSections.length;

    const newSection: PageSection = {
      id: tempId,
      page_id: effectivePageId,
      block_type: blockType,
      content: defaultContent,
      sort_order: sortOrder,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    newSectionIdsRef.current.add(tempId);
    setLocalSections(prev => [...prev, newSection]);
    setHasUnsavedChanges(true);
    toast.success('Block added (unsaved)');
  }, [localSections.length, effectivePageId]);

  // Handle delete block - LOCAL ONLY
  const handleDeleteBlock = useCallback((sectionId: string) => {
    if (selectedBlockId === sectionId) {
      setSelectedBlockId(null);
      setActiveTab('layers');
    }

    // If it was a new section (not in DB), just remove from new set
    if (newSectionIdsRef.current.has(sectionId)) {
      newSectionIdsRef.current.delete(sectionId);
    } else {
      // It's an existing DB section - mark for deletion on save
      deletedSectionIdsRef.current.add(sectionId);
    }

    setLocalSections(prev => prev.filter(s => s.id !== sectionId));
    setHasUnsavedChanges(true);
    toast.success('Block deleted (unsaved)');
  }, [selectedBlockId]);

  // Handle toggle visibility - LOCAL ONLY
  const handleToggleVisibility = useCallback((section: PageSection) => {
    setLocalSections(prev => prev.map(s =>
      s.id === section.id ? { ...s, is_visible: !s.is_visible } : s
    ));
    setHasUnsavedChanges(true);
  }, []);

  // Handle move up - LOCAL ONLY
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setLocalSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      return newSections;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Handle move down - LOCAL ONLY
  const handleMoveDown = useCallback((index: number) => {
    setLocalSections(prev => {
      if (index >= prev.length - 1) return prev;
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      return newSections;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Handle reorder via drag and drop - LOCAL ONLY
  const handleReorder = useCallback((newSections: PageSection[]) => {
    setLocalSections(newSections);
    setHasUnsavedChanges(true);
  }, []);

  // Handle content update - LOCAL ONLY
  const handleUpdateContent = useCallback((sectionId: string, key: string, value: unknown) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        content: { ...(s.content as Record<string, unknown>), [key]: value },
      };
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle nested block layout change - LOCAL ONLY
  // Also auto-expand parent when nested block moves beyond current bounds
  const handleNestedLayoutChange = useCallback((blockId: string, nestedId: string, layoutUpdates: Partial<NestedBlock['layout']>) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id !== blockId) return s;
      const content = s.content as Record<string, unknown>;
      const children = (content.children as NestedBlock[]) || [];
      const currentHeight = content._height as number | undefined;
      
      // Update the nested block
      const updatedChildren = children.map(child => 
        child.id === nestedId 
          ? { ...child, layout: { ...child.layout, ...layoutUpdates } }
          : child
      );
      
      // Calculate required height based on all nested children
      let requiredHeight = 0;
      updatedChildren.forEach(child => {
        const childY = child.layout?.y ?? 0;
        // Use actual height if set, otherwise use default dimensions for block type
        const childHeight = typeof child.layout?.height === 'number' && child.layout.height > 0 
          ? child.layout.height 
          : getDefaultBlockDimensions(child.block_type).height;
        const childBottom = childY + childHeight + 30; // Add padding
        if (childBottom > requiredHeight) requiredHeight = childBottom;
      });
      
      // Auto-expand parent if needed (only expand, never shrink automatically)
      const newHeight = Math.max(currentHeight || 0, requiredHeight);
      
      return {
        ...s,
        content: { 
          ...content, 
          children: updatedChildren,
          // Only update height if it needs to grow
          ...(newHeight > (currentHeight || 0) ? { _height: newHeight } : {}),
        },
      };
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Handle parent block resize - LOCAL ONLY
  const handleBlockResize = useCallback((blockId: string, height: number) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id !== blockId) return s;
      const content = s.content as Record<string, unknown>;
      return {
        ...s,
        content: { ...content, _height: height },
      };
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Save all changes to DB
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Delete sections that were removed
      for (const deletedId of deletedSectionIdsRef.current) {
        await deleteSection.mutateAsync({ id: deletedId, pageId: effectivePageId });
      }

      // 2. Create new sections
      for (const section of localSections) {
        if (newSectionIdsRef.current.has(section.id)) {
          const created = await createSection.mutateAsync({
            page_id: effectivePageId,
            block_type: section.block_type,
            content: section.content,
            sort_order: section.sort_order,
            is_visible: section.is_visible,
          });
          // Update local ID to match the DB-assigned ID
          const oldId = section.id;
          const newId = created.id;
          setLocalSections(prev => prev.map(s =>
            s.id === oldId ? { ...s, id: newId } : s
          ));
          if (selectedBlockId === oldId) {
            setSelectedBlockId(newId);
          }
          newSectionIdsRef.current.delete(oldId);
        }
      }

      // 3. Update existing sections (content, visibility)
      for (const section of localSections) {
        if (newSectionIdsRef.current.has(section.id)) continue; // just created above
        const original = sections?.find(s => s.id === section.id);
        if (!original) continue;

        const contentChanged = JSON.stringify(original.content) !== JSON.stringify(section.content);
        const visibilityChanged = original.is_visible !== section.is_visible;

        if (contentChanged || visibilityChanged) {
          await updateSection.mutateAsync({
            id: section.id,
            content: section.content,
            is_visible: section.is_visible,
          });
        }
      }

      // 4. Reorder if needed
      const reorderUpdates = localSections.map((section, index) => ({
        id: section.id,
        sort_order: index,
      }));
      await reorderSections.mutateAsync({ sections: reorderUpdates, pageId: effectivePageId });

      newSectionIdsRef.current.clear();
      deletedSectionIdsRef.current.clear();
      setHasUnsavedChanges(false);
      setShowSaveConfirm(false);
      // Allow server sync after save
      initialDataLoadedRef.current = false;
      // Clear sessionStorage backup after successful save
      try {
        sessionStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e);
      }
      toast.success('All changes saved');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish toggle
  const handleTogglePublish = async () => {
    if (!page) return;
    try {
      await updatePage.mutateAsync({
        id: page.id,
        is_published: !page.is_published,
      });
      toast.success(page.is_published ? 'Page unpublished' : 'Page published');
    } catch (error) {
      toast.error('Failed to update page');
    }
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'palette') {
      setIsDraggingFromPalette(true);
      setActiveDragType(data.blockType as BlockType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDraggingFromPalette(false);
    setActiveDragType(null);

    if (!over) return;

    const activeData = active.data.current;

    // Palette to preview: add new block locally
    if (activeData?.type === 'palette') {
      handleAddBlock(activeData.blockType as BlockType);
      return;
    }

    // Reorder within preview - LOCAL ONLY
    if (active.id !== over.id) {
      const oldIndex = localSections.findIndex(s => s.id === active.id);
      const newIndex = localSections.findIndex(s => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      setLocalSections(prev => arrayMove(prev, oldIndex, newIndex));
      setHasUnsavedChanges(true);
    }
  };

  if (pageLoading || sectionsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Page not found</p>
        <button onClick={() => navigate('/admin/pages')} className="text-primary underline">
          Back to Pages
        </button>
      </div>
    );
  }

  const dragOverlayBlock = activeDragType
    ? blockTypes.find(b => b.type === activeDragType)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        <BuilderToolbar
          page={page}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          previewDevice={previewDevice}
          customWidth={customWidth}
          customHeight={customHeight}
          onSave={() => setShowSaveConfirm(true)}
          onTogglePublish={handleTogglePublish}
          onDeviceChange={setPreviewDevice}
          onCustomSizeChange={(w, h) => {
            setCustomWidth(w);
            setCustomHeight(h);
          }}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={28} minSize={20} maxSize={45}>
            <BuilderSidebar
              sections={localSections}
              selectedBlockId={selectedBlockId}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSelectBlock={handleSelectBlock}
              onAddBlock={handleAddBlock}
              onDeleteBlock={handleDeleteBlock}
              onToggleVisibility={handleToggleVisibility}
              onUpdateContent={handleUpdateContent}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onReorder={handleReorder}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={72}>
            <BuilderPreview
              sections={localSections}
              selectedBlockId={selectedBlockId}
              onSelectBlock={(id) => handleSelectBlock(id)}
              previewDevice={previewDevice}
              customWidth={customWidth}
              customHeight={customHeight}
              isDraggingFromPalette={isDraggingFromPalette}
              selectedNestedBlockId={selectedNestedBlockId}
              onSelectNestedBlock={setSelectedNestedBlockId}
              onNestedLayoutChange={handleNestedLayoutChange}
              onBlockResize={handleBlockResize}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Drag overlay for palette items */}
      <DragOverlay>
        {dragOverlayBlock && (
          <div className="bg-background border-2 border-primary rounded-lg p-3 shadow-lg flex items-center gap-2 opacity-90">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <dragOverlayBlock.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium">{dragOverlayBlock.label}</span>
          </div>
        )}
      </DragOverlay>

      {/* Save confirmation dialog */}
      <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save all changes to this page? This will update the live website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DndContext>
  );
}
