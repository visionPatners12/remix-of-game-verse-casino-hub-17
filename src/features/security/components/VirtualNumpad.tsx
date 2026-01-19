import React from 'react';
import { motion } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualNumpadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  disabled?: boolean;
  showBiometric?: boolean;
}

const VirtualNumpad: React.FC<VirtualNumpadProps> = ({
  onKeyPress,
  onDelete,
  onBiometric,
  disabled = false,
  showBiometric = false,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['biometric', '0', 'delete'],
  ];

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    
    if (key === 'delete') {
      onDelete();
    } else if (key === 'biometric') {
      onBiometric?.();
    } else {
      onKeyPress(key);
    }
  };

  const renderKey = (key: string, rowIndex: number, colIndex: number) => {
    const isSpecial = key === 'delete' || key === 'biometric';
    const isBiometric = key === 'biometric';
    const isDelete = key === 'delete';

    // Hide biometric button if not enabled
    if (isBiometric && !showBiometric) {
      return <div key={`${rowIndex}-${colIndex}`} className="w-20 h-16" />;
    }

    return (
      <motion.button
        key={`${rowIndex}-${colIndex}`}
        type="button"
        disabled={disabled}
        onClick={() => handleKeyPress(key)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          "w-20 h-16 rounded-2xl flex items-center justify-center",
          "text-2xl font-semibold transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          isSpecial
            ? "bg-transparent text-muted-foreground hover:bg-muted/50"
            : "bg-muted/30 text-foreground hover:bg-muted/50 active:bg-muted/70"
        )}
      >
        {isDelete ? (
          <Delete className="w-6 h-6" />
        ) : isBiometric ? (
          <Fingerprint className="w-6 h-6" />
        ) : (
          key
        )}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-6">
          {row.map((key, colIndex) => renderKey(key, rowIndex, colIndex))}
        </div>
      ))}
    </div>
  );
};

export default VirtualNumpad;
