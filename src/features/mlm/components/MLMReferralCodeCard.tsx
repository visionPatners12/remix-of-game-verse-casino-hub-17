import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, Loader2, Users } from 'lucide-react';
import { useMLMStats } from '../hooks';
import { toast } from 'sonner';

export function MLMReferralCodeCard() {
  const { t } = useTranslation('common');
  const { data: stats, isLoading } = useMLMStats();
  const [copied, setCopied] = useState(false);

  const referralCode = stats?.referral_code;
  const referralLink = referralCode
    ? `${window.location.origin}/r/${referralCode}`
    : null;

  const handleCopy = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(t('referral.linkCopied', 'Lien copié !'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for environments where clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success(t('referral.linkCopied', 'Lien copié !'));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t('referral.copyFailed', 'Impossible de copier'));
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    
    // Check if Web Share API is available and we're in a secure context
    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title: t('referral.shareTitle', 'Rejoins PRYZEN !'),
          text: t('referral.shareText', 'Inscris-toi sur PRYZEN avec mon lien de parrainage !'),
          url: referralLink,
        });
        toast.success(t('referral.shareSuccess', 'Partagé avec succès !'));
      } catch (err: any) {
        // User cancelled or error - fallback to copy
        if (err?.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('referral.yourReferralCode')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('referral.uniqueCode')}</p>
          <p className="text-2xl font-bold text-primary tracking-wider">
            {referralCode || '---'}
          </p>
        </div>

        {referralCode && (
          <>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {t('buttons.copy')}
              </Button>
              <Button className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('buttons.share')}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {stats?.total_referrals || 0} {t('referral.peopleReferred')}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
