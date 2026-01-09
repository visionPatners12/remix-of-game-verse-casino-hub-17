import React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { cn } from '@/lib/utils';

interface PinInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
  value = '',
  onChange,
  onComplete,
  maxLength = 6,
  disabled = false,
  error = false,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <OTPInput
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        maxLength={maxLength}
        inputMode="numeric"
        disabled={disabled}
        autoComplete="one-time-code"
        containerClassName="flex items-center gap-2"
        render={({ slots }) => (
          <div className="flex items-center gap-2">
            {slots.map((slot, i) => (
              <PinSlot 
                key={i} 
                slot={slot} 
                error={error}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      />
    </div>
  );
};

interface PinSlotProps {
  slot: {
    char: string | null;
    placeholderChar: string;
    isActive: boolean;
  };
  error: boolean;
  disabled: boolean;
}

const PinSlot: React.FC<PinSlotProps> = ({ slot, error, disabled }) => {
  const { char, isActive } = slot;
  
  return (
    <div
      className={cn(
        "relative flex h-12 w-12 items-center justify-center text-center text-lg font-medium transition-all duration-200",
        "border-2 rounded-lg bg-background",
        {
          // Normal state
          "border-border text-foreground": !isActive && !error && !disabled,
          // Active state
          "border-primary ring-2 ring-primary/20": isActive && !error && !disabled,
          // Error state
          "border-destructive text-destructive ring-2 ring-destructive/20": error,
          // Disabled state
          "border-muted text-muted-foreground bg-muted/50 cursor-not-allowed": disabled,
          // Filled state
          "border-primary/50 bg-primary/5": char && !error && !disabled,
        }
      )}
      data-active={isActive}
    >
      {char || (isActive && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-0.5 animate-pulse bg-primary" />
        </div>
      ))}
    </div>
  );
};