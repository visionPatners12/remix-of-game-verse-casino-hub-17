import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth';
import { useGetStream } from '@/contexts/StreamProvider';
import { PolymarketPredictionService } from '../services/PolymarketPredictionService';
import type { PolymarketEvent, PolymarketMarket } from '../types/events';

export interface PredictionSelection {
  market: PolymarketMarket;
  outcome: 'Yes' | 'No' | string;
  odds: number;
  probability: number;
}

interface UsePolymarketPredictionReturn {
  // State
  analysis: string;
  confidence: number;
  isPremium: boolean;
  isSubmitting: boolean;
  isReady: boolean;
  
  // Setters
  setAnalysis: (value: string) => void;
  setConfidence: (value: number) => void;
  setIsPremium: (value: boolean) => void;
  
  // Actions
  submitPrediction: (event: PolymarketEvent, selection: PredictionSelection) => Promise<boolean>;
}

export function usePolymarketPrediction(): UsePolymarketPredictionReturn {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { client, isReady: isStreamReady } = useGetStream();
  
  const [analysis, setAnalysis] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = isAuthenticated && isStreamReady && !!client;

  const submitPrediction = useCallback(async (
    event: PolymarketEvent,
    selection: PredictionSelection
  ): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour publier une prédiction',
        variant: 'destructive',
      });
      return false;
    }

    if (!client) {
      toast({
        title: 'Erreur de connexion',
        description: 'Le service de feed n\'est pas disponible. Réessayez.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // Build author info from user profile metadata
      const metadata = user.user_metadata || {};
      const authorUsername = metadata.username || '';
      const authorFullName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ') || '';
      const authorAvatar = metadata.avatar_url || null;
      
      const { predictionId, error } = await PolymarketPredictionService.createPrediction(
        client,
        {
          userId: user.id,
          market: selection.market,
          event,
          outcome: selection.outcome,
          odds: selection.odds,
          analysis,
          confidence,
          isPremium,
          authorUsername,
          authorFullName,
          authorAvatar,
        }
      );

      if (error || !predictionId) {
        console.error('[usePolymarketPrediction] Error:', error);
        toast({
          title: 'Erreur',
          description: error || 'Impossible de créer la prédiction',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Prédiction publiée !',
        description: 'Votre prédiction a été partagée avec succès',
      });

      // Navigate back to event or feed
      navigate(-1);
      return true;
    } catch (err) {
      console.error('[usePolymarketPrediction] Error:', err);
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, user, client, analysis, confidence, isPremium, toast, navigate]);

  return {
    analysis,
    confidence,
    isPremium,
    isSubmitting,
    isReady,
    setAnalysis,
    setConfidence,
    setIsPremium,
    submitPrediction,
  };
}
