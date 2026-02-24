import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Star, Eye, EyeOff, Pencil, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { usePortfolioItems, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem } from '@/hooks/usePortfolio';
import { toast } from 'sonner';
import type { PortfolioItem } from '@/types/database';
import { MediaPicker } from './MediaPicker';

export function PortfolioManager() {
  const { data: items, isLoading } = usePortfolioItems();
  const createItem = useCreatePortfolioItem();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    client: '',
    industry: '',
    tech_stack: '',
    short_description: '',
    content: '',
    featured_image: '',
    highlights: '',
    is_featured: false,
    is_published: false,
    completed_at: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      client: '',
      industry: '',
      tech_stack: '',
      short_description: '',
      content: '',
      featured_image: '',
      highlights: '',
      is_featured: false,
      is_published: false,
      completed_at: '',
    });
    setEditingItem(null);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      client: item.client || '',
      industry: item.industry || '',
      tech_stack: item.tech_stack?.join(', ') || '',
      short_description: item.short_description || '',
      content: item.content || '',
      featured_image: item.featured_image || '',
      highlights: item.highlights?.join('\n') || '',
      is_featured: item.is_featured,
      is_published: item.is_published,
      completed_at: item.completed_at || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title: formData.title,
      slug: formData.slug,
      client: formData.client || null,
      industry: formData.industry || null,
      tech_stack: formData.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      short_description: formData.short_description || null,
      content: formData.content || null,
      featured_image: formData.featured_image || null,
      highlights: formData.highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      is_featured: formData.is_featured,
      is_published: formData.is_published,
      completed_at: formData.completed_at || null,
    };

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...data });
        toast.success('Portfolio item updated successfully');
      } else {
        await createItem.mutateAsync(data);
        toast.success('Portfolio item created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save portfolio item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast.success('Portfolio item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete portfolio item');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Manage your projects and case studies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingItem ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Project title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="project-slug"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Healthcare, Finance"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
                  <Input
                    id="tech_stack"
                    value={formData.tech_stack}
                    onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completed_at">Completed Date</Label>
                  <Input
                    id="completed_at"
                    type="date"
                    value={formData.completed_at}
                    onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                  />
                </div>
              </div>
              <MediaPicker
                label="Featured Image"
                value={formData.featured_image}
                onChange={(url) => setFormData({ ...formData, featured_image: url })}
                description="Choose or upload a featured image for this portfolio item"
              />
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <RichTextEditor
                  value={formData.short_description}
                  onChange={(value) => setFormData({ ...formData, short_description: value })}
                  placeholder="Brief description for cards"
                  minHeight="80px"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlights">Key Highlights (one per line)</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Increased performance by 50%&#10;Reduced costs by 30%&#10;Improved user engagement"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Full Content</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Project overview and detailed description..."
                  minHeight="200px"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                  {editingItem ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            <div className="aspect-video bg-muted relative">
              {item.featured_image ? (
                <img
                  src={item.featured_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
              {item.is_featured && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                {item.is_published ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                    <Eye className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    <EyeOff className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {item.short_description}
              </p>
              {item.tech_stack && item.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tech_stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-xs bg-muted px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                  {item.tech_stack.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{item.tech_stack.length - 3}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{item.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        ))}
        {items?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No portfolio items yet. Add your first project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
