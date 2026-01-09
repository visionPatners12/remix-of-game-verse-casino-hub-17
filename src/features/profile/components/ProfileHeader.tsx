import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileAvatar } from './ProfileAvatar';
import { TipsterSubscribeButton } from '@/features/tipster/components';
import { useAuth } from '@/features/auth';
import { useFollow } from '@/hooks/useFollow';
import { useSubscription, useTipsterWalletAddress } from '@/hooks/useSubscription';
import { useTipsterProfile, useTipsterProfileByUserId, useHasTipsterProfile } from '@/hooks/useTipsterProfile';
import { useUserFeed } from '@/hooks/useUserFeed';
import { useUnifiedWallet } from '@/features/wallet/hooks';
import { WalletDisplay } from './WalletDisplay';
import { Settings, MessageCircle, Crown, Star, Copy, Check, LayoutDashboard } from 'lucide-react';
import { SportIcon } from '@/components/ui/sport-icon';
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

// TipsterOfferSection Component
function TipsterOfferSection({ 
  tipsterProfile, 
  isOwnProfile, 
  isSubscribed, 
  profileId 
}: { 
  tipsterProfile: any; 
  isOwnProfile: boolean; 
  isSubscribed: boolean; 
  profileId: string;
}) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyAddress = () => {
    if (tipsterProfile.split_contract_address) {
      navigator.clipboard.writeText(tipsterProfile.split_contract_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/30 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-4 h-4 text-amber-600" />
        <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
          Tipster Offer
        </span>
        {tipsterProfile.monthly_price && (
          <Badge variant="secondary" className="ml-auto bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
            {tipsterProfile.monthly_price} USDT/month
          </Badge>
        )}
      </div>
      
      {/* Sports Specialties */}
      {tipsterProfile.specialty_names && tipsterProfile.specialty_names.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tipsterProfile.specialty_names.map((sport: { id: string; name: string; slug: string }) => (
            <Badge key={sport.id} variant="outline" className="flex items-center gap-1.5 text-xs py-0.5 px-2 border-amber-300 dark:border-amber-700">
              <SportIcon slug={sport.slug} className="w-4 h-4" />
              <span className="text-amber-700 dark:text-amber-300">{sport.name}</span>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Description */}
      {tipsterProfile.description && (
        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
          {tipsterProfile.description}
        </p>
      )}
      
      {/* Subscribe Button - Only for other users */}
      {!isOwnProfile && tipsterProfile.is_active && (
        <TipsterSubscribeButton 
          tipsterId={tipsterProfile.id}
          monthlyPrice={tipsterProfile.monthly_price || 0}
          splitContractAddress={tipsterProfile.split_contract_address || ''}
          disabled={!tipsterProfile.split_contract_address}
        />
      )}
      
      {/* Contract Address - Only for own profile */}
      {isOwnProfile && tipsterProfile.split_contract_address && (
        <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/30">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <span className="text-muted-foreground">Split Contract:</span>
            <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
              {shortenAddress(tipsterProfile.split_contract_address)}
            </code>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0"
              onClick={handleCopyAddress}
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { followUser, isFollowing, stats, loading: followLoading } = useFollow(profile.id);
  const { activities } = useUserFeed({ userId: profile.id });
  const postsCount = activities.length;
  const { address: userWalletAddress } = useUnifiedWallet();
  
  // Use different hooks based on whether it's own profile or not
  const ownTipsterProfile = useTipsterProfile();
  const otherTipsterProfile = useTipsterProfileByUserId(isOwnProfile ? '' : profile.id);
  
  // Get the appropriate tipster profile data
  const currentTipsterProfile = isOwnProfile ? ownTipsterProfile : otherTipsterProfile;
  const tipsterProfile = currentTipsterProfile?.data?.data;
  const hasTipsterProfile = useHasTipsterProfile(); // For own profile button text
  
  // ✅ FIX: Use tipsterProfile.id (tipster_profiles.id) instead of profile.id (users.id)
  const { data: subscriptionData } = useSubscription(tipsterProfile?.id || '');
  const { data: walletData } = useTipsterWalletAddress(tipsterProfile?.id || '');
  
  // Placeholder data for social features
  const followersCount = stats.followers;
  const followingCount = stats.following;
  const isSubscribed = !!subscriptionData?.data;
  const walletAddress = walletData?.data?.wallet_address;

  // Navigation handlers
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleDashboardNavigation = () => {
    navigate('/user-dashboard');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.username || 'User';

  // formatNumber is now imported from @/utils/formatters

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
              <div className="font-semibold text-foreground text-sm">{formatNumber(postsCount || 0)}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-left">
              {followLoading ? (
                <div className="font-semibold text-foreground text-sm">...</div>
              ) : (
                <div className="font-semibold text-foreground text-sm">{formatNumber(followersCount)}</div>
              )}
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-left">
              {followLoading ? (
                <div className="font-semibold text-foreground text-sm">...</div>
              ) : (
                <div className="font-semibold text-foreground text-sm">{formatNumber(followingCount)}</div>
              )}
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
                  <span>Dashboard</span>
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
                  variant={isFollowing ? "outline" : "default"} 
                  className="h-7 px-4 text-xs font-medium flex-1"
                  onClick={() => followUser()}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
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


      {/* Tipster Offer Section */}
      {tipsterProfile && (tipsterProfile.is_active || isOwnProfile) && (
        <>
          {/* 🔴 DEBUG: Audit tipsterProfile IDs */}
          {console.log('🔴 AUDIT ProfileHeader:', {
            'tipsterProfile.id (tipster_profiles.id)': tipsterProfile.id,
            'tipsterProfile.user_id': tipsterProfile.user_id,
            'profile.id (users.id)': profile.id,
            'BUG CHECK - IDs match (should be false)': tipsterProfile.id === profile.id,
            'CORRECT CHECK - user_id matches profile.id': tipsterProfile.user_id === profile.id
          })}
          <TipsterOfferSection 
            tipsterProfile={tipsterProfile}
            isOwnProfile={isOwnProfile}
            isSubscribed={isSubscribed}
            profileId={profile.id}
          />
        </>
      )}
    </div>
  );
}