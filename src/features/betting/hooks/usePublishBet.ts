import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStream } from '@/contexts/StreamProvider';
import { useAuth } from '@/features/auth';
import { PostCreationService } from '@/features/create-post/services/PostCreationService';
import { toast } from 'sonner';

export function usePublishBet() {
  const [isPublishing, setIsPublishing] = useState(false);
  const { client } = useGetStream();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get profile from user data or create default
  const profile = user ? {
    id: user.id,
    username: user.email?.split('@')[0] || 'user',
    fullName: user.email || 'Anonymous User',
    avatar: user.user_metadata?.avatar_url || null
  } : null;

  const publishBet = async (
    selectedPrediction: any,
    content: string,
    confidence: number,
    hashtags: string[],
    visibility: 'public' | 'private',
    amount: number
  ) => {
    if (!client || !user || !profile) {
      toast.error("Erreur", { description: "Vous devez être connecté pour publier un pari" });
      return false;
    }

    setIsPublishing(true);
    try {
      await PostCreationService.createBet(
        client,
        selectedPrediction,
        content,
        confidence,
        hashtags,
        visibility,
        amount,
        user,
        profile
      );

      toast.success("Succès !", { description: "Votre pari a été publié avec succès" });

      navigate('/');
      return true;
    } catch (error) {
      console.error('Error publishing bet:', error);
      toast.error("Erreur", { description: "Une erreur est survenue lors de la publication" });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publishBet,
    isPublishing,
  };
}
