import React from 'react';
import { useBets, useBetsSummary, useRedeemBet } from '@azuro-org/sdk';
import { useUnifiedWallet } from '@/features/wallet';
import { Button } from '@/components/ui/button';
import { 
  Loader2,
  Gift
} from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { getSportById } from '@/lib/sportsMapping';
import { usePostNavigation } from '@/hooks/usePostNavigation';
import { ArrowLeft } from 'lucide-react';
import { useOddsDisplay } from '@/shared/hooks/useOddsDisplay';
import { useTranslation } from 'react-i18next';
import { CashoutButton } from '@/features/betting/components/CashoutButton';

// Helper component for formatted odds display
function FormattedOdds({ odds, className }: { odds: number; className?: string }) {
  const { formattedOdds } = useOddsDisplay({ odds });
  return <span className={className}>{formattedOdds}</span>;
}

export default function BetHistoryPage() {
  const { t } = useTranslation('bets');
  const { address, isConnecting } = useUnifiedWallet();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { navigateBack, navigateToDashboard } = usePostNavigation();
  const { submit: redeemBet, isPending: isRedeemPending, isProcessing: isRedeemProcessing } = useRedeemBet();
  
  const betsResult = useBets({
    filter: {
      bettor: address as `0x${string}` || '0x0000000000000000000000000000000000000000'
    }
  });

  const { data, hasNextPage, isFetching, fetchNextPage, isLoading } = betsResult;
  const { pages = [] } = data || {};

  const { data: summaryData, isLoading: summaryLoading } = useBetsSummary({
    account: address,
  });

  const getBetStatus = (bet: any) => {
    if (bet.isCashedOut) return { 
      label: t('status.cashedOut'), 
      color: 'text-blue-600'
    };
    if (bet.isWin) return { 
      label: t('status.won'), 
      color: 'text-emerald-600'
    };
    if (bet.isLose) return { 
      label: t('status.lost'), 
      color: 'text-red-500'
    };
    return { 
      label: t('status.pending'), 
      color: 'text-amber-500'
    };
  };

  const getOutcomeStatus = (outcome: any) => {
    if (outcome.isCanceled) return { 
      label: t('status.canceled'), 
      color: 'text-red-500'
    };
    if (outcome.isWin) return { 
      label: t('status.won'), 
      color: 'text-emerald-500'
    };
    if (outcome.isLose) return { 
      label: t('status.lost'), 
      color: 'text-red-500'
    };
    return { 
      label: t('status.pending'), 
      color: 'text-amber-500'
    };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRedeem = async (bet: any) => {
    try {
      await redeemBet({
        bets: [{
          tokenId: bet.tokenId,
          coreAddress: bet.coreAddress,
          freebetId: bet.freebetId,
          paymaster: bet.paymaster,
          lpAddress: bet.lpAddress
        }]
      });
    } catch (error) {
      console.error('Redeem failed:', error);
    }
  };

  // Hierarchical states to avoid sequential display
  if (!address && !isConnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
        <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-subtle max-w-sm p-8 text-center">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-foreground mb-3`}>{t('wallet.connect')}</h2>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{t('wallet.connectMessage')}</p>
        </section>
      </main>
    );
  }

  if (isConnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
        <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-subtle max-w-sm p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-foreground mb-3`}>{t('wallet.connecting')}</h2>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{t('wallet.connectingMessage')}</p>
        </section>
      </main>
    );
  }

  // Skeleton during data loading
  if (address && isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <header className="border-b border-border/30 sticky top-0 z-50 h-[110px] flex items-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <nav className="w-full px-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={navigateBack}
                className="rounded-full h-10 w-10 bg-card/50 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{t('page.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
              </div>
            </div>
          </nav>
        </header>

        <section className="pb-6">
          <div className="border-b border-border/30 overflow-hidden">
            {/* Stats skeleton */}
            <div className="flex border-b border-border/30">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 py-3 px-2 text-center ${i < 3 ? 'border-r border-border/30' : ''}`}
                >
                  <div className="h-6 w-16 bg-muted/30 rounded-full animate-pulse mx-auto mb-2" />
                  <div className="h-3 w-12 bg-muted/30 rounded-full animate-pulse mx-auto" />
                </div>
              ))}
            </div>

            {/* Bets list skeleton */}
            <div className="divide-y divide-border/30">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="mb-4">
                    <div className="h-4 w-32 bg-muted/30 rounded-full animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-muted/30 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="pl-4 border-l-2 border-border/30">
                      <div className="h-3 w-full bg-muted/30 rounded-full animate-pulse mb-2" />
                      <div className="h-3 w-3/4 bg-muted/30 rounded-full animate-pulse mb-2" />
                      <div className="h-4 w-1/2 bg-muted/30 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (address && !isLoading && (!pages || pages.length === 0)) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <header className="border-b border-border/30 sticky top-0 z-50 h-[110px] flex items-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <nav className="w-full px-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={navigateBack}
              className="rounded-full h-10 w-10 bg-card/50 backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{t('page.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
            </div>
          </div>
        </nav>
      </header>
        
        <section className="p-4 pt-12">
          <div className="bg-card/60 backdrop-blur-sm border-0 rounded-2xl shadow-subtle text-center py-16 px-8">
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground mb-3`}>{t('empty.title')}</h3>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{t('empty.message')}</p>
          </div>
        </section>
      </main>
    );
  }

  const winRate = summaryData?.betsCount ? 
    ((summaryData.wonBetsCount / summaryData.betsCount) * 100).toFixed(1) : '0';

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
    <header className="border-b border-border/30 sticky top-0 z-50 h-[110px] flex items-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <nav className="w-full px-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={navigateBack}
            className="rounded-full h-10 w-10 bg-card/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
              <h1 className="text-lg font-semibold">{t('page.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
          </div>
        </div>
      </nav>
    </header>

      <section className="pb-6">
        <div className="border-b border-border/30 overflow-hidden">
          {/* Stats section */}
          {summaryData && !summaryLoading && (
            <div className="flex border-b border-border/30">
              {/* Win Rate */}
              <div className="flex-1 py-3 px-2 text-center border-r border-border/30">
                <div className="text-lg font-bold text-success">
                  {winRate}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.winRate')}</div>
              </div>
              
              {/* Total Wagered */}
              <div className="flex-1 py-3 px-2 text-center border-r border-border/30">
                <div className="text-lg font-bold">
                  {(parseFloat(summaryData.inBets) / 1e6).toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.wagered')}</div>
              </div>
              
              {/* Total Profit */}
              <div className="flex-1 py-3 px-2 text-center border-r border-border/30">
                <div className={`text-lg font-bold ${parseFloat(summaryData.totalProfit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {parseFloat(summaryData.totalProfit) >= 0 ? "+" : ""}{(parseFloat(summaryData.totalProfit) / 1e6).toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.profit')}</div>
              </div>
              
              {/* Total Bets */}
              <div className="flex-1 py-3 px-2 text-center">
                <div className="text-lg font-bold text-muted-foreground">
                  {summaryData.betsCount}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('stats.bets')}</div>
              </div>
            </div>
          )}

          {/* Bets list */}
          <div className="divide-y divide-border/30">
          {pages.map(({ bets, nextPage }, pageIndex) => (
            <React.Fragment key={`${nextPage}-${pageIndex}`}>
              {bets.map((bet, betIndex) => {
                const status = getBetStatus(bet);
                const isFirst = pageIndex === 0 && betIndex === 0;
                const isLast = pageIndex === pages.length - 1 && betIndex === bets.length - 1 && !hasNextPage;
                const previousBetsCount = pages.slice(0, pageIndex).reduce((sum, page) => sum + page.bets.length, 0);
                const ticketNumber = previousBetsCount + betIndex + 1;
                
                return (
                  <div 
                    key={`${bet.createdAt}-${betIndex}`} 
                    className="p-4"
                  >
                      <header className={`${isMobile ? 'flex-col items-start gap-2' : 'flex items-center justify-between'} mb-4`}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-foreground`}>
                            {bet.outcomes.length > 1 ? t('bet.parlay') : t('bet.single')}
                          </span>
                          {bet.freebetId && (
                            <Gift className="h-4 w-4 text-accent" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-current/10`}>
                            {status.label}
                          </span>
                        </div>
                        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground ${isMobile ? 'mt-1' : ''}`}>
                          {formatDate(bet.createdAt)} at {formatTime(bet.createdAt)}
                        </div>
                      </header>

                      <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'flex items-center gap-8'} mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        <div>
                          <span className="text-muted-foreground">{t('bet.stake')}: </span>
                          <span className="font-medium text-foreground">{bet.amount} USDT</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('bet.odds')}: </span>
                          <FormattedOdds odds={bet.totalOdds} className="font-bold text-primary" />
                        </div>
                        <div className={`${isMobile ? 'col-span-2' : ''}`}>
                          <span className="text-muted-foreground">
                            {bet.payout !== null ? `${t('bet.payout')}: ` : `${t('bet.potentialWin')}: `}
                          </span>
                          <span className={`font-medium ${bet.payout !== null ? 'text-foreround' : 'text-emerald-600'}`}>
                            {bet.payout !== null ? bet.payout.toFixed(2) : bet.possibleWin.toFixed(2)} USDT
                          </span>
                        </div>
                      </div>

                      <div className={`${isMobile ? 'space-y-2' : 'space-y-3'} mb-4`}>
                        {bet.outcomes.map((outcome, index) => {
                          const outcomeStatus = getOutcomeStatus(outcome);
                          const sportInfo = getSportById(outcome.game.sport.slug);
                          
                          return (
                            <div key={index} className={`${isMobile ? 'pl-3' : 'pl-4'} border-l-2 border-border/30`}>
                              <div className={`${isMobile ? 'flex-col' : 'flex items-start justify-between'}`}>
                                <div className="flex-1 min-w-0">
                                  <div className="mb-2">
                                    <div className={`flex items-center gap-1 ${isMobile ? 'flex-wrap' : ''} text-xs text-muted-foreground`}>
                                      {sportInfo.icon && (
                                        <sportInfo.icon className="h-3 w-3 text-muted-foreground" />
                                      )}
                                      <span>{outcome.game.sport.name}</span>
                                      <span>•</span>
                                      <span>{outcome.game.league.name}</span>
                                      <span>•</span>
                                      <span>{formatDate(Number(outcome.game.startsAt))}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-foreground truncate`}>
                                      {outcome.game.title}
                                    </p>
                                  </div>

                                  <div className="mb-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{outcome.marketName}</span>
                                      <span>•</span>
                                      <span className="font-medium text-foreground">{outcome.selectionName}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className={`${isMobile ? 'flex items-center justify-between mt-2' : 'text-right ml-4 flex-shrink-0'}`}>
                                  <FormattedOdds odds={outcome.odds} className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-primary ${isMobile ? '' : 'mb-1'}`} />
                                  <div className={`text-xs ${outcomeStatus.color}`}>
                                    {outcomeStatus.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {(bet.isRedeemable || !bet.isCashedOut) && (
                        <footer className={`${isMobile ? 'flex-col gap-3' : 'flex gap-4'} pt-4 mt-4 border-t border-border/20`}>
                          {bet.isRedeemable && (
                            <Button 
                              variant="default" 
                              size={isMobile ? "default" : "sm"}
                              className={`${isMobile ? 'text-sm h-12' : 'text-sm h-10'} ${isMobile ? 'w-full' : ''} rounded-full shadow-lg transition-all duration-300 hover:shadow-xl`}
                              onClick={() => handleRedeem(bet)}
                              disabled={isRedeemPending || isRedeemProcessing}
                            >
                              {(isRedeemPending || isRedeemProcessing) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  {t('actions.redeeming')}
                                </>
                              ) : (
                                t('actions.redeem')
                              )}
                            </Button>
                          )}
                          {!bet.isCashedOut && !bet.isRedeemable && !bet.isWin && !bet.isLose && (
                            <CashoutButton bet={bet} isMobile={isMobile} />
                          )}
                        </footer>
                      )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
          </div>
        </div>
        
        {hasNextPage && (
          <div className="text-center pt-6">
            <Button 
              onClick={() => fetchNextPage()} 
              disabled={isFetching}
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground bg-card/60 backdrop-blur-sm border-0 hover:bg-card/80 transition-all duration-300 rounded-full px-8 py-3 shadow-subtle"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('actions.loading')}
                </>
              ) : (
                t('actions.loadMore')
              )}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
