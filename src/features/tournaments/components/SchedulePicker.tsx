import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

interface SchedulePickerProps {
  registrationStart: Date;
  registrationEnd: Date;
  tournamentStart: Date | null;
  startWhenFull: boolean;
  onRegistrationStartChange: (date: Date) => void;
  onRegistrationEndChange: (date: Date) => void;
  onTournamentStartChange: (date: Date | null) => void;
  onStartWhenFullChange: (value: boolean) => void;
}

export const SchedulePicker = ({
  registrationStart,
  registrationEnd,
  tournamentStart,
  startWhenFull,
  onRegistrationStartChange,
  onRegistrationEndChange,
  onTournamentStartChange,
  onStartWhenFullChange
}: SchedulePickerProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Schedule</span>
      </div>

      {/* Registration Opens */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Registration Opens</label>
        <div className="grid grid-cols-2 gap-2">
          <DatePickerButton 
            date={registrationStart} 
            onChange={onRegistrationStartChange} 
          />
          <TimeDisplay date={registrationStart} />
        </div>
      </div>

      {/* Registration Closes */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Registration Closes</label>
        <div className="grid grid-cols-2 gap-2">
          <DatePickerButton 
            date={registrationEnd} 
            onChange={onRegistrationEndChange}
          />
          <TimeDisplay date={registrationEnd} />
        </div>
      </div>

      {/* Start when full toggle */}
      <div className="flex items-center justify-between bg-muted/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Start when bracket is full</p>
            <p className="text-xs text-muted-foreground">
              Begin immediately once all spots are filled
            </p>
          </div>
        </div>
        <Switch 
          checked={startWhenFull}
          onCheckedChange={onStartWhenFullChange}
        />
      </div>

      {/* Tournament Start (if not auto-start) */}
      {!startWhenFull && (
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Tournament Starts</label>
          <div className="grid grid-cols-2 gap-2">
            <DatePickerButton 
              date={tournamentStart || new Date()} 
              onChange={onTournamentStartChange}
            />
            <TimeDisplay date={tournamentStart || new Date()} />
          </div>
        </div>
      )}
    </div>
  );
};

interface DatePickerButtonProps {
  date: Date;
  onChange: (date: Date) => void;
}

const DatePickerButton = ({ date, onChange }: DatePickerButtonProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-12 justify-start text-left font-normal bg-muted/30 border-0 rounded-xl",
            !date && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(d)}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

const TimeDisplay = ({ date }: { date: Date }) => {
  return (
    <div className="h-12 flex items-center gap-2 px-4 bg-muted/30 rounded-xl text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">{format(date, "HH:mm")}</span>
    </div>
  );
};
