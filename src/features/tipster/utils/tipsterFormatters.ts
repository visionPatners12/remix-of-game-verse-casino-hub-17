// Tipster formatting utilities
export function formatCurrency(amount: number, currency: string = '€'): string {
  return `${currency}${amount.toFixed(2)}`;
}

export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatProfit(profit: number): string {
  const sign = profit >= 0 ? '+' : '';
  return `${sign}€${profit.toFixed(0)}`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatSubscriptionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

export function formatLastActivity(activityString: string): string {
  // Simple formatter for activity strings like "2h ago", "1d ago"
  return activityString;
}

export function formatTipsterRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';  
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function formatTipsterLevel(level: number): string {
  if (level <= 2) return 'Débutant';
  if (level <= 4) return 'Intermédiaire';
  if (level <= 6) return 'Expert';
  if (level <= 8) return 'Pro';
  return 'Elite';
}

export function formatFollowerCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

export function formatTipCount(wins: number, total: number): string {
  return `${wins}/${total}`;
}

export function formatForm(form: ('W' | 'L')[]): string {
  return form.join('');
}