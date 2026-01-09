import { FootballStanding } from '@/types/standings/football';
import { FootballStandingsRow } from './FootballStandingsRow';
import { groupStandingsByGroupName } from '@/utils/standings/groupByGroupName';

interface FootballStandingsTableProps {
  standings: FootballStanding[];
}

export function FootballStandingsTable({ standings }: FootballStandingsTableProps) {
  const groupedByGroup = groupStandingsByGroupName(standings);
  const groups = Object.keys(groupedByGroup);

  return (
    <div className="overflow-x-auto">
      {groups.map((group) => (
        <div key={group} className="mb-6">
          {group !== '__ungrouped__' && (
            <h3 className="text-lg font-semibold mb-3 px-3 text-foreground">{group}</h3>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/20">
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pos
            </th>
            <th className="py-3 px-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
              Team
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GP
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              W
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              D
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              L
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GF
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GA
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              +/-
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              PTS
            </th>
            <th className="py-3 px-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Form
            </th>
          </tr>
            </thead>
            <tbody>
              {groupedByGroup[group].map((standing) => (
                <FootballStandingsRow
                  key={standing.id}
                  standing={standing}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}