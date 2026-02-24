import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Plus, Menu, GripVertical, Pencil, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAllMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useReorderMenuItems } from '@/hooks/useMenuItems';
import { usePages } from '@/hooks/usePages';
import { toast } from 'sonner';
import type { MenuItem } from '@/types/database';

export function MenuManager() {
  const { data: allItems, isLoading } = useAllMenuItems();
  const { data: pages } = usePages();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const reorderMenuItems = useReorderMenuItems();
  
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [localItems, setLocalItems] = useState<MenuItem[]>([]);

  const [formData, setFormData] = useState({
    label: '',
    url: '',
    page_id: '',
    is_enabled: true,
    open_in_new_tab: false,
  });

  const filteredItems = allItems?.filter((item) => item.menu_location === activeTab) || [];

  useEffect(() => {
    setLocalItems(filteredItems);
  }, [allItems, activeTab]);

  const resetForm = () => {
    setFormData({
      label: '',
      url: '',
      page_id: '',
      is_enabled: true,
      open_in_new_tab: false,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      url: item.url || '',
      page_id: item.page_id || '',
      is_enabled: item.is_enabled,
      open_in_new_tab: item.open_in_new_tab,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      label: formData.label,
      url: formData.page_id ? null : formData.url || null,
      page_id: formData.page_id || null,
      is_enabled: formData.is_enabled,
      open_in_new_tab: formData.open_in_new_tab,
      menu_location: activeTab,
    };

    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, ...data });
        toast.success('Menu item updated');
      } else {
        const sortOrder = filteredItems.length;
        await createMenuItem.mutateAsync({
          ...data,
          sort_order: sortOrder,
          parent_id: null,
        });
        toast.success('Menu item added');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem.mutateAsync(id);
      toast.success('Menu item deleted');
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleReorder = async (newOrder: MenuItem[]) => {
    setLocalItems(newOrder);
    
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    try {
      await reorderMenuItems.mutateAsync(updates);
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const handleToggleEnabled = async (item: MenuItem) => {
    try {
      await updateMenuItem.mutateAsync({
        id: item.id,
        is_enabled: !item.is_enabled,
      });
      toast.success(item.is_enabled ? 'Menu item disabled' : 'Menu item enabled');
    } catch (error) {
      toast.error('Failed to update');
    }
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
          <h1 className="text-3xl font-bold">Menus</h1>
          <p className="text-muted-foreground">Manage your navigation menus</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Menu item label"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page_id">Link to Page</Label>
                <Select
                  value={formData.page_id}
                  onValueChange={(value) => setFormData({ ...formData, page_id: value, url: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page or use custom URL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom URL</SelectItem>
                    {pages?.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title} (/{page.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!formData.page_id && (
                <div className="space-y-2">
                  <Label htmlFor="url">Custom URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/about or https://external.com"
                  />
                </div>
              )}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                  <Label htmlFor="is_enabled">Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="open_in_new_tab"
                    checked={formData.open_in_new_tab}
                    onCheckedChange={(checked) => setFormData({ ...formData, open_in_new_tab: checked })}
                  />
                  <Label htmlFor="open_in_new_tab">Open in new tab</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuItem.isPending || updateMenuItem.isPending}>
                  {editingItem ? 'Update' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'header' | 'footer')}>
        <TabsList>
          <TabsTrigger value="header">Header Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer Menu</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Reorder.Group axis="y" values={localItems} onReorder={handleReorder} className="space-y-2">
            {localItems.map((item) => (
              <Reorder.Item key={item.id} value={item}>
                <motion.div
                  layout
                  className={`bg-card rounded-lg border border-border p-4 flex items-center gap-4 ${
                    !item.is_enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Menu className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {item.url || (item.page_id ? 'Linked to page' : 'No URL')}
                      {item.open_in_new_tab && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleEnabled(item)}
                    >
                      {item.is_enabled ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{item.label}". This action cannot be undone.
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
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {localItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <Menu className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this menu yet. Add your first menu item.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
