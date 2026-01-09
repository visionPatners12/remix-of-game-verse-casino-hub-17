import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/utils/helpers';

export interface MediaUploadResult {
  url: string;
  type: 'image' | 'video';
  id: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
}

export class PostMediaService {
  private static readonly BUCKET = 'post-media';
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  static async uploadMedia(
    file: File,
    userId: string
  ): Promise<MediaUploadResult> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    const postId = generateId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${postId}/${generateId()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(this.BUCKET)
      .getPublicUrl(data.path);

    const type = file.type.startsWith('video/') ? 'video' : 'image';

    return {
      url: urlData.publicUrl,
      type,
      id: generateId(),
      storagePath: data.path,
      fileSizeBytes: file.size,
      mimeType: file.type
    };
  }

  static async uploadMultipleMedia(
    files: File[],
    userId: string
  ): Promise<MediaUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadMedia(file, userId));
    return Promise.all(uploadPromises);
  }

  static async deleteMedia(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}