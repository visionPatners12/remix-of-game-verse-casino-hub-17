
import React, { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../forms/InputField';
import { TextAreaField } from '../forms/TextAreaField';
import { DateTimePicker } from '../forms/DateTimePicker';
import { ToggleSwitch } from '../forms/ToggleSwitch';
import { HashtagsField } from '../forms/HashtagsField';
import { UnifiedButton, Avatar, AvatarImage, AvatarFallback, ThemeAvatarFallback, Card, CardContent, Separator } from '@/ui';
import { Play, Calendar, Trophy, Hash, Sparkles, AlertCircle } from 'lucide-react';
import { useStreamCreation } from '../../hooks/useStreamCreation';
import { DateTimeDisplay } from '@/features/sports/components/MatchCard/components/DateTimeDisplay';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';
import type { GamesQuery } from '@azuro-org/toolkit';

interface TeamInfo {
  name: string;
  slug?: string;
  image?: string;
  image_path?: string;
}

type AzuroGame = GamesQuery['games'][0];

interface LiveCreationFormProps {
  selectedMatch?: AzuroGame | null;
}

export const LiveCreationForm = memo(({ selectedMatch }: LiveCreationFormProps) => {
  const navigate = useNavigate();
  const { streamData, setTitle, setDescription, setIsPublic, setGameId, createStream, isLoading, error } = useStreamCreation();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [user, setUser] = useState(null);

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to update form data
  const updateFormField = (field: string, value: string | boolean) => {
    if (field === 'title') setTitle(value as string);
    else if (field === 'description') setDescription(value as string);
    else if (field === 'isPublic') setIsPublic(value as boolean);
    else if (field === 'gameId') setGameId(value as string | undefined);
  };

  // Pré-remplir le titre, la description et l'heure quand un match est sélectionné
  useEffect(() => {
    if (selectedMatch && !streamData.title) {
      const matchTitle = `Live: ${selectedMatch.participants[0]?.name} vs ${selectedMatch.participants[1]?.name}`;
      setTitle(matchTitle);
      
      if (!streamData.description) {
        const matchDescription = `Live du match ${selectedMatch.league?.name || ''} - ${selectedMatch.participants[0]?.name} vs ${selectedMatch.participants[1]?.name}`;
        setDescription(matchDescription);
      }
      
      if (selectedMatch.gameId) {
        setGameId(selectedMatch.gameId);
      }
    }
  }, [selectedMatch, streamData.title, streamData.description]);

  const handleLaunchLive = async () => {
    if (!streamData.title.trim()) {
      toast.error("Stream title is required");
      return;
    }

    try {
      const streamId = await createStream();
      toast.success("Stream created successfully!");
      navigate(`/stream/${streamId}/host`);
    } catch (err) {
      logger.error('Failed to create stream');
      toast.error(error || 'Error creating stream');
    }
  };

  const TeamAvatar = ({ team, variant }: { team?: TeamInfo; variant: "A" | "B" }) => (
    <Avatar className="w-12 h-12 ring-2 ring-border/20">
      <AvatarImage 
        src={team?.image} 
        alt={team?.name || `Team ${variant}`}
      />
      <AvatarFallback asChild>
        <ThemeAvatarFallback 
          name={team?.name || `Team ${variant}`}
          variant="team"
          size="md"
        />
      </AvatarFallback>
    </Avatar>
  );

  // Button is disabled if: no title, loading, not authenticated, or currently creating
  const isButtonDisabled = !streamData.title.trim() || isLoading || !user;

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Match sélectionné - Design amélioré */}
      {selectedMatch && (
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <TeamAvatar team={selectedMatch.participants[0]} variant="A" />
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-muted-foreground">vs</span>
                  <div className="w-8 h-px bg-border"></div>
                </div>
                <TeamAvatar team={selectedMatch.participants[1]} variant="B" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="font-semibold text-lg">
                  {selectedMatch.participants[0]?.name} vs {selectedMatch.participants[1]?.name}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {selectedMatch.league?.name}
                  </div>
                  <DateTimeDisplay 
                    startingAt={selectedMatch.startsAt} 
                    viewMode="list"
                  />
                </div>
                {selectedMatch.sport?.name && (
                  <div className="flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-primary font-medium">{selectedMatch.sport.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire principal */}
      <div className="grid gap-6">
        <InputField
          label="Stream Title"
          value={streamData.title}
          onChange={(value) => updateFormField('title', value)}
          placeholder="Enter your stream title..."
          required
        />

        <TextAreaField
          label="Stream Description (optional)"
          value={streamData.description}
          onChange={(value) => updateFormField('description', value)}
          placeholder="Describe your stream..."
        />

        <Separator className="my-2" />

        {/* Section Hashtags - Design amélioré */}
        <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-muted-foreground/20">
          <HashtagsField
            hashtags={hashtags}
            onChange={setHashtags}
            selectedMatch={selectedMatch}
          />
        </div>

        <div className="pt-2">
          <ToggleSwitch
            label="Stream Visibility"
            checked={streamData.isPublic}
            onChange={(checked) => updateFormField('isPublic', checked)}
            trueLabel="Public"
            falseLabel="Private"
          />
        </div>
      </div>

      {/* Bouton de lancement - Design amélioré */}
      <div className="pt-4">
        <UnifiedButton
          buttonType="action"
          onClick={handleLaunchLive}
          isLoading={isLoading}
          disabled={isButtonDisabled}
          label={!user ? "Sign in to start streaming" : "Start Live Stream"}
          loadingText="Creating stream..."
          icon={<Play className="h-5 w-5" />}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        />
        
        {hashtags.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            With {hashtags.length} hashtag{hashtags.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
});

LiveCreationForm.displayName = 'LiveCreationForm';
