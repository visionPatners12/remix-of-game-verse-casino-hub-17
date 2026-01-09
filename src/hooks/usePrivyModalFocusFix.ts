import { useEffect } from 'react';
import { isPWA, isIOS } from '@/utils/walletConnectPwa';

/**
 * Hook to fix keyboard not appearing on OTP input in Privy modal on iOS PWA.
 * Uses MutationObserver to detect when the modal changes and force focus on inputs.
 */
export function usePrivyModalFocusFix() {
  useEffect(() => {
    // Only apply fix for iOS PWA
    if (!isPWA() || !isIOS()) return;

    let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const tryFocusInput = (container: Element) => {
      // Look for OTP inputs (usually numeric or tel type)
      const inputs = container.querySelectorAll<HTMLInputElement>(
        'input:not([type="hidden"]):not([disabled])'
      );
      
      if (inputs.length === 0) return;

      // Find OTP input - typically has inputmode="numeric" or is part of OTP group
      const otpInput = Array.from(inputs).find((input) => {
        const inputMode = input.getAttribute('inputmode');
        const type = input.getAttribute('type');
        const autocomplete = input.getAttribute('autocomplete');
        
        return (
          inputMode === 'numeric' ||
          type === 'tel' ||
          type === 'number' ||
          autocomplete?.includes('one-time-code') ||
          input.pattern?.includes('[0-9]')
        );
      });

      const targetInput = otpInput || inputs[0];
      
      // Only focus if not already focused
      if (targetInput && document.activeElement !== targetInput) {
        // Clear any pending focus attempt
        if (focusTimeoutId) clearTimeout(focusTimeoutId);
        
        // Delay to let modal animation complete
        focusTimeoutId = setTimeout(() => {
          targetInput.focus();
          // iOS workaround: click() can help trigger the keyboard
          targetInput.click();
        }, 150);
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
          continue;
        }

        // Check each added node
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          // Look for Privy modal or any dialog
          const modal = 
            node.querySelector('[data-privy-dialog]') ||
            node.querySelector('[data-privy-modal]') ||
            node.querySelector('.privy-dialog') ||
            node.querySelector('[role="dialog"]') ||
            (node.matches('[role="dialog"]') ? node : null) ||
            (node.matches('[data-privy-dialog]') ? node : null);

          if (modal) {
            tryFocusInput(modal);
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also handle touch on inputs in modals to re-trigger focus
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' &&
        target.closest('[role="dialog"], [data-privy-dialog], .privy-dialog')
      ) {
        // Delay focus to work with iOS
        setTimeout(() => {
          (target as HTMLInputElement).focus();
        }, 0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('touchstart', handleTouchStart);
      if (focusTimeoutId) clearTimeout(focusTimeoutId);
    };
  }, []);
}
