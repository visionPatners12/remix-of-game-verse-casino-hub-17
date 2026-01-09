import { BaseHeader } from '@/components/shared/BaseHeader';
import { ReactNode } from 'react';

interface MobilePageHeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: ReactNode;
  showBack?: boolean;
}

export function MobilePageHeader({ 
  title, 
  onBack, 
  rightContent,
  showBack = true 
}: MobilePageHeaderProps) {
  return (
    <BaseHeader 
      title={title}
      onBack={onBack}
      rightContent={rightContent}
      showBack={showBack}
    />
  );
}
