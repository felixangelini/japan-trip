'use client';

import { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { uploadAttachment, validateFile, type FileUploadOptions } from '@/lib/utils/storage';
import type { Attachment } from '@/lib/types/database';

interface FileUploadProps {
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note';
  entityId: string;
  userId: string;
  onUploadComplete?: (attachment: Attachment) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({
  entityType,
  entityId,
  userId,
  onUploadComplete,
  onUploadError,
  className
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.error!);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        // Simulate progress (in real implementation, you might want to use XMLHttpRequest for progress tracking)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map((f, idx) => 
              idx === fileIndex && f.status === 'uploading'
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        const result = await uploadAttachment({
          file,
          userId,
          entityType,
          entityId
        });

        clearInterval(progressInterval);

        if (result.success) {
          setUploadingFiles(prev => 
            prev.map((f, idx) => 
              idx === fileIndex
                ? { ...f, progress: 100, status: 'success' as const }
                : f
            )
          );

          // Fetch the created attachment from database
          // In a real implementation, you might want to return the attachment data from uploadAttachment
          onUploadComplete?.({
            id: '', // This would be the actual attachment ID
            user_id: userId,
            url: result.url!,
            type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'file',
            filename: file.name,
            uploaded_at: new Date().toISOString(),
            itinerary_id: entityType === 'itinerary' ? entityId : null,
            stop_id: entityType === 'stop' ? entityId : null,
            activity_id: entityType === 'activity' ? entityId : null,
            accommodation_id: entityType === 'accommodation' ? entityId : null,
            note_id: entityType === 'note' ? entityId : null
          });

          // Remove from uploading list after a delay
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
          }, 2000);

        } else {
          setUploadingFiles(prev => 
            prev.map((f, idx) => 
              idx === fileIndex
                ? { ...f, status: 'error' as const, error: result.error }
                : f
            )
          );
          onUploadError?.(result.error!);
        }

      } catch (error) {
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f
          )
        );
        onUploadError?.('Upload failed');
      }
    }
  }, [entityType, entityId, userId, uploadingFiles.length, onUploadComplete, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card
        className={`
          relative border-2 border-dashed p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            click to select
          </Button>
        </p>
        <p className="text-xs text-muted-foreground">
          Supports images, PDFs, and documents up to 50MB
        </p>
        
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="image/*,.pdf,.txt,.doc,.docx"
        />
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={`${uploadingFile.file.name}-${index}`} className="p-3">
              <div className="flex items-center gap-3">
                {getFileIcon(uploadingFile.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={uploadingFile.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {uploadingFile.progress}%
                    </span>
                  </div>
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                  {uploadingFile.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">
                      Upload complete!
                    </p>
                  )}
                </div>
                {uploadingFile.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadingFiles(prev => prev.filter((_, idx) => idx !== index))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 