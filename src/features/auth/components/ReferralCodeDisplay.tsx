import { Badge, UnifiedButton, UnifiedCard } from '@/ui';
import { Users, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useValidateReferralCode, getReferralCode, saveReferralCode, clearReferralCode } from "@/features/mlm";

export function ReferralCodeDisplay() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const validateCode = useValidateReferralCode();

  useEffect(() => {
    // Check URL first, then localStorage
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('ref');
    const savedCode = getReferralCode();
    
    const code = codeFromUrl || savedCode;
    
    if (code) {
      // Persist to localStorage if from URL
      if (codeFromUrl && codeFromUrl !== savedCode) {
        saveReferralCode(codeFromUrl);
      }
      
      setReferralCode(code);
      validateCode.mutate(code);
    }
  }, []);

  const handleClearReferralCode = () => {
    setReferralCode(null);
    clearReferralCode();
    // Also clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  };

  if (!referralCode || validateCode.isPending) {
    return null;
  }

  const isValidCode = validateCode.data?.is_valid || false;

  return (
    <UnifiedCard className={`mb-4 ${isValidCode ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 ${isValidCode ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm font-medium">
              {isValidCode ? 'Code de parrainage valide' : 'Code invalide'}
            </span>
            <Badge variant={isValidCode ? "default" : "destructive"}>
              {referralCode}
            </Badge>
          </div>
          <UnifiedButton
            buttonType="default"
            variant="ghost"
            size="sm"
            onClick={handleClearReferralCode}
            className="h-auto p-1"
            icon={<X className="h-3 w-3" />}
          />
        </div>
        {isValidCode && (
          <p className="text-xs text-green-600 mt-1">
            Vous serez parrainé par {validateCode.data?.referrer_username}
          </p>
        )}
      </div>
    </UnifiedCard>
  );
}
