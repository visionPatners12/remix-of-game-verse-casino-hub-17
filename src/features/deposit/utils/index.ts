// Export all deposit utilities
export { cryptoOptions } from '../config/cryptoConfig';

// Fee rates for withdrawals
export const FEE_RATES = {
  crypto: {
    bitcoin: 0.0005,
    ethereum: 0.002,
    usdt: 0.001,
    usdc: 0.001
  },
  mobileMoney: 0.02,
  bankTransfer: 0.015,
  paypal: 0.025
} as const;

// Calculate withdrawal fee based on method and amount
export const calculateWithdrawalFee = (
  method: 'crypto' | 'mobileMoney' | 'bankTransfer' | 'paypal',
  amount: number,
  cryptoType?: keyof typeof FEE_RATES.crypto
): number => {
  if (method === 'crypto' && cryptoType) {
    return FEE_RATES.crypto[cryptoType] || 0.001;
  }
  
  let feeRate: number;
  switch (method) {
    case 'mobileMoney':
      feeRate = FEE_RATES.mobileMoney;
      break;
    case 'bankTransfer':
      feeRate = FEE_RATES.bankTransfer;
      break;
    case 'paypal':
      feeRate = FEE_RATES.paypal;
      break;
    default:
      feeRate = 0.02;
  }
  
  const calculatedFee = amount * feeRate;
  return Math.round(calculatedFee * 100) / 100;
};