import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { withRetry, isRetriableError } from '@/utils/retry';
import type { StreamCreationData, StreamData, StreamStatus } from '../types';

export class StreamService {
  /**
   * Create a new stream in the database
   */
  async createStream(data: StreamCreationData): Promise<string> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Generate a UUID that will be used for both database and Stream.io call
    const streamId = crypto.randomUUID();

    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert({
        id: streamId, // Use the same ID for database
        user_id: user.id,
        match_id: data.gameId || null,
        title: data.title,
        description: data.description || null,
        hashtags: data.hashtags,
        visibility: data.isPublic,
        status: 'created' as StreamStatus
      })
      .select('id')
      .single();

    if (error) {
      logger.error('Failed to create stream:', error);
      throw new Error('Failed to create stream: ' + error.message);
    }

    logger.stream('Stream created successfully:', { id: stream.id, title: data.title });
    return stream.id; // This ID will be used as callId in Stream.io
  }

  /**
   * Get stream by ID with retry logic
   */
  async getStreamById(id: string): Promise<StreamData | null> {
    return withRetry(
      async () => {
        const { data: stream, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Failed to get stream:', error);
          throw error;
        }

        return stream as StreamData;
      },
      {
        maxRetries: 3,
        shouldRetry: isRetriableError,
      }
    ).catch((error) => {
      logger.error('All retries failed for getStreamById:', error);
      return null;
    });
  }

  /**
   * Update stream status with retry logic
   */
  async updateStreamStatus(id: string, status: StreamStatus): Promise<void> {
    await withRetry(
      async () => {
        const { error } = await supabase
          .from('live_streams')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) {
          logger.error('Failed to update stream status:', error);
          throw new Error('Failed to update stream status: ' + error.message);
        }

        logger.stream('Stream status updated:', { id, status });
      },
      {
        maxRetries: 3,
        shouldRetry: isRetriableError,
      }
    );
  }

  /**
   * Update viewer count
   */
  async updateViewerCount(id: string, viewersCount: number): Promise<void> {
    const { error } = await supabase
      .from('live_streams')
      .update({ viewers_count: viewersCount, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Failed to update viewer count:', error);
      throw new Error('Failed to update viewer count: ' + error.message);
    }

    logger.stream('Viewer count updated:', { id, viewersCount });
  }

  /**
   * End stream
   */
  async endStream(id: string): Promise<void> {
    await this.updateStreamStatus(id, 'ended');
    logger.stream('Stream ended:', id);
  }
}

export const streamService = new StreamService();