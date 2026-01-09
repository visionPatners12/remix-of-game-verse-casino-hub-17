import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SportIcon } from '@/components/ui/sport-icon';
import { CountryFlag } from '@/components/ui/country-flag';

interface DetailPageHeaderProps {
  onBack?: () => void;
  sportSlug?: string | null;
  sportName?: string | null;
  countryName?: string | null;
  countrySlug?: string | null;
}

export function DetailPageHeader({ 
  onBack, 
  sportSlug, 
  sportName,
  countryName,
  countrySlug
}: DetailPageHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = onBack || (() => navigate(-1));
  
  return (
    <div 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20 flex items-center px-4"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-top))'
      }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className="p-2 -ml-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      {/* Badge Sport */}
      {sportSlug && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs ml-2">
          <SportIcon slug={sportSlug} className="h-3.5 w-3.5" />
          {sportName && <span className="font-medium capitalize">{sportName}</span>}
        </div>
      )}
      
      {/* Badge Pays (uniquement si fourni - pour les leagues) */}
      {countryName && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs ml-2">
          <CountryFlag countryName={countryName} countrySlug={countrySlug} size={14} />
          <span className="font-medium">{countryName}</span>
        </div>
      )}
      
      {/* Spacer pour équilibrer le layout */}
      <div className="flex-1" />
    </div>
  );
}
