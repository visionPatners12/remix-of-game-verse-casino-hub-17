import { useState, useCallback, useEffect } from 'react';

export interface RecentRecipient {
  type: 'user' | 'address';
  address: string;
  label?: string;
  username?: string;
  avatar_url?: string;
  ens_subdomain?: string;
  lastUsed: string;
}

const STORAGE_KEY = 'recent_recipients';
const MAX_RECIPIENTS = 10;

export const useRecentRecipients = () => {
  const [recipients, setRecipients] = useState<RecentRecipient[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecipients(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent recipients:', error);
    }
  }, []);

  const addRecipient = useCallback((recipient: Omit<RecentRecipient, 'lastUsed'>) => {
    setRecipients(prev => {
      // Remove existing entry with same address
      const filtered = prev.filter(r => r.address.toLowerCase() !== recipient.address.toLowerCase());
      
      // Add new entry at the beginning
      const updated = [
        { ...recipient, lastUsed: new Date().toISOString() },
        ...filtered
      ].slice(0, MAX_RECIPIENTS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent recipients:', error);
      }

      return updated;
    });
  }, []);

  const removeRecipient = useCallback((address: string) => {
    setRecipients(prev => {
      const updated = prev.filter(r => r.address.toLowerCase() !== address.toLowerCase());
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recent recipients:', error);
      }

      return updated;
    });
  }, []);

  const clearRecipients = useCallback(() => {
    setRecipients([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear recent recipients:', error);
    }
  }, []);

  return {
    recipients,
    addRecipient,
    removeRecipient,
    clearRecipients
  };
};
