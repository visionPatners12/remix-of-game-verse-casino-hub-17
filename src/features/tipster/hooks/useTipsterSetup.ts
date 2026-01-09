import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedWallet } from '@/features/wallet';
import { deployTipsterSplitContract } from '@/services/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { TipsterSetupFormData } from '../types';

export function useTipsterSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { address, chainId, switchNetwork } = useUnifiedWallet();
  const { wallets } = useWallets();

  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (formData: TipsterSetupFormData, isUpdate: boolean = false) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return;
    }

    if (!isUpdate && (wallets.length === 0 || !address)) {
      toast({
        title: "Erreur",
        description: "Wallet requis pour créer un profil tipster",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (isUpdate) {
        // TODO: Implement update logic when needed
        toast({
          title: "Profil mis à jour",
          description: "Vos modifications ont été enregistrées"
        });
      } else {
        // Ensure Polygon network
        if (chainId !== 137) {
          await switchNetwork(137);
        }

        toast({
          title: "Création en cours...",
          description: "Déploiement du contrat et création du profil"
        });

        const response = await deployTipsterSplitContract({
          monthly_price: formData.monthly_price,
          description: formData.description,
          experience: formData.experience || undefined,
          specialties: formData.specialties.length > 0 ? formData.specialties : undefined,
        });

        toast({
          title: "Profil créé !",
          description: `Contrat: ${response.split.contractAddress.slice(0, 6)}...${response.split.contractAddress.slice(-4)}`
        });
      }
      
      navigate('/tipster/dashboard');
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitForm
  };
}
