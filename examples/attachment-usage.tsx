'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/file-upload';
import { AttachmentViewer } from '@/components/attachment-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Attachment } from '@/lib/types/database';

interface AttachmentManagerProps {
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note';
  entityId: string;
  userId: string;
}

export function AttachmentManager({
  entityType,
  entityId,
  userId
}: AttachmentManagerProps) {
  const [recentUploads, setRecentUploads] = useState<Attachment[]>([]);

  const handleUploadComplete = (url: string) => {
    // Create a mock attachment object for display purposes
    const mockAttachment: Attachment = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      itinerary_id: entityType === 'itinerary' ? entityId : null,
      stop_id: entityType === 'stop' ? entityId : null,
      activity_id: entityType === 'activity' ? entityId : null,
      accommodation_id: entityType === 'accommodation' ? entityId : null,
      note_id: entityType === 'note' ? entityId : null,
      url,
      type: 'file',
      filename: url.split('/').pop() || 'uploaded-file',
      uploaded_at: new Date().toISOString()
    };
    setRecentUploads(prev => [mockAttachment, ...prev.slice(0, 4)]); // Keep last 5
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You might want to show a toast notification here
  };

  const handleAttachmentDeleted = (attachmentId: string) => {
    setRecentUploads(prev => prev.filter(a => a.id !== attachmentId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="view">View Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <FileUpload
              entityType={entityType}
              userId={userId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
            
            {recentUploads.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent Uploads</h4>
                <div className="space-y-2">
                  {recentUploads.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <span className="text-xs text-muted-foreground">
                        {attachment.filename}
                      </span>
                      <span className="text-xs text-green-600">
                        ✓ Uploaded
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="view">
            <AttachmentViewer
              entityType={entityType}
              entityId={entityId}
              onAttachmentDeleted={handleAttachmentDeleted}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Example usage in an itinerary detail page
export function ItineraryDetailPage({ itineraryId, userId }: { itineraryId: string; userId: string }) {
  return (
    <div className="space-y-6">
      <h1>Itinerary Details</h1>
      
      {/* Other itinerary content */}
      
      {/* Attachment manager */}
      <AttachmentManager
        entityType="itinerary"
        entityId={itineraryId}
        userId={userId}
      />
    </div>
  );
}

// Example usage in an activity detail page
export function ActivityDetailPage({ activityId, userId }: { activityId: string; userId: string }) {
  return (
    <div className="space-y-6">
      <h1>Activity Details</h1>
      
      {/* Other activity content */}
      
      {/* Attachment manager */}
      <AttachmentManager
        entityType="activity"
        entityId={activityId}
        userId={userId}
      />
    </div>
  );
} 