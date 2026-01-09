import React from 'react';
import type { Currency } from '../../types';

interface QuickStakeButtonsProps {
  onStakeSelect: (amount: number) => void;
  currency: Currency;
  currentStake: number;
}

export function QuickStakeButtons({ onStakeSelect, currency, currentStake }: QuickStakeButtonsProps) {
  // No quick stake buttons - removed per user request
  return null;
}