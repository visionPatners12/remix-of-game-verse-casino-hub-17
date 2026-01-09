import React, { useState, Suspense, memo } from 'react';
import { Card } from '@/ui';
import { TemplateA, TemplateB } from '../templates/LazyTemplates';
import { MarketCardProps } from '../../types/ui';
import { determineTemplate } from '../../utils/helpers';
import { cn } from '@/lib/utils';

export const MarketCard: React.FC<MarketCardProps> = memo(({
  event,
  className,
  onView,
  onOpenDetails
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const template = determineTemplate(event);
  const isResolved = event.closed;
  
  const handleCardClick = () => {
    if (event.markets[0]?.id) {
      onOpenDetails?.(event.markets[0].id);
    }
  };

  const templateProps = {
    event,
    isResolved,
    isHovered,
    onView
  };

  return (
    <Card 
      className={cn(
        "p-4 rounded-2xl bg-card shadow-soft transition-smooth cursor-pointer h-full flex flex-col",
        "hover:shadow-medium hover:bg-surface-hover",
        isResolved && "opacity-75",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Suspense fallback={<div className="animate-pulse bg-muted h-32 rounded" />}>
        {template === 'A' ? (
          <TemplateA {...templateProps} />
        ) : (
          <TemplateB {...templateProps} />
        )}
      </Suspense>
    </Card>
  );
});