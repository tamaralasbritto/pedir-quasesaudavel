import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { LiveSummary } from "@/components/LiveSummary";
import { Button } from "@/components/ui/button";
import { buildableProducts, categoriesForKind } from "@/data/ingredients";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { sumNutrition } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import type { CartItemSelection, IngredientCategory, ProductKind } from "@/types";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Monte o seu — QUASE! saudável" },
      {
        name: "description",
        content: "Escolha o tamanho, os ingredientes e monte seu pedido do seu jeito.",
      },
    ],
  }),
  component: MontePage,
});

const SALAD_LIMITS: Record<string, number> = {
  "salada-300": 4,
  "salada-500": 6,
  "salada-750": 8,
};

function MontePage() {
  const [kind, setKind] = useState<ProductKind | null>(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const { addItem, count } = useCart();

  const productMeta = buildableProducts.find((product) => product.kind === kind);
  const selectedSize = selected.tamanho?.[0];

  const categories = useMemo(() => {
    if (!kind) return [];
    const all = categoriesForKind(kind);
    if (kind === "salada-folhas" && selectedSize === "salada-300") {
      return all.filter((category) => category.id !== "proteina");
    }
    return all;
  }, [kind, selectedSize]);

  const current = categories[step];
  const ingredientLimit = selectedSize ? SALAD_LIMITS[selectedSize] : 0;

  const chosen: CartItemSelection[] = useMemo(() => {
    const selections: CartItemSelection[] = [];
    categories.forEach((category) => {
      const counts = (selected[category.id] ?? []).reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});

      Object.entries(counts).forEach(([ingredientId, quantity]) => {
        const ingredient = category.ingredients.find((item) => item.id === ingredientId);
        if (!ingredient) return;
        const price = category.id === "tamanho" || category.id === "proteina" ? ingredient.price : 0;
        selections.push({
          categoryId: category.id,
          categoryName: category.name,
          ingredientId: ingredient.id,
          name: quantity > 1 ? `${quantity}x ${ingredient.name}` : ingredient.name,
          portion: quantity > 1 ? `${quantity} porções de ${ingredient.portion}` : ingredient.portion,
          price,
        });
      });
    });
    return selections;
  }, [categories, selected]);

  const nutrition = useMemo(() => {
    const values = categories.flatMap((category) =>
      (selected[category.id] ?? [])
        .map((id) => category.ingredients.find((ingredient) => ingredient.id === id)?.nutrition)
        .filter(Boolean),
    );
    return sumNutrition(values as { calories: number; protein: number; carbs: number; fat: number }[]);
  }, [categories, selected]);

  const sizePrice =
    categories
      .find((category) => category.id === "tamanho")
      ?.ingredients.find((ingredient) => ingredient.id === selectedSize)?.price ?? 0;
  const proteinPrice =
    categories
      .find((category) => category.id === "proteina")
      ?.ingredients.find((ingredient) => ingredient.id === selected.proteina?.[0])?.price ?? 0;
  const total = sizePrice + proteinPrice;

  const currentSelectionCount = current ? (selected[current.id] ?? []).length : 0;
  const currentStepValid = useMemo(() => {
    if (!current) return false;
    if (current.id === "complementos") return currentSelectionCount === ingredientLimit;
    if (current.required) return currentSelectionCount > 0;
    return true;
  }, [current, currentSelectionCount, ingredientLimit]);

  const requirementsOk = categories.every((category) => {
    const amount = (selected[category.id] ?? []).length;
    if (category.id === "complementos") return amount === ingredientLimit;
    return category.required ? amount > 0 : true;
  });

  const toggleSingle = (category: IngredientCategory, ingredientId: string) => {
    setSelected((previous) => {
      const currentIds = previous[category.id] ?? [];
      const next = currentIds.includes(ingredientId) ? [] : [ingredientId];
      const updated = { ...previous, [category.id]: next };
      if (category.id === "tamanho") {
        updated.complementos = [];
        if (ingredientId === "salada-300") updated.proteina = [];
      }
      return updated;
    });
  };

  const changePortion = (ingredientId: string, delta: 1 | -1) => {
    setSelected((previous) => {
      const currentIds = previous.complementos ?? [];

      if (delta === 1) {
        if (currentIds.length >= ingredientLimit) {
          toast.info(`Você já completou as ${ingredientLimit} porções.`);
          return previous;
        }
        return { ...previous, complementos: [...currentIds, ingredientId] };
      }

      const lastIndex = currentIds.lastIndexOf(ingredientId);
      if (lastIndex < 0) return previous;
      return {
        ...previous,
        complementos: currentIds.filter((_, index) => index !== lastIndex),
      };
    });
  };

  const handleAdd = () => {
    if (!kind || !productMeta || !requirementsOk) return;
    const sizeName = chosen.find((item) => item.categoryId === "tamanho")?.name;
    addItem({
      type: "montado",
      productId: `montado-${kind}`,
      name: sizeName ? `${productMeta.name} ${sizeName}` : productMeta.name,
      unitPrice: total,
      quantity: 1,
      nutrition,
      selections: chosen,
    });
    toast.success("Adicionado ao carrinho");
    setKind(null);
    setStep(0);
    setSelected({});
  };

  if (!kind) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <PageHeader title="Monte o seu" subtitle="Escolha o que você quer montar" />
        <main className="mx-auto max-w-3xl space-y-3 px-5 pt-8">
          {buildableProducts.map((product) => (
            <button
              key={product.kind}
              type="button"
              disabled={!product.available}
              onClick={() => {
                if (!product.available) return;
                setKind(product.kind);
                setStep(0);
                setSelected({});
              }}
              className={cn(
                "flex w-full items-center justify-between gap-4 rounded-4xl border border-border bg-card p-6 text-left transition-all",
                product.available
                  ? "hover:border-foreground/20 hover:shadow-soft"
                  : "cursor-not-allowed opacity-55",
              )}
            >
              <span>
                <span className="font-display block text-xl font-semibold">{product.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{product.description}</span>
                <span className="mt-3 block text-xs text-muted-foreground">
                  {product.available ? product.includes.join(" · ") : "Em breve"}
                </span>
                {product.available && (
                  <span className="mt-2 block text-sm font-medium">
                    a partir de {formatBRL(product.basePrice)}
                  </span>
                )}
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
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors",
                index <= step ? "bg-foreground" : "bg-border",
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
              <p className="mt-1.5 text-sm text-muted-foreground">
                {current.id === "complementos"
                  ? `Distribua ${ingredientLimit} porções como preferir. Você pode repetir ingredientes. ${currentSelectionCount} de ${ingredientLimit} porções escolhidas.`
                  : current.helper}
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.ingredients.map((ingredient) => {
                const quantity = (selected[current.id] ?? []).filter((id) => id === ingredient.id).length;
                const isSelected = quantity > 0;
                const shownPrice = current.id === "tamanho" || current.id === "proteina";

                if (current.id === "complementos") {
                  return (
                    <div
                      key={ingredient.id}
                      className={cn(
                        "rounded-3xl border p-4 transition-all",
                        isSelected ? "border-foreground bg-accent" : "border-border bg-card",
                        !ingredient.available && "opacity-45",
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium">{ingredient.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{ingredient.portion} por porção</p>
                          {!ingredient.available && (
                            <p className="mt-2 text-[11px] font-medium text-muted-foreground">Indisponível hoje</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Remover uma porção de ${ingredient.name}`}
                            disabled={!ingredient.available || quantity === 0}
                            onClick={() => changePortion(ingredient.id, -1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background disabled:opacity-35"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-6 text-center text-lg font-semibold tabular-nums">{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Adicionar uma porção de ${ingredient.name}`}
                            disabled={!ingredient.available || currentSelectionCount >= ingredientLimit}
                            onClick={() => changePortion(ingredient.id, 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-35"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={ingredient.id}
                    type="button"
                    disabled={!ingredient.available}
                    onClick={() => toggleSingle(current, ingredient.id)}
                    className={cn(
                      "rounded-3xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-foreground bg-accent"
                        : "border-border bg-card hover:border-foreground/25",
                      !ingredient.available && "cursor-not-allowed opacity-45",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ingredient.portion}</p>
                      </div>
                      <span className="flex items-center gap-2">
                        {ingredient.available && shownPrice && (
                          <span className="rounded-full bg-sage/25 px-2.5 py-1 text-[11px] font-medium">
                            {current.id === "proteina"
                              ? `+ ${formatBRL(ingredient.price)}`
                              : formatBRL(ingredient.price)}
                          </span>
                        )}
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </span>
                    </div>
                    {!ingredient.available && (
                      <p className="mt-2 text-[11px] font-medium text-muted-foreground">Indisponível hoje</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 space-y-4 border-t border-border pt-6">
          <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Seu pedido</h3>
          {chosen.length === 0 ? (
            <p className="text-sm text-muted-foreground">Suas escolhas aparecem aqui conforme você monta.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {chosen.map((selection) => (
                <li key={`${selection.categoryId}-${selection.ingredientId}`} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {selection.categoryName}: <span className="text-foreground">{selection.name}</span>
                  </span>
                  {selection.price > 0 && selection.categoryId === "proteina" && (
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      + {formatBRL(selection.price)}
                    </span>
                  )}
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
            <span className="text-sm text-muted-foreground">Valores nutricionais aproximados</span>
            <span className="font-display text-xl font-semibold tabular-nums">{formatBRL(total)}</span>
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
              <Button
                size="lg"
                className="flex-1 rounded-full"
                disabled={!currentStepValid}
                onClick={() => setStep(step + 1)}
              >
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="lg" className="flex-1 rounded-full" disabled={!requirementsOk} onClick={handleAdd}>
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
        </div>
      </div>
    </div>
  );
}
