import React from 'react';
import { Layout } from '@/components/Layout';
// OLD VERSION - Commented for migration (safe rollback)
// import { WalletDebugPanel } from '@/components/debug/WalletDebugPanel';

// NEW VERSION - Using local component for now
import { WalletDebugPanel } from '@/components/debug/WalletDebugPanel';

/**
 * Debug page for testing and validating wallet integration
 * Access via /wallet-debug (for testing purposes)
 */
const WalletDebug = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Wallet Integration Debug</h1>
          <p className="text-muted-foreground">
            This page helps validate the wallet auto-connection and persistence flow for Supabase users.
          </p>
        </div>
        <WalletDebugPanel />
      </div>
    </Layout>
  );
};

export default WalletDebug;