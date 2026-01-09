
import { ScrollArea } from "@/ui";
import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { UnifiedModal } from '@/components/unified/UnifiedModal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: 'terms' | 'privacy';
}

export const TermsModal = ({ isOpen, onClose, onAccept, type }: TermsModalProps) => {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToEnd(false);
    }
  }, [isOpen]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (isAtBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const content = type === 'terms' ? {
    title: "Terms of Service (ToS)",
    content: `
      PRYZEN - CONDITIONS GÉNÉRALES D'UTILISATION

      Article 1 : Objet
      Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme PRYZEN.

      Article 2 : Acceptation des conditions
      L'accès et l'utilisation de la plateforme PRYZEN impliquent l'acceptation pleine et entière des présentes CGU.

      Article 3 : Description des services
      PRYZEN est une plateforme de gaming et de paris sportifs qui permet aux utilisateurs de participer à des jeux en ligne.

      Article 4 : Inscription et compte utilisateur
      Pour accéder aux services, vous devez créer un compte en fournissant des informations exactes et à jour.

      Article 5 : Règles d'utilisation
      Les utilisateurs s'engagent à respecter les lois et réglementations en vigueur.

      Dernière mise à jour : 2025
    `
  } : {
    title: "Terms of Sale and Privacy Policy",
    content: `
      CONDITIONS GÉNÉRALES DE VENTE ET POLITIQUE DE CONFIDENTIALITÉ

      PARTIE I - CONDITIONS GÉNÉRALES DE VENTE
      Article 1 : Champ d'application
      Les présentes CGV s'appliquent à tous les achats effectués sur la plateforme PRYZEN.

      PARTIE II - POLITIQUE DE CONFIDENTIALITÉ
      Article 5 : Collecte des données
      Nous collectons les données d'identification, de navigation et de jeu.

      Article 9 : Vos droits
      Vous disposez des droits d'accès, de rectification et d'effacement de vos données.

      Dernière mise à jour : 2025
    `
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      size="xl"
      primaryAction={{
        label: "I Accept",
        onClick: handleAccept,
        isLoading: false,
        variant: "default"
      }}
      secondaryAction={{
        label: "Close",
        onClick: onClose,
        variant: "outline"
      }}
      contentClassName="bg-slate-800 border-slate-700"
    >
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-[60vh] pr-4"
        onScroll={handleScroll}
      >
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {content.content}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 text-sm pt-4 border-t border-slate-700">
        {hasScrolledToEnd ? (
          <div className="flex items-center gap-2 text-green-400">
            <Check className="h-4 w-4" />
            <span>Document lu jusqu'à la fin</span>
          </div>
        ) : (
          <span className="text-slate-400">
            Veuillez faire défiler jusqu'à la fin du document
          </span>
        )}
      </div>
    </UnifiedModal>
  );
};
