import React from 'react';
import { TipsterCard } from './TipsterCard';
import { TipsterStats, TipsterLeaderboardProps } from '../types';

export function TipsterLeaderboard({ 
  tipsters, 
  onTipsterClick, 
  variant = 'list',
  className = '' 
}: TipsterLeaderboardProps) {
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {tipsters.map((tipster) => (
          <TipsterCard
            key={tipster.id}
            tipster={tipster}
            onClick={onTipsterClick}
            variant="default"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 md:space-y-3 ${className}`}>
      {tipsters.map((tipster) => (
        <TipsterCard
          key={tipster.id}
          tipster={tipster}
          onClick={onTipsterClick}
          variant="horizontal"
        />
      ))}
    </div>
  );
}