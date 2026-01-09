import { supabase } from '@/integrations/supabase/client';

const getAuthenticatedUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Not authenticated');
  }
  return user;
};

export const fcmService = {
  async saveToken(token: string): Promise<void> {
    const user = await getAuthenticatedUser();
    
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id: user.id,
        token: token,
        device_info: navigator.userAgent,
        updated_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,token'
      });

    if (error) throw error;
  },

  async deactivateToken(token: string): Promise<void> {
    const user = await getAuthenticatedUser();
    
    const { error } = await supabase
      .from('fcm_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('token', token);

    if (error) throw error;
  },

  async deactivateAllTokens(): Promise<void> {
    const user = await getAuthenticatedUser();
    
    const { error } = await supabase
      .from('fcm_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getActiveTokens(): Promise<string[]> {
    const user = await getAuthenticatedUser();
    
    const { data, error } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data?.map(t => t.token) ?? [];
  }
};
