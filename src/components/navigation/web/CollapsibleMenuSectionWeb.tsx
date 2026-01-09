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

interface CollapsibleMenuSectionWebProps {
  title: string;
  items: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const CollapsibleMenuSectionWeb = ({ 
  title, 
  items, 
  isOpen, 
  onToggle 
}: CollapsibleMenuSectionWebProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-2 px-2 hover:bg-muted/30 rounded-md transition-all duration-300">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pb-2 space-y-1">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer transition-all duration-300 group"
              onClick={item.action || (() => logger.debug(item.label))}
            >
              <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors duration-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};