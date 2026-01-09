import { TeamStandingDisplay } from '../../../hooks/useTeamStandingsForDisplay';

interface GenericStatsCardProps {
  standing: TeamStandingDisplay;
}

export function GenericStatsCard({ standing }: GenericStatsCardProps) {
  const stats = standing.raw_stats || {};
  
  // Filter out nested objects and null values
  const flatStats = Object.entries(stats).filter(([key, value]) => {
    return value !== null && 
           value !== undefined && 
           typeof value !== 'object' &&
           key !== 'total' &&
           key !== 'home' &&
           key !== 'away';
  });

  // Split into pairs for table rows
  const rows: [string, any][][] = [];
  for (let i = 0; i < flatStats.length; i += 4) {
    rows.push(flatStats.slice(i, i + 4));
  }

  const formatLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="text-base font-semibold">{standing.stage || 'Season'}</h3>
        {standing.group_name && (
          <span className="text-xs text-muted-foreground">{standing.group_name}</span>
        )}
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-border">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/30">
                {row.map(([key, value]) => (
                  <>
                    <td className="py-1.5 px-2 font-medium text-muted-foreground">{formatLabel(key)}</td>
                    <td className="py-1.5 px-2 text-right">{value}</td>
                  </>
                ))}
                {/* Fill empty cells if less than 4 items */}
                {row.length < 4 && (
                  <td colSpan={(4 - row.length) * 2}></td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
