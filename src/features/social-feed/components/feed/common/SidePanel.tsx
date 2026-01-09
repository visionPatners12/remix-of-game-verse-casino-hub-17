
import React from 'react';
import { OptimizedSidebar } from '@/components/home/OptimizedSidebar';
import { ScrollArea } from '@/ui';

export function SidePanel() {
  return (
    <div className="sticky top-14 h-[calc(100vh-var(--header-height))] p-4 border-l border-border overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <OptimizedSidebar />
        </div>
      </ScrollArea>
    </div>
  );
}
