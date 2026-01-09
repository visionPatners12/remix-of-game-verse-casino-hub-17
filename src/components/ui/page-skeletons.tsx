import { Skeleton } from './skeleton';

// Match Details Page Skeleton
export function MatchDetailsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="p-4 space-y-4">
        {/* Teams section */}
        <div className="flex items-center justify-between py-6">
          <div className="flex flex-col items-center gap-2 flex-1">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col items-center gap-2 px-4">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* League info */}
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-border">
        <div className="flex justify-center gap-6 py-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// League Page Skeleton
export function LeaguePageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-border">
        <div className="flex justify-center gap-6 py-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Standings skeleton */}
      <div className="p-4 space-y-3">
        {/* Table header */}
        <div className="flex items-center gap-3 py-2 border-b border-border">
          <Skeleton className="w-6 h-4" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="w-6 h-6 rounded-sm" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Team Page Skeleton
export function TeamPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-6 mt-3">
              <div className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Competition selector */}
      <div className="px-4 py-2 border-y border-border">
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-border">
        <div className="flex justify-center gap-6 py-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Match cards skeleton */}
      <div className="divide-y divide-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-10" />
              <div className="flex items-center gap-2 flex-1 justify-end">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Player Page Skeleton
export function PlayerPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-6 mt-3">
              <div className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
              <div className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-border">
        <div className="flex justify-center gap-6 py-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-6">
        {/* Bio section */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Team card */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="p-4 border border-border rounded-lg flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Stats highlights */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border border-border rounded-lg text-center space-y-1">
                <Skeleton className="h-5 w-10 mx-auto" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Match List Skeleton (for league/team matches sections)
export function MatchListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-border animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-10" />
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
