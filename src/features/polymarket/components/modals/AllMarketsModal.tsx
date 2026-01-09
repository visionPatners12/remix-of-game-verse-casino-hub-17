import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarketActionButtons } from '../ui/MarketActionButtons';
import { PolymarketEvent } from '../../types/events';
import { MarketRowDataWithMarket } from '../../types/ui';
import { probabilityToOdds } from '@/utils/oddsCalculators';

interface AllMarketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  markets: MarketRowDataWithMarket[];
  onView?: (params: { 
    marketId: string; 
    side: 'YES' | 'NO'; 
    eventTitle: string;
    marketQuestion: string;
  }) => void;
  isResolved?: boolean;
  event: PolymarketEvent;
}

export const AllMarketsModal: React.FC<AllMarketsModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  markets,
  onView,
  isResolved = false,
  event
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-semibold line-clamp-2">
            {eventTitle}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-3">
            {markets.map((market) => (
              <div key={market.id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2">
                        {market.label}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        {market.percentage}% probability
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <MarketActionButtons
                      marketId={market.id}
                      size="small"
                      disabled={isResolved}
                      yesOdds={probabilityToOdds(market.percentage)}
                      noOdds={probabilityToOdds(100 - market.percentage)}
                      showReadonly={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};