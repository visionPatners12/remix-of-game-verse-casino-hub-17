import type { PostType, MediaFile } from '../types/creation';

export const formatPostContent = (content: string, type: PostType): string => {
  // Nettoyer et formater le contenu
  return content.trim().replace(/\n{3,}/g, '\n\n');
};

export const formatHashtag = (hashtag: string): string => {
  return hashtag.trim().toLowerCase().replace(/^#/, '');
};

export const generatePostSlug = (content: string, type: PostType): string => {
  const baseSlug = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
    
  return `${type}-${baseSlug}-${Date.now()}`;
};

export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateMediaFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Le fichier est trop volumineux (max 10MB)' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Type de fichier non supporté' };
  }
  
  return { isValid: true };
};

export const createMediaFile = (file: File): MediaFile => {
  return {
    file,
    url: URL.createObjectURL(file),
    type: file.type.startsWith('image/') ? 'image' : 'video'
  };
};

export const cleanupMediaUrls = (mediaFiles: MediaFile[]): void => {
  mediaFiles.forEach(media => {
    URL.revokeObjectURL(media.url);
  });
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatConfidence = (confidence: number): string => {
  return `${confidence}%`;
};