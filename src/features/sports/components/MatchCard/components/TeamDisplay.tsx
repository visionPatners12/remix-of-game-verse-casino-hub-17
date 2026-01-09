import React from "react";
import { OptimizedTeamLogo } from "@/components/ui/optimized-team-logo";

interface Team {
  name: string;
  image?: string | null;
}

interface Score {
  home: number;
  away: number;
}

interface TeamDisplayProps {
  teamA?: Team;
  teamB?: Team;
  viewMode?: 'grid' | 'list' | 'horizontal';
  score?: Score;
  hideImages?: boolean;
}

export function TeamDisplay({ teamA, teamB, viewMode = 'grid', score, hideImages = false }: TeamDisplayProps) {
  const TeamAvatar = ({ team, variant }: { team?: Team; variant: "A" | "B" }) => (
    <OptimizedTeamLogo
      src={team?.image}
      alt={team?.name || `Équipe ${variant}`}
      teamName={team?.name || `Team ${variant}`}
      variant={variant}
      size="sm"
      lazy={true}
    />
  );

  // Layout uniforme pour tous les modes - noms toujours verticaux
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Team Logos - Superposés à moitié */}
      {!hideImages && (
        <div className="relative flex items-center">
          <TeamAvatar team={teamA} variant="A" />
          <div className="relative -ml-2 z-5">
            <TeamAvatar team={teamB} variant="B" />
          </div>
        </div>
      )}

      {/* Team Names - toujours en vertical pour tous les modes */}
      <div className="flex flex-col gap-px min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">
            {teamA?.name || "Équipe A"}
          </span>
          {score && (
            <span className="font-bold text-lg text-primary flex-shrink-0">
              {score.home}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-muted-foreground truncate">
            {teamB?.name || "Équipe B"}
          </span>
          {score && (
            <span className="font-bold text-lg text-primary flex-shrink-0">
              {score.away}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}