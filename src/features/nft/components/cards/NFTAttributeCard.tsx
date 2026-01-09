import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface NFTAttributeCardProps {
  traitType: string;
  value: string | number;
}

export function NFTAttributeCard({ traitType, value }: NFTAttributeCardProps) {
  const formatTraitType = (trait: string) => {
    return trait
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toString();
    }
    return val;
  };

  return (
    <Card className="bg-gradient-to-br from-card/80 to-muted/10 border-border/30 hover:border-primary/40 hover:shadow-sm transition-all duration-200 active:scale-[0.98]">
      <CardContent className="p-3">
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">
            {formatTraitType(traitType)}
          </p>
          <p className="text-sm font-bold text-foreground leading-tight">
            {formatValue(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}