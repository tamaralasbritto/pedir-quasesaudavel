import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LiveSummary } from "@/components/LiveSummary";
import { Button } from "@/components/ui/button";
import { buildableProducts, categoriesForKind } from "@/data/ingredients";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { sumNutrition } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import type { CartItemSelection, Ingredient, IngredientCategory, Nutrition, ProductKind } from "@/types";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Faça seu pedido — QUASE! saudável" },
      { name: "description", content: "Escolha seus produtos e faça o pedido pelo WhatsApp." },
    ],
  }),
  component: OrderBuilderPage,
});

const LIMITS: Record<string, Partial<Record<string, number>>> = {
  "salada-300": { complementos: 4 },
  "salada-500": { complementos: 6 },
  "salada-750": { complementos: 8 },
  "acai-300": { frutas: 2, caldas: 1, acompanhamentos: 4 },
  "acai-400": { frutas: 2, caldas: 2, acompanhamentos: 5 },
  "acai-500": { frutas: 2, caldas: 2, acompanhamentos: 6 },
};

const SIZE_CATEGORIES = ["tamanho", "tamanho-acai"];
const REPEATABLE_CATEGORIES = ["complementos", "frutas", "caldas", "acompanhamentos"];
const CHARGEABLE_CATEGORIES = ["tamanho", "tamanho-acai", "proteina", "extras"];
const SANDWICH_PRICE = 8;
const SANDWICH_NUTRITION: Nutrition = { calories: 310, protein: 19, carbs: 30, fat: 13 };

function OrderBuilderPage() {
  const [kind, setKind] = useState<ProductKind | null>(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);
  const [fixedQuantity, setFixedQuantity] = useState(1);
  const { addItem, count } = useCart();

  const productMeta = buildableProducts.find((product) => product.kind === kind);
  const selectedSize = selected.tamanho?.[0] ?? selected["tamanho-acai"]?.[0];

  const categories = useMemo(() => {
    if (!kind || kind === "sanduiche-natural") return [];
    const all = categoriesForKind(kind);
    if (kind === "salada-folhas" && selectedSize === "salada-300") {
      return all.filter((category) => category.id !== "proteina");
    }
    return all;
  }, [kind, selectedSize]);

  const current = categories[step];
  const currentLimit = current && selectedSize ? LIMITS[selectedSize]?.[current.id] : undefined;
  const currentCount = current ? (selected[current.id] ?? []).length : 0;

  const chosen: CartItemSelection[] = useMemo(() => {
    const result: CartItemSelection[] = [];
    categories.forEach((category) => {
      const counts = (selected[category.id] ?? []).reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
      Object.entries(counts).forEach(([ingredientId, quantity]) => {
        const ingredient = category.ingredients.find((item) => item.id === ingredientId);
        if (!ingredient) return;
        result.push({
          categoryId: category.id,
          categoryName: category.name,
          ingredientId,
          name: quantity > 1 ? `${quantity}x ${ingredient.name}` : ingredient.name,
          portion: quantity > 1 ? `${quantity} porções de ${ingredient.portion}` : ingredient.portion,
          price: CHARGEABLE_CATEGORIES.includes(category.id) ? ingredient.price * quantity : 0,
        });
      });
    });
    return result;
  }, [categories, selected]);

  const nutrition = useMemo(() => {
    const values = categories.flatMap((category) =>
      (selected[category.id] ?? [])
        .map((id) => category.ingredients.find((ingredient) => ingredient.id === id)?.nutrition)
        .filter(Boolean),
    );
    return sumNutrition(values as Nutrition[]);
  }, [categories, selected]);

  const total = chosen.reduce((sum, item) => sum + item.price, 0);

  const stepValid = useMemo(() => {
    if (!current) return false;
    if (currentLimit !== undefined) return currentCount === currentLimit;
    return current.required ? currentCount > 0 : true;
  }, [current, currentCount, currentLimit]);

  const requirementsOk = categories.every((category) => {
    const amount = (selected[category.id] ?? []).length;
    const limit = selectedSize ? LIMITS[selectedSize]?.[category.id] : undefined;
    if (limit !== undefined) return amount === limit;
    return category.required ? amount > 0 : true;
  });

  const selectProduct = (productKind: ProductKind) => {
    setKind(productKind);
    setStep(0);
    setSelected({});
    setFixedQuantity(1);
  };

  const toggleSingle = (category: IngredientCategory, ingredientId: string) => {
    setSelected((previous) => {
      const currentIds = previous[category.id] ?? [];
      const next = currentIds.includes(ingredientId) ? [] : [ingredientId];
      const updated = { ...previous, [category.id]: next };
      if (SIZE_CATEGORIES.includes(category.id)) {
        updated.complementos = [];
        updated.frutas = [];
        updated.caldas = [];
        updated.acompanhamentos = [];
        if (ingredientId === "salada-300") updated.proteina = [];
        setStep(0);
      }
      return updated;
    });
  };

  const toggleMultiple = (category: IngredientCategory, ingredientId: string) => {
    setSelected((previous) => {
      const currentIds = previous[category.id] ?? [];
      return {
        ...previous,
        [category.id]: currentIds.includes(ingredientId)
          ? currentIds.filter((id) => id !== ingredientId)
          : [...currentIds, ingredientId],
      };
    });
  };

  const changePortion = (category: IngredientCategory, ingredientId: string, delta: 1 | -1) => {
    setSelected((previous) => {
      const currentIds = previous[category.id] ?? [];
      const limit = selectedSize ? LIMITS[selectedSize]?.[category.id] : undefined;
      if (delta === 1) {
        if (limit !== undefined && currentIds.length >= limit) return previous;
        return { ...previous, [category.id]: [...currentIds, ingredientId] };
      }
      const index = currentIds.lastIndexOf(ingredientId);
      if (index < 0) return previous;
      return { ...previous, [category.id]: currentIds.filter((_, position) => position !== index) };
    });
  };

  const resetBuilder = () => {
    setJustAdded(false);
    setKind(null);
    setStep(0);
    setSelected({});
    setFixedQuantity(1);
  };

  const handleCustomAdd = () => {
    if (!kind || !productMeta || !requirementsOk) return;
    const size = chosen.find((item) => SIZE_CATEGORIES.includes(item.categoryId));
    addItem({
      type: "montado",
      productId: `montado-${kind}`,
      name: size ? `${productMeta.name} ${size.name}` : productMeta.name,
      unitPrice: total,
      quantity: 1,
      nutrition,
      selections: chosen,
    });
    setJustAdded(true);
  };

  const handleSandwichAdd = () => {
    addItem({
      type: "pronto",
      productId: "sanduiche-natural-frango",
      name: "Sanduíche natural de frango",
      unitPrice: SANDWICH_PRICE,
      quantity: fixedQuantity,
      nutrition: SANDWICH_NUTRITION,
      selections: [],
    });
    setJustAdded(true);
  };

  if (justAdded) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <PageHeader title="Prontinho!" subtitle="Seu pedido foi adicionado ao carrinho" />
        <main className="mx-auto max-w-3xl px-5 pt-10">
          <section className="rounded-4xl border border-border bg-card p-7 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/30">
              <Check className="h-7 w-7" />
            </span>
            <h1 className="font-display mt-5 text-3xl font-semibold">Tudo certo! 💚</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Você pode escolher outro produto ou conferir o carrinho antes de finalizar.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" size="lg" className="rounded-full" onClick={resetBuilder}>
                Continuar escolhendo
              </Button>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/checkout"><ShoppingBag className="h-4 w-4" />Ir para o carrinho ({count})</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!kind) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <PageHeader title="O que você vai pedir hoje?" subtitle="Escolha uma opção para começar" />
        <main className="mx-auto max-w-3xl space-y-3 px-5 pt-8">
          {buildableProducts.map((product) => {
            const isSandwich = product.kind === "sanduiche-natural";
            const available = product.available || isSandwich;
            const description = isSandwich
              ? "Receita fixa com patê de frango, cenoura, tomate e alface."
              : product.description;
            const details = isSandwich ? "Pronto para pedir · receita da casa" : product.includes.join(" · ");

            return (
              <button
                key={product.kind}
                type="button"
                disabled={!available}
                onClick={() => available && selectProduct(product.kind)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-4xl border border-border bg-card p-6 text-left transition-all",
                  available ? "hover:border-foreground/20 hover:shadow-soft" : "cursor-not-allowed opacity-55",
                )}
              >
                <span>
                  <span className="font-display block text-xl font-semibold">{product.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                  <span className="mt-3 block text-xs text-muted-foreground">{available ? details : "Em breve"}</span>
                  {available && <span className="mt-2 block text-sm font-medium">{isSandwich ? formatBRL(SANDWICH_PRICE) : `a partir de ${formatBRL(product.basePrice)}`}</span>}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </main>
        {count > 0 && (
          <div className="fixed inset-x-0 bottom-5 z-40 px-5">
            <Button asChild size="lg" className="mx-auto flex w-full max-w-3xl rounded-full shadow-soft">
              <Link to="/checkout"><ShoppingBag className="h-4 w-4" />Ir para o carrinho ({count})</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (kind === "sanduiche-natural") {
    return (
      <div className="min-h-screen bg-background pb-40">
        <PageHeader title="Sanduíche natural" subtitle="Receita da casa" />
        <main className="mx-auto max-w-3xl px-5 pt-8">
          <section className="rounded-4xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex rounded-full bg-lavender/45 px-3 py-1 text-xs font-semibold">Prontinho para pedir</span>
            <h1 className="font-display mt-4 text-3xl font-semibold">Sanduíche natural de frango</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Receita fixa, preparada com 80 g de patê de frango, cenoura, tomate e alface.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-3xl bg-cream p-4">
              <div>
                <p className="text-xs text-muted-foreground">Valor unitário</p>
                <p className="font-display mt-1 text-2xl font-semibold">{formatBRL(SANDWICH_PRICE)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Diminuir quantidade" disabled={fixedQuantity === 1} onClick={() => setFixedQuantity((value) => Math.max(1, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background disabled:opacity-35"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-xl font-semibold tabular-nums">{fixedQuantity}</span>
                <button type="button" aria-label="Aumentar quantidade" onClick={() => setFixedQuantity((value) => value + 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
        </main>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 pt-3 pb-5 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => setKind(null)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
            <Button size="lg" className="flex-1 rounded-full" onClick={handleSandwichAdd}>Adicionar · {formatBRL(SANDWICH_PRICE * fixedQuantity)}</Button>
            {count > 0 && <Button asChild variant="secondary" size="lg" className="rounded-full px-4"><Link to="/checkout"><ShoppingBag className="h-4 w-4" />{count}</Link></Button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <PageHeader title={productMeta?.name ?? "Seu pedido"} subtitle="Feito do seu jeito" />
      <main className="mx-auto max-w-3xl px-5 pt-6">
        <div className="flex items-center gap-1.5">
          {categories.map((category, index) => (
            <div key={category.id} className={cn("h-0.5 flex-1 rounded-full", index <= step ? "bg-foreground" : "bg-border")} />
          ))}
        </div>
        <p className="mt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Passo {step + 1} de {categories.length}</p>

        {current && (
          <section className="mt-4 space-y-5">
            <div>
              <h2 className="font-display text-3xl font-semibold">{current.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {currentLimit !== undefined ? `${current.helper} ${currentCount} de ${currentLimit} porções escolhidas.` : current.helper}
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.ingredients.map((ingredient) => {
                const quantity = (selected[current.id] ?? []).filter((id) => id === ingredient.id).length;
                const selectedNow = quantity > 0;
                const repeatable = REPEATABLE_CATEGORIES.includes(current.id) && currentLimit !== undefined;
                if (repeatable) {
                  return (
                    <div key={ingredient.id} className={cn("rounded-3xl border p-4", selectedNow ? "border-foreground bg-accent" : "border-border bg-card", !ingredient.available && "opacity-45")}>
                      <div className="flex items-center justify-between gap-4">
                        <IngredientInfo ingredient={ingredient} />
                        <div className="flex shrink-0 items-center gap-2">
                          <button type="button" disabled={!ingredient.available || quantity === 0} onClick={() => changePortion(current, ingredient.id, -1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background disabled:opacity-35"><Minus className="h-4 w-4" /></button>
                          <span className="w-6 text-center text-lg font-semibold tabular-nums">{quantity}</span>
                          <button type="button" disabled={!ingredient.available || currentCount >= (currentLimit ?? 0)} onClick={() => changePortion(current, ingredient.id, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-35"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <button key={ingredient.id} type="button" disabled={!ingredient.available} onClick={() => current.selection === "multiple" ? toggleMultiple(current, ingredient.id) : toggleSingle(current, ingredient.id)} className={cn("rounded-3xl border p-4 text-left", selectedNow ? "border-foreground bg-accent" : "border-border bg-card hover:border-foreground/25", !ingredient.available && "cursor-not-allowed opacity-45")}>
                    <div className="flex items-start justify-between gap-3">
                      <IngredientInfo ingredient={ingredient} />
                      <span className="flex items-center gap-2">
                        {ingredient.available && CHARGEABLE_CATEGORIES.includes(current.id) && <span className="rounded-full bg-sage/25 px-2.5 py-1 text-[11px] font-medium">{SIZE_CATEGORIES.includes(current.id) ? formatBRL(ingredient.price) : `+ ${formatBRL(ingredient.price)}`}</span>}
                        {selectedNow && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"><Check className="h-3.5 w-3.5" /></span>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 space-y-4 border-t border-border pt-6">
          <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Seu pedido</h3>
          {chosen.length === 0 ? <p className="text-sm text-muted-foreground">Suas escolhas aparecem aqui.</p> : (
            <ul className="space-y-1.5 text-sm">
              {chosen.map((item) => <li key={`${item.categoryId}-${item.ingredientId}`} className="flex justify-between gap-3"><span className="text-muted-foreground">{item.categoryName}: <span className="text-foreground">{item.name}</span></span>{item.price > 0 && !SIZE_CATEGORIES.includes(item.categoryId) && <span className="shrink-0 text-muted-foreground">+ {formatBRL(item.price)}</span>}</li>)}
            </ul>
          )}
          <LiveSummary total={total} nutrition={nutrition} />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl space-y-3 px-5 pt-3 pb-5">
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Valores nutricionais aproximados</span><span className="font-display text-xl font-semibold tabular-nums">{formatBRL(total)}</span></div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="rounded-full" onClick={() => step === 0 ? setKind(null) : setStep(step - 1)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
            {step < categories.length - 1 ? <Button size="lg" className="flex-1 rounded-full" disabled={!stepValid} onClick={() => setStep(step + 1)}>Continuar<ChevronRight className="h-4 w-4" /></Button> : <Button size="lg" className="flex-1 rounded-full" disabled={!requirementsOk} onClick={handleCustomAdd}>Adicionar ao carrinho</Button>}
            {count > 0 && <Button asChild variant="secondary" size="lg" className="rounded-full px-4"><Link to="/checkout"><ShoppingBag className="h-4 w-4" />{count}</Link></Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function IngredientInfo({ ingredient }: { ingredient: Ingredient }) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{ingredient.name}</p>{ingredient.badge && <span className="rounded-full bg-lavender/45 px-2 py-0.5 text-[10px] font-semibold">{ingredient.badge}</span>}</div>
      <p className="mt-0.5 text-xs text-muted-foreground">{ingredient.portion}</p>
      {!ingredient.available && <p className="mt-2 text-[11px] font-medium text-muted-foreground">Indisponível hoje</p>}
    </div>
  );
}
