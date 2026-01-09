import React, { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';

type ActionType = 'bet' | 'follow' | 'comment' | 'create' | 'wallet';

interface WebActionGateProps {
  children: React.ReactNode;
  action: ActionType;
  /** If true, allows the action even for unauthenticated users */
  allowGuest?: boolean;
  /** Called when the action is blocked - use to show modal */
  onBlocked?: () => void;
}

/**
 * WebActionGate wraps interactive elements to limit actions for web visitors.
 * 
 * On mobile web (non-PWA, non-authenticated):
 * - Intercepts click events on the wrapper
 * - Shows an installation modal instead of performing the action
 * 
 * For authenticated users or installed PWA:
 * - Passes through clicks normally
 */
export function WebActionGate({ 
  children, 
  action, 
  allowGuest = false,
  onBlocked 
}: WebActionGateProps) {
  const { authenticated } = usePrivy();
  const { isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // Determine if the user can perform the action
  const canPerformAction = authenticated || isInstalled || allowGuest;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (canPerformAction) {
      // User is authenticated or has the app installed - allow the action
      return;
    }

    // Prevent the original action and show the install modal
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
    onBlocked?.();
  }, [canPerformAction, onBlocked]);

  const handleContinueWeb = useCallback(() => {
    // Allow limited browsing without action
    setShowModal(false);
  }, []);

  // If user can perform the action, just render children normally
  if (canPerformAction) {
    return <>{children}</>;
  }

  // Wrap children in a div that intercepts clicks
  return (
    <>
      <div onClick={handleClick} className="contents">
        {children}
      </div>
      <InstallAppModal
        open={showModal}
        onOpenChange={setShowModal}
        action={action}
        onContinueWeb={handleContinueWeb}
      />
    </>
  );
}
