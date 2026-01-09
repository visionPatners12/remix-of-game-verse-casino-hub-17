
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProfileSettings from "@/features/profile/components/ProfileSettings";
import { NotificationSettings as NotificationSettingsComponent } from "@/features/notifications/components/NotificationSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { 
  useSecuritySettings
} from "@/features/settings";
import { useNotificationSettings } from "@/features/notifications";
import { useUserProfile } from "@/features/profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Bell, 
  ArrowLeft,
  User,
  Shield
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const isMobile = useIsMobile();
  
  // Settings hooks
  const { notifications, updateNotifications, isUpdating: isUpdatingNotifications } = useNotificationSettings();
  const { securitySettings, updateSecuritySettings, isUpdating: isUpdatingSecurity } = useSecuritySettings();
  
  // Active settings tab
  const [activeTab, setActiveTab] = useState('profile');

  const getProfileInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    return profile?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const handlePinManagement = () => {
    navigate('/settings/pin?from=settings');
  };

  const handleSecurityUpdate = async (updates: Partial<import('@/features/settings').SecuritySettings>) => {
    await updateSecuritySettings({ settings: updates });
  };

  // Mobile-native header component
  const MobileHeader = () => (
    <div className="sticky top-0 bg-background z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>
      <Separator />
    </div>
  );

  // Mobile content without cards
  const MobileContent = () => (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader />
      
      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <div className="sticky top-[57px] z-10 bg-background">
          <TabsList className="grid w-full grid-cols-3 bg-background rounded-none h-12 border-none">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          <Separator />
        </div>

        <div className="flex-1">
          <TabsContent value="profile" className="mt-0 p-4">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 p-4">
            <NotificationSettingsComponent
              settings={notifications}
              onUpdate={updateNotifications}
              isUpdating={isUpdatingNotifications}
            />
          </TabsContent>

          <TabsContent value="security" className="mt-0 p-4">
            <SecuritySettings
              settings={securitySettings}
              onUpdate={handleSecurityUpdate}
              onManagePin={handlePinManagement}
              isUpdating={isUpdatingSecurity}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  // Render mobile or desktop version
  if (isMobile) {
    return <MobileContent />;
  }

  // Desktop version (unchanged)
  return (
    <Layout>
      <div className="max-w-lg mx-auto animate-fade-in">
        {/* Header moderne avec gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md border-b border-border/50 px-4 py-4 z-10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 w-10 h-10 shadow-subtle"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-8 h-8 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {getProfileInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-semibold">Settings</h1>
                <p className="text-xs text-muted-foreground">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username || 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8">
          {/* Settings Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notif</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile">
              <Card className="shadow-soft border-border/50 animate-scale-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileSettings />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings Tab */}
            <TabsContent value="notifications">
              <Card className="shadow-soft border-border/50 animate-scale-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NotificationSettingsComponent
                    settings={notifications}
                    onUpdate={updateNotifications}
                    isUpdating={isUpdatingNotifications}
                  />
                </CardContent>
              </Card>
            </TabsContent>


            {/* Security Settings Tab */}
            <TabsContent value="security">
              <Card className="shadow-soft border-border/50 animate-scale-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SecuritySettings
                    settings={securitySettings}
                    onUpdate={handleSecurityUpdate}
                    onManagePin={handlePinManagement}
                    isUpdating={isUpdatingSecurity}
                  />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
