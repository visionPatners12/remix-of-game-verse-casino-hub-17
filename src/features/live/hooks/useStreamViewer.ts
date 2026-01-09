import { useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { logger } from '@/utils/logger';
import type { StreamViewerState } from '../types';

export const useStreamViewer = (callId?: string) => {
  const call = useCall();
  const { useParticipantCount, useIsCallLive } = useCallStateHooks();
  const participantCount = useParticipantCount() || 0;
  const isStreamLive = useIsCallLive();

  const connectToCall = useCallback(async () => {
    if (!call) {
      throw new Error('Call not available');
    }
    
    try {
      await call.join();
      logger.stream('Viewer connected to call:', callId);
    } catch (error) {
      logger.error('Failed to connect to call:', error);
      throw error;
    }
  }, [call, callId]);

  const setStreamQuality = useCallback((quality: StreamViewerState['streamQuality']) => {
    // TODO: Implement quality change with Stream SDK
    logger.stream('Stream quality changed to:', quality);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elem.requestFullscreen();
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    // TODO: Implement volume control with Stream SDK
    logger.stream('Volume changed to:', clampedVolume);
  }, []);

  const leaveCall = useCallback(async () => {
    if (!call) return;
    
    try {
      await call.leave();
      logger.stream('Viewer left call');
    } catch (error) {
      logger.error('Failed to leave call:', error);
      throw error;
    }
  }, [call]);

  return {
    isConnected: !!call,
    isStreamLive,
    participantCount,
    streamQuality: 'auto' as StreamViewerState['streamQuality'],
    isFullscreen: !!document.fullscreenElement,
    volume: 1,
    connectToCall,
    setStreamQuality,
    toggleFullscreen,
    setVolume,
    leaveCall,
  };
};