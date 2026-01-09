import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface StreamMetrics {
  streamId: string;
  currentViewers: number;
  peakViewers: number;
  totalViews: number;
  averageWatchTime: number; // in seconds
  likes: number;
  duration: number; // current stream duration in seconds
  isLive: boolean;
}

// Mock data structures for now - these would be real tables in production
export interface ViewerMetric {
  id: string;
  stream_id: string;
  viewer_count: number;
  timestamp: string;
  created_at: string;
}

export interface EngagementMetric {
  id: string;
  stream_id: string;
  likes: number;
  messages: number;
  timestamp: string;
  created_at: string;
}

class AnalyticsService {
  // Mock data storage for development - replace with real database in production
  private mockViewerData = new Map<string, ViewerMetric[]>();
  private mockEngagementData = new Map<string, EngagementMetric[]>();

  /**
   * Get real-time metrics for a specific stream
   */
  async getStreamMetrics(streamId: string): Promise<StreamMetrics | null> {
    try {
      // Get stream info from existing live_streams table
      const { data: stream, error: streamError } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (streamError) {
        logger.error('Error fetching stream:', streamError);
        return null;
      }

      if (!stream) return null;

      // Generate mock viewer data based on stream status
      const currentViewers = this.generateMockViewers(streamId, stream.status === 'live');
      const peakViewers = Math.max(currentViewers + Math.floor(Math.random() * 50), currentViewers);
      
      // Calculate duration if stream is live (use created_at as fallback for started_at)
      const duration = stream.status === 'live' && stream.created_at 
        ? Math.floor((Date.now() - new Date(stream.created_at).getTime()) / 1000)
        : 0;

      // Mock engagement data
      const likes = Math.floor(Math.random() * 100) + (stream.status === 'live' ? 20 : 0);

      return {
        streamId,
        currentViewers,
        peakViewers,
        totalViews: Math.floor(Math.random() * 5000) + 100,
        averageWatchTime: Math.floor(Math.random() * 3600) + 300, // 5min to 1h
        likes,
        duration,
        isLive: stream.status === 'live'
      };
    } catch (error) {
      logger.error('Error in getStreamMetrics:', error);
      return null;
    }
  }

  private generateMockViewers(streamId: string, isLive: boolean): number {
    if (!isLive) return 0;
    
    // Generate consistent but random-looking viewer count
    const base = 50 + Math.sin(Date.now() / 10000) * 30;
    const random = Math.sin(streamId.charCodeAt(0) + Date.now() / 1000) * 20;
    return Math.max(0, Math.floor(base + random));
  }

  /**
   * Track viewer count for analytics (mock implementation)
   */
  async trackViewerCount(streamId: string, viewerCount: number): Promise<void> {
    try {
      // Mock implementation - store in memory
      const existingData = this.mockViewerData.get(streamId) || [];
      const newMetric: ViewerMetric = {
        id: `${streamId}-${Date.now()}`,
        stream_id: streamId,
        viewer_count: viewerCount,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      existingData.push(newMetric);
      // Keep only last 100 entries
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      this.mockViewerData.set(streamId, existingData);
      logger.info(`Tracked viewer count: ${viewerCount} for stream ${streamId}`);
    } catch (error) {
      logger.error('Error in trackViewerCount:', error);
    }
  }

  /**
   * Track engagement metrics (likes, messages) (mock implementation)
   */
  async trackEngagement(streamId: string, likes: number, messages: number): Promise<void> {
    try {
      // Mock implementation - store in memory
      const existingData = this.mockEngagementData.get(streamId) || [];
      const newMetric: EngagementMetric = {
        id: `${streamId}-${Date.now()}`,
        stream_id: streamId,
        likes,
        messages,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      
      existingData.push(newMetric);
      // Keep only last 100 entries
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      this.mockEngagementData.set(streamId, existingData);
      logger.info(`Tracked engagement: ${likes} likes, ${messages} messages for stream ${streamId}`);
    } catch (error) {
      logger.error('Error in trackEngagement:', error);
    }
  }

  /**
   * Get viewer history for charts (mock implementation)
   */
  async getViewerHistory(streamId: string, hours: number = 24): Promise<ViewerMetric[]> {
    try {
      // Get existing mock data or generate new data
      let existingData = this.mockViewerData.get(streamId) || [];
      
      // If no data exists, generate realistic sample data
      if (existingData.length === 0) {
        existingData = this.generateMockViewerHistory(streamId, hours);
        this.mockViewerData.set(streamId, existingData);
      }
      
      // Filter by time range
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      return existingData.filter(metric => 
        new Date(metric.created_at) >= hoursAgo
      );
    } catch (error) {
      logger.error('Error in getViewerHistory:', error);
      return [];
    }
  }

  /**
   * Get engagement history for charts (mock implementation)
   */
  async getEngagementHistory(streamId: string, hours: number = 24): Promise<EngagementMetric[]> {
    try {
      // Get existing mock data or generate new data
      let existingData = this.mockEngagementData.get(streamId) || [];
      
      // If no data exists, generate realistic sample data
      if (existingData.length === 0) {
        existingData = this.generateMockEngagementHistory(streamId, hours);
        this.mockEngagementData.set(streamId, existingData);
      }
      
      // Filter by time range
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
      return existingData.filter(metric => 
        new Date(metric.created_at) >= hoursAgo
      );
    } catch (error) {
      logger.error('Error in getEngagementHistory:', error);
      return [];
    }
  }

  private generateMockViewerHistory(streamId: string, hours: number): ViewerMetric[] {
    const data: ViewerMetric[] = [];
    const now = Date.now();
    const interval = (hours * 60 * 60 * 1000) / 50; // 50 data points
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now - (49 - i) * interval);
      const baseViewers = 30 + Math.sin(i / 10) * 20; // Wave pattern
      const randomVariation = (Math.random() - 0.5) * 10;
      const viewerCount = Math.max(0, Math.floor(baseViewers + randomVariation));
      
      data.push({
        id: `${streamId}-${i}`,
        stream_id: streamId,
        viewer_count: viewerCount,
        timestamp: timestamp.toISOString(),
        created_at: timestamp.toISOString()
      });
    }
    
    return data;
  }

  private generateMockEngagementHistory(streamId: string, hours: number): EngagementMetric[] {
    const data: EngagementMetric[] = [];
    const now = Date.now();
    const interval = (hours * 60 * 60 * 1000) / 30; // 30 data points
    
    let cumulativeLikes = 0;
    let cumulativeMessages = 0;
    
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(now - (29 - i) * interval);
      
      // Gradual increase over time
      cumulativeLikes += Math.floor(Math.random() * 5) + 1;
      cumulativeMessages += Math.floor(Math.random() * 10) + 2;
      
      data.push({
        id: `${streamId}-${i}`,
        stream_id: streamId,
        likes: cumulativeLikes,
        messages: cumulativeMessages,
        timestamp: timestamp.toISOString(),
        created_at: timestamp.toISOString()
      });
    }
    
    return data;
  }
}

export const analyticsService = new AnalyticsService();