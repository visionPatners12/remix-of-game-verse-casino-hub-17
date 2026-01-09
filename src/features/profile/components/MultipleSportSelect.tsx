import React from 'react';
import { Label } from '@/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sport } from '@/hooks/useSports';

interface MultipleSportSelectProps {
  sports: Sport[];
  selectedSportIds: string[];
  onToggleSport: (sportId: string) => void;
  maxSelections?: number;
  loading?: boolean;
}

export function MultipleSportSelect({ 
  sports, 
  selectedSportIds, 
  onToggleSport, 
  maxSelections = 5,
  loading = false 
}: MultipleSportSelectProps) {
  const selectedSports = sports.filter(sport => selectedSportIds.includes(sport.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Sports favoris</Label>
        <span className="text-sm text-muted-foreground">
          {selectedSportIds.length}/{maxSelections}
        </span>
      </div>

      {/* Selected Sports */}
      {selectedSports.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Sélectionnés</Label>
          <div className="flex flex-wrap gap-2">
            {selectedSports.map((sport) => {
              const IconComponent = sport.icon;
              return (
                <Badge
                  key={sport.id}
                  variant="default"
                  className="flex items-center gap-2 px-3 py-2 h-8"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{sport.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                    onClick={() => onToggleSport(sport.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* All Sports Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {sports.map((sport) => {
          const IconComponent = sport.icon;
          const isSelected = selectedSportIds.includes(sport.id);
          const isDisabled = !isSelected && selectedSportIds.length >= maxSelections;
          
          return (
            <Button
              key={sport.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center gap-2 justify-start h-10 px-3",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isDisabled && onToggleSport(sport.id)}
              disabled={isDisabled || loading}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate">{sport.name}</span>
              {isSelected && (
                <Check className="w-3 h-3 ml-auto" />
              )}
            </Button>
          );
        })}
      </div>

      {selectedSportIds.length >= maxSelections && (
        <p className="text-xs text-muted-foreground">
          Vous avez atteint la limite de {maxSelections} sports.
        </p>
      )}
    </div>
  );
}