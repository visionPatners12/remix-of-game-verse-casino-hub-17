import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProfileAvatar, useUserProfile, useProfileAvatar } from "@/features/profile";
import { useAuth } from "@/features/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Save, Check } from "lucide-react";
import { useSports, Sport } from "@/hooks/useSports";
import { useFavoriteSports } from "@/features/onboarding/hooks/useFavoriteSports";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export default function ProfileEdit() {
  const navigate = useNavigate();
  const { t } = useTranslation('profile');
  const { user, session } = useAuth();
  const { profile, isLoading: loading, updateProfile } = useUserProfile();
  const { uploadAvatar } = useProfileAvatar();
  
  // Fetch sports from database
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  
  // Use existing user_preferences system for favorite sports
  const { 
    favoriteSports, 
    isLoading: favoriteSportsLoading, 
    addFavorite, 
    removeFavorite,
    isAdding,
    isRemoving
  } = useFavoriteSports();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: ""
  });

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session && !loading) {
      navigate('/auth');
    }
  }, [session, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = formData.avatar_url;
      
      // Upload avatar if a new file was selected
      if (selectedAvatarFile) {
        const uploadedUrl = await uploadAvatar(selectedAvatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      // Update profile with all data including new avatar URL
      await updateProfile({
        ...formData,
        avatar_url: avatarUrl
      });
      
      toast.success(t('edit.successMessage'));
      navigate('/profile');
    } catch (error) {
      toast.error(t('edit.errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSportToggle = async (sport: Sport) => {
    const isSelected = favoriteSports.includes(sport.id);
    
    if (isSelected) {
      try {
        await removeFavorite(sport.id);
        toast.success(`${sport.name} ${t('edit.sportRemoved')}`);
      } catch (error) {
        toast.error(t('edit.sportRemoveError'));
      }
    } else {
      if (favoriteSports.length >= 5) {
        toast.error(t('edit.maxSportsError'));
        return;
      }
      try {
        await addFavorite(sport.id);
        toast.success(`${sport.name} ${t('edit.sportAdded')}`);
      } catch (error) {
        toast.error(t('edit.sportAddError'));
      }
    }
  };

  const handleAvatarFileSelect = (file: File) => {
    setSelectedAvatarFile(file);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (!session || !user || !profile) {
    return null;
  }

  return (
    <Layout hideNavigation={true}>
      <div className="w-full max-w-lg mx-auto min-h-screen bg-background" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-background/95 backdrop-blur sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('edit.title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <ProfileAvatar
              profile={{
                ...profile,
                avatar_url: formData.avatar_url
              }}
              size="large"
              allowUpload={true}
              showUploadButton={true}
              onFileSelect={handleAvatarFileSelect}
            />
            <p className="text-sm text-muted-foreground text-center">
              {t('edit.avatarHint')}
            </p>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">{t('edit.firstName')}</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder={t('edit.firstNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">{t('edit.lastName')}</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder={t('edit.lastNamePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('edit.bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder={t('edit.bioPlaceholder')}
                rows={4}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/160 {t('edit.characters')}
              </p>
            </div>

            {/* Sports favoris */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('edit.favoriteSports')}</Label>
                <span className="text-sm text-muted-foreground">
                  {favoriteSports.length}/5 {t('edit.selected')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {sports.map((sport) => {
                  const isSelected = favoriteSports.includes(sport.id);
                  const isDisabled = !isSelected && favoriteSports.length >= 5;
                  const isLoading = isAdding || isRemoving;
                  
                  return (
                    <Button
                      key={sport.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "flex items-center gap-2 justify-start h-10 px-3",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isDisabled && !isLoading && handleSportToggle(sport)}
                      disabled={isDisabled || sportsLoading || isLoading}
                    >
                      <sport.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate">{sport.name}</span>
                      {isSelected && (
                        <Check className="w-3 h-3 ml-auto" />
                      )}
                    </Button>
                  );
                })}
              </div>
              
              {favoriteSports.length >= 5 && (
                <p className="text-xs text-muted-foreground">
                  {t('edit.sportsLimitReached')}
                </p>
              )}
            </div>
          </div>

          {/* Bouton de sauvegarde mobile optimisé */}
          <div className="space-y-3 pt-4 pb-8">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner />
                  <span>{t('edit.saving')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  <span>{t('edit.saveChanges')}</span>
                </div>
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 text-muted-foreground"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              {t('edit.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}