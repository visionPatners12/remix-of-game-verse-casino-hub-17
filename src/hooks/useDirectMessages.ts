
import { useState } from 'react';
import { logger } from '@/utils/logger';

interface DirectMessage {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  read: boolean;
}

// Consolidated hook using simple state pattern
export function useDirectMessages(friendId?: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendDirectMessage = async (recipientId: string, content: string) => {
    logger.debug('Send message placeholder:', { recipientId, content });
    // Will be replaced with Stream API implementation
  };

  return {
    messages,
    loadingMessages: isLoading,
    sendDirectMessage,
    totalUnreadMessages: 0,
    error,
  };
}
