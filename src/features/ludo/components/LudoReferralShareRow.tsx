import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Link2, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLudoReferralStats } from '@/features/ludo/hooks/useLudoReferralStats';

export const LudoReferralShareRow: React.FC = () => {
  const { data: stats, isLoading } = useLudoReferralStats(30);
  const [copied, setCopied] = useState(false);
  const code = stats?.referral_code;
  const link = code ? `${window.location.origin}/r/${code}` : '';

  const copyLink = async () => {
    if (!link) {
      toast.error('No referral code yet');
      return;
    }

    const showSuccess = () => {
      setCopied(true);
      toast.success('Link copied', {
        description: 'Paste it anywhere to invite friends.',
        duration: 3500,
      });
      setTimeout(() => setCopied(false), 2000);
    };

    try {
      await navigator.clipboard.writeText(link);
      showSuccess();
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess();
      } catch {
        toast.error('Could not copy — copy the link from Refer page.');
      }
      document.body.removeChild(textArea);
    }
  };

  const share = async () => {
    if (!link) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on Pryzen',
          text: 'Play Ludo with my link',
          url: link,
        });
        toast.message('Shared');
      } else {
        await copyLink();
      }
    } catch {
      /* cancelled */
    }
  };

  const earnings =
    (stats?.total_earnings_n1 ?? 0) + (stats?.total_earnings_n2 ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Gift className="w-4 h-4 text-primary shrink-0" />
        <span>Referrals</span>
        {!isLoading && (
          <span className="text-xs font-normal text-muted-foreground ml-auto">
            ~30d: ${earnings.toFixed(2)}
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Earn when your friends play Ludo (1.5% / 0.5% tiers). Share your link so they sign up with your code.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          disabled={!link}
          onClick={copyLink}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          ) : (
            <Link2 className="w-3.5 h-3.5 mr-1" />
          )}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={!link}
          onClick={share}
        >
          <Share2 className="w-3.5 h-3.5 mr-1" />
          Share
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <Link to="/refer">Refer page</Link>
        </Button>
      </div>
    </div>
  );
};
