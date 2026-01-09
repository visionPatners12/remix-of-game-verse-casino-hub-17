import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { streamService } from '../services/streamService';
import { logger } from '@/utils/logger';

interface StreamCreationData {
  title: string;
  description: string;
  isPublic: boolean;
  gameId?: string;
  hashtags: string[];
  tags: string[];
}

const createStreamInDB = async (data: StreamCreationData): Promise<string> => {
  return await streamService.createStream(data);
};

export const useStreamCreation = () => {
  const [streamData, setStreamData] = useState<StreamCreationData>({
    title: '',
    description: '',
    isPublic: true,
    hashtags: [],
    tags: [],
  });

  const mutation = useMutation({
    mutationFn: createStreamInDB,
    onSuccess: (callId) => {
      logger.stream('Stream created with ID:', callId);
    },
    onError: (error) => {
      logger.error('Failed to create stream:', error);
    }
  });

  const updateField = (field: keyof StreamCreationData, value: any) => {
    setStreamData(prev => ({ ...prev, [field]: value }));
  };

  const createStream = () => {
    return mutation.mutateAsync(streamData);
  };

  return {
    streamData,
    setTitle: (title: string) => updateField('title', title),
    setDescription: (description: string) => updateField('description', description),
    setIsPublic: (isPublic: boolean) => updateField('isPublic', isPublic),
    setGameId: (gameId?: string) => updateField('gameId', gameId),
    setHashtags: (hashtags: string[]) => updateField('hashtags', hashtags),
    setTags: (tags: string[]) => updateField('tags', tags),
    createStream,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
  };
};