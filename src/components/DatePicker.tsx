import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  iconClassName?: string;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled,
  iconClassName = "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <CalendarIcon className={iconClassName} />
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal pl-10",
              !date && "text-muted-foreground",
              className
            )}
          >
            {date ? format(date, "PPP") : placeholder}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabled}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateSelect?: (date: Date | undefined) => void;
  onEndDateSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  iconClassName?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateSelect,
  onEndDateSelect,
  placeholder = "Select dates",
  className,
  disabled,
  iconClassName = "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    } else if (startDate) {
      return `${format(startDate, "MMM d, yyyy")} - End date`;
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <CalendarIcon className={iconClassName} />
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal pl-10",
              !startDate && "text-muted-foreground",
              className
            )}
          >
            {formatDateRange()}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="text-sm font-medium">Start Date</div>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              onStartDateSelect?.(date);
              if (date && endDate && date > endDate) {
                onEndDateSelect?.(undefined);
              }
            }}
            disabled={disabled}
            className="pointer-events-auto"
          />
          
          {startDate && (
            <>
              <div className="text-sm font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onEndDateSelect?.(date);
                  if (date) {
                    setIsOpen(false);
                  }
                }}
                disabled={(date) => {
                  if (disabled?.(date)) return true;
                  return startDate ? date < startDate : false;
                }}
                className="pointer-events-auto"
              />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}