import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Debug panel for testing wallet integration
 * Placeholder component for testing purposes
 */
export const WalletDebugPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Status</Badge>
              <span className="text-sm text-muted-foreground">
                Wallet debug functionality placeholder
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              This component is ready for future wallet debugging features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};