import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TripDateTimeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  onStartDateSelect?: (date: Date | undefined) => void;
  onEndDateSelect?: (date: Date | undefined) => void;
  onStartTimeSelect?: (time: string) => void;
  onEndTimeSelect?: (time: string) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

// Generate time options (10:00 a.m., 10:30 a.m., etc.)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'p.m.' : 'a.m.';
      const timeDisplay = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
      times.push({ value: time24, label: timeDisplay });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export function TripDateTimeSelector({
  startDate,
  endDate,
  startTime = "10:00",
  endTime = "10:00",
  onStartDateSelect,
  onEndDateSelect,
  onStartTimeSelect,
  onEndTimeSelect,
  disabled,
  className
}: TripDateTimeSelectorProps) {
  const [isStartDateOpen, setIsStartDateOpen] = React.useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = React.useState(false);

  const formatTimeDisplay = (time: string) => {
    const timeOption = timeOptions.find(option => option.value === time);
    return timeOption ? timeOption.label : time;
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold text-foreground">Your trip</h3>
      
      {/* Trip start */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Trip start</label>
        <div className="grid grid-cols-2 gap-3">
          {/* Start Date */}
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-between text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
                data-testid="start-date-button"
              >
                {startDate ? format(startDate, "yyyy-MM-dd") : "Select date"}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  onStartDateSelect?.(date);
                  setIsStartDateOpen(false);
                }}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Start Time */}
          <Select value={startTime} onValueChange={onStartTimeSelect}>
            <SelectTrigger className="h-12" data-testid="start-time-trigger">
              <SelectValue placeholder="Select time">
                {formatTimeDisplay(startTime)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trip end */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Trip end</label>
        <div className="grid grid-cols-2 gap-3">
          {/* End Date */}
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-12 justify-between text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
                data-testid="end-date-button"
              >
                {endDate ? format(endDate, "yyyy-MM-dd") : "Select date"}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onEndDateSelect?.(date);
                  setIsEndDateOpen(false);
                }}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* End Time */}
          <Select value={endTime} onValueChange={onEndTimeSelect}>
            <SelectTrigger className="h-12" data-testid="end-time-trigger">
              <SelectValue placeholder="Select time">
                {formatTimeDisplay(endTime)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}