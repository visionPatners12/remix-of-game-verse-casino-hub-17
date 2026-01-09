import { BaseHeader } from '@/components/shared/BaseHeader';

interface PostDetailHeaderProps {
  onNavigateBack: () => void;
}

export function PostDetailHeader({ onNavigateBack }: PostDetailHeaderProps) {
  return (
    <BaseHeader 
      title="Post"
      onBack={onNavigateBack}
      showBack={true}
    />
  );
}
