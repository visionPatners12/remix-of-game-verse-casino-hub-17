import React, { useRef, useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { ProfileData } from '@/features/profile/types';

interface ProfileAvatarProps {
  profile: ProfileData | null;
  size?: 'small' | 'medium' | 'large';
  allowUpload?: boolean;
  showUploadButton?: boolean;
  onFileSelect?: (file: File) => void;
}

export function ProfileAvatar({ 
  profile, 
  size = 'medium', 
  allowUpload = false, 
  showUploadButton = false,
  onFileSelect 
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-20 h-20'
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    return profile?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Cleanup previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Pass file to parent component
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => allowUpload && showUploadButton && fileInputRef.current?.click()}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={previewUrl || profile?.avatar_url || ''} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {allowUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {showUploadButton && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}
        </>
      )}
    </div>
  );
}