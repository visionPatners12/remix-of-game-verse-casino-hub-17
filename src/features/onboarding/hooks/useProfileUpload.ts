import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';

/**
 * Optimized hook for handling profile picture uploads with image compression
 */
export const useProfileUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Compress image before upload
  const compressImage = useCallback((file: File, maxWidth = 400, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadProfilePicture = useCallback(async (
    file: File, 
    currentPictureUrl?: string | null
  ): Promise<string | null> => {
    if (!user?.id) {
      setUploadError('User not logged in');
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size cannot exceed 5MB');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Compress image for better performance
      const compressedBlob = await compressImage(file);
      if (!compressedBlob) {
        throw new Error('Error compressing image');
      }

      // Remove old image if exists
      if (currentPictureUrl && currentPictureUrl.includes('avatars/')) {
        const urlParts = currentPictureUrl.split('/avatars/');
        if (urlParts[1]) {
          await supabase.storage.from('avatars').remove([urlParts[1]]);
        }
      }

      // Upload compressed image with folder structure
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      toast.success('Profile picture updated');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading photo';
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user?.id, compressImage]);

  const removeProfilePicture = useCallback(async (currentPictureUrl: string): Promise<boolean> => {
    try {
      if (currentPictureUrl.includes('avatars/')) {
        const urlParts = currentPictureUrl.split('/avatars/');
        if (urlParts[1]) {
          await supabase.storage.from('avatars').remove([urlParts[1]]);
        }
      }
      toast.success('Profile picture removed');
      return true;
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Error deleting photo');
      return false;
    }
  }, []);

  return {
    isUploading,
    uploadError,
    uploadProfilePicture,
    removeProfilePicture,
    setUploadError,
  };
};