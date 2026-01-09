import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType } from 'react';

interface SelectedSport {
  id: string;
  name: string;
  icon?: ComponentType<any>;
}

interface SelectedSportsPanelProps {
  selectedSports: SelectedSport[];
  onRemove: (id: string) => void;
  maxCount: number;
}

export const SelectedSportsPanel = ({
  selectedSports,
  onRemove,
  maxCount,
}: SelectedSportsPanelProps) => {
  if (selectedSports.length === 0) return null;

  return (
    <div className="px-2 mb-6">
      <div className="border border-border/40 rounded-xl p-4 min-h-[100px]">
        <div className="flex flex-wrap gap-2.5 min-h-[60px] items-start">
          {selectedSports.map((sport) => (
            <div
              key={sport.id}
              className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-2 text-sm font-medium"
            >
              {sport.icon && (
                <sport.icon className="w-4 h-4" />
              )}
              <span className="text-xs">{sport.name}</span>
              <button
                onClick={() => onRemove(sport.id)}
                className="w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors focus-ring ml-1"
                aria-label={`Remove ${sport.name}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};