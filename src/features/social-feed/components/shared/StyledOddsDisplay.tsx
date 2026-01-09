import React from 'react';
import { useActiveMarkets, useBaseBetslip } from '@azuro-org/sdk';
import { OddsButton } from '@/shared/ui/buttons';

// Extended outcome type with blockchain addresses
interface OutcomeWithAddresses {
  outcomeId: string;
  conditionId: string;
  odds: number;
  selectionName?: string;
  coreAddress?: string;
  lpAddress?: string;
}

interface Participant {
  name: string;
  image?: string;
}

interface StyledOddsDisplayProps {
  gameId: string;
  sportSlug?: string;
  leagueName?: string;
  participants: Participant[];
  sport?: { name: string; slug: string };
  league?: { name: string; slug: string; logo?: string };
  startsAt?: string;
}

export function StyledOddsDisplay({ gameId, sportSlug, leagueName, participants, sport, league, startsAt }: StyledOddsDisplayProps) {
  const { data: markets = [], isLoading } = useActiveMarkets({
    gameId,
    chainId: 137,
    query: {
      refetchInterval: 10_000, // Rafraîchir toutes les 10 secondes
      staleTime: 5_000, // Considérer les données comme périmées après 5 secondes
      refetchOnWindowFocus: true, // Rafraîchir quand l'utilisateur revient sur la page
      enabled: !!gameId, // Activer seulement si gameId existe
    }
  });

  const { items: betslipItems, addItem } = useBaseBetslip();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-2">
        <div className="h-10 w-24 bg-muted/50 rounded-md animate-pulse" />
        <div className="h-10 w-24 bg-muted/50 rounded-md animate-pulse" />
        <div className="h-10 w-24 bg-muted/50 rounded-md animate-pulse" />
      </div>
    );
  }

  const firstMarket = markets[0];
  const outcomes = firstMarket?.conditions?.[0]?.outcomes || [];

  if (!firstMarket || outcomes.length === 0) {
    return null;
  }
  const validOutcomes = outcomes.slice(0, 3).filter(Boolean);

  if (validOutcomes.length === 0) {
    return null;
  }

  const handleOutcomeClick = (event: React.MouseEvent, outcome: OutcomeWithAddresses) => {
    event.stopPropagation();
    event.preventDefault();

    const teamA = participants[0]?.name || 'Team A';
    const teamB = participants[1]?.name || 'Team B';

    addItem({
      // Champs requis Azuro
      outcomeId: outcome.outcomeId,
      conditionId: outcome.conditionId,
      gameId,
      isExpressForbidden: false,
      
      // Champs blockchain
      coreAddress: outcome.coreAddress,
      lpAddress: outcome.lpAddress,
      
      // Champs d'affichage personnalisés (cohérents avec le reste du projet)
      eventName: `${teamA} vs ${teamB}`,
      marketType: firstMarket.name || '',
      pick: outcome.selectionName || '',
      
      // Champs Azuro natifs (pour compatibilité)
      marketName: firstMarket.name || '',
      selectionName: outcome.selectionName || '',
      odds: outcome.odds || 0,
      isLive: false,
      
      // Localisation
      sportSlug: sportSlug || sport?.slug || '',
      leagueName: (leagueName && leagueName.trim() !== '') ? leagueName : (league?.name || ''),
      countryName: '',
      countrySlug: '',
      leagueSlug: league?.slug || '',
      
      // Participants
      participants: participants.map(p => ({ name: p.name, image: p.image || '' })),
      participantImages: participants.map(p => p.image || '').filter(Boolean),
      
      // Metadata
      sport,
      league,
      startsAt: startsAt ? parseInt(startsAt) : 0,
    });
  };

  const isSelected = (outcome: OutcomeWithAddresses) => {
    return betslipItems.some(item => 
      item.outcomeId === outcome.outcomeId && 
      item.conditionId === outcome.conditionId
    );
  };

  const teamA = participants[0]?.name || 'Team A';
  const teamB = participants[1]?.name || 'Team B';

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-2">
      {validOutcomes[0] && (
        <OddsButton
          variant="sport"
          teamType="home"
          label="1"
          odds={validOutcomes[0].odds}
          outcome={validOutcomes[0]}
          isSelected={isSelected(validOutcomes[0])}
          onSelect={() => {/* OddsButton handles betslip internally */}}
          gameId={gameId}
          eventName={`${teamA} vs ${teamB}`}
          marketType={firstMarket.name}
          participants={participants}
          sport={sport}
          league={league}
          startsAt={startsAt}
          realTimeOdds={true}
          className="flex-1"
        />
      )}
      
      {validOutcomes[1] && validOutcomes.length === 3 && (
        <OddsButton
          variant="sport"
          teamType="draw"
          label="X"
          odds={validOutcomes[1].odds}
          outcome={validOutcomes[1]}
          isSelected={isSelected(validOutcomes[1])}
          onSelect={() => {/* OddsButton handles betslip internally */}}
          gameId={gameId}
          eventName={`${teamA} vs ${teamB}`}
          marketType={firstMarket.name}
          participants={participants}
          sport={sport}
          league={league}
          startsAt={startsAt}
          realTimeOdds={true}
          className="flex-1"
        />
      )}
      
      {validOutcomes[validOutcomes.length === 3 ? 2 : 1] && (
        <OddsButton
          variant="sport"
          teamType="away"
          label="2"
          odds={validOutcomes[validOutcomes.length === 3 ? 2 : 1].odds}
          outcome={validOutcomes[validOutcomes.length === 3 ? 2 : 1]}
          isSelected={isSelected(validOutcomes[validOutcomes.length === 3 ? 2 : 1])}
          onSelect={() => {/* OddsButton handles betslip internally */}}
          gameId={gameId}
          eventName={`${teamA} vs ${teamB}`}
          marketType={firstMarket.name}
          participants={participants}
          sport={sport}
          league={league}
          startsAt={startsAt}
          realTimeOdds={true}
          className="flex-1"
        />
      )}
    </div>
  );
}
