import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateContactSubmission } from '@/hooks/useContactSubmissions';
import { toast } from 'sonner';
import { getTextStyles } from '@/lib/utils';

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface ContactFormBlockContent {
  title?: string;
  subtitle?: string;
  fields?: FormField[];
}

interface ContactFormBlockProps {
  content: ContactFormBlockContent;
  index: number;
}

export function ContactFormBlock({ content, index }: ContactFormBlockProps) {
  const { title, subtitle } = content;
  const titleColor = (content as Record<string, unknown>)._titleColor as string | undefined;
  const titleCss = (content as Record<string, unknown>)._titleCss as string | undefined;
  const subtitleColor = (content as Record<string, unknown>)._subtitleColor as string | undefined;
  const subtitleCss = (content as Record<string, unknown>)._subtitleCss as string | undefined;
  const createSubmission = useCreateContactSubmission();
  const [submitted, setSubmitted] = useState(false);

  // Default fields if none configured
  const fields: FormField[] = content.fields || [
    { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
    { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+1234567890', required: false },
    { id: 'company', label: 'Company', type: 'text', placeholder: 'Your company', required: false },
    { id: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?', required: false },
    { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...', required: true },
  ];

  // Dynamically create Zod schema from fields
  const schema = useMemo(() => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().trim().email('Please enter a valid email');
          break;
        case 'tel':
        case 'number':
          fieldSchema = z.string().trim();
          break;
        case 'textarea':
          fieldSchema = z.string().trim().min(10, `${field.label} must be at least 10 characters`);
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string().trim();
      }

      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: `${field.label} is required`,
          });
        } else {
          fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
        }
      } else {
        if (field.type !== 'checkbox') {
          fieldSchema = (fieldSchema as z.ZodString).optional();
        } else {
          fieldSchema = z.boolean().optional();
        }
      }

      schemaFields[field.id] = fieldSchema;
    });

    return z.object(schemaFields);
  }, [fields]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Map dynamic fields to submission data
      await createSubmission.mutateAsync({
        name: data.name || 'Anonymous',
        email: data.email || '',
        message: data.message || JSON.stringify(data),
        phone: data.phone || null,
        company: data.company || null,
        subject: data.subject || null,
      });
      setSubmitted(true);
      reset();
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && '*'}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              rows={6}
              {...register(field.id)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error.message?.toString()}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && '*'}
            </Label>
            <Select
              value={watch(field.id)}
              onValueChange={(value) => setValue(field.id, value)}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error.message?.toString()}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={watch(field.id)}
              onCheckedChange={(checked) => setValue(field.id, checked)}
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {field.label} {field.required && '*'}
            </Label>
            {error && <p className="text-sm text-destructive ml-2">{error.message?.toString()}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error.message?.toString()}</p>}
          </div>
        );
    }
  };

  // Group fields into rows (2 columns for non-textarea fields)
  const fieldRows: FormField[][] = [];
  let currentRow: FormField[] = [];

  fields.forEach((field) => {
    if (field.type === 'textarea' || field.type === 'select') {
      if (currentRow.length > 0) {
        fieldRows.push(currentRow);
        currentRow = [];
      }
      fieldRows.push([field]);
    } else if (field.type === 'checkbox') {
      if (currentRow.length > 0) {
        fieldRows.push(currentRow);
        currentRow = [];
      }
      fieldRows.push([field]);
    } else {
      currentRow.push(field);
      if (currentRow.length === 2) {
        fieldRows.push(currentRow);
        currentRow = [];
      }
    }
  });

  if (currentRow.length > 0) {
    fieldRows.push(currentRow);
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="max-w-3xl mx-auto"
        >
          {title && (
            <h2 
              className="text-3xl font-bold mb-4 text-center"
              style={getTextStyles(titleColor, titleCss)}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p 
              className="text-muted-foreground text-center mb-8"
              style={getTextStyles(subtitleColor, subtitleCss)}
            >
              {subtitle}
            </p>
          )}

          <div className="bg-card rounded-2xl border border-border p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Send className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                  Your message has been sent successfully. We'll get back to you within 24 hours.
                </p>
                <Button onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {fieldRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={row.length > 1 ? 'grid md:grid-cols-2 gap-6' : ''}
                  >
                    {row.map((field) => renderField(field))}
                  </div>
                ))}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
