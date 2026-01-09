import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/ui';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, ShoppingCart } from 'lucide-react';
import { useBaseBetslip, useDetailedBetslip, useBet } from '@azuro-org/sdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { toast } from '@/hooks/use-toast';
import { saveBetFromTicketSlip } from '@/features/betting/utils/betIntegration';
import { usePublishBet } from '@/features/betting/hooks/usePublishBet';
import { useWalletTransaction } from '@/hooks/useWalletTransaction';

import { 
  StakeInputRow, 
  TotalQuoteRow, 
  FinancialSummary, 
  PrimaryCTA, 
  ShareButton, 
  ModeSelector,
  TicketSlipErrorBoundary 
} from './components';
import { SimpleSelectionCard } from './components/cards/SimpleSelectionCard';
import { useFinancialCalculations } from './hooks';
import { createBetConfig } from './utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getDisableReasonInfo } from './constants';

import type { BetMode, Currency, FinancialCalculations, TicketSlipState } from './types';

interface TicketSlipContainerProps {
  className?: string;
}

export function TicketSlipContainer({ className }: TicketSlipContainerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { publishBet } = usePublishBet();
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [readyToBet, setReadyToBet] = useState(false);
  const { isWaitingForWallet, startTransaction, endTransaction } = useWalletTransaction();
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem('ticketSlipExpanded');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [ticketState, setTicketState] = useState<TicketSlipState>({
    mode: 'REGULAR' as BetMode,
    currency: 'USDT' as Currency,
    stake: 10,
    persistentBet: false,
    socialShare: false,
  });

  // Azuro hooks
  const { items: selections, removeItem, clear } = useBaseBetslip();
  const { 
    betAmount, 
    odds, 
    totalOdds, 
    maxBet, 
    minBet, 
    states,
    disableReason,
    changeBetAmount,
    isStatesFetching,
    isOddsFetching,
    isMaxBetFetching,
    isBetAllowed
  } = useDetailedBetslip();

  // Create handlers
  const handleStakeChange = useCallback((stake: number) => {
    setTicketState(prev => ({ ...prev, stake }));
    changeBetAmount(stake.toString());
  }, [setTicketState, changeBetAmount]);

  const handleClearSelections = useCallback(() => {
    clear();
  }, [clear]);

  const handleRemoveSelection = useCallback((selection: { conditionId: string; outcomeId: string; coreAddress: string }) => {
    removeItem(selection);
  }, [removeItem]);

  // Financial calculations
  const calculations = useFinancialCalculations({
    stake: ticketState.stake,
    totalOdds,
    mode: ticketState.mode,
    maxBet,
    minBet,
  });

  // Configure useBet hook using utility
  const bet = useBet(createBetConfig({
    stake: ticketState.stake,
    readyToBet,
    items: selections,
    odds: odds || {},
    totalOdds,
    onSuccess: useCallback(() => {
      endTransaction(); // End wallet waiting state
      setReadyToBet(false);
      clear();
    }, [clear, endTransaction]),
    onError: useCallback(() => {
      endTransaction(); // End wallet waiting state
      setReadyToBet(false);
    }, [endTransaction]),
  }));

  // Event handlers
  const handleSubmitBet = useCallback(async () => {
    if (!user || selections.length === 0) {
      toast({
        title: "Erreur",
        description: "Impossible de placer le pari",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTransaction(async () => {
        // Déclencher la transaction Azuro
        setReadyToBet(true);
        
        // Sauvegarder le pari dans la base de données
        const result = await saveBetFromTicketSlip({
          selections: selections as any,
          stake: ticketState.stake,
          totalOdds: totalOdds || 1,
          potentialWin: calculations.potentialPayout,
          mode: ticketState.mode === 'REGULAR' ? 'single' : 'parlay',
          isShared: false,
        });

        if (result.error) {
          console.error('Error saving bet:', result.error);
          toast({
            title: "Erreur",
            description: "Échec de l'enregistrement du pari",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Succès !",
          description: "Votre pari a été placé avec succès",
        });
      });
    } catch (error) {
      console.error('Error submitting bet:', error);
      endTransaction();
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  }, [user, selections, ticketState, totalOdds, calculations, startTransaction, endTransaction]);

  const handlePublishBet = useCallback(async () => {
    if (!user || selections.length === 0) return;
    
    setIsPublishing(true);
    
    try {
      // Créer le post avec les sélections
      const selectedPrediction = {
        selections: selections.map((s, index) => ({
          conditionId: s.conditionId,
          outcomeId: s.outcomeId,
          odds: odds?.[index] || 1,
          marketType: '',
          pick: s.outcomeId,
        })),
        totalOdds: totalOdds || 1,
      };

      const success = await publishBet(
        selectedPrediction,
        '', // content vide par défaut
        80, // confidence par défaut
        [], // hashtags vides
        'public',
        ticketState.stake
      );

      if (success) {
        clear(); // Vider le ticket après publication
      }
    } catch (error) {
      console.error('Error publishing bet:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [user, selections, odds, totalOdds, ticketState.stake, publishBet, clear, setIsPublishing]);

  const handleEventClick = useCallback((gameId: string) => {
    if (gameId) {
      // Simple fallback URL for match navigation
      navigate(`/match/unknown/unknown/unknown/${gameId}`);
    }
  }, [navigate]);

  // Save expanded state
  useEffect(() => {
    localStorage.setItem('ticketSlipExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Auto-collapse when no selections
  useEffect(() => {
    if (selections.length === 0 && isExpanded) {
      setIsExpanded(false);
    }
  }, [selections.length, isExpanded]);

  // Don't render on mobile
  if (isMobile) return null;

  const isPending = bet.approveTx.isPending || bet.betTx.isPending || isWaitingForWallet;
  const isProcessing = bet.approveTx.isProcessing || bet.betTx.isProcessing;
  
  if (selections.length === 0) {
    return (
      <Card className={cn("w-80 fixed right-6 top-24 z-40", className)}>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your ticket is empty</h3>
          <p className="text-muted-foreground text-sm">
            Add selections to start building your bet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TicketSlipErrorBoundary>
      <Card className={cn("w-80 fixed right-6 top-24 z-40", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {selections.length} Selection{selections.length > 1 ? 's' : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-4">
            <ModeSelector
              mode={ticketState.mode}
              onChange={(mode) => setTicketState(prev => ({ ...prev, mode }))}
              selectionsCount={selections.length}
              canChangeToSystem={selections.length >= 3}
            />

            <div className="space-y-2">
              {selections.map((selection) => (
                <SimpleSelectionCard
                  key={`${selection.conditionId}-${selection.outcomeId}`}
                  selection={selection}
                  onRemove={handleRemoveSelection}
                  onEventClick={handleEventClick}
                  isStatesFetching={isStatesFetching}
                  states={states}
                />
              ))}
            </div>

            <Separator />

              <StakeInputRow
                mode={ticketState.mode}
                stake={ticketState.stake}
                currency={ticketState.currency}
                onChange={handleStakeChange}
                maxBet={maxBet}
                minBet={minBet}
                isMaxBetFetching={isMaxBetFetching}
                disableReason={disableReason ? getDisableReasonInfo(disableReason)?.description : undefined}
              />

            <TotalQuoteRow
              selections={selections}
              mode={ticketState.mode}
              selectionsCount={selections.length}
              totalOdds={totalOdds}
              onClearAll={handleClearSelections}
            />

              <FinancialSummary
                selections={selections}
                stake={ticketState.stake}
                totalOdds={totalOdds}
                potentialWin={calculations.potentialPayout}
                currency={ticketState.currency}
                mode={ticketState.mode}
                maxBet={maxBet}
                isMaxBetFetching={isMaxBetFetching}
              />

            <PrimaryCTA
              canSubmit={isBetAllowed && selections.length > 0}
              selectionsCount={selections.length}
              mode={ticketState.mode}
              isSubmitting={isPending || isProcessing}
              onSubmit={handleSubmitBet}
              onPublish={handlePublishBet}
              isPublishing={isPublishing}
            />

            {!isBetAllowed && disableReason && (
              <div className="text-xs text-destructive text-center">
                {getDisableReasonInfo(disableReason).title}
              </div>
            )}

            <ShareButton
              selections={selections}
              totalOdds={totalOdds}
              stake={ticketState.stake}
              potentialWin={calculations.potentialPayout}
            />
          </CardContent>
        )}
      </Card>
    </TicketSlipErrorBoundary>
  );
}