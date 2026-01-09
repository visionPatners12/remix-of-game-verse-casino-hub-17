import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileSettings from "@/features/profile/components/ProfileSettings";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import { ArrowLeft, User } from "lucide-react";

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  
  const getProfileInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    return profile?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto animate-fade-in">
        {/* Header moderne avec gradient + safe area pour notch iOS */}
        <div className="sticky top-0 bg-gradient-to-r from-background via-background/98 to-background/95 backdrop-blur-md border-b border-border/50 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] z-10">
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
                <h1 className="text-lg font-semibold">Paramètres du Profil</h1>
                <p className="text-xs text-muted-foreground">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username || 'Utilisateur'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 space-y-6">
          {/* Paramètres du profil - Card moderne */}
          <Card className="shadow-soft border-border/50 animate-scale-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-base">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Mon Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}