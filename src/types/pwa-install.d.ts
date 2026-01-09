import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pwa-install': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'manifest-url'?: string;
          name?: string;
          description?: string;
          icon?: string;
          'manual-apple'?: string;
          'manual-chrome'?: string;
          'disable-install-description'?: string;
          'disable-screenshots'?: string;
          'disable-close'?: string;
          'use-local-storage'?: string;
        },
        HTMLElement
      > & { styles?: string };
    }
  }

  interface PWAInstallElement extends HTMLElement {
    // Methods
    showDialog: (force?: boolean) => void;
    hideDialog: () => void;
    install: () => Promise<void>;
    getInstalledRelatedApps: () => Promise<any[]>;
    
    // Readonly properties
    readonly userChoiceResult: 'accepted' | 'dismissed' | '';
    readonly isDialogHidden: boolean;
    readonly isInstallAvailable: boolean;
    readonly isAppleMobilePlatform: boolean;
    readonly isAppleDesktopPlatform: boolean;
    readonly isApple26Plus: boolean;
    readonly isUnderStandaloneMode: boolean;
    readonly isRelatedAppsInstalled: boolean;
  }

  // Custom events
  interface PWAInstallAvailableEvent extends CustomEvent {
    detail: {
      supported: boolean;
    };
  }

  interface PWAUserChoiceResultEvent extends CustomEvent {
    detail: {
      message: 'accepted' | 'dismissed';
    };
  }

  interface PWAInstallHowToEvent extends CustomEvent {
    detail: {
      platform: 'apple' | 'chrome';
    };
  }

  interface PWAInstallGalleryEvent extends CustomEvent {
    detail: {
      step: number;
    };
  }
}

export {};
