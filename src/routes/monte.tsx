import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Info, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { NutritionGrid } from "@/components/NutritionGrid";
import { Button } from "@/components/ui/button";
import { buildableProducts, categoriesForKind } from "@/data/ingredients";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { sumNutrition } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import type { CartItemSelection, Ingredient, ProductKind } from "@/types";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Monte o seu — QUASE! saudável" },
      {
        name: "description",
        content:
          "Escolha a base, a proteína, os complementos e os extras. O preço e as informações nutricionais estimadas atualizam na hora.",
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

  const chosen: CartItemSelection[] = useMemo(() => {
    const list: CartItemSelection[] = [];
    categories.forEach((cat) => {
      (selected[cat.id] ?? []).forEach((id) => {
        const ing = cat.ingredients.find((i) => i.id === id);
        if (ing)
          list.push({
            categoryId: cat.id,
            categoryName: cat.name,
            ingredientId: ing.id,
            name: ing.name,
            portion: ing.portion,
            price: ing.price,
          });
      });
    });
    return list;
  }, [categories, selected]);

  const chosenIngredients: Ingredient[] = useMemo(() => {
    const list: Ingredient[] = [];
    categories.forEach((cat) => {
      (selected[cat.id] ?? []).forEach((id) => {
        const ing = cat.ingredients.find((i) => i.id === id);
        if (ing) list.push(ing);
      });
    });
    return list;
  }, [categories, selected]);

  const nutrition = useMemo(
    () => sumNutrition(chosenIngredients.map((i) => i.nutrition)),
    [chosenIngredients],
  );
  const total =
    (productMeta?.basePrice ?? 0) + chosenIngredients.reduce((sum, i) => sum + i.price, 0);

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
        <main className="mx-auto max-w-3xl space-y-4 px-5 pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
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
              className="flex w-full items-center justify-between gap-4 rounded-4xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span>
                <span className="block text-xl font-semibold text-olive-deep">{p.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{p.description}</span>
                <span className="mt-2 block text-sm font-medium text-olive">
                  a partir de {formatBRL(p.basePrice)}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-olive" />
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <PageHeader title={productMeta?.name ?? "Monte o seu"} subtitle="Do seu jeito" />

      <main className="mx-auto max-w-3xl px-5 pt-5">
        <div className="flex items-center gap-1.5">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-olive" : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Passo {step + 1} de {categories.length}
        </p>

        {current && (
          <section className="mt-3 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-olive-deep">{current.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.helper}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {current.ingredients.map((ing) => {
                const isSelected = (selected[current.id] ?? []).includes(ing.id);
                return (
                  <button
                    key={ing.id}
                    type="button"
                    disabled={!ing.available}
                    onClick={() => toggle(current.id, current.selection, ing.id)}
                    className={cn(
                      "rounded-3xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-olive bg-accent shadow-soft"
                        : "border-border bg-card hover:border-sage",
                      !ing.available && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-xs font-semibold text-olive">
                        {ing.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-olive-deep">{ing.name}</p>
                          {isSelected && (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive text-primary-foreground">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {ing.portion} ·{" "}
                          {ing.price === 0 ? "sem custo extra" : `+ ${formatBRL(ing.price)}`}
                        </p>
                        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                          {Math.round(ing.nutrition.calories)} kcal · {ing.nutrition.protein} g prot
                          · {ing.nutrition.carbs} g carb · {ing.nutrition.fat} g gord
                        </p>
                        {!ing.available && (
                          <p className="mt-1 text-[11px] font-medium text-destructive">
                            Indisponível hoje
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-4xl border border-border bg-cream p-5 shadow-soft">
          <h3 className="font-display text-lg font-semibold text-olive-deep">Resumo do seu pedido</h3>
          {chosen.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Suas escolhas aparecem aqui conforme você monta.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {chosen.map((s) => (
                <li key={s.ingredientId} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {s.categoryName}: <span className="text-foreground">{s.name}</span> ({s.portion})
                  </span>
                  <span className="shrink-0 tabular-nums text-olive">
                    {s.price === 0 ? "—" : `+ ${formatBRL(s.price)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <NutritionGrid nutrition={nutrition} className="mt-4" />
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Valores nutricionais são estimativas com base nas porções selecionadas.
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl space-y-3 px-5 pt-3 pb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {Math.round(nutrition.calories)} kcal estimadas
            </span>
            <span className="text-xl font-semibold tabular-nums text-olive-deep">
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
