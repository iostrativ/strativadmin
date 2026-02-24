import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, Building, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useContactSubmissions, useMarkSubmissionRead, useDeleteContactSubmission } from '@/hooks/useContactSubmissions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ContactSubmission } from '@/types/database';

export function SubmissionsManager() {
  const { data: submissions, isLoading } = useContactSubmissions();
  const markRead = useMarkSubmissionRead();
  const deleteSubmission = useDeleteContactSubmission();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleRead = async (submission: ContactSubmission) => {
    try {
      await markRead.mutateAsync({
        id: submission.id,
        is_read: !submission.is_read,
      });
      toast.success(submission.is_read ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubmission.mutateAsync(id);
      toast.success('Submission deleted');
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  const unreadCount = submissions?.filter((s) => !s.is_read).length || 0;

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
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? (
              <span>
                You have <span className="text-primary font-semibold">{unreadCount}</span> unread message{unreadCount !== 1 ? 's' : ''}
              </span>
            ) : (
              'All messages have been read'
            )}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions?.map((submission, index) => (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-card rounded-lg border border-border overflow-hidden ${
              !submission.is_read ? 'border-l-4 border-l-primary' : ''
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  submission.is_read ? 'bg-muted' : 'bg-primary/10'
                }`}>
                  <MessageSquare className={`h-5 w-5 ${
                    submission.is_read ? 'text-muted-foreground' : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${!submission.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {submission.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {submission.subject && (
                    <p className="text-sm font-medium mb-1">{submission.subject}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {submission.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {submission.email}
                    </span>
                    {submission.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {submission.phone}
                      </span>
                    )}
                    {submission.company && (
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {submission.company}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expandedId === submission.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Expanded Content */}
            {expandedId === submission.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4 border-t border-border"
              >
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Full Message:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.message}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRead(submission);
                      }}
                    >
                      {submission.is_read ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Read
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${submission.email}?subject=Re: ${submission.subject || 'Your inquiry'}`;
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this message. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(submission.id)}
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
            )}
          </motion.div>
        ))}
        {submissions?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No contact submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
