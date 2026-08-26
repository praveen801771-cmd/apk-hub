import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yadbuyueeefgmawsipgm.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Existing Public Storage Bucket Name
export const STORAGE_BUCKET = 'app-assets';

// Determine explicit MIME type based on file extension
export function getMimeType(filename, fallbackMime = 'application/octet-stream') {
  if (!filename) return fallbackMime;
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'apk':
      return 'application/vnd.android.package-archive';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return fallbackMime;
  }
}

// Sanitize filename for safe storage paths
export function sanitizeStorageFilename(filename) {
  if (!filename) return `file_${Date.now()}`;
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_');
}

// Upload file to Supabase Storage with explicit MIME type
export async function uploadAssetToStorage(file, folder = 'assets', customPrefix = '') {
  if (!file) throw new Error('No file provided for upload.');

  // Explicitly determine MIME type (ensures .apk is sent as application/vnd.android.package-archive)
  const mimeType = getMimeType(file.name, file.type || 'application/octet-stream');
  const cleanName = sanitizeStorageFilename(file.name);
  const prefix = customPrefix ? `${sanitizeStorageFilename(customPrefix)}_` : '';
  const storagePath = `${folder}/${prefix}${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Storage upload failed (${folder}): ${error.message}`);
  }

  // Retrieve public URL
  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl
  };
}

// Format bytes into human-readable size (MB / KB)
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate public URL for Supabase storage assets
export function getStoragePublicUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || path;
}
