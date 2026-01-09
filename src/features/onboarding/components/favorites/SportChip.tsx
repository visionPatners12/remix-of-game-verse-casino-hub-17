import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType } from 'react';

interface SportChipProps {
  id: string;
  name: string;
  icon?: ComponentType<any>;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export const SportChip = ({
  id,
  name,
  icon: Icon,
  isSelected,
  onToggle,
  disabled = false,
}: SportChipProps) => {
  return (
    <button
      onClick={() => onToggle(id)}
      disabled={disabled}
      className={cn(
        "relative min-h-[44px] w-full px-2 py-2 rounded-[16px] border-2 transition-all duration-200",
        "bg-card hover:bg-card/80 active:scale-[0.98] focus-ring",
        "text-left flex items-center gap-1.5",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/60 hover:border-border shadow-sm",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100"
      )}
    >
      {/* Sport Icon */}
      {Icon && (
        <div className="flex-shrink-0">
          <Icon className="w-[18px] h-[18px] text-muted-foreground" />
        </div>
      )}
      
      {/* Sport Name */}
      <span className={cn(
        "flex-1 text-[13px] font-semibold text-foreground truncate leading-tight",
        "min-w-0" // Allow text to truncate properly
      )}>
        {name}
      </span>

      {/* Selection Check */}
      {isSelected && (
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
};