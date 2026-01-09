
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback, Button, Progress } from '@/ui';
import { Copy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SoonOverlay } from '@/ui';
import { useUserProfile, profileUtils } from '@/features/profile';

interface ProfileCardProps {
  user: {
    user_metadata?: {
      username?: string;
      avatar_url?: string;
    };
    email?: string;
  } | null;
  onCopyUserId: () => void;
}

export const ProfileCard = ({ user, onCopyUserId }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const displayIdentifier = profileUtils.getDisplayIdentifier(profile);

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 bg-background active:bg-muted/30 cursor-pointer"
      onClick={() => navigate('/profile')}
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={profile?.avatar_url} alt={`${profile?.first_name} ${profile?.last_name}` || 'Avatar'} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
          {profile?.first_name?.slice(0, 1).toUpperCase()}{profile?.last_name?.slice(0, 1).toUpperCase() || 'US'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold truncate">{profile?.first_name} {profile?.last_name}</h2>
        <span className="text-sm text-muted-foreground">@{displayIdentifier}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};
