import { ProcessingStep } from "@/types/workspace";
import { cn } from "@/lib/utils";

interface ThinkingPanelProps {
  steps: ProcessingStep[];
  thinkingContent?: string;
  isComplete?: boolean;
}

export const ThinkingPanel = ({ steps, isComplete }: ThinkingPanelProps) => {
  if (isComplete) return null;

  const activeStep = steps.find(s => s.status === 'active');
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const label = activeStep?.label ?? "Analyzing...";

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      {/* Animated shimmer bar */}
      <div className="relative h-0.5 w-48 rounded-full overflow-hidden bg-border/60">
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/50 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        {/* Traveling shimmer */}
        <div className="absolute inset-y-0 w-16 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 animate-[shimmer_1.6s_ease-in-out_infinite]" />
      </div>

      {/* Step label */}
      <div className="flex items-center gap-2">
        <div className="flex gap-[3px] items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full bg-muted-foreground/60 animate-[bounce_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground tracking-wide transition-all duration-300">
          {label}
        </span>
      </div>
    </div>
  );
};
