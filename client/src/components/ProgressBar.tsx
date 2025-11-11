import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
}

export default function ProgressBar({ current, goal, className }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  const getColorClass = () => {
    if (percentage >= 100) return "bg-gradient-to-r from-teal to-primary";
    if (percentage >= 90) return "bg-teal";
    if (percentage >= 50) return "bg-primary";
    return "bg-blue";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">
          UGX {current.toLocaleString()} raised
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-out", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        of UGX {goal.toLocaleString()} goal
      </div>
    </div>
  );
}
