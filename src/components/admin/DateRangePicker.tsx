import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

interface DateRangePickerProps {
  value: { preset: number | null; range: DateRange | undefined };
  onChange: (v: { preset: number | null; range: DateRange | undefined }) => void;
}

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const activePreset = PRESETS.find((p) => p.days === value.preset);

  const label = activePreset
    ? activePreset.label
    : value.range?.from
    ? value.range.to
      ? `${format(value.range.from, "MMM d")} – ${format(value.range.to, "MMM d, yyyy")}`
      : format(value.range.from, "MMM d, yyyy")
    : "Select range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-sm font-normal">
          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {label}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex" align="end">
        {/* Preset list */}
        <div className="flex flex-col border-r border-border p-2 gap-0.5 w-36">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => {
                onChange({ preset: p.days, range: undefined });
                setOpen(false);
              }}
              className={cn(
                "text-left text-sm px-3 py-1.5 rounded-md transition-colors",
                value.preset === p.days
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Calendar */}
        <Calendar
          mode="range"
          selected={value.range}
          onSelect={(range) => onChange({ preset: null, range })}
          numberOfMonths={2}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
};
