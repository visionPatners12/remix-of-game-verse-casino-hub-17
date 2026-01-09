import React from 'react';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileTicketSlipPage, useFinancialCalculations, WalletBalanceCard } from '@/features/ticket-slip';
import { useBaseBetslip, useDetailedBetslip } from '@azuro-org/sdk';
import { Button } from '@/components/ui/button';

export default function TicketSlipPage() {
  const navigate = useNavigate();
  const { items, clear } = useBaseBetslip();
  
  // Temporary state until we integrate properly
  const [ticketState, setTicketState] = React.useState({
    mode: 'REGULAR' as const,
    currency: 'USDT' as const,
    stake: 10,
    persistentBet: false,
    socialShare: false,
  });
  
  // Use real Azuro data
  const { totalOdds, maxBet, minBet } = useDetailedBetslip();
  const calculations = useFinancialCalculations({
    stake: ticketState.stake,
    totalOdds: totalOdds || 1.0,
    mode: ticketState.mode,
    maxBet,
    minBet,
  });

  return (
    <Layout hideNavigation={true}>
      <div className="min-h-screen bg-background" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold">My Ticket</h1>
                {items.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {items.length} selection{items.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clear()}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Wallet Balance Card */}
          <WalletBalanceCard />
          
          {/* Ticket Slip */}
          <MobileTicketSlipPage
            ticketState={ticketState}
            setTicketState={setTicketState}
            calculations={calculations}
          />
        </div>
      </div>
    </Layout>
  );
}