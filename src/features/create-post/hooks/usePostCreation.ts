import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { PostCreationService } from '../services/PostCreationService';
import { useAuth } from '@/features/auth';
import { useGetStream } from '@/contexts/StreamProvider';
import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk';
import { POST_TYPES, DEFAULT_CONFIDENCE, DEFAULT_CURRENCY, DEFAULT_TIP_VISIBILITY } from '../constants';
import type { PostCreationState, PostCreationActions } from '../types/creation';
import { transformBetslipItem } from '../utils/predictionHelpers';
import { logger } from '@/utils/logger';

// Initial state for post creation
const initialState: PostCreationState = {
  selectedType: 'simple',
  content: '',
  hashtags: [],
  newHashtag: '',
  mediaFiles: [],
  isSubmitting: false,
  selectedPrediction: null,
  selectedMatch: null,
  confidence: DEFAULT_CONFIDENCE,
  isPremiumTip: false,
  betAmount: 0,
  currency: DEFAULT_CURRENCY
};

/**
 * Main post creation hook
 */
export function usePostCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { client } = useGetStream();
  const { items: betslipItems } = useBaseBetslip();
  const { totalOdds: azuroTotalOdds, odds: azuroOddsMap } = useDetailedBetslip();

  // State management
  const [state, setState] = useState<PostCreationState>(initialState);

  // Get profile from user data or create default
  const profile = user ? {
    id: user.id,
    username: user.email?.split('@')[0] || 'user',
    fullName: user.email || 'Anonymous User',
    avatar: user.user_metadata?.avatar_url || null
  } : null;

  // Pre-fill with location state if available (for predictions from elsewhere)
  useEffect(() => {
    if (location.state?.selectedPrediction) {
      setState(prev => ({
        ...prev,
        selectedType: 'prediction',
        selectedPrediction: location.state.selectedPrediction,
        confidence: location.state.selectedPrediction.confidence || DEFAULT_CONFIDENCE
      }));
    }
  }, [location.state]);

  // Synchronize selectedPrediction with Azuro betslip
  useEffect(() => {
    if (state.selectedType === 'prediction' && betslipItems && betslipItems.length > 0) {
      
      // ✅ Transformer tous les items du betslip avec les cotes live
      const selections = betslipItems.map(item => transformBetslipItem(item, azuroOddsMap));
      
      // ✅ Utiliser les cotes dynamiques d'Azuro (fallback sur calcul manuel si non disponible)
      const totalOdds = azuroTotalOdds || selections.reduce((acc, sel) => acc * sel.odds, 1);
      
      // ✅ Structure unifiée pour 1 ou N sélections
      const predictionFromBetslip = {
        selections,           // Array (1 ou N items)
        totalOdds,           // Cotes dynamiques d'Azuro
        confidence: state.confidence,
        
        // Propriétés du premier match (pour rétrocompatibilité UI)
        ...selections[0],
        matchTitle: selections.length > 1
          ? `Combiné (${selections.length} matchs)` 
          : selections[0].matchName
      };
      
      setState(prev => ({ ...prev, selectedPrediction: predictionFromBetslip }));
    }
  }, [betslipItems, state.confidence, state.selectedType, azuroTotalOdds, azuroOddsMap]);

  // Actions object
  const actions: PostCreationActions = {
    setSelectedType: (type) => setState(prev => ({ ...prev, selectedType: type })),
    setContent: (content) => setState(prev => ({ ...prev, content })),
    
    addHashtag: (hashtag) => {
      const tagToAdd = hashtag || state.newHashtag.trim();
      if (tagToAdd && !state.hashtags.includes(tagToAdd)) {
        setState(prev => ({
          ...prev,
          hashtags: [...prev.hashtags, tagToAdd],
          newHashtag: ''
        }));
      }
    },
    
    removeHashtag: (hashtag) => {
      setState(prev => ({
        ...prev,
        hashtags: prev.hashtags.filter(tag => tag !== hashtag)
      }));
    },
    
    setNewHashtag: (hashtag) => setState(prev => ({ ...prev, newHashtag: hashtag })),
    
    addMediaFile: (file) => {
      setState(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, file]
      }));
    },
    
    removeMediaFile: (index) => {
      setState(prev => ({
        ...prev,
        mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
      }));
    },
    
    handlePredictionSelection: (selection) => {
      
      if (state.selectedType === 'opinion') {
        setState(prev => ({
          ...prev,
          selectedMatch: {
            matchTitle: selection.prediction.matchTitle,
            sport: selection.prediction.sport,
            league: selection.prediction.league,
          }
        }));
      } else {
        // Pour les pronostics, construire l'objet complet avec les participants
        const predictionPreview = {
          matchTitle: selection.prediction.matchTitle,
          predictionText: selection.prediction.predictionText,
          odds: selection.prediction.odds,
          sport: selection.prediction.sport,
          league: selection.prediction.league,
          confidence: state.confidence,
          participants: selection.participants || [],
          gameId: selection.gameId,
          conditionId: selection.conditionId,
          outcomeId: selection.outcomeId,
          startsAt: selection.startsAt,
          marketType: selection.marketType,
          pick: selection.pick,
        };
        
        setState(prev => ({ ...prev, selectedPrediction: predictionPreview }));
      }
    },
    
    handleRemovePrediction: () => {
      setState(prev => ({
        ...prev,
        selectedPrediction: null,
        selectedMatch: null
      }));
    },
    
    setConfidence: (confidence) => setState(prev => ({ ...prev, confidence })),
    setIsPremiumTip: (isPremium) => setState(prev => ({ ...prev, isPremiumTip: isPremium })),
    setBetAmount: (amount) => setState(prev => ({ ...prev, betAmount: amount })),
    setCurrency: (currency) => setState(prev => ({ ...prev, currency })),
    
    submitPost: async () => {
      
      if (!client || !user || !profile) {
        toast({
          title: "❌ Authentication error",
          description: "Please log in again",
          variant: "destructive"
        });
        console.error('❌ Missing dependencies:', { client, user, profile });
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      setState(prev => ({ ...prev, isSubmitting: true }));
      
      toast({
        title: "⏳ Creating...",
        description: "Publishing your post..."
      });

      try {
        switch (state.selectedType) {
          case 'simple':
            await PostCreationService.createSimplePost(
              client, state.content, state.hashtags, state.mediaFiles, user, profile,
              state.isPremiumTip
            );
            break;
            
          case 'prediction':
            if (state.selectedPrediction) {
        const isPremium = state.isPremiumTip;
        await PostCreationService.createPrediction(
          client, state.selectedPrediction, state.content, state.confidence,
          state.hashtags, isPremium, user, profile
        );
            } else {
              throw new Error('No match selected for prediction');
            }
            break;
            
          case 'opinion':
            if (state.selectedMatch) {
              await PostCreationService.createOpinion(
                client, state.selectedMatch, state.content, user, profile,
                state.isPremiumTip
              );
            } else {
              // Simple opinion without match
              await PostCreationService.createSimplePost(
                client, state.content, state.hashtags, state.mediaFiles, user, profile,
                state.isPremiumTip
              );
            }
            break;
        }

        const successMessages = {
          prediction: '✅ Your prediction has been published!',
          opinion: '✅ Your opinion has been published!',
          simple: '✅ Your post has been published!'
        };

        toast({
          title: "Success!",
          description: successMessages[state.selectedType] || successMessages.simple
        });
        navigate('/');
      } catch (error: any) {
        let errorTitle = "❌ Publication error";
        let errorMessage = "An error occurred";

        // Case 1: Supabase error (prediction)
        if (error?.message?.includes('Supabase failed') || error?.message?.includes('Échec Supabase')) {
          errorTitle = "❌ Database error";
          errorMessage = error.message;
          
          // Specific Supabase details
          if (error?.code === '23505') {
            errorTitle = "❌ Duplicate detected";
            errorMessage = "This prediction already exists";
          } else if (error?.code === '42501') {
            errorTitle = "❌ Permission denied";
            errorMessage = "You don't have the necessary permissions";
          }
        } 
        // Case 2: Selection error
        else if (error?.message?.includes('Selection failed') || error?.message?.includes('Échec sélection')) {
          errorTitle = "❌ Selection error";
          errorMessage = error.message;
        } 
        // Case 3: GetStream error
        else if (error?.message?.includes('GetStream')) {
          errorTitle = "❌ Publishing error";
          errorMessage = "Unable to publish to feed";
        }
        // Default case
        else {
          errorMessage = error?.message || 
                        error?.error_description || 
                        error?.details || 
                        'Unknown error';
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
        
        logger.error('Post creation failed', { selectedType: state.selectedType, error });
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    
    resetForm: () => setState(initialState)
  };

  return { ...state, ...actions };
}