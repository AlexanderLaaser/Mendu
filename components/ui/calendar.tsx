"use client";

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
      className={cn("w-full p-3", className)} // Hinzufügen von w-full
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full", // Sicherstellen, dass Monate die volle Breite nutzen
        month: "flex-1 space-y-4", // Flex-1 sorgt dafür, dass die Monate gleichmäßig verteilt werden
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse", // Entfernen von space-y-1, falls es die Höhe beeinflusst
        head_row: "flex w-full", // Sicherstellen, dass die Kopfzeile die volle Breite nutzt
        head_cell:
          "flex-1 text-slate-500 rounded-md font-normal text-[0.8rem] dark:text-slate-400", // Flex-1 für gleichmäßige Verteilung
        row: "flex w-full mt-2",
        cell: "flex-1 h-9 w-full text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected].day-outside)]:bg-slate-800/50 dark:[&:has([aria-selected])]:bg-slate-800",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 w-full" // Hinzufügen von w-full
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary/40 font-primary/70 text-primary font-bold hover:bg-primary/20 focus:bg-primary/40 focus:font-bold focus:text-primary dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50 dark:hover:text-slate-900 dark:focus:bg-slate-50 dark:focus:text-slate-900",
        day_today:
          "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
        day_outside:
          "day-outside text-slate-500 aria-selected:bg-slate-100/50 aria-selected:text-slate-500 dark:text-slate-400 dark:aria-selected:bg-slate-800/50 dark:aria-selected:text-slate-400",
        day_disabled: "text-slate-500 opacity-50 dark:text-slate-400 disabled",
        day_range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-slate-900 dark:aria-selected:bg-slate-800 dark:aria-selected:text-slate-50",
        day_hidden: "invisible disabled",
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
