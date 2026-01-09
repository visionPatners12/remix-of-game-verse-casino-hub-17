
import React from 'react';
import { ReactiveWalletCard } from './ReactiveWalletCard';
import { ReactiveTransactionsList } from './ReactiveTransactionsList';

export const OptimizedWalletPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Reactive Wallet Cards */}
      <ReactiveWalletCard showActions={true} compact={false} />
      
      {/* Reactive Transactions List */}
      <ReactiveTransactionsList />
    </div>
  );
};
