// Asset Loader - Maps asset file names to URLs
// In production, assets should be uploaded to Supabase Storage and use public URLs
// For development, we use placeholder URLs or construct Supabase Storage URLs

import Constants from 'expo-constants';
import { supabase } from '../supabaseClient';

// Placeholder URLs for development (fallback if Supabase Storage not available)
const PLACEHOLDER_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1568605117035-4c1b3c0e0b1a?w=800',
  'https://images.unsplash.com/photo-1560448075-cbc16bf4e33c?w=800',
];

export function getAssetUri(storagePath: string, mediaType?: 'video' | 'image'): string {
  // If it's already a URL (starts with http:// or https://), return as-is
  if (storagePath && (storagePath.startsWith('http://') || storagePath.startsWith('https://'))) {
    // Asset already a URL
    return storagePath;
  }
  
  if (!storagePath || storagePath.trim() === '') {
    // Empty storage path, using placeholder
    // Return placeholder based on type
    if (mediaType === 'video') {
      return PLACEHOLDER_VIDEOS[0];
    }
    return PLACEHOLDER_IMAGES[0];
  }
  
  // Extract filename from path (e.g., "assests/video.mp4" -> "video.mp4")
  const filename = storagePath.split('/').pop() || storagePath;
  
  // Try to get Supabase URL from the client
  let supabaseUrl: string | null = null;
  try {
    // Get from supabase client (it has the URL)
    supabaseUrl = (supabase as any).supabaseUrl || 
                  Constants.expoConfig?.extra?.supabaseUrl || 
                  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
                  (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_URL : null);
  } catch (e) {
    // Fallback to Constants
    supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
                  (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_SUPABASE_URL : null);
  }
  
  // Try to construct Supabase Storage URL
  if (supabaseUrl && (storagePath.startsWith('assests/') || storagePath.includes('/'))) {
    // Construct Supabase Storage public URL
    // Format: {SUPABASE_URL}/storage/v1/object/public/listing-media/{filename}
    const storageUrl = `${supabaseUrl}/storage/v1/object/public/listing-media/${filename}`;
    // Constructed Supabase Storage URL
    return storageUrl;
  }
  
  // Fallback to placeholder URLs for development
  // Always use placeholders if we can't construct a Supabase URL
  const isVideo = mediaType === 'video' || filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.MOV');
  const isImage = mediaType === 'image' || filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.JPG') || filename.endsWith('.PNG');
  
  if (isVideo) {
    const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const placeholder = PLACEHOLDER_VIDEOS[hash % PLACEHOLDER_VIDEOS.length];
    // Using placeholder video
    return placeholder;
  } else if (isImage) {
    const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const placeholder = PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
    // Using placeholder image
    return placeholder;
  }
  
  // Default to first placeholder based on type
  // Unknown media type, using default placeholder
  return isVideo ? PLACEHOLDER_VIDEOS[0] : PLACEHOLDER_IMAGES[0];
}

