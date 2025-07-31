'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { validateFile } from '@/lib/utils/storage';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface FileUploadProps {
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note';
  userId: string;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  id?: string;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// ============================================================================
// UTILITIES
// ============================================================================

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (file.type === 'application/pdf') return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// COMPONENT
// ============================================================================

export function FileUpload({
  entityType,
  userId,
  onUploadComplete,
  onUploadError,
  className,
  id = 'file-input',
  accept = 'image/*,.pdf,.txt,.doc,.docx',
  maxFiles = 5,
  maxSize = 50 // 50MB default
}: FileUploadProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // UPLOAD LOGIC
  // ============================================================================

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Create storage path
    const storagePath = `${userId}/${entityType}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  }, [userId, entityType]);

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  const validateFiles = useCallback((files: File[]): { valid: File[], invalid: { file: File, error: string }[] } => {
    const valid: File[] = [];
    const invalid: { file: File, error: string }[] = [];

    files.forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        invalid.push({ file, error: `File troppo grande. Massimo ${maxSize}MB` });
        return;
      }

  // Use existing validation
      const validation = validateFile(file);
      if (!validation.valid) {
        invalid.push({ file, error: validation.error! });
        return;
      }

      valid.push(file);
    });

    return { valid, invalid };
  }, [maxSize]);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check max files limit
    if (fileArray.length > maxFiles) {
      onUploadError?.(`Massimo ${maxFiles} file alla volta`);
      return;
    }

    // Validate files
    const { valid, invalid } = validateFiles(fileArray);

    // Report invalid files
    invalid.forEach(({ error }) => onUploadError?.(error));

    if (valid.length === 0) return;

    // Create uploading files state
    const newUploadingFiles: UploadingFile[] = valid.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    setIsUploading(true);

    // Upload each file
    for (const uploadingFile of newUploadingFiles) {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(f =>
              f.id === uploadingFile.id && f.status === 'uploading'
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 100);

        // Upload file
        const url = await uploadFile(uploadingFile.file);

        clearInterval(progressInterval);

        // Update success state
        setUploadingFiles(prev => 
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, progress: 100, status: 'success' as const }
              : f
          )
        );

        // Callback
        onUploadComplete?.(url);

        // Remove from list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        }, 2000);

      } catch {
        // Update error state
        setUploadingFiles(prev => 
          prev.map(f =>
            f.id === uploadingFile.id
              ? { ...f, status: 'error' as const, error: 'Upload fallito' }
              : f
          )
        );
        onUploadError?.('Upload fallito');
      }
    }

    setIsUploading(false);
  }, [maxFiles, validateFiles, uploadFile, onUploadComplete, onUploadError]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFileSelect = useCallback((files: FileList | null) => {
    processFiles(files);
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={className}>
      {/* Upload Area */}
      <Card
        className={cn(
          "relative border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragOver && "border-primary bg-primary/5 scale-[1.02]",
          isUploading && "pointer-events-none opacity-75"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Upload className={cn(
          "w-8 h-8 mx-auto mb-2 transition-colors",
          isDragOver ? "text-primary" : "text-muted-foreground"
        )} />

        <p className="text-sm text-muted-foreground mb-2">
          Trascina i file qui o clicca per selezionare
        </p>

        <p className="text-xs text-muted-foreground">
          Supporta immagini, PDF e documenti fino a {maxSize}MB
        </p>

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          onClick={(e) => e.stopPropagation()}
          accept={accept}
        />
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="p-3">
              <div className="flex items-center gap-3">
                {getFileIcon(uploadingFile.file)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={uploadingFile.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground min-w-[3rem]">
                      {uploadingFile.progress}%
                    </span>
                  </div>

                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadingFile.error}
                    </p>
                  )}

                  {uploadingFile.status === 'success' && (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Upload completato!</span>
                    </div>
                  )}
                </div>

                {uploadingFile.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadingFile.id)}
                    className="text-destructive hover:text-destructive"
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