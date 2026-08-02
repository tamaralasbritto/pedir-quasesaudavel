import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Nutrition } from "@/types";

const round = (v: number) => formatNumber(Math.round(v * 10) / 10);

export const nutritionItems = (n: Nutrition) => [
  { icon: Flame, label: "Calorias", value: `${Math.round(n.calories)}`, unit: "kcal" },
  { icon: Beef, label: "Proteína", value: round(n.protein), unit: "g" },
  { icon: Wheat, label: "Carboidratos", value: round(n.carbs), unit: "g" },
  { icon: Droplet, label: "Gorduras", value: round(n.fat), unit: "g" },
];

export function NutritionGrid({
  nutrition,
  className,
}: {
  nutrition: Nutrition;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {nutritionItems(nutrition).map((i) => (
        <div
          key={i.label}
          className="rounded-2xl border border-border/70 bg-card px-2 py-3 text-center"
        >
          <i.icon className="mx-auto h-3.5 w-3.5 text-olive" strokeWidth={1.6} />
          <p className="mt-1.5 text-sm font-semibold tabular-nums text-foreground">
            {i.value}
            <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{i.unit}</span>
          </p>
          <p className="text-[10px] tracking-wide text-muted-foreground">{i.label}</p>
        </div>
      ))}
    </div>
  );
}
