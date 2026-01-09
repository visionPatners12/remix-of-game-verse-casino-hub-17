import { supabase } from '@/integrations/supabase/client';
import { ProfileData, ProfileFormData } from '@/features/profile/types';

export const profileService = {
  async getUserProfile(userId: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async deleteAvatar(userId: string, avatarPath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([avatarPath]);

    if (error) throw error;
  },

  async validateUsername(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    // If no error and data exists, username is taken
    return error?.code === 'PGRST116'; // Not found error code
  },

  async getPublicProfile(username: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }
};