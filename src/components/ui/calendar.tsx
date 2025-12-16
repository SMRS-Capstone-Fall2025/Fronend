import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "space-y-6",
        caption: "flex items-center justify-between px-2 pt-2",
        caption_label: "text-lg font-semibold tracking-tight",
        caption_dropdowns:
          "flex items-center justify-center gap-2 text-lg font-semibold",
        dropdown:
          "flex h-9 min-w-[90px] items-center justify-between rounded-full border border-input/60 bg-background px-4 text-base font-semibold shadow-sm transition-colors hover:border-primary/60 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 [&>option]:text-black dark:[&>option]:text-white",
        dropdown_month: "capitalize",
        dropdown_year: "text-right",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 rounded-full border border-transparent bg-transparent p-0 text-primary opacity-100 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex text-sm text-muted-foreground",
        head_cell: "w-10 text-center font-medium uppercase tracking-[0.08em]",
        row: "mt-2 flex w-full",
        cell: "relative h-10 w-10 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:before:content-[''] [&:has([aria-selected].day-range-start)]:before:absolute [&:has([aria-selected].day-range-start)]:before:left-1/2 [&:has([aria-selected].day-range-start)]:before:top-1/2 [&:has([aria-selected].day-range-start)]:before:h-8 [&:has([aria-selected].day-range-start)]:before:w-1/2 [&:has([aria-selected].day-range-start)]:before:-translate-y-1/2 [&:has([aria-selected].day-range-start)]:before:bg-primary/10 [&:has([aria-selected].day-range-start)]:before:rounded-l-full [&:has([aria-selected].day-range-middle)]:before:absolute [&:has([aria-selected].day-range-middle)]:before:inset-y-1 [&:has([aria-selected].day-range-middle)]:before:left-0 [&:has([aria-selected].day-range-middle)]:before:right-0 [&:has([aria-selected].day-range-middle)]:before:rounded-none [&:has([aria-selected].day-range-middle)]:before:bg-primary/10 [&:has([aria-selected].day-range-end)]:before:absolute [&:has([aria-selected].day-range-end)]:before:right-1/2 [&:has([aria-selected].day-range-end)]:before:top-1/2 [&:has([aria-selected].day-range-end)]:before:h-8 [&:has([aria-selected].day-range-end)]:before:w-1/2 [&:has([aria-selected].day-range-end)]:before:-translate-y-1/2 [&:has([aria-selected].day-range-end)]:before:bg-primary/10 [&:has([aria-selected].day-range-end)]:before:rounded-r-full",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-full p-0 font-medium text-foreground aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today:
          "font-semibold text-primary underline decoration-primary/40 decoration-2",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "day-range-middle aria-selected:bg-transparent aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
