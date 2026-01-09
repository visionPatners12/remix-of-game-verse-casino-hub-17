import { ProfileData } from '@/features/profile/types';

export const profileUtils = {
  getDisplayName(profile: ProfileData | null): string {
    if (!profile) return 'Utilisateur';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    
    return profile.username || 'Utilisateur';
  },

  getInitials(profile: ProfileData | null): string {
    if (!profile) return 'U';
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`;
    }
    
    return profile.username?.substring(0, 2).toUpperCase() || 'U';
  },

  formatFollowCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },

  isProfileComplete(profile: ProfileData | null): boolean {
    if (!profile) return false;
    
    return !!(
      profile.first_name &&
      profile.last_name &&
      profile.username &&
      profile.email
    );
  },

  getProfileCompletionPercentage(profile: ProfileData | null): number {
    if (!profile) return 0;
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.username,
      profile.email,
      profile.bio,
      profile.avatar_url,
      profile.phone,
      profile.country
    ];
    
    const completedFields = fields.filter(field => !!field).length;
    return Math.round((completedFields / fields.length) * 100);
  },

  getDisplayIdentifier(profile: ProfileData | null): string {
    if (!profile) return '';
    
    // Prioriser l'ENS subdomain s'il existe
    if (profile.ens_subdomain) {
      return profile.ens_subdomain;
    }
    
    // Sinon utiliser le username
    return profile.username || '';
  }
};