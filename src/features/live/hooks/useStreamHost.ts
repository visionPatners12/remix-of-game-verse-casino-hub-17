import { useCallback } from 'react';
import { 
  useCall, 
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { streamService } from '../services/streamService';
import { logger } from '@/utils/logger';

export const useStreamHost = (callId?: string) => {
  const call = useCall();
  const { 
    useParticipantCount, 
    useLocalParticipant,
    useCameraState,
    useMicrophoneState,
    useIsCallLive 
  } = useCallStateHooks();
  
  const { isMute: isCameraOff } = useCameraState();
  const { isMute: isMicOff } = useMicrophoneState();
  const isStreaming = useIsCallLive();
  const participantCount = useParticipantCount() || 0;
  const localParticipant = useLocalParticipant();
  
  // KISS: Auto-detect connection via localParticipant (set when call.join() succeeds)
  const isConnected = !!localParticipant;
  const isCameraOn = !isCameraOff;
  const isMicOn = !isMicOff;

  const connectToCall = useCallback(async () => {
    if (!call) {
      throw new Error('Call not available');
    }
    
    try {
      await call.join({ create: true });
      await call.camera.enable();
      await call.microphone.enable();
      logger.stream('Host connected to call:', callId);
    } catch (error) {
      logger.error('Failed to connect to call:', error);
      throw error;
    }
  }, [call, callId]);

  const startStream = useCallback(async (streamId?: string) => {
    if (!call) return;
    
    try {
      await call.goLive();
      
      // Update stream status in database
      if (streamId) {
        await streamService.updateStreamStatus(streamId, 'live');
      }
      
      logger.stream('Stream started');
    } catch (error) {
      logger.error('Failed to start stream:', error);
      throw error;
    }
  }, [call]);

  const stopStream = useCallback(async (streamId?: string) => {
    if (!call) return;
    
    try {
      await call.stopLive();
      
      // Update stream status in database
      if (streamId) {
        await streamService.updateStreamStatus(streamId, 'ended');
      }
      
      logger.stream('Stream stopped');
    } catch (error) {
      logger.error('Failed to stop stream:', error);
      throw error;
    }
  }, [call]);

  const toggleCamera = useCallback(async () => {
    if (!call) return;
    
    try {
      await call.camera.toggle();
    } catch (error) {
      logger.error('Failed to toggle camera:', error);
    }
  }, [call]);

  const toggleMicrophone = useCallback(async () => {
    if (!call) return;
    
    try {
      await call.microphone.toggle();
    } catch (error) {
      logger.error('Failed to toggle microphone:', error);
    }
  }, [call]);

  const endCall = useCallback(async () => {
    if (!call) return;
    
    try {
      await call.endCall();
      logger.stream('Call ended');
    } catch (error) {
      logger.error('Failed to end call:', error);
      throw error;
    }
  }, [call]);

  return {
    isConnected,
    isStreaming,
    isCameraOn,
    isMicOn,
    participantCount,
    connectToCall,
    startStream,
    stopStream,
    toggleCamera,
    toggleMicrophone,
    endCall,
  };
};