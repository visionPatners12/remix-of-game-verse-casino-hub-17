import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { SportSelect } from "@/features/profile/components/SportSelect";
import { useUserProfile } from '@/features/profile/hooks/useUserProfile';
import { useProfileAvatar } from '@/features/profile/hooks/useProfileAvatar';
import { useAuth } from "@/features/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { profile, isLoading: loading, updateProfile } = useUserProfile();
  const { uploadAvatar } = useProfileAvatar();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    favorite_sport: [] as string[],
    avatar_url: ""
  });

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  // Sports with icons
  const sportsOptions = [
    { value: "football", label: "Football ⚽", icon: "⚽" },
    { value: "basketball", label: "Basketball 🏀", icon: "🏀" },
    { value: "tennis", label: "Tennis 🎾", icon: "🎾" },
    { value: "rugby", label: "Rugby 🏉", icon: "🏉" },
    { value: "volleyball", label: "Volleyball 🏐", icon: "🏐" },
    { value: "handball", label: "Handball 🤾", icon: "🤾" },
    { value: "hockey", label: "Hockey 🏒", icon: "🏒" },
    { value: "baseball", label: "Baseball ⚾", icon: "⚾" },
    { value: "golf", label: "Golf ⛳", icon: "⛳" },
    { value: "swimming", label: "Swimming 🏊", icon: "🏊" },
    { value: "cycling", label: "Cycling 🚴", icon: "🚴" },
    { value: "running", label: "Running 🏃", icon: "🏃" },
    { value: "boxing", label: "Boxing 🥊", icon: "🥊" },
    { value: "mma", label: "MMA 🥋", icon: "🥋" },
    { value: "esports", label: "E-sports 🎮", icon: "🎮" }
  ];

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
        favorite_sport: profile.favorite_sport || [],
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
      
      toast.success("Profile updated", {
        description: "Your information has been saved successfully."
      });
      navigate('/profile');
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating your profile."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    <Layout>
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
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
              Tap the avatar to change your profile picture
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/160 characters
              </p>
            </div>

            <SportSelect
              value={Array.isArray(formData.favorite_sport) && formData.favorite_sport.length > 0 ? String(formData.favorite_sport[0]) : ''}
              onValueChange={(value) => handleInputChange('favorite_sport', [parseInt(value)])}
              sports={sportsOptions}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
