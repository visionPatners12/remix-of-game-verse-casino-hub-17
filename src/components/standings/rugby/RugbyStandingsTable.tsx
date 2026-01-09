import { RugbyStanding } from '@/types/standings/rugby';
import { RugbyStandingsRow } from './RugbyStandingsRow';
import { groupStandingsByGroupName } from '@/utils/standings/groupByGroupName';

interface RugbyStandingsTableProps {
  standings: RugbyStanding[];
}

export function RugbyStandingsTable({ standings }: RugbyStandingsTableProps) {
  const groupedByGroup = groupStandingsByGroupName(standings);
  const groups = Object.keys(groupedByGroup);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group} className="space-y-2">
          {group !== '__ungrouped__' && groups.length > 1 && (
            <h3 className="text-sm font-semibold px-2 text-foreground">{group}</h3>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-8 md:w-12">Pos</th>
                  <th className="text-left px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground min-w-[120px]">Team</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-8 md:w-12">GP</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-8 md:w-12">W</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-8 md:w-12">D</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-8 md:w-12">L</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-10 md:w-14">PF</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-10 md:w-14">PA</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-10 md:w-14">Diff</th>
                  <th className="text-center px-1 md:px-2 py-2 text-[10px] md:text-xs font-semibold text-muted-foreground w-10 md:w-14">Pts</th>
                </tr>
              </thead>
              <tbody>
                {groupedByGroup[group].map((standing) => (
                  <RugbyStandingsRow key={standing.id} standing={standing} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}