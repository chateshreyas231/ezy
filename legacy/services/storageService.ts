// services/storageService.ts
// File uploads to Supabase storage
import { supabase } from './supabaseClient';

export interface UploadFileInput {
  bucket: string;
  path: string;
  file: Blob | File | ArrayBuffer;
  contentType?: string;
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(input: UploadFileInput): Promise<{ path: string }> {
  const { data, error } = await supabase.storage
    .from(input.bucket)
    .upload(input.path, input.file, {
      contentType: input.contentType,
      upsert: true,
    });

  if (error) throw error;
  return { path: data.path };
}

/**
 * Get a public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL for a file (temporary access)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

