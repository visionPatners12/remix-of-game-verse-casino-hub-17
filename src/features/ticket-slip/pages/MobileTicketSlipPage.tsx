import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBaseBetslip, useDetailedBetslip, useBet } from '@azuro-org/sdk';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useGetStream } from '@/contexts/StreamProvider';
import { useAuth } from '@/features/auth';
import { PostCreationService } from '@/features/create-post/services/PostCreationService';
import { saveBetFromTicketSlip } from '@/features/betting/utils/betIntegration';
import { logger } from '@/utils/logger';
import { useWalletTransaction } from '@/hooks/useWalletTransaction';

import {
  CompactSelectionCard,
  GlassSummaryCard,
  QuickStakePills,
  StakeInput,
  GlowCTAButton,
  EmptyTicketState,
  ModernModeSelector,
} from '../components/mobile/redesign';
import { getDisableReasonInfo } from '../constants/betslip-messages';

import type { FinancialCalculations, TicketSlipState } from '../types';

interface MobileTicketSlipPageProps {
  ticketState: TicketSlipState;
  setTicketState: React.Dispatch<React.SetStateAction<TicketSlipState>>;
  calculations: FinancialCalculations;
}

export function MobileTicketSlipPage({ 
  ticketState, 
  setTicketState, 
  calculations 
}: MobileTicketSlipPageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { client } = useGetStream();
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const { isWaitingForWallet, startTransaction, endTransaction } = useWalletTransaction();
  
  // Azuro hooks
  const { items: selections, removeItem, clear } = useBaseBetslip();
  const {
    betAmount,
    changeBetAmount,
    odds,
    totalOdds,
    maxBet,
    minBet,
    isBetAllowed,
    disableReason,
    states,
    isStatesFetching,
    isMaxBetFetching,
    isOddsFetching,
  } = useDetailedBetslip();

  logger.debug('Mobile useBet parameters:', {
    itemsCount: selections.length,
    stake: ticketState.stake,
    betAmount,
    totalOdds,
    odds
  });

  // Configure useBet hook
  const bet = useBet({
    betAmount: ticketState.stake.toString(),
    slippage: 10,
    affiliate: '0xE32eB47aaad68dE59A92B8fdE0D0BcC61B7741e3',
    selections: selections.map(item => ({
      conditionId: item.conditionId,
      outcomeId: item.outcomeId,
    })),
    odds: odds || {},
    totalOdds: totalOdds || 1,
    onSuccess: async () => {
      endTransaction(); // End wallet waiting state
      
      await saveBetFromTicketSlip({
        selections: selections as any,
        stake: ticketState.stake,
        totalOdds: totalOdds || 1,
        potentialWin: calculations.potentialPayout,
        mode: ticketState.mode === 'REGULAR' ? 'single' : 'parlay',
      });
      
      toast({
        title: "Success!",
        description: "Your bet has been placed successfully",
      });
      
      clear();
    },
    onError: (error) => {
      endTransaction(); // End wallet waiting state
      
      console.error('Bet error:', error);
      toast({
        title: "Error",
        description: error?.message || "Error placing bet",
        variant: "destructive",
      });
    },
  });

  // Handle bet submission with wallet transaction management
  const handleSubmitBet = async () => {
    if (!user || selections.length === 0) {
      toast({
        title: "Error",
        description: "Unable to place bet",
        variant: "destructive",
      });
      return;
    }

    if (ticketState.stake <= 0) {
      toast({
        title: "Invalid stake",
        description: "Please enter a valid stake",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTransaction(async () => {
        await bet.submit();
      });
    } catch (error) {
      console.error('Bet submission error:', error);
      endTransaction();
    }
  };

  // Publish bet function
  const handlePublishBet = async () => {
    if (!client || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to publish a bet",
        variant: "destructive",
      });
      return;
    }

    if (selections.length === 0) {
      toast({
        title: "No selections",
        description: "Add selections to your ticket before publishing",
        variant: "destructive",
      });
      return;
    }

    if (ticketState.stake <= 0) {
      toast({
        title: "Invalid stake",
        description: "Please enter a valid stake",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      const profile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        fullName: user.email || 'Anonymous User',
        avatar: user.user_metadata?.avatar_url || null
      };

      await PostCreationService.createBet(
        client,
        {
          selections: selections,
          totalOdds: calculations.totalOdds
        },
        '',
        80,
        [],
        'public',
        ticketState.stake,
        user,
        profile
      );

      toast({
        title: "Success!",
        description: "Your bet has been published successfully",
      });

      clear();
      navigate('/');
    } catch (error) {
      console.error('Error publishing bet:', error);
      toast({
        title: "Error",
        description: "An error occurred while publishing",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle event click navigation
  const handleEventClick = (gameId: string) => {
    if (gameId) {
      navigate(`/match/unknown/unknown/unknown/${gameId}`);
    } else {
      toast({
        title: "Error",
        description: "Unable to find match details",
        variant: "destructive",
      });
    }
  };

  const handleStakeChange = (value: number) => {
    setTicketState(prev => ({ ...prev, stake: value }));
    changeBetAmount(value.toString());
  };

  // Empty state
  if (selections.length === 0) {
    return <EmptyTicketState />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-48 space-y-3">
        {/* Header with Mode Selector */}
        <ModernModeSelector
          mode={ticketState.mode}
          onChange={(mode) => setTicketState(prev => ({ ...prev, mode }))}
        />

        {/* Selections List */}
        <div className="divide-y divide-border/20">
          <AnimatePresence mode="popLayout">
            {selections.map((selection, index) => (
              <CompactSelectionCard
                key={`${selection.conditionId}-${selection.outcomeId}`}
                selection={selection}
                onRemove={(sel) => removeItem(sel)}
                onEventClick={handleEventClick}
                isStatesFetching={isStatesFetching}
                states={states}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Stake Section */}
        <div className="space-y-2">
          <StakeInput
            value={ticketState.stake}
            onChange={handleStakeChange}
            currency={ticketState.currency}
            minBet={minBet}
            maxBet={maxBet}
            onMaxClick={maxBet ? () => handleStakeChange(maxBet) : undefined}
            error={disableReason ? getDisableReasonInfo(disableReason)?.description : undefined}
          />

          <QuickStakePills
            currentStake={ticketState.stake}
            onSelect={handleStakeChange}
            maxBet={maxBet}
          />
        </div>

        {/* Disable Reason Alert */}
        {!isBetAllowed && disableReason && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-1 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  {getDisableReasonInfo(disableReason)?.title}
                </p>
                <p className="text-xs text-destructive/80">
                  {getDisableReasonInfo(disableReason)?.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Summary Card */}
        <GlassSummaryCard
          totalOdds={calculations.totalOdds}
          potentialWin={calculations.potentialPayout}
          stake={ticketState.stake}
          currency={ticketState.currency}
        />
      </div>

      {/* Fixed Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-sm z-50"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <GlowCTAButton
          onSubmit={handleSubmitBet}
          onPublish={handlePublishBet}
          isSubmitting={isWaitingForWallet || bet.betTx.isPending || bet.betTx.isProcessing}
          isPublishing={isPublishing}
          canSubmit={isBetAllowed && selections.length > 0 && ticketState.stake > 0 && !bet.betTx.isPending && !isWaitingForWallet}
          potentialWin={calculations.potentialPayout}
          currency={ticketState.currency}
        />
      </motion.div>
    </div>
  );
}
