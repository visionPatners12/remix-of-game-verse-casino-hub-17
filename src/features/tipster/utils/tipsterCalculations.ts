// Tipster calculation utilities
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((wins / total) * 100).toFixed(1));
}

export function calculateYield(profit: number, totalStaked: number): number {
  if (totalStaked === 0) return 0;
  return parseFloat(((profit / totalStaked) * 100).toFixed(1));
}

export function calculateROI(profit: number, investment: number): number {
  if (investment === 0) return 0;
  return parseFloat(((profit / investment) * 100).toFixed(1));
}

export function calculateAverageOdds(odds: number[]): number {
  if (odds.length === 0) return 0;
  const sum = odds.reduce((acc, odd) => acc + odd, 0);
  return parseFloat((sum / odds.length).toFixed(2));
}

export function calculateStreak(results: ('W' | 'L')[]): { current: number; type: 'W' | 'L' | null } {
  if (results.length === 0) return { current: 0, type: null };
  
  const lastResult = results[results.length - 1];
  let streak = 1;
  
  for (let i = results.length - 2; i >= 0; i--) {
    if (results[i] === lastResult) {
      streak++;
    } else {
      break;
    }
  }
  
  return { current: streak, type: lastResult };
}

export function calculateMonthlyRevenue(monthlyPrice: number, subscriberCount: number): number {
  return monthlyPrice * subscriberCount;
}

export function calculateTipsterLevel(totalTips: number, winRate: number): number {
  let level = 1;
  
  // Base level on number of tips
  if (totalTips >= 100) level = 2;
  if (totalTips >= 250) level = 3;
  if (totalTips >= 500) level = 4;
  if (totalTips >= 1000) level = 5;
  
  // Bonus level for high win rate
  if (winRate >= 70 && totalTips >= 50) level += 1;
  if (winRate >= 80 && totalTips >= 100) level += 1;
  
  return Math.min(level, 10); // Cap at level 10
}