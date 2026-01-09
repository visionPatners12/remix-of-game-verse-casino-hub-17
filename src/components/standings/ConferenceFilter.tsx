import { Badge } from '@/components/ui/badge';

interface ConferenceFilterProps {
  conferences: string[];
  selectedConference: string | null;
  onConferenceChange: (conference: string | null) => void;
}

export function ConferenceFilter({
  conferences,
  selectedConference,
  onConferenceChange,
}: ConferenceFilterProps) {
  if (conferences.length === 0) return null;

  return (
    <div className="bg-background px-4 py-2 border-b border-border">
      <div className="flex gap-2 overflow-x-auto pb-1">
        
        {conferences.map((conference) => {
          const isSelected = selectedConference === conference;
          
          return (
            <Badge
              key={conference}
              variant={isSelected ? "default" : "secondary"}
              className={`
                shrink-0 cursor-pointer transition-colors duration-200 px-3 py-1.5
                ${isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
              onClick={() => onConferenceChange(conference)}
            >
              <span className="text-xs font-medium">{conference}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
