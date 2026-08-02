import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  className?: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, onChange, min = 1, className, size = "md" }: Props) {
  const btn =
    size === "sm"
      ? "h-8 w-8 rounded-full"
      : "h-11 w-11 rounded-full";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          btn,
          "flex items-center justify-center bg-background text-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-40",
        )}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-base font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={() => onChange(value + 1)}
        className={cn(
          btn,
          "flex items-center justify-center bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
