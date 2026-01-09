import { supabase } from '@/integrations/supabase/client';

export const subscriptionQueries = {
  // Get subscription status (any status, not just active)
  getSubscriptionStatus: async (subscriberId: string, tipsterProfileId: string) => {
    const { data, error } = await supabase
      .from('tipster_subscriptions')
      .select('id, status, subscription_start, subscription_end, tx_hash')
      .eq('subscriber_id', subscriberId)
      .eq('tipster_profile_id', tipsterProfileId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    return { data, error };
  },

  // Check if user is subscribed to a tipster (active only)
  checkSubscription: async (subscriberId: string, tipsterProfileId: string) => {
    const { data, error } = await supabase
      .from('tipster_subscriptions')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .eq('tipster_profile_id', tipsterProfileId)
      .eq('status', 'active')
      .gt('subscription_end', new Date().toISOString())
      .maybeSingle();

    return { data, error };
  },

  // Get tipster wallet address - tipsterId is tipster_profiles.id, NOT user_id
  getTipsterWalletAddress: async (tipsterProfileId: string) => {
    // First, get the user_id from tipster_profiles
    const { data: tipster, error: tipsterError } = await supabase
      .from('tipster_profiles')
      .select('user_id')
      .eq('id', tipsterProfileId)
      .maybeSingle();

    if (tipsterError || !tipster) {
      return { data: null, error: tipsterError || { message: 'Tipster profile not found' } };
    }

    // Then get the wallet by the tipster's user_id
    const { data, error } = await supabase
      .from('user_wallet')
      .select('wallet_address')
      .eq('user_id', tipster.user_id)
      .eq('is_primary', true)
      .maybeSingle();

    return { data, error };
  },

  // Get user's subscriptions
  getUserSubscriptions: async (subscriberId: string) => {
    // Since we can't do complex joins easily, we'll keep it simple
    const { data, error } = await supabase
      .from('tipster_subscriptions')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .eq('status', 'active')
      .gt('subscription_end', new Date().toISOString());

    return { data, error };
  },

  // Get tipster's subscribers
  getTipsterSubscribers: async (tipsterProfileId: string) => {
    // Simple query without complex joins
    const { data, error } = await supabase
      .from('tipster_subscriptions')
      .select('*')
      .eq('tipster_profile_id', tipsterProfileId)
      .eq('status', 'active')
      .gt('subscription_end', new Date().toISOString());

    return { data, error };
  },

  // Get tipster's subscribers with user data
  getTipsterSubscribersWithUserData: async (tipsterProfileId: string) => {
    const { data, error } = await supabase
      .from('tipster_subscriptions')
      .select(`
        id,
        subscriber_id,
        tipster_profile_id,
        subscription_start,
        subscription_end,
        status,
        created_at,
        updated_at,
        subscriber:users!subscriber_id(
          id,
          username,
          avatar_url,
          first_name,
          last_name
        )
      `)
      .eq('tipster_profile_id', tipsterProfileId)
      .eq('status', 'active')
      .gt('subscription_end', new Date().toISOString())
      .order('created_at', { ascending: false });

    return { data, error };
  }
};
