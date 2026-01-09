import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingStepProps } from '@/features/onboarding/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface FavoriteStepLayoutProps extends OnboardingStepProps {
  title: string;
  subtitle: string;
  selectedCount: number;
  maxCount: number;
  isLoading?: boolean;
  onContinue: () => void;
  canContinue: boolean;
  children: React.ReactNode;
  searchComponent?: React.ReactNode;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => (
  <div className="flex items-center justify-center gap-1.5 mt-2">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "h-1.5 rounded-full transition-all duration-300",
          index < currentStep 
            ? 'bg-primary w-8' 
            : index === currentStep 
              ? 'bg-primary/40 w-6' 
              : 'bg-muted w-4'
        )}
      />
    ))}
  </div>
);

export const FavoriteStepLayout = ({
  title,
  subtitle,
  selectedCount,
  maxCount,
  isLoading = false,
  onContinue,
  canContinue,
  onBack,
  children,
  searchComponent,
}: FavoriteStepLayoutProps) => {
  const { t } = useTranslation('auth');
  const isMobile = useIsMobile();

  // Determine current step based on title
  const getCurrentStep = () => {
    if (title.includes('Sports') || title.includes('sports') || title.includes('favoris')) return 3;
    if (title.includes('Leagues') || title.includes('Ligues') || title.includes('ligas')) return 4;
    if (title.includes('Teams') || title.includes('Équipes') || title.includes('Equipos')) return 5;
    return 3; // fallback
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col relative safe-area-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="relative flex items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="z-10 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="absolute inset-0 flex items-center justify-center px-4 py-3">
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {title}
              </h1>
              <ProgressBar currentStep={getCurrentStep()} totalSteps={6} />
            </div>
          </div>
        </div>
      </header>

      {/* Search Component */}
      {searchComponent && (
        <div className="border-b border-border/30 bg-card/30 backdrop-blur-sm px-4 py-3">
          {searchComponent}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-40 overflow-y-auto">
        <p className="text-sm text-muted-foreground leading-relaxed text-center mb-6">
          {subtitle}
        </p>
        {children}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4 border-t border-border/30">
        <Button
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className={cn(
            "w-full h-14 text-base font-semibold rounded-2xl",
            "bg-primary hover:bg-primary/90",
            "shadow-lg shadow-primary/20",
            "transition-all duration-200",
            "group"
          )}
          size="lg"
        >
          <span>{isLoading ? t('onboarding.steps.common.saving') : t('onboarding.steps.common.continue')}</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-foreground/20 text-sm">
            {selectedCount}/{maxCount}
          </span>
          <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        
        <button 
          onClick={onContinue}
          className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors rounded-lg px-2 py-2"
        >
          {t('onboarding.steps.common.skipForNow')}
        </button>
        
        <div className="h-6" /> {/* Safe area for gesture bar */}
      </div>
    </div>
  );
};
