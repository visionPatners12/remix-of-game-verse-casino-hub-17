// Swap Page - Native design with PWA safe-area support
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { SwapWidget } from '@/features/swap';
import { BaseHeader } from '@/components/shared/BaseHeader';

export default function SwapPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with PWA safe-area support */}
      <BaseHeader
        title="Swap"
        onBack={() => navigate('/wallet', { replace: true })}
        rightContent={
          <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <SwapWidget />
        </motion.div>

        {/* Powered by LI.FI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-4 text-xs text-muted-foreground"
        >
          Powered by LI.FI
        </motion.div>
      </main>
    </div>
  );
}
