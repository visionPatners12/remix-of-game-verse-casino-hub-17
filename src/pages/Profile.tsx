import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ProfileHeader, EnhancedUserFeed, useUserProfile, ProfileTabs, type TabType } from "@/features/profile";
import { useAuth } from "@/features/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenuHeader } from "@/components/mobile/MobileMenuHeader";

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation('profile');
  const { user, session } = useAuth();
  const { profile, isLoading: loading } = useUserProfile();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  useEffect(() => {
    if (!session && !loading) {
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (!session || !user) {
    return null;
  }

  if (!profile || !profile.id) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('errors.error')}</h3>
            <p className="text-muted-foreground">{t('errors.loadError')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Create a profile object that matches ProfileHeader's expected interface
  const profileForHeader = {
    id: profile.id,
    username: profile.username,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar_url: profile.avatar_url
  };

  return (
    <Layout hideNavigation={isMobile}>
      <div className="w-full max-w-lg mx-auto">
        {/* Mobile header avec flèche retour et username */}
        {isMobile && (
          <MobileMenuHeader 
            onBack={() => navigate('/')} 
            username={profile.username}
          />
        )}
        
        {/* Header avec avatar et infos */}
        <ProfileHeader profile={profileForHeader} isOwnProfile={true} />

        {/* Sticky Navigation Tabs */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isMobile={isMobile} />

        {/* Contenu principal - Feed */}
        <div>
          <EnhancedUserFeed userId={profile.id} activeFilter={activeTab} />
        </div>
      </div>
    </Layout>
  );
}
