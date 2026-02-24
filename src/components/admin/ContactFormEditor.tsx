import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // For select fields
  sortOrder: number;
}

const defaultFields: FormField[] = [
  { id: '1', type: 'text', label: 'Name', placeholder: 'John Doe', required: true, sortOrder: 0 },
  { id: '2', type: 'email', label: 'Email', placeholder: 'john@example.com', required: true, sortOrder: 1 },
  { id: '3', type: 'tel', label: 'Phone', placeholder: '+1 (555) 123-4567', required: false, sortOrder: 2 },
  { id: '4', type: 'text', label: 'Company', placeholder: 'Your Company', required: false, sortOrder: 3 },
  { id: '5', type: 'text', label: 'Subject', placeholder: 'How can we help?', required: false, sortOrder: 4 },
  { id: '6', type: 'textarea', label: 'Message', placeholder: 'Tell us about your project...', required: true, sortOrder: 5 },
];

export function ContactFormEditor() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [formData, setFormData] = useState({
    contact_form_title: 'Get in Touch',
    contact_form_description: 'Have a question or want to work together? We\'d love to hear from you.',
    contact_form_email: settings?.email || '',
    contact_form_fields: defaultFields,
  });

  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        contact_form_title: (settings as any).contact_form_title || 'Get in Touch',
        contact_form_description: (settings as any).contact_form_description || 'Have a question or want to work together? We\'d love to hear from you.',
        contact_form_email: settings.email || '',
        contact_form_fields: (settings as any).contact_form_fields || defaultFields,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        ...(settings || {}),
        ...formData,
      } as any);
      toast.success('Contact form settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      sortOrder: formData.contact_form_fields.length,
    };
    setEditingField(newField);
    setIsDialogOpen(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField({ ...field });
    setIsDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!editingField) return;

    const existingIndex = formData.contact_form_fields.findIndex(f => f.id === editingField.id);
    let updatedFields;

    if (existingIndex >= 0) {
      // Update existing field
      updatedFields = [...formData.contact_form_fields];
      updatedFields[existingIndex] = editingField;
    } else {
      // Add new field
      updatedFields = [...formData.contact_form_fields, editingField];
    }

    setFormData({ ...formData, contact_form_fields: updatedFields });
    setIsDialogOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = formData.contact_form_fields.filter(f => f.id !== fieldId);
    setFormData({ ...formData, contact_form_fields: updatedFields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formData.contact_form_fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newFields.length) return;

    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    newFields.forEach((field, idx) => field.sortOrder = idx);

    setFormData({ ...formData, contact_form_fields: newFields });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure the basic settings for your contact form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_form_title">Form Title</Label>
            <Input
              id="contact_form_title"
              value={formData.contact_form_title}
              onChange={(e) => setFormData({ ...formData, contact_form_title: e.target.value })}
              placeholder="Get in Touch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_form_description">Form Description</Label>
            <Textarea
              id="contact_form_description"
              value={formData.contact_form_description}
              onChange={(e) => setFormData({ ...formData, contact_form_description: e.target.value })}
              placeholder="Describe your contact form..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_form_email">Recipient Email</Label>
            <Input
              id="contact_form_email"
              type="email"
              value={formData.contact_form_email}
              onChange={(e) => setFormData({ ...formData, contact_form_email: e.target.value })}
              placeholder="your@email.com"
            />
            <p className="text-sm text-muted-foreground">
              Form submissions will be sent to this email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Form Fields</CardTitle>
              <CardDescription>
                Customize the fields in your contact form
              </CardDescription>
            </div>
            <Button type="button" onClick={handleAddField} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.contact_form_fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{field.label}</span>
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </div>
                  <div className="text-muted-foreground">{field.type}</div>
                  <div className="text-muted-foreground truncate">{field.placeholder}</div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveField(index, 'down')}
                    disabled={index === formData.contact_form_fields.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField(field)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove "{field.label}" from your contact form.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteField(field.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {formData.contact_form_fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No fields added yet. Click "Add Field" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField?.id ? 'Edit' : 'Add'} Form Field</DialogTitle>
          </DialogHeader>

          {editingField && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={editingField.type}
                  onValueChange={(value: any) => setEditingField({ ...editingField, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="tel">Phone</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={editingField.label}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  placeholder="Field label"
                />
              </div>

              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={editingField.placeholder}
                  onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                  placeholder="Placeholder text"
                />
              </div>

              {editingField.type === 'select' && (
                <div className="space-y-2">
                  <Label>Options (one per line)</Label>
                  <Textarea
                    value={editingField.options?.join('\n') || ''}
                    onChange={(e) => setEditingField({
                      ...editingField,
                      options: e.target.value.split('\n').filter(o => o.trim())
                    })}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={5}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingField.required}
                  onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                />
                <Label>Required field</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveField}>
                  Save Field
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </form>
  );
}
