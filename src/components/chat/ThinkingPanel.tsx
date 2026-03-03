import { ProcessingStep } from "@/types/workspace";
import { useState } from "react";
import { ChevronDown, Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingPanelProps {
  steps: ProcessingStep[];
  thinkingContent?: string;
  isComplete?: boolean;
}

export const ThinkingPanel = ({ steps, isComplete }: ThinkingPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  // Completed state: show collapsible "View reasoning" link
  if (isComplete) {
    return (
      <div className="mb-3">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")} />
          <span>View reasoning</span>
        </button>
        {expanded && (
          <div className="flex flex-col gap-1.5 pl-1 border-l border-border/40 ml-1 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                <Check className="w-3 h-3 text-primary shrink-0" />
                <span className="text-muted-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const activeStep = steps.find(s => s.status === 'active');
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const label = activeStep?.label ?? "Analyzing...";

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      {/* Animated shimmer bar */}
      <div className="relative h-0.5 w-48 rounded-full overflow-hidden bg-border/60">
        <div
          className="absolute inset-y-0 left-0 bg-primary/50 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-y-0 w-16 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 animate-[shimmer_1.6s_ease-in-out_infinite]" />
      </div>

      {/* Step label + toggle */}
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
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-0.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-1"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")} />
        </button>
      </div>

      {/* Expanded steps */}
      {expanded && (
        <div className="flex flex-col gap-1.5 pl-1 border-l border-border/40 ml-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              {step.status === 'complete' && <Check className="w-3 h-3 text-primary shrink-0" />}
              {step.status === 'active' && <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" />}
              {step.status === 'pending' && <Circle className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
              <span className={cn(
                "transition-colors",
                step.status === 'pending' ? "text-muted-foreground/40" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
