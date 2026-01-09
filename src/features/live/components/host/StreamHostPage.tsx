import React, { useState, useEffect, useMemo } from 'react';
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
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  ArrowLeft,
  Radio,
  Eye,
  BarChart3
} from 'lucide-react';
import { useStreamHost } from '../../hooks/useStreamHost';
import { streamService } from '../../services/streamService';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import type { StreamData } from '../../types';
import { StreamDashboardOverlay } from '../dashboard/StreamDashboardOverlay';

interface StreamHostControlsProps {
  streamId?: string;
  onDashboardToggle: () => void;
  isDashboardOpen: boolean;
}

const StreamHostControls: React.FC<StreamHostControlsProps> = ({ 
  streamId, 
  onDashboardToggle,
  isDashboardOpen
}) => {
  const navigate = useNavigate();
  const {
    isConnected,
    isStreaming,
    isCameraOn,
    isMicOn,
    participantCount,
    startStream,
    stopStream,
    toggleCamera,
    toggleMicrophone,
    endCall,
  } = useStreamHost(streamId!);

  const handleStartStream = async () => {
    try {
      await startStream(streamId);
      toast.success('Stream started successfully!');
    } catch (error) {
      toast.error('Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    try {
      await stopStream(streamId);
      toast.success('Stream stopped');
    } catch (error) {
      toast.error('Failed to stop stream');
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      if (streamId) {
        await streamService.endStream(streamId);
      }
      toast.success('Stream ended');
      navigate('/live/create');
    } catch (error) {
      toast.error('Failed to end stream');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-overlay-content safe-bottom">
      <Card className="overlay-glass shadow-overlay border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Stream Status */}
            <div className="flex items-center gap-2">
              <Badge variant={isStreaming ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Radio className={`h-3 w-3 ${isStreaming ? 'text-destructive animate-pulse' : ''}`} />
                {isStreaming ? 'LIVE' : 'OFFLINE'}
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
                variant={isCameraOn ? 'default' : 'destructive'}
                size="sm"
                onClick={toggleCamera}
                className="h-10 w-10 p-0 transition-smooth"
              >
                {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>

              <Button
                variant={isMicOn ? 'default' : 'destructive'}
                size="sm"
                onClick={toggleMicrophone}
                className="h-10 w-10 p-0 transition-smooth"
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>

              {!isStreaming ? (
                <Button
                  onClick={handleStartStream}
                  disabled={!isConnected}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-smooth"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
              ) : (
                <Button
                  onClick={handleStopStream}
                  variant="outline"
                  className="transition-smooth"
                >
                  Stop Stream
                </Button>
              )}

              <Button
                onClick={onDashboardToggle}
                variant="outline"
                size="sm"
                className={`h-10 px-3 transition-smooth ${isDashboardOpen ? 'bg-primary/20 border-primary' : ''}`}
                title="Dashboard Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="sm"
                className="h-10 w-10 p-0 transition-smooth"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StreamHostContentProps {
  streamData?: StreamData;
  onDashboardToggle: () => void;
  isDashboardOpen: boolean;
}

const StreamHostContent: React.FC<StreamHostContentProps> = ({ 
  streamData,
  onDashboardToggle,
  isDashboardOpen
}) => {
  const navigate = useNavigate();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Main Video */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
        {localParticipant && (
          <ParticipantView 
            participant={localParticipant} 
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>

      {/* Stream Title Overlay */}
      <div className="absolute top-6 left-6 flex items-center gap-4 z-overlay-content safe-top safe-left">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/live/create')}
          className="overlay-glass text-foreground hover:bg-primary/20 transition-smooth"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="overlay-glass px-4 py-2 rounded-lg">
          <h1 className="text-foreground text-xl font-semibold">
            {streamData?.title || 'Mon Live Stream'}
          </h1>
        </div>
      </div>

      {/* Stream Controls */}
      <StreamHostControls 
        streamId={streamData?.id}
        onDashboardToggle={onDashboardToggle}
        isDashboardOpen={isDashboardOpen}
      />
    </div>
  );
};

export default function StreamHostPage() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { client, isReady, isLoading: clientLoading } = useStreamVideo();
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoinedCall, setHasJoinedCall] = useState(false);
  
  // Overlay states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Create call instance using Stream.io pattern
  const call = useMemo(() => {
    if (!client || !callId) return null;
    return client.call('livestream', callId);
  }, [client, callId]);

  useEffect(() => {
    if (!callId) {
      logger.error('No callId provided');
      navigate('/live/create');
      return;
    }

    if (!isReady || !call || hasJoinedCall) return;

    const initializeStream = async () => {
      try {
        setIsLoading(true);
        
        // Get the stream data from database
        const stream = await streamService.getStreamById(callId);
        if (!stream) {
          logger.error('Stream not found');
          navigate('/live/create');
          return;
        }
        setStreamData(stream);
        
        // Join call and enable devices using Stream.io hooks approach
        await call.join({ create: true });
        setHasJoinedCall(true);
        await call.camera.enable();
        await call.microphone.enable();
        
        logger.stream('Stream host initialized successfully', { 
          callId, 
          streamTitle: stream.title 
        });
      } catch (error) {
        logger.error('Failed to initialize stream host:', error);
        setHasJoinedCall(false);
        navigate('/live/create');
      } finally {
        setIsLoading(false);
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
  }, [callId, navigate, isReady, call, hasJoinedCall]);

  const handleGoToStream = () => {
    // Already on stream page, just close dashboard
    setIsDashboardOpen(false);
  };

  if (clientLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {clientLoading ? 'Initializing client...' : 'Connecting to stream...'}
          </p>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
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
        <StreamHostContent 
          streamData={streamData}
          onDashboardToggle={() => setIsDashboardOpen(!isDashboardOpen)}
          isDashboardOpen={isDashboardOpen}
        />
        
        {/* Dashboard Overlay */}
        {callId && (
          <StreamDashboardOverlay
            streamId={callId}
            isOpen={isDashboardOpen}
            onToggle={setIsDashboardOpen}
            onGoToStream={handleGoToStream}
          />
        )}
      </StreamCall>
    </StreamVideo>
  );
}