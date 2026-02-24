import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Type,
  Image,
  LayoutTemplate,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Megaphone,
  Code,
  Briefcase,
  Users,
  Building,
  Layers,
  Clock,
  Award,
  FileText,
  CheckCircle,
  Mail,
  MapPin,
  Grid,
  Filter,
  PanelLeftClose,
  ChevronUp,
  ChevronDown,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { usePage, usePageBySlugAdmin, useUpdatePage, useAllPageSections, useCreatePageSection, useUpdatePageSection, useDeletePageSection, useReorderPageSections } from '@/hooks/usePages';
import { toast } from 'sonner';
import type { BlockType, PageSection } from '@/types/database';
import { BlockEditor } from './BlockEditor';

const blockTypes: { type: BlockType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'hero', label: 'Hero', icon: LayoutTemplate, description: 'Full-width hero section with heading and CTA' },
  { type: 'rich_text', label: 'Rich Text', icon: Type, description: 'Text content with markdown support' },
  { type: 'image_text', label: 'Image + Text', icon: Image, description: 'Image alongside text content' },
  { type: 'gallery', label: 'Gallery', icon: Image, description: 'Image gallery grid' },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'Customer testimonials section' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions accordion' },
  { type: 'stats', label: 'Stats', icon: TrendingUp, description: 'Statistics counter section' },
  { type: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Pricing table' },
  { type: 'cta', label: 'Call to Action', icon: Megaphone, description: 'Call to action banner' },
  { type: 'embed', label: 'Embed', icon: Code, description: 'Video, map, or custom embed' },
  { type: 'services', label: 'Services', icon: Layers, description: 'Display services from CMS' },
  { type: 'portfolio', label: 'Portfolio', icon: Briefcase, description: 'Display portfolio items' },
  { type: 'team', label: 'Team', icon: Users, description: 'Display team members' },
  { type: 'clients', label: 'Clients', icon: Building, description: 'Client logos carousel' },
  { type: 'timeline', label: 'Timeline', icon: Clock, description: 'Vertical timeline with milestones' },
  { type: 'values', label: 'Values', icon: Award, description: 'Company values grid with icons' },
  { type: 'story', label: 'Story', icon: FileText, description: 'Company story with stats overlay' },
  { type: 'why_choose', label: 'Why Choose Us', icon: CheckCircle, description: 'Reasons with statistics grid' },
  { type: 'contact_form', label: 'Contact Form', icon: Mail, description: 'Contact form with validation' },
  { type: 'contact_info', label: 'Contact Info', icon: MapPin, description: 'Contact details display' },
  { type: 'blog_grid', label: 'Blog Grid', icon: Grid, description: 'Blog posts grid with pagination' },
  { type: 'category_filter', label: 'Category Filter', icon: Filter, description: 'Blog category filter buttons' },
  { type: 'container', label: 'Container', icon: Box, description: 'Nested blocks container with layout options' },
];

export function PageBuilder() {
  const { pageId, slug } = useParams<{ pageId?: string; slug?: string }>();
  const navigate = useNavigate();

  // Fetch page - use admin version for slug (no is_published filter)
  const { data: pageById, isLoading: pageByIdLoading } = usePage(pageId || '');
  const { data: pageBySlug, isLoading: pageBySlugLoading } = usePageBySlugAdmin(slug || '');

  const page = pageById || pageBySlug;
  const pageLoading = (!!pageId && pageByIdLoading) || (!!slug && pageBySlugLoading);
  const effectivePageId = page?.id || pageId || '';

  const { data: sections, isLoading: sectionsLoading } = useAllPageSections(effectivePageId);
  const updatePage = useUpdatePage();
  const createSection = useCreatePageSection();
  const updateSection = useUpdatePageSection();
  const deleteSection = useDeletePageSection();
  const reorderSections = useReorderPageSections();

  // Local state - ALL changes are local until save
  const [localSections, setLocalSections] = useState<PageSection[]>([]);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Track which local sections are new (not yet in DB)
  const newSectionIdsRef = useRef<Set<string>>(new Set());
  // Track which sections were deleted locally
  const deletedSectionIdsRef = useRef<Set<string>>(new Set());
  // Track unsaved changes for the sync effect
  const hasUnsavedChangesRef = useRef(false);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Warn on browser tab close / refresh / back navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onPopState = () => {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', onPopState);
    // Push an extra entry so back button triggers popstate instead of leaving
    window.history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [hasUnsavedChanges]);

  // Sync sections from server - but NOT if we have unsaved local changes
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (sections) {
      // Only sync from server on initial load or if no unsaved changes
      if (initialLoadRef.current || !hasUnsavedChangesRef.current) {
        setLocalSections(sections);
        setHasUnsavedChanges(false);
        newSectionIdsRef.current.clear();
        deletedSectionIdsRef.current.clear();
        initialLoadRef.current = false;
      }
    }
  }, [sections]);

  // Keep editingSection in sync with localSections
  useEffect(() => {
    if (editingSection) {
      const updated = localSections.find(s => s.id === editingSection.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(editingSection)) {
        setEditingSection(updated);
      }
    }
  }, [localSections, editingSection]);

  // Handle add block - LOCAL ONLY
  const handleAddBlock = useCallback((blockType: BlockType) => {
    if (!effectivePageId) return;

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
    setIsAddBlockOpen(false);
    toast.success('Block added (unsaved)');
  }, [localSections.length, effectivePageId]);

  // Handle reorder - LOCAL ONLY
  const handleReorder = useCallback((newOrder: PageSection[]) => {
    setLocalSections(newOrder);
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

  // Handle delete - LOCAL ONLY
  const handleDeleteSection = useCallback((sectionId: string) => {
    if (editingSection?.id === sectionId) {
      setEditingSection(null);
    }

    if (newSectionIdsRef.current.has(sectionId)) {
      newSectionIdsRef.current.delete(sectionId);
    } else {
      deletedSectionIdsRef.current.add(sectionId);
    }

    setLocalSections(prev => prev.filter(s => s.id !== sectionId));
    setHasUnsavedChanges(true);
    toast.success('Block deleted (unsaved)');
  }, [editingSection]);

  // Handle toggle visibility - LOCAL ONLY
  const handleToggleVisibility = useCallback((section: PageSection) => {
    setLocalSections(prev => prev.map(s =>
      s.id === section.id ? { ...s, is_visible: !s.is_visible } : s
    ));
    setHasUnsavedChanges(true);
  }, []);

  // Handle block content save from editor - LOCAL ONLY
  const handleSaveBlock = useCallback((sectionId: string, content: Record<string, unknown>) => {
    setLocalSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ));
    setHasUnsavedChanges(true);
    setEditingSection(null);
    toast.success('Block updated (unsaved)');
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
          const oldId = section.id;
          const newId = created.id;
          setLocalSections(prev => prev.map(s =>
            s.id === oldId ? { ...s, id: newId } : s
          ));
          newSectionIdsRef.current.delete(oldId);
        }
      }

      // 3. Update existing sections
      for (const section of localSections) {
        if (newSectionIdsRef.current.has(section.id)) continue;
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

      // 4. Reorder
      const reorderUpdates = localSections.map((section, index) => ({
        id: section.id,
        sort_order: index,
      }));
      await reorderSections.mutateAsync({ sections: reorderUpdates, pageId: effectivePageId });

      newSectionIdsRef.current.clear();
      deletedSectionIdsRef.current.clear();
      setHasUnsavedChanges(false);
      setShowSaveConfirm(false);
      toast.success('All changes saved');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (pageLoading || sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p>Page not found</p>
        <Button onClick={() => navigate('/admin/pages')} className="mt-4">
          Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{page.title}</h1>
              {page.is_system_page && (
                <Badge variant="secondary" className="text-xs">
                  System Page
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              /{page.slug}
              {page.is_system_page && (
                <span className="ml-2 text-xs">(Slug and deletion are protected)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="default"
            className="gap-2"
            onClick={() => setShowSaveConfirm(true)}
            disabled={!hasUnsavedChanges || isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            className="gap-2"
          >
            {page.is_published ? (
              <>
                <EyeOff className="h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={() => navigate(slug ? `/admin/builder/slug/${slug}` : `/admin/builder/${effectivePageId}`)}
          >
            <PanelLeftClose className="h-4 w-4" />
            Visual Builder
          </Button>
          <Button asChild variant="outline">
            <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <Reorder.Group axis="y" values={localSections} onReorder={handleReorder} className="space-y-3">
          {localSections.map((section, index) => (
            <Reorder.Item key={section.id} value={section}>
              <motion.div
                layout
                className={`bg-card rounded-lg border border-border p-4 ${!section.is_visible ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === localSections.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const blockInfo = blockTypes.find((b) => b.type === section.block_type);
                        const Icon = blockInfo?.icon || Type;
                        return <Icon className="h-4 w-4 text-primary" />;
                      })()}
                      <span className="font-medium capitalize">
                        {section.block_type.replace('_', ' ')}
                      </span>
                      {newSectionIdsRef.current.has(section.id) && (
                        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(section)}
                    >
                      {section.is_visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSection(section)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {localSections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No content blocks yet. Add your first block to start building.</p>
          </div>
        )}

        {/* Add Block Button */}
        <Button
          variant="outline"
          className="w-full gap-2 h-14 border-dashed"
          onClick={() => setIsAddBlockOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Add Content Block
        </Button>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {blockTypes.map((block) => (
              <button
                key={block.type}
                onClick={() => handleAddBlock(block.type)}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <block.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{block.label}</h4>
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      {editingSection && (
        <BlockEditor
          section={editingSection}
          onSave={(content) => handleSaveBlock(editingSection.id, content)}
          onClose={() => setEditingSection(null)}
        />
      )}

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

    </div>
  );
}

function getDefaultContent(blockType: BlockType): Record<string, unknown> {
  switch (blockType) {
    case 'hero':
      return {
        headline: 'Your Headline Here',
        subheadline: 'Add a compelling subheadline',
        primaryButtonText: 'Get Started',
        primaryButtonUrl: '/contact',
        alignment: 'center',
      };
    case 'rich_text':
      return { content: '# Your Content\n\nStart writing your content here...' };
    case 'image_text':
      return {
        title: 'Section Title',
        content: 'Your content here...',
        imageUrl: '/placeholder.svg',
        imagePosition: 'left',
      };
    case 'gallery':
      return {
        title: 'Gallery',
        images: [],
        columns: 3,
      };
    case 'testimonials':
      return {
        title: 'What Our Clients Say',
        displayStyle: 'carousel',
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        items: [
          { question: 'Question 1?', answer: 'Answer 1' },
          { question: 'Question 2?', answer: 'Answer 2' },
        ],
      };
    case 'stats':
      return {
        items: [
          { value: '100', label: 'Projects', suffix: '+' },
          { value: '50', label: 'Clients', suffix: '+' },
          { value: '10', label: 'Years', suffix: '+' },
        ],
      };
    case 'pricing':
      return {
        title: 'Our Pricing',
        plans: [
          {
            name: 'Starter',
            price: '$99',
            period: '/month',
            features: ['Feature 1', 'Feature 2'],
            buttonText: 'Get Started',
            buttonUrl: '/contact',
          },
        ],
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        subtitle: 'Contact us today for a free consultation',
        buttonText: 'Contact Us',
        buttonUrl: '/contact',
        backgroundStyle: 'gradient',
      };
    case 'embed':
      return {
        embedType: 'video',
        aspectRatio: '16:9',
      };
    case 'services':
      return {
        title: 'Our Services',
        displayStyle: 'grid',
        showFeaturedOnly: false,
      };
    case 'portfolio':
      return {
        title: 'Our Work',
        displayStyle: 'grid',
        showFeaturedOnly: false,
        limit: 6,
      };
    case 'team':
      return {
        title: 'Meet Our Team',
        displayStyle: 'grid',
      };
    case 'clients':
      return {
        title: 'Trusted By',
        displayStyle: 'carousel',
      };
    case 'timeline':
      return {
        title: 'Our Journey',
        subtitle: 'Key milestones in our history',
        items: [
          { year: '2020', title: 'Founded', description: 'Company started' },
          { year: '2021', title: 'First Milestone', description: 'Achievement description' },
        ],
      };
    case 'values':
      return {
        title: 'Our Values',
        subtitle: 'What drives us forward',
        columns: 3,
        items: [
          { icon: 'target', title: 'Excellence', description: 'We strive for excellence in everything we do' },
          { icon: 'heart', title: 'Passion', description: 'Passionate about delivering great results' },
          { icon: 'users', title: 'Teamwork', description: 'Collaboration is key to our success' },
        ],
      };
    case 'story':
      return {
        title: 'Our Story',
        paragraphs: [
          'Add your company story here...',
          'Continue your narrative...',
        ],
        stats: {
          yearsExperience: 10,
          projectsCompleted: 100,
        },
      };
    case 'why_choose':
      return {
        title: 'Why Choose Us',
        reasons: 'Expert Team\nProven Track Record\nCustomer First Approach',
        stats: {
          stat1Label: 'Projects',
          stat1Value: '100+',
          stat2Label: 'Clients',
          stat2Value: '50+',
          stat3Label: 'Countries',
          stat3Value: '10+',
          stat4Label: 'Awards',
          stat4Value: '5+',
        },
      };
    case 'contact_form':
      return {
        title: 'Get In Touch',
        subtitle: 'We would love to hear from you',
      };
    case 'contact_info':
      return {
        title: 'Contact Information',
        useSettings: true,
      };
    case 'blog_grid':
      return {
        title: 'Latest Posts',
        layout: 'grid',
        postsPerPage: 9,
      };
    case 'category_filter':
      return {
        style: 'pills',
        showAll: true,
      };
    case 'container':
      return {
        _containerLayout: 'flex',
        _direction: 'column',
        _gap: 16,
        _columns: 2,
        _alignItems: 'stretch',
        _justifyContent: 'flex-start',
        children: [],
      };
    default:
      return {};
  }
}
