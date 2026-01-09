
import React from 'react';
import { Label, Input } from '@/ui';

interface DateTimePickerProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  error?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-lg mb-2 block">Date et heure de début (optionnel)</Label>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <Label className="text-base mb-1 block">Date</Label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full h-10 rounded-md shadow-sm"
          />
        </div>
        <div className="flex-1">
          <Label className="text-base mb-1 block">Heure</Label>
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full h-10 rounded-md shadow-sm"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm mt-1 text-red-600">{error}</p>
      )}
    </div>
  );
};
