import React from 'react';

export function OnboardingLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex flex-col safe-area-top">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/20">
        <div className="flex items-center px-4 py-3">
          <div className="w-[44px] h-[44px] rounded-lg bg-muted animate-pulse"></div>
          
          <div className="flex-1 text-center px-4">
            <div className="h-6 w-32 bg-muted rounded mx-auto animate-pulse"></div>
            <div className="flex items-center justify-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 w-8 rounded-full bg-muted animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="w-[44px]"></div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex-1 px-4 py-8 pb-safe">
        <div className="max-w-sm mx-auto space-y-8">
          {/* Profile Picture Skeleton */}
          <div className="space-y-4 text-center">
            <div className="h-6 w-32 bg-muted rounded mx-auto animate-pulse"></div>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-muted rounded mx-auto animate-pulse"></div>
          </div>

          {/* Form Fields Skeleton */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-12 w-full bg-muted rounded-md animate-pulse"></div>
            </div>
          ))}

          {/* Button Skeleton */}
          <div className="pt-4">
            <div className="h-[52px] w-full bg-muted rounded-xl animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
}