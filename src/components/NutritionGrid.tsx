import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Nutrition } from "@/types";

const items = (n: Nutrition) => [
  { label: "kcal", value: formatNumber(Math.round(n.calories)) },
  { label: "proteína", value: `${formatNumber(Math.round(n.protein * 10) / 10)} g` },
  { label: "carbo.", value: `${formatNumber(Math.round(n.carbs * 10) / 10)} g` },
  { label: "gordura", value: `${formatNumber(Math.round(n.fat * 10) / 10)} g` },
];

export function NutritionGrid({ nutrition, className }: { nutrition: Nutrition; className?: string }) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {items(nutrition).map((i) => (
        <div key={i.label} className="rounded-2xl bg-muted px-2 py-2.5 text-center">
          <p className="text-sm font-semibold tabular-nums text-olive-deep">{i.value}</p>
          <p className="text-[11px] text-muted-foreground">{i.label}</p>
        </div>
      ))}
    </div>
  );
}
