export const transactionService = {
  validateAmount: (amount: number) => {
    return amount > 0 && amount < 1000000;
  },
  formatTransactionId: (id: string) => {
    return id ? `#${id.slice(0, 8)}` : '';
  }
};