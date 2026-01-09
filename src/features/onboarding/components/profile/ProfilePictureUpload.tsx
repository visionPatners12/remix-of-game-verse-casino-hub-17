import React, { useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, Camera, X, Loader2 } from "lucide-react";

interface ProfilePictureUploadProps {
  profilePictureUrl: string | null;
  isUploading: boolean;
  uploadError: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

export function ProfilePictureUpload({
  profilePictureUrl,
  isUploading,
  uploadError,
  onFileSelect,
  onRemovePhoto,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 text-center">
      <Label className="text-base font-semibold">Photo de profil</Label>
      <div className="flex justify-center">
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <div 
            className="relative cursor-pointer group"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <Avatar className="w-24 h-24 border-2 border-border group-hover:border-primary/50 transition-colors">
              <AvatarImage 
                src={profilePictureUrl || ''} 
                alt="Photo de profil"
                className="object-cover"
              />
              <AvatarFallback className="bg-muted">
                <User className="w-10 h-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            
            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            
            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            
            {/* Remove button */}
            {profilePictureUrl && !isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePhoto();
                }}
                className="absolute -top-1 -right-1 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Cliquez pour {profilePictureUrl ? 'modifier' : 'ajouter'} votre photo
      </p>
      
      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}
    </div>
  );
}