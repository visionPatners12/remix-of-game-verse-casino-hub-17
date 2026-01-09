import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Button } from '@/components/ui/button';
import { useHasTipsterProfile } from '@/hooks/useTipsterProfile';
import { usePostCreation } from '../../hooks/usePostCreation';
import { POST_TYPES } from '../../constants';
import {
  PostTypeSection,
  ContentSection,
  TipConfigSection,
  BetAmountSection,
  MediaSection,
  HashtagSection,
  SubmitSection,
  ConfidenceSection
} from '../sections';

export function CreatePostPageUI() {
  const navigate = useNavigate();
  const hasTipsterProfile = useHasTipsterProfile();
  
  // State from the main hook
  const {
    selectedType,
    content,
    hashtags,
    newHashtag,
    mediaFiles,
    isSubmitting,
    selectedPrediction,
    selectedMatch,
    confidence,
    isPremiumTip,
    betAmount,
    currency,
    setSelectedType,
    setContent,
    addHashtag,
    removeHashtag,
    setNewHashtag,
    addMediaFile,
    removeMediaFile,
    handlePredictionSelection,
    handleRemovePrediction,
    setConfidence,
    setIsPremiumTip,
    setBetAmount,
    setCurrency,
    submitPost
  } = usePostCreation();

  // Cleanup sessionStorage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedSport');
      sessionStorage.removeItem('selectedSportName');
      sessionStorage.removeItem('selectedLeague');
      sessionStorage.removeItem('selectedLeagueName');
      sessionStorage.removeItem('selectedMatchId');
      sessionStorage.removeItem('postMode');
    };
  }, []);

  // Compute derived values
  const selectedConfig = POST_TYPES.find(type => type.id === selectedType)!;
  const canSubmit = !isSubmitting && (
    content.trim().length > 0 ||
    selectedPrediction !== null ||
    selectedMatch !== null
  );

  return (
    <Layout hideNavigation={true}>
      <div style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Create a post</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
          
          {/* Type de post */}
          <PostTypeSection
            selectedType={selectedType}
            onTypeSelect={setSelectedType}
            onRemovePrediction={handleRemovePrediction}
          />

          {/* Configuration des tips (pour tous les types de post) */}
          <TipConfigSection
            isPremiumTip={isPremiumTip}
            hasTipsterProfile={hasTipsterProfile}
            onTogglePremiumTip={setIsPremiumTip}
          />

          {/* Zone de contenu avec sélections et confiance intégrées */}
          <ContentSection 
            content={content}
            onContentChange={setContent}
            selectedType={selectedType}
            selectedConfig={selectedConfig}
            selectedPrediction={selectedPrediction}
            selectedMatch={selectedMatch}
            confidence={confidence}
            onConfidenceChange={setConfidence}
          />

          {/* Médias (uniquement pour les posts simples) */}
          {selectedType === 'simple' && (
            <MediaSection
              mediaFiles={mediaFiles}
              onMediaUpload={(files) => files.forEach(addMediaFile)}
              onRemoveMedia={removeMediaFile}
            />
          )}

          {/* Hashtags */}
          <HashtagSection
            hashtags={hashtags}
            newHashtag={newHashtag}
            onNewHashtagChange={setNewHashtag}
            onAddHashtag={addHashtag}
            onRemoveHashtag={removeHashtag}
          />
        </div>
      </div>

      {/* Submit Button */}
      <SubmitSection
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onSubmit={submitPost}
      />
      </div>
    </Layout>
  );
}