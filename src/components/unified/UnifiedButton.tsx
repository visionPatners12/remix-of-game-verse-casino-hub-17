import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// ===== UNIFIED BUTTON COMPONENT =====
// Consolidates all button variants: AnimatedOddsButton, MobileAnimatedOddsButton, SubmitButton, etc.

const unifiedButtonVariants = cva(
  "relative transition-all duration-200 ease-out",
  {
    variants: {
      buttonType: {
        default: "",
        odds: "flex-col gap-1 h-auto p-3 text-sm font-medium min-h-[60px]",
        mobileOdds: "flex items-center justify-between p-2 h-12 text-sm",
        submit: "w-full",
        action: "hover:scale-105 active:scale-95",
      },
      animation: {
        none: "",
        up: "animate-pulse bg-green-50 border-green-200 text-green-700",
        down: "animate-pulse bg-red-50 border-red-200 text-red-700",
        loading: "opacity-70",
      },
      state: {
        default: "",
        selected: "ring-2 ring-primary border-primary bg-primary/10",
        disabled: "opacity-50 cursor-not-allowed",
        error: "border-destructive text-destructive",
      }
    },
    defaultVariants: {
      buttonType: "default",
      animation: "none",
      state: "default"
    }
  }
);

export interface UnifiedButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof unifiedButtonVariants> {
  // Content props
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  
  // State props
  isLoading?: boolean;
  isSelected?: boolean;
  loadingText?: string;
  
  // Animation props
  animationDirection?: 'up' | 'down' | 'none';
  showAnimationIcon?: boolean;
  
  // Styling
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  asChild?: boolean;
}
export const UnifiedButton = React.forwardRef<HTMLButtonElement, UnifiedButtonProps>(
  ({
    label,
    sublabel,
    icon,
    badge,
    isLoading = false,
    isSelected = false,
    loadingText,
    animationDirection = 'none',
    showAnimationIcon = false,
    buttonType = 'default',
    variant = 'default',
    size = 'default',
    className,
    children,
    disabled,
    ...props
  }, ref) => {
    // Determine animation state
    const animation = isLoading ? 'loading' : animationDirection;
    const state = disabled ? 'disabled' : isSelected ? 'selected' : 'default';

    // Render animation icon
    const renderAnimationIcon = () => {
      if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
      if (!showAnimationIcon || animationDirection === 'none') return null;
      
      return animationDirection === 'up' 
        ? <ChevronUp className="h-3 w-3 text-green-600" />
        : <ChevronDown className="h-3 w-3 text-red-600" />;
    };

    // Render content based on button type
    const renderContent = () => {
      if (children) return children;

      switch (buttonType) {
        case 'odds':
        case 'mobileOdds':
          return (
            <>
              {buttonType === 'mobileOdds' ? (
                <>
                  <span className="flex-1 text-left truncate">{label}</span>
                  <div className="flex items-center gap-1">
                    {renderAnimationIcon()}
                    <span className="font-bold">{sublabel}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-xs truncate">{label}</span>
                    {renderAnimationIcon()}
                  </div>
                  {sublabel && (
                    <span className="font-bold text-sm">{sublabel}</span>
                  )}
                </>
              )}
            </>
          );
          
        case 'submit':
          return (
            <>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? loadingText || 'Chargement...' : label || 'Soumettre'}
            </>
          );
          
        default:
          return (
            <>
              {icon && <span className="mr-2">{icon}</span>}
              {label}
              {badge && (
                <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {badge}
                </span>
              )}
            </>
          );
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={cn(
          unifiedButtonVariants({ buttonType, animation, state }),
          className
        )}
        {...props}
      >
        {renderContent()}
      </Button>
    );
  }
);

UnifiedButton.displayName = "UnifiedButton";