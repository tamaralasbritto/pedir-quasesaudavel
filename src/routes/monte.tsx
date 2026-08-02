import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { LiveSummary } from "@/components/LiveSummary";
import { Button } from "@/components/ui/button";
import { buildableProducts, categoriesForKind } from "@/data/ingredients";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { sumNutrition } from "@/lib/nutrition";
import { buildPriceLines, previewCharge } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { CartItemSelection, ProductKind } from "@/types";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Monte o seu — QUASE! saudável" },
      {
        name: "description",
        content:
          "Escolha a base, a proteína, os complementos e os extras. O preço e as informações nutricionais aproximadas atualizam na hora.",
      },
      { property: "og:title", content: "Monte o seu — QUASE! saudável" },
      {
        property: "og:description",
        content: "Escolha a base, a proteína, os complementos e deixe tudo do seu jeito.",
      },
    ],
  }),
  component: MontePage,
});

function MontePage() {
  const [kind, setKind] = useState<ProductKind | null>(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const { addItem, count } = useCart();

  const categories = useMemo(() => (kind ? categoriesForKind(kind) : []), [kind]);
  const productMeta = buildableProducts.find((p) => p.kind === kind);
  const current = categories[step];

  const lines = useMemo(() => buildPriceLines(categories, selected), [categories, selected]);

  const chosen: CartItemSelection[] = useMemo(
    () =>
      lines.map((l) => ({
        categoryId: l.categoryId as CartItemSelection["categoryId"],
        categoryName: l.categoryName,
        ingredientId: l.ingredient.id,
        name: l.ingredient.name,
        portion: l.ingredient.portion,
        price: l.charge,
      })),
    [lines],
  );

  const nutrition = useMemo(
    () => sumNutrition(lines.map((l) => l.ingredient.nutrition)),
    [lines],
  );
  const extrasTotal = lines.reduce((sum, l) => sum + l.charge, 0);
  const total = (productMeta?.basePrice ?? 0) + extrasTotal;

  const toggle = (categoryId: string, mode: "single" | "multiple", ingredientId: string) => {
    setSelected((prev) => {
      const currentIds = prev[categoryId] ?? [];
      if (mode === "single") {
        return {
          ...prev,
          [categoryId]: currentIds.includes(ingredientId) ? [] : [ingredientId],
        };
      }
      return {
        ...prev,
        [categoryId]: currentIds.includes(ingredientId)
          ? currentIds.filter((i) => i !== ingredientId)
          : [...currentIds, ingredientId],
      };
    });
  };

  const requirementsOk = categories
    .filter((c) => c.required)
    .every((c) => (selected[c.id] ?? []).length > 0);

  const handleAdd = () => {
    if (!kind || !productMeta) return;
    addItem({
      type: "montado",
      productId: `montado-${kind}`,
      name: `${productMeta.name} do seu jeito`,
      unitPrice: total,
      quantity: 1,
      nutrition,
      selections: chosen,
    });
    toast.success("Adicionado ao carrinho", { description: "Do seu jeito, do jeitinho certo." });
    setKind(null);
    setStep(0);
    setSelected({});
  };

  if (!kind) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <PageHeader title="Monte o seu" subtitle="Comece escolhendo o que você quer montar" />
        <main className="mx-auto max-w-3xl space-y-3 px-5 pt-8">
          <p className="pb-2 text-sm leading-relaxed text-muted-foreground">
            Escolha por onde começar. Depois é só seguir os passos.
          </p>
          {buildableProducts.map((p) => (
            <button
              key={p.kind}
              type="button"
              onClick={() => {
                setKind(p.kind);
                setStep(0);
                setSelected({});
              }}
              className="flex w-full items-center justify-between gap-4 rounded-4xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/20 hover:shadow-soft"
            >
              <span>
                <span className="font-display block text-xl font-semibold">{p.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{p.description}</span>
                <span className="mt-3 block text-xs text-muted-foreground">
                  Inclui {p.includes.join(" · ")}
                </span>
                <span className="mt-2 block text-sm font-medium">
                  a partir de {formatBRL(p.basePrice)}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <PageHeader title={productMeta?.name ?? "Monte o seu"} subtitle="Do seu jeito" />

      <main className="mx-auto max-w-3xl px-5 pt-6">
        <div className="flex items-center gap-1.5">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-foreground" : "bg-border",
              )}
            />
          ))}
        </div>
        <p className="mt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Passo {step + 1} de {categories.length}
        </p>

        {current && (
          <section className="mt-4 space-y-5">
            <div>
              <h2 className="font-display text-3xl font-semibold">{current.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{current.helper}</p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.ingredients.map((ing) => {
                const selectedIds = selected[current.id] ?? [];
                const isSelected = selectedIds.includes(ing.id);
                const charge = previewCharge(current, ing, selectedIds);
                return (
                  <button
                    key={ing.id}
                    type="button"
                    disabled={!ing.available}
                    onClick={() => toggle(current.id, current.selection, ing.id)}
                    className={cn(
                      "rounded-3xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-foreground bg-accent"
                        : "border-border bg-card hover:border-foreground/25",
                      !ing.available && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{ing.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ing.portion}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums",
                            charge === 0
                              ? "bg-sage/25 text-foreground"
                              : "bg-lavender/40 text-foreground",
                          )}
                        >
                          {charge === 0 ? "Incluso" : `+ ${formatBRL(charge)}`}
                        </span>
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                      {Math.round(ing.nutrition.calories)} kcal · {ing.nutrition.protein} g proteína
                      · {ing.nutrition.carbs} g carb. · {ing.nutrition.fat} g gord.
                    </p>
                    {!ing.available && (
                      <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                        Indisponível hoje
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 space-y-4 border-t border-border pt-6">
          <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Seu pedido
          </h3>
          {chosen.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Suas escolhas aparecem aqui conforme você monta.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {chosen.map((s) => (
                <li key={s.ingredientId} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {s.categoryName}: <span className="text-foreground">{s.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {s.price === 0 ? "Incluso" : `+ ${formatBRL(s.price)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <LiveSummary total={total} nutrition={nutrition} />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl space-y-3 px-5 pt-3 pb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {Math.round(nutrition.calories)} kcal aprox.
            </span>
            <span className="font-display text-xl font-semibold tabular-nums">
              {formatBRL(total)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              onClick={() => (step === 0 ? setKind(null) : setStep(step - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            {step < categories.length - 1 ? (
              <Button size="lg" className="flex-1 rounded-full" onClick={() => setStep(step + 1)}>
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 rounded-full"
                disabled={!requirementsOk}
                onClick={handleAdd}
              >
                Adicionar ao carrinho
              </Button>
            )}
            {count > 0 && (
              <Button asChild variant="secondary" size="lg" className="rounded-full px-4">
                <Link to="/checkout" aria-label="Ir para o checkout">
                  <ShoppingBag className="h-4 w-4" />
                  {count}
                </Link>
              </Button>
            )}
          </div>
          {!requirementsOk && step === categories.length - 1 && (
            <p className="text-center text-xs text-muted-foreground">
              Escolha uma opção nos passos obrigatórios para continuar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
