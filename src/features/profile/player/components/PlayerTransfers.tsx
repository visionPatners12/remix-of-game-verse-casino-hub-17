import { Transfer } from '../types/player';
import { ArrowRight } from 'lucide-react';

interface PlayerTransfersProps {
  transfers: Transfer[];
}

// Filter out youth/academy transfers
function isSignificantTransfer(transfer: Transfer): boolean {
  const youthKeywords = ['youth', 'u16', 'u17', 'u18', 'u19', 'u20', 'u21', 'u23', 'academy', 'juvenil', 'b team', 'barça b'];
  const from = transfer.from.toLowerCase();
  const to = transfer.to.toLowerCase();
  return !youthKeywords.some(kw => from.includes(kw) || to.includes(kw));
}

export function PlayerTransfers({ transfers }: PlayerTransfersProps) {
  if (!transfers || transfers.length === 0) return null;

  // Filter and show last 5 significant transfers
  const recentTransfers = transfers
    .filter(isSignificantTransfer)
    .slice(0, 5);

  if (recentTransfers.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Transfer History
      </h3>
      
      <div className="space-y-2">
        {recentTransfers.map((transfer, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 text-sm py-2 border-b border-border last:border-0"
          >
            <span className="text-xs text-muted-foreground w-24 shrink-0">
              {transfer.transferDate}
            </span>
            <span className="truncate text-foreground">{transfer.from}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate text-foreground">{transfer.to}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">
              {transfer.marketValue || transfer.fee || 'Free'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
