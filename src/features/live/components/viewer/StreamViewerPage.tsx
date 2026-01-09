import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StreamCall, 
  StreamVideo, 
  ParticipantView,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useStreamVideo } from '@/contexts/StreamProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  ArrowLeft,
  Radio,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useStreamViewer } from '../../hooks/useStreamViewer';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

const StreamViewerControls = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const {
    isConnected,
    isStreamLive,
    participantCount,
    streamQuality,
    isFullscreen,
    volume,
    setStreamQuality,
    toggleFullscreen,
    setVolume,
    leaveCall,
  } = useStreamViewer(callId!);

  const handleLeaveStream = async () => {
    try {
      await leaveCall();
      navigate('/');
    } catch (error) {
      toast.error('Failed to leave stream');
    }
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 1);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="bg-background/95 backdrop-blur shadow-lg border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Stream Status */}
            <div className="flex items-center gap-2">
              <Badge variant={isStreamLive ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Radio className={`h-3 w-3 ${isStreamLive ? 'text-red-500' : ''}`} />
                {isStreamLive ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {participantCount}
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-10 w-10 p-0"
              >
                {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-10 w-10 p-0"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleLeaveStream}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StreamViewerContent = () => {
  const { useRemoteParticipants } = useCallStateHooks();
  const remoteParticipants = useRemoteParticipants();
  
  // Get the host (first remote participant)
  const hostParticipant = remoteParticipants?.[0];

  return (
    <div className="relative h-screen bg-black">
      {/* Main Video */}
      <div className="absolute inset-0">
        {hostParticipant ? (
          <ParticipantView 
            participant={hostParticipant} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Stream Not Available</h2>
              <p className="text-gray-400">The streamer is not broadcasting right now</p>
            </div>
          </div>
        )}
      </div>

      {/* Stream Info Overlay */}
      <div className="absolute top-6 left-6 right-6 z-40">
        <Card className="bg-background/80 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Live Stream</h1>
                <p className="text-sm text-muted-foreground">Watching live broadcast</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Controls */}
      <StreamViewerControls />
    </div>
  );
};

export default function StreamViewerPage() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { client, isReady, isLoading: clientLoading } = useStreamVideo();

  // Create call instance using Stream.io pattern
  const call = useMemo(() => {
    if (!client || !callId) return null;
    return client.call('livestream', callId);
  }, [client, callId]);

  useEffect(() => {
    if (!callId) {
      navigate('/');
      return;
    }

    if (!isReady || !call) return;

    const initializeStream = async () => {
      try {
        // Join the call as viewer
        await call.join();
        logger.stream('Stream viewer initialized successfully');
      } catch (error) {
        logger.error('Failed to join stream:', error);
        toast.error('Failed to join stream');
        navigate('/');
      }
    };

    initializeStream();

    return () => {
      if (call) {
        const callingState = call.state.callingState;
        if (callingState && callingState !== 'left' && callingState !== 'idle') {
          call.leave().catch(() => {
            // Silently ignore - likely already disconnected
          });
        }
      }
    };
  }, [callId, navigate, isReady, call]);

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing client...</p>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to stream...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamViewerContent />
      </StreamCall>
    </StreamVideo>
  );
}