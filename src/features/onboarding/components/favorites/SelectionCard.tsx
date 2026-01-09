import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SelectionCardProps {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

export const SelectionCard = ({
  id,
  name,
  logo,
  description,
  isSelected,
  onToggle,
  disabled = false,
  className,
  compact = false,
}: SelectionCardProps) => {
  const isMobile = useIsMobile();
  const isCompact = compact || isMobile;
  return (
    <button
      onClick={() => onToggle(id)}
      disabled={disabled}
      className={cn(
        "relative rounded-xl border-2 transition-all duration-200",
        "bg-card hover:bg-card/80 active:scale-[0.98]",
        "text-left w-full group",
        isCompact ? "p-3" : "p-4",
        isSelected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/20"
          : "border-border/60 hover:border-border shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Selection Indicator */}
      <div
        className={cn(
          "absolute rounded-full border-2 transition-all duration-200 flex items-center justify-center",
          isCompact 
            ? "top-2 right-2 w-4 h-4"
            : "top-3 right-3 w-6 h-6",
          isSelected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 group-hover:border-muted-foreground/60"
        )}
      >
        {isSelected && <Check className={isCompact ? "w-3 h-3" : "w-4 h-4"} />}
      </div>

      {/* Content */}
      <div className={cn(
        "flex items-center gap-3",
        isCompact ? "pr-6" : "pr-8"
      )}>
        {logo && (
          <div className={cn(
            "flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden border border-border/20",
            isCompact ? "w-10 h-10" : "w-12 h-12"
          )}>
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span class="text-primary font-bold ${isCompact ? 'text-sm' : 'text-lg'}">${name.charAt(0).toUpperCase()}</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium text-foreground truncate",
            isCompact ? "text-sm" : "text-base"
          )}>{name}</h3>
          {description && (
            <p className={cn(
              "text-muted-foreground truncate",
              isCompact ? "text-xs" : "text-sm mt-1"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};