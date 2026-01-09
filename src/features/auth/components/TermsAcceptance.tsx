
import { Checkbox, Label, Button } from '@/ui';
import { useState } from "react";
import { TermsModal } from "./TermsModal";

interface TermsAcceptanceProps {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  onPrivacyChange: (checked: boolean) => void;
}

export const TermsAcceptance = ({ 
  termsAccepted, 
  privacyAccepted, 
  onTermsChange, 
  onPrivacyChange 
}: TermsAcceptanceProps) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleTermsAccept = () => {
    onTermsChange(true);
  };

  const handlePrivacyAccept = () => {
    onPrivacyChange(true);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={onTermsChange}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I accept the{" "}
              <Button
                type="button"
                variant="link"
                className="text-primary hover:underline font-medium p-0 h-auto"
                onClick={() => setShowTermsModal(true)}
              >
                Terms of Service (ToS)
              </Button>
            </Label>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="privacy" 
            checked={privacyAccepted}
            onCheckedChange={onPrivacyChange}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="privacy" className="text-sm leading-relaxed">
              I accept the{" "}
              <Button
                type="button"
                variant="link"
                className="text-primary hover:underline font-medium p-0 h-auto"
                onClick={() => setShowPrivacyModal(true)}
              >
                Terms of Sale and Privacy Policy
              </Button>
            </Label>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        type="terms"
      />

      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={handlePrivacyAccept}
        type="privacy"
      />
    </>
  );
};
