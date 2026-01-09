import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { UnifiedButton } from './UnifiedButton';

// ===== UNIFIED MODAL COMPONENT =====
// Consolidates all modal patterns: NFTDetailModal, TermsModal, WalletTokensModal, etc.

export interface UnifiedModalProps {
  // Core modal props
  isOpen: boolean;
  onClose: () => void;
  
  // Content props
  title?: string;
  description?: string;
  children?: React.ReactNode;
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  
  // Styling
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  contentClassName?: string;
  
  // Behavior
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]'
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  size = 'md',
  className,
  contentClassName,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}) => {
  
  const handleOpenChange = (open: boolean) => {
    if (!open && (closeOnEscape || closeOnOverlayClick)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          'gap-6',
          contentClassName
        )}
        aria-describedby={description ? undefined : "modal-content"}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </button>
        )}

        {/* Header */}
        {(title || description) && (
          <DialogHeader className={cn("space-y-2", showCloseButton && "pr-8")}>
            {title && (
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Content */}
        <div className={cn("flex-1", className)} id="modal-content">
          {children}
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
            {secondaryAction && (
              <UnifiedButton
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                label={secondaryAction.label}
                className="sm:mr-auto"
              />
            )}
            {primaryAction && (
              <UnifiedButton
                variant={primaryAction.variant || 'default'}
                onClick={primaryAction.onClick}
                label={primaryAction.label}
                isLoading={primaryAction.isLoading}
                buttonType="submit"
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};