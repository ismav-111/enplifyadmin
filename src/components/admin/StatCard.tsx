import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number; // percentage change
  trendLabel?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accent = "primary",
}: StatCardProps) => {
  const isPositive = trend !== undefined && trend >= 0;

  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", accentClasses[accent])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isPositive
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">{title}</p>
        {(subtitle || trendLabel) && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle ?? trendLabel}
          </p>
        )}
      </div>
    </div>
  );
};
