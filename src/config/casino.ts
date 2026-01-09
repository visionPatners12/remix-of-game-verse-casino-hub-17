// Default casino commission rate (fallback if DB is unavailable)
export const DEFAULT_CASINO_COMMISSION_RATE = 10; // 10%

// Helper to calculate net pot after commission
export const calculateNetPot = (grossPot: number, commissionRate: number = DEFAULT_CASINO_COMMISSION_RATE) => {
  return grossPot * (1 - commissionRate / 100);
};

// Helper to calculate commission amount
export const calculateCommission = (amount: number, commissionRate: number = DEFAULT_CASINO_COMMISSION_RATE) => {
  return amount * (commissionRate / 100);
};
