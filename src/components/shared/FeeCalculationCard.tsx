
import React from 'react';
import { Card, CardContent } from '@/ui';
import { calculateWithdrawalFee } from '@/features/deposit';

interface FeeCalculationCardProps {
  amount: string;
}

export const FeeCalculationCard = ({ amount }: FeeCalculationCardProps) => {
  if (!amount || parseFloat(amount) <= 0) return null;

  const amountNum = parseFloat(amount);
  const fee = calculateWithdrawalFee('mobileMoney', amountNum);
  const total = amountNum - fee;

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Montant:</span>
          <span>${amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Frais (2.5%):</span>
          <span>${fee.toFixed(2)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-medium">
          <span>Vous recevrez:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
