'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Eye, X, File, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAttachments, deleteAttachment } from '@/lib/utils/storage';
import type { Attachment } from '@/lib/types/database';

interface AttachmentViewerProps {
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note';
  entityId: string;
  onAttachmentDeleted?: (attachmentId: string) => void;
  className?: string;
}

export function AttachmentViewer({
  entityType,
  entityId,
  onAttachmentDeleted,
  className
}: AttachmentViewerProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadAttachments();
  }, [entityType, entityId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await getAttachments(entityType, entityId);
      setAttachments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load attachments');
      console.error('Error loading attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const result = await deleteAttachment(attachmentId);
      if (result.success) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        onAttachmentDeleted?.(attachmentId);
      } else {
        setError(result.error || 'Failed to delete attachment');
      }
    } catch (err) {
      setError('Failed to delete attachment');
      console.error('Error deleting attachment:', err);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading attachments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-center py-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={loadAttachments} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No attachments yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="p-3">
            <div className="space-y-3">
              {/* Preview */}
              {attachment.type === 'image' ? (
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={attachment.url}
                    alt={attachment.filename || 'Attachment'}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(attachment.url)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setSelectedImage(attachment.url)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  {getFileIcon(attachment.type)}
                </div>
              )}

              {/* File Info */}
              <div className="space-y-1">
                <p className="text-sm font-medium truncate" title={attachment.filename || 'Untitled'}>
                  {attachment.filename || 'Untitled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(attachment.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 