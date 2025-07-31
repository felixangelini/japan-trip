import { createClient } from '@/lib/supabase/client';
import type { AttachmentInsert } from '@/lib/types/database';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface FileUploadOptions {
  file: File;
  userId: string;
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note';
  entityId: string;
  filename?: string;
}

/**
 * Upload a file to Supabase Storage and create an attachment record
 */
export async function uploadAttachment({
  file,
  userId,
  entityType,
  entityId,
  filename
}: FileUploadOptions): Promise<UploadResult> {
  const supabase = createClient();
  
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = filename || `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Create the storage path: userId/entityType/entityId/filename
    const storagePath = `${userId}/${entityType}/${entityId}/${uniqueFilename}`;
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message
      };
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);
    
    // Determine file type
    const fileType = getFileType(file.type, fileExtension);
    
    // Create attachment record in database
    const attachmentData: AttachmentInsert = {
      user_id: userId,
      url: urlData.publicUrl,
      type: fileType,
      filename: file.name,
      // Set the appropriate foreign key based on entity type
      ...(entityType === 'itinerary' && { itinerary_id: entityId }),
      ...(entityType === 'stop' && { stop_id: entityId }),
      ...(entityType === 'activity' && { activity_id: entityId }),
      ...(entityType === 'accommodation' && { accommodation_id: entityId }),
      ...(entityType === 'note' && { note_id: entityId })
    };
    
    const { error: dbError } = await supabase
      .from('attachments')
      .insert(attachmentData);
    
    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up the uploaded file if database insert fails
      await supabase.storage
        .from('attachments')
        .remove([storagePath]);
      
      return {
        success: false,
        error: dbError.message
      };
    }
    
    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath
    };
    
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete an attachment from storage and database
 */
export async function deleteAttachment(attachmentId: string): Promise<UploadResult> {
  const supabase = createClient();
  
  try {
    // Get attachment info from database
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();
    
    if (fetchError || !attachment) {
      return {
        success: false,
        error: 'Attachment not found'
      };
    }
    
    // Extract path from URL
    const urlParts = attachment.url.split('/');
    const path = urlParts.slice(-4).join('/'); // userId/entityType/entityId/filename
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([path]);
    
    if (storageError) {
      console.error('Storage deletion error:', storageError);
      return {
        success: false,
        error: storageError.message
      };
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);
    
    if (dbError) {
      console.error('Database deletion error:', dbError);
      return {
        success: false,
        error: dbError.message
      };
    }
    
    return {
      success: true
    };
    
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get attachments for a specific entity
 */
export async function getAttachments(
  entityType: 'itinerary' | 'stop' | 'activity' | 'accommodation' | 'note',
  entityId: string
) {
  const supabase = createClient();
  
  const query = supabase
    .from('attachments')
    .select('*')
    .eq(`${entityType}_id`, entityId)
    .order('uploaded_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
  
  return data;
}

/**
 * Determine file type based on MIME type and extension
 */
function getFileType(mimeType: string, extension?: string): 'image' | 'pdf' | 'file' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  if (mimeType === 'application/pdf' || extension?.toLowerCase() === 'pdf') {
    return 'pdf';
  }
  
  return 'file';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/avif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB'
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload images, PDFs, or text documents.'
    };
  }
  
  return { valid: true };
} 