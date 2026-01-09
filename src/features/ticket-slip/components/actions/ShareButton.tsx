import React from 'react';
import { Button } from '@/ui';
import { TwitterIcon } from 'lucide-react';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';

interface ShareButtonProps {
  selections: any[];
  totalOdds: number;
  stake: number;
  potentialWin: number;
}

export function ShareButton({ selections, totalOdds, stake, potentialWin }: ShareButtonProps) {
  const { formattedOdds } = useOddsDisplay({ odds: totalOdds });
  
  const handleShare = () => {
    const message = `🎯 My sports betting ticket:\n${selections.length} selections\nTotal odds: ${formattedOdds}\nStake: €${stake}\nPotential win: €${potentialWin.toFixed(2)} 💰\n\n#Sports #Betting`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black border-yellow-400 font-medium"
    >
      <TwitterIcon className="w-4 h-4 mr-2 text-yellow-800" />
      Share on Twitter
    </Button>
  );
}