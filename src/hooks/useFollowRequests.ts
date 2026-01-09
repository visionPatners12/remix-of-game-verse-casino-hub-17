
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FollowRequest {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  follower?: {
    username: string;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export function useFollowRequests() {
  const [receivedRequests, setReceivedRequests] = useState<FollowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Temporarily disabled - social tables don't exist yet
  // Return consolidated state to prevent errors
  return {
    receivedRequests,
    isLoadingReceived: isLoading,
    respondToFollowRequest: ({ requestId, action }: { requestId: string; action: 'accepted' | 'rejected' }) => {},
    isRespondingToRequest: false,
  };
}
