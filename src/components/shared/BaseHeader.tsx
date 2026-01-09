import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface BaseHeaderProps {
  title?: string;
  onBack?: () => void;
  rightContent?: ReactNode;
  showBack?: boolean;
  sticky?: boolean;
  className?: string;
}

export function BaseHeader({ 
  title, 
  onBack, 
  rightContent,
  showBack = true,
  sticky = true,
  className = ''
}: BaseHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = onBack || (() => navigate(-1));
  
  return (
    <div 
      className={`${sticky ? 'sticky top-0' : ''} z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border ${className}`}
      style={{ paddingTop: 'var(--safe-area-inset-top)' }}
    >
      <div className="flex items-center h-14 px-4">
        <div className="flex items-center gap-2 flex-1">
          {showBack ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack} 
              className="p-2 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-9" />
          )}
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        {rightContent || <div className="w-9" />}
      </div>
    </div>
  );
}
