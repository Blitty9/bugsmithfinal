import { cn } from "@/lib/utils";

type Status = "idle" | "thinking" | "running" | "completed" | "error";

interface StatusChipProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { 
  label: string; 
  dotColor: string; 
  textColor: string; 
  bgColor: string;
  borderColor: string;
}> = {
  idle: {
    label: "Idle",
    dotColor: "bg-foreground-muted",
    textColor: "text-foreground-muted",
    bgColor: "bg-muted",
    borderColor: "border-border",
  },
  thinking: {
    label: "Thinking",
    dotColor: "bg-[#ff9e64]",     /* Tokyo Night Orange */
    textColor: "text-[#ff9e64]",
    bgColor: "bg-[#ff9e64]/10",
    borderColor: "border-[#ff9e64]/20",
  },
  running: {
    label: "Running",
    dotColor: "bg-[#7aa2f7]",     /* Tokyo Night Blue */
    textColor: "text-[#7aa2f7]",
    bgColor: "bg-[#7aa2f7]/10",
    borderColor: "border-[#7aa2f7]/20",
  },
  completed: {
    label: "Completed",
    dotColor: "bg-[#9ece6a]",     /* Tokyo Night Green */
    textColor: "text-[#9ece6a]",
    bgColor: "bg-[#9ece6a]/10",
    borderColor: "border-[#9ece6a]/20",
  },
  error: {
    label: "Error",
    dotColor: "bg-[#f7768e]",     /* Tokyo Night Red */
    textColor: "text-[#f7768e]",
    bgColor: "bg-[#f7768e]/10",
    borderColor: "border-[#f7768e]/20",
  },
};

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status];
  const isAnimated = status === "running" || status === "thinking";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.textColor,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          config.dotColor,
          isAnimated && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
