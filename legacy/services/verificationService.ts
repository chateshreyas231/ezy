// services/verificationService.ts
// User verification management
import { supabase } from './supabaseClient';
import { uploadFile } from './storageService';
import { logActivity } from './activityLogService';

/**
 * Get current user's verification level
 */
export async function getVerificationLevel(): Promise<number> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('users')
    .select('verification_level')
    .eq('id', user.user.id)
    .single();

  if (error) throw error;
  return data?.verification_level ?? 0;
}

/**
 * Upload ID verification document
 */
export async function uploadIdVerification(file: File | Blob): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const filePath = `verifications/id/${user.user.id}/${Date.now()}.${file instanceof File ? file.name.split('.').pop() : 'jpg'}`;
  const url = await uploadFile('verifications', filePath, file);

  // Log the upload
  await logActivity({
    entity_type: 'user',
    entity_id: user.user.id,
    action: 'id_verification_uploaded',
    meta: { file_path: filePath },
  });

  return url;
}

/**
 * Upload pre-approval document
 */
export async function uploadPreApproval(file: File | Blob): Promise<string> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const filePath = `verifications/preapproval/${user.user.id}/${Date.now()}.${file instanceof File ? file.name.split('.').pop() : 'pdf'}`;
  const url = await uploadFile('verifications', filePath, file);

  // Log the upload
  await logActivity({
    entity_type: 'user',
    entity_id: user.user.id,
    action: 'preapproval_uploaded',
    meta: { file_path: filePath },
  });

  return url;
}

/**
 * Update verification level (typically called by admin or after automated verification)
 */
export async function updateVerificationLevel(level: number): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .update({ verification_level: level })
    .eq('id', user.user.id);

  if (error) throw error;

  await logActivity({
    entity_type: 'user',
    entity_id: user.user.id,
    action: 'verification_level_updated',
    meta: { level },
  });
}

/**
 * Check if user can perform verified-only actions
 */
export async function canPerformVerifiedAction(requiredLevel: number = 2): Promise<boolean> {
  const level = await getVerificationLevel();
  return level >= requiredLevel;
}

