import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui';
import { cn } from '@/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// ===== UNIFIED CARD COMPONENT =====
// Consolidates all card patterns: MatchCard variants, GridViewCard, ListViewCard, etc.

const unifiedCardVariants = cva(
  "group cursor-pointer transition-all duration-200",
  {
    variants: {
      cardType: {
        default: "hover:shadow-md",
        match: "hover:shadow-lg hover:scale-[1.02] bg-card border border-yellow-400 rounded-lg shadow-yellow-400/20 h-full flex flex-col",
        list: "flex items-center p-4 space-x-4 hover:bg-muted/50",
        horizontal: "flex items-center p-3 space-x-3 min-h-[80px]",
        grid: "aspect-square p-4 flex flex-col justify-between",
        compact: "p-2 min-h-[60px] flex items-center justify-between",
      },
      size: {
        sm: "p-1",
        md: "p-4",
        lg: "p-6",
      },
      interactive: {
        none: "",
        hover: "hover:bg-muted/30",
        selected: "ring-2 ring-primary border-primary bg-primary/5",
        disabled: "opacity-50 cursor-not-allowed",
      }
    },
    defaultVariants: {
      cardType: "default",
      size: "md",
      interactive: "hover"
    }
  }
);

export interface UnifiedCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedCardVariants> {
  // Content props
  title?: string;
  description?: string;
  subtitle?: string;
  children?: React.ReactNode;
  
  // Header content
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  
  // Media
  image?: string;
  imageAlt?: string;
  icon?: React.ReactNode;
  
  // State
  isSelected?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  
  // Actions
  onClick?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  
  // Layout
  showHeader?: boolean;
  showFooter?: boolean;
  contentAlignment?: 'left' | 'center' | 'right';
}

export const UnifiedCard: React.FC<UnifiedCardProps> = ({
  title,
  description,
  subtitle,
  children,
  headerContent,
  footerContent,
  image,
  imageAlt,
  icon,
  isSelected = false,
  isDisabled = false,
  isLoading = false,
  onClick,
  onSecondaryAction,
  secondaryActionLabel,
  showHeader = true,
  showFooter = false,
  contentAlignment = 'left',
  cardType = 'default',
  size = 'md',
  className,
  ...props
}) => {
  
  // Determine interactive state
  const interactive = isDisabled ? 'disabled' : isSelected ? 'selected' : onClick ? 'hover' : 'none';
  
  // Handle click
  const handleClick = () => {
    if (!isDisabled && !isLoading && onClick) {
      onClick();
    }
  };

  // Render content based on card type
  const renderContent = () => {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }[contentAlignment];

    switch (cardType) {
      case 'list':
      case 'horizontal':
        return (
          <div className="flex items-center w-full">
            {/* Media */}
            {(image || icon) && (
              <div className="flex-shrink-0 mr-4">
                {image ? (
                  <img 
                    src={image} 
                    alt={imageAlt || title || ''} 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : icon}
              </div>
            )}
            
            {/* Content */}
            <div className={cn("flex-1 min-w-0", alignmentClass)}>
              {title && (
                <h3 className="font-medium text-foreground truncate">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
              )}
            </div>
            
            {/* Footer content (e.g., odds, actions) */}
            {footerContent && (
              <div className="flex-shrink-0 ml-4">
                {footerContent}
              </div>
            )}
          </div>
        );
        
      case 'compact':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {icon}
              <span className="text-sm font-medium truncate">{title}</span>
            </div>
            {footerContent}
          </div>
        );
        
      default:
        return (
          <>
            {/* Header */}
            {showHeader && (title || description || headerContent) && (
              <CardHeader className={size === 'sm' ? 'p-3' : undefined}>
                {headerContent || (
                  <>
                    {title && <CardTitle className="text-base">{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                  </>
                )}
              </CardHeader>
            )}
            
            {/* Content */}
            <CardContent className={cn(
              size === 'sm' ? 'p-3' : 'pt-0',
              alignmentClass
            )}>
              {image && (
                <img 
                  src={image} 
                  alt={imageAlt || title || ''} 
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}
              {children}
            </CardContent>
            
            {/* Footer */}
            {showFooter && footerContent && (
              <CardFooter className={size === 'sm' ? 'p-3' : 'pt-0'}>
                {footerContent}
              </CardFooter>
            )}
          </>
        );
    }
  };

  // For list and horizontal types, don't use Card wrapper
  if (cardType === 'list' || cardType === 'horizontal' || cardType === 'compact') {
    return (
      <div
        className={cn(
          unifiedCardVariants({ cardType, size, interactive }),
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {renderContent()}
      </div>
    );
  }

  // For other types, use Card wrapper
  return (
    <Card
      className={cn(
        unifiedCardVariants({ cardType, size, interactive }),
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </Card>
  );
};