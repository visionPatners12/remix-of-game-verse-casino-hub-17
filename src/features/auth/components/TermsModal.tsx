
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
      PRYZEN - TERMS OF SERVICE

      Article 1: Purpose
      These terms of service (ToS) define the terms and conditions of use of the PRYZEN platform.

      Article 2: Acceptance of Terms
      Access to and use of the PRYZEN platform implies full acceptance of these ToS.

      Article 3: Description of Services
      PRYZEN is a gaming and sports betting platform that allows users to participate in online games.

      Article 4: Registration and User Account
      To access services, you must create an account by providing accurate and up-to-date information.

      Article 5: Rules of Use
      Users agree to comply with applicable laws and regulations.

      Last updated: 2025
    `
  } : {
    title: "Terms of Sale and Privacy Policy",
    content: `
      TERMS OF SALE AND PRIVACY POLICY

      PART I - TERMS OF SALE
      Article 1: Scope
      These terms of sale apply to all purchases made on the PRYZEN platform.

      PART II - PRIVACY POLICY
      Article 5: Data Collection
      We collect identification, navigation, and gaming data.

      Article 9: Your Rights
      You have rights of access, rectification, and deletion of your data.

      Last updated: 2025
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
            <span>Document read to the end</span>
          </div>
        ) : (
          <span className="text-slate-400">
            Please scroll to the end of the document
          </span>
        )}
      </div>
    </UnifiedModal>
  );
};
