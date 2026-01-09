import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ProfileHeader, EnhancedUserFeed, ProfileTabs, type TabType } from "@/features/profile";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenuHeader } from "@/components/mobile/MobileMenuHeader";
import { useViewTracking } from "@/hooks/useViewTracking";

export default function UserProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation(['profile', 'navigation']);
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<{
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  // Track view (1 per session per user)
  useViewTracking('user', profile?.id);

  useEffect(() => {
    if (!username) {
      navigate('/search');
      return;
    }

    fetchUserProfile();
  }, [username, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setError(t('profile:errors.userNotFound'));
        return;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(t('profile:errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Si c'est le profil de l'utilisateur connecté, rediriger vers /profile
  useEffect(() => {
    if (currentUser && profile && profile.id === currentUser.id) {
      navigate('/profile');
    }
  }, [currentUser, profile, navigate]);

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

  if (error || !profile) {
    return (
      <Layout hideNavigation={isMobile}>
        <div className="container mx-auto py-8">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('navigation:menu.back')}
            </Button>
          </div>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {error || t('profile:errors.userNotFound')}
            </h3>
            <p className="text-muted-foreground">
              {t('profile:errors.profileNotAccessible')}
            </p>
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
    avatar_url: profile.avatar_url,
    bio: profile.bio
  };

  return (
    <Layout hideNavigation={isMobile}>
      <div className="w-full max-w-lg mx-auto overflow-y-auto hide-scrollbar">
        {/* Mobile header avec flèche retour et username */}
        {isMobile && (
          <MobileMenuHeader 
            onBack={() => navigate(-1)} 
            username={profile.username}
          />
        )}
        
        {/* Navigation retour - Desktop seulement */}
        {!isMobile && (
          <div className="px-4 py-2 border-b border-border/30">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('navigation:menu.back')}
            </Button>
          </div>
        )}

        {/* Header with avatar and info */}
        <ProfileHeader profile={profileForHeader} isOwnProfile={false} />

        {/* Sticky Navigation Tabs */}
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} isMobile={isMobile} />

        {/* Main content - Feed */}
        <div>
          <EnhancedUserFeed userId={profile.id} activeFilter={activeTab} />
        </div>
      </div>
    </Layout>
  );
}