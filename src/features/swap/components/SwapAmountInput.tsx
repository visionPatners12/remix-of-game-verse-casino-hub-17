// Amount input with max/percentage buttons - Native design
import React from 'react';
import { motion } from 'framer-motion';
import { formatUSD } from '../utils/formatters';
import type { SwapTokenWithBalance } from '../types';

interface SwapAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  tokenBalance?: SwapTokenWithBalance;
  disabled?: boolean;
  readOnly?: boolean;
  usdValue?: string;
}

export function SwapAmountInput({
  value,
  onChange,
  tokenBalance,
  disabled,
  readOnly,
  usdValue,
}: SwapAmountInputProps) {
  const handlePercentage = (percent: number) => {
    if (!tokenBalance) return;
    const balance = Number(tokenBalance.balance) / 10 ** tokenBalance.decimals;
    const amount = (balance * percent / 100).toFixed(6);
    onChange(amount);
  };

  const percentButtons = [25, 50, 75, 100];

  const formattedBalance = tokenBalance
    ? (Number(tokenBalance.balance) / 10 ** tokenBalance.decimals).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : null;

  return (
    <div className="space-y-1">
      {/* Balance */}
      {tokenBalance && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            Balance: {formattedBalance}
          </span>
        </div>
      )}
      
      {/* Input */}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Only allow valid decimal numbers
          const val = e.target.value;
          if (val === '' || /^\d*\.?\d*$/.test(val)) {
            onChange(val);
          }
        }}
        disabled={disabled}
        readOnly={readOnly}
        placeholder="0"
        className={`w-full text-3xl font-semibold bg-transparent outline-none placeholder:text-muted-foreground/40 ${
          readOnly ? 'text-muted-foreground' : 'text-foreground'
        }`}
      />
      
      {/* USD value */}
      {usdValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          ≈ {formatUSD(usdValue)}
        </motion.div>
      )}

      {/* Percentage buttons - only show when editable and has balance */}
      {!readOnly && tokenBalance && (
        <div className="flex gap-2 pt-2">
          {percentButtons.map(percent => (
            <button
              key={percent}
              onClick={() => handlePercentage(percent)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                percent === 100
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {percent === 100 ? 'MAX' : `${percent}%`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
