import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/ui';

interface SportOption {
  value: string;
  label: string;
  icon: string;
}

interface SportSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  sports: SportOption[];
}

export function SportSelect({ value, onValueChange, sports }: SportSelectProps) {
  const selectedSport = sports.find(sport => sport.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="favorite_sport">Sport favori</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Choisissez votre sport favori">
            {selectedSport && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedSport.icon}</span>
                <span>{selectedSport.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {sports.map((sport) => (
            <SelectItem key={sport.value} value={sport.value} className="h-12">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sport.icon}</span>
                <span>{sport.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}