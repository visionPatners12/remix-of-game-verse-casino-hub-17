import React from 'react';
import { MainNavigation } from '../common/MainNavigation';
import { SidePanel } from '../common/SidePanel';
import { FeedContent } from '../common/FeedContent';
import type { FeedFilter } from '@/types/feed/state';

interface DesktopFeedLayoutProps {
  selectedFilter: FeedFilter;
  onFilterSelect: (filter: FeedFilter) => void;
  showRightPanel: boolean;
}

export function DesktopFeedLayout({ selectedFilter, onFilterSelect, showRightPanel }: DesktopFeedLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-background overflow-y-auto hide-scrollbar">
      <div className="flex">
        {/* Left sidebar - Navigation */}
        <MainNavigation 
          selected={selectedFilter}
          onSelect={onFilterSelect}
          variant="sidebar"
        />
        
        {/* Main feed with filtered content */}
        <div className={`flex-1 ${showRightPanel ? 'max-w-2xl' : 'max-w-4xl'} mx-auto pt-4`}>
          <FeedContent filter={selectedFilter} />
        </div>
        
        {/* Right sidebar - QuickAccessPanel (desktop only) */}
        {showRightPanel && (
          <div className="w-80 flex-shrink-0">
            <SidePanel />
          </div>
        )}
      </div>
    </div>
  );
}
