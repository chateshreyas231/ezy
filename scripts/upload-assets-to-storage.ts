/**
 * Script to upload assets from /assests folder to Supabase Storage
 * Run this after seeding to upload videos and images to Supabase Storage
 * 
 * Usage:
 * npx ts-node scripts/upload-assets-to-storage.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function uploadAssets() {
  console.log('📤 Uploading assets to Supabase Storage...\n');

  const assetsDir = resolve(process.cwd(), 'assests');
  
  try {
    const files = await readdir(assetsDir);
    const mediaFiles = files.filter(f => 
      f.endsWith('.mp4') || 
      f.endsWith('.jpg') || 
      f.endsWith('.jpeg') || 
      f.endsWith('.png')
    );

    console.log(`Found ${mediaFiles.length} media files\n`);

    // Ensure listing-media bucket exists (create if needed)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'listing-media');

    if (!bucketExists) {
      console.log('Creating listing-media bucket...');
      const { error: createError } = await supabase.storage.createBucket('listing-media', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        // Don't restrict MIME types - allow all for flexibility
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        return;
      }
      console.log('✅ Bucket created\n');
    } else {
      console.log('Bucket already exists.\n');
      console.log('⚠️  If uploads fail due to MIME type restrictions:');
      console.log('   1. Delete the bucket in Supabase Dashboard > Storage');
      console.log('   2. Run this script again to recreate it without restrictions\n');
    }

    // Helper function to get MIME type from filename
    function getMimeType(filename: string): string {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'mp4':
        case 'mov':
          return 'video/mp4';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        default:
          return 'application/octet-stream';
      }
    }

    // Upload each file
    let uploaded = 0;
    for (const file of mediaFiles) {
      try {
        const filePath = join(assetsDir, file);
        const fileBuffer = await readFile(filePath);
        const mimeType = getMimeType(file);
        
        // Create Blob with explicit MIME type
        const fileBlob = new Blob([fileBuffer], { type: mimeType });

        const { data, error } = await supabase.storage
          .from('listing-media')
          .upload(file, fileBlob, {
            contentType: mimeType,
            upsert: true,
            cacheControl: '3600',
          });

        if (error) {
          console.error(`  ✗ Failed to upload ${file}:`, error.message);
          // If error is about MIME type, suggest updating bucket settings
          if (error.message.includes('mime type') || error.message.includes('not supported')) {
            console.error(`     → Try updating bucket settings in Supabase Dashboard to allow ${mimeType}`);
          }
        } else {
          console.log(`  ✓ Uploaded ${file} (${mimeType})`);
          uploaded++;
        }
      } catch (error: any) {
        console.error(`  ✗ Error uploading ${file}:`, error.message);
      }
    }

    console.log(`\n✅ Uploaded ${uploaded}/${mediaFiles.length} files`);
    
    if (uploaded < mediaFiles.length) {
      console.log('\n⚠️  Some files failed to upload.');
      console.log('💡 If errors mention MIME types, run:');
      console.log('   npx ts-node scripts/fix-storage-bucket.ts');
      console.log('   This will delete and recreate the bucket without MIME restrictions.\n');
    }
    
    console.log('📝 Next steps:');
    console.log('   1. Assets are available at:');
    console.log(`      ${supabaseUrl}/storage/v1/object/public/listing-media/{filename}`);
    console.log('   2. The assetLoader.ts will automatically use these URLs');
    console.log('   3. Re-run the seed script to associate media with listings');

  } catch (error: any) {
    console.error('❌ Error reading assets directory:', error.message);
  }
}

uploadAssets().catch(console.error);

