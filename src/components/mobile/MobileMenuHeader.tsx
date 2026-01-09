import { BaseHeader } from '@/components/shared/BaseHeader';

interface MobileMenuHeaderProps {
  onBack: () => void;
  username?: string;
}

export function MobileMenuHeader({ onBack, username }: MobileMenuHeaderProps) {
  return (
    <BaseHeader 
      title={username ? `@${username}` : undefined}
      onBack={onBack}
      showBack={true}
    />
  );
}
