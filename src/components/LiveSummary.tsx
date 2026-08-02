import { Info } from "lucide-react";
import { nutritionItems } from "@/components/NutritionGrid";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Nutrition } from "@/types";

export function LiveSummary({
  total,
  nutrition,
  className,
}: {
  total: number;
  nutrition: Nutrition;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between rounded-3xl bg-cream px-5 py-4">
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Preço</span>
        <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
          {formatBRL(total)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {nutritionItems(nutrition).map((i) => (
          <div
            key={i.label}
            className="rounded-3xl border border-border/70 bg-card px-4 py-3.5 shadow-soft"
          >
            <i.icon className="h-4 w-4 text-olive" strokeWidth={1.6} />
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {i.value}
              <span className="ml-1 text-xs font-medium text-muted-foreground">{i.unit}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">{i.label}</p>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
        Valores nutricionais aproximados.
      </p>
    </section>
  );
}
