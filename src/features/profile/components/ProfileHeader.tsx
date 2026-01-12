import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from './ProfileAvatar';
import { useAuth } from '@/features/auth';
import { useUnifiedWallet } from '@/features/wallet/hooks';
import { WalletDisplay } from './WalletDisplay';
import { Settings, MessageCircle, LayoutDashboard } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface ProfileHeaderProps {
  profile: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string | null;
    bio?: string;
    ens_subdomain?: string | null;
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { address: userWalletAddress } = useUnifiedWallet();
  
  // Placeholder stats
  const postsCount = 0;
  const followersCount = 0;
  const followingCount = 0;

  // Navigation handlers
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleDashboardNavigation = () => {
    navigate('/games/ludo');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username || 'User';

  return (
    <div className="px-4 py-3">
      {/* Header avec avatar et infos - Style Instagram */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <ProfileAvatar profile={profile} size="large" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Nom */}
          <div className="mb-2">
            <h1 className="text-base font-semibold text-foreground truncate">
              {displayName}
            </h1>
          </div>

          {/* Stats en ligne horizontale */}
          <div className="flex items-center gap-6 mb-3">
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{formatNumber(postsCount)}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{formatNumber(followersCount)}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">{formatNumber(followingCount)}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 mb-2">
            {isOwnProfile ? (
              <>
                <Button 
                  onClick={handleEditProfile}
                  variant="outline"
                  className="h-7 px-4 text-xs font-medium flex-1"
                >
                  Edit Profile
                </Button>
                <Button 
                  onClick={handleDashboardNavigation}
                  variant="outline"
                  className="h-7 px-4 text-xs font-medium gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  <span>Games</span>
                </Button>
                <Button 
                  onClick={handleSettings}
                  variant="outline"
                  className="h-7 px-2 text-xs font-medium"
                >
                  <Settings size={14} />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="default" 
                  className="h-7 px-4 text-xs font-medium flex-1"
                >
                  Follow
                </Button>
                <Button 
                  variant="outline"
                  className="h-7 px-3 text-xs font-medium"
                >
                  <MessageCircle size={14} />
                </Button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Wallet Display - Only for own profile */}
      {isOwnProfile && userWalletAddress && (
        <div className="mt-3">
          <WalletDisplay 
            address={userWalletAddress} 
            ensSubdomain={profile.ens_subdomain}
          />
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-foreground mt-3">{profile.bio}</p>
      )}
    </div>
  );
}