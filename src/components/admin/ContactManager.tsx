import { MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubmissionsManager } from './SubmissionsManager';
import { ContactFormEditor } from './ContactFormEditor';

export function ContactManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Form Submissions
          </TabsTrigger>
          <TabsTrigger value="form">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Form Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <SubmissionsManager />
        </TabsContent>

        <TabsContent value="form">
          <ContactFormEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
