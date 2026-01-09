
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui';
import { ChevronDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { logger } from '@/utils/logger';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  action?: () => void;
}

interface CollapsibleMenuSectionProps {
  title: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const CollapsibleMenuSection = ({ title, items, isOpen, onToggle }: CollapsibleMenuSectionProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-background active:bg-muted/30">
          <span className="font-medium">{title}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="bg-muted/10">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 px-4 py-3 active:bg-muted/30 cursor-pointer"
              onClick={item.action || (() => logger.debug('Menu item clicked:', item.label))}
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
