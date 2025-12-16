import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateDisplay,
  formatDateOnly,
  parseDateValue,
  type DateFormatterLike,
} from "@/lib/date-utils";

export type DatePickerProps = {
  value?: string | null;
  onChange?: (value?: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatter?: DateFormatterLike;
  clearLabel?: string;
  todayLabel?: string;
  disabledDays?: CalendarProps["disabled"];
  fromDate?: CalendarProps["fromDate"];
  toDate?: CalendarProps["toDate"];
};

const defaultClearLabel = "Xóa";
const defaultTodayLabel = "Hôm nay";
const defaultPlaceholder = "Chọn ngày";

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = defaultPlaceholder,
  disabled,
  className,
  formatter,
  clearLabel = defaultClearLabel,
  todayLabel = defaultTodayLabel,
  disabledDays,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateValue(value);
  const displayValue = formatDateDisplay(value, formatter);

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }

    onChange?.(formatDateOnly(date));
  };

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      onBlur?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-start gap-2 rounded-md border border-border/80 bg-background px-3 py-2 text-sm font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {displayValue ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto space-y-2 p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            handleSelect(date ?? undefined);
            handleClose(false);
          }}
          initialFocus
          disabled={disabledDays}
          fromDate={fromDate}
          toDate={toDate}
        />
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              onChange?.(undefined);
              handleClose(false);
            }}
          >
            {clearLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              const today = new Date();
              onChange?.(formatDateOnly(today));
              handleClose(false);
            }}
          >
            {todayLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
