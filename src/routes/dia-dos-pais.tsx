import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LiveSummary } from "@/components/LiveSummary";
import { Button } from "@/components/ui/button";
import { getIngredientMaxPortions } from "@/config/availability";
import { STORE_CONFIG } from "@/config/store";
import { categoriesForKind } from "@/data/ingredients";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { sumNutrition } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import type { CartItemSelection, Ingredient, IngredientCategory, Nutrition } from "@/types";

export const Route = createFileRoute("/dia-dos-pais")({
  head: () => ({
    meta: [
      { title: "Açaí QUASE! saudável" },
      { name: "description", content: "Monte seu açaí QUASE! do seu jeito." },
    ],
  }),
  component: AcaiPage,
});

const LIMITS: Record<string, Partial<Record<string, number>>> = {
  "acai-300": { frutas: 2, caldas: 1, acompanhamentos: 4 },
  "acai-400": { frutas: 2, caldas: 2, acompanhamentos: 5 },
  "acai-500": { frutas: 2, caldas: 2, acompanhamentos: 6 },
  "acai-750-pais": { frutas: 3, caldas: 3, acompanhamentos: 10 },
};

const REPEATABLE = ["frutas", "caldas", "acompanhamentos"];

function AcaiPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);
  const { addItem, count } = useCart();
  const fathersDay = STORE_CONFIG.activeCampaign === "dia-dos-pais";

  const categories = useMemo(() => {
    return categoriesForKind("acai").map((category) => {
      const baseCategory = {
        ...category,
        ingredients: category.ingredients.filter((ingredient) => ingredient.available),
      };

      if (category.id !== "tamanho-acai" || !fathersDay) return baseCategory;
      return {
        ...baseCategory,
        helper: "Escolha seu tamanho. Hoje tem edição especial de Dia dos Pais.",
        ingredients: [
          ...baseCategory.ingredients,
          {
            id: "acai-750-pais",
            name: "750 ml — Especial Dia dos Pais",
            portion: "3 frutas · 3 caldas · 10 complementos",
            price: 25,
            badge: "Só hoje",
            nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            available: true,
          },
        ],
      };
    });
  }, [fathersDay]);

  const selectedSize = selected["tamanho-acai"]?.[0];
  const current = categories[step];
  const currentLimit = current && selectedSize ? LIMITS[selectedSize]?.[current.id] : undefined;
  const currentCount = current ? (selected[current.id] ?? []).length : 0;
  const isFruitStep = current?.id === "frutas";

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
          portion: quantity > 1 ? `${quantity} porções` : ingredient.portion,
          price: category.id === "tamanho-acai" ? ingredient.price : 0,
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
  const stepValid = isFruitStep
    ? true
    : currentLimit !== undefined
      ? currentCount === currentLimit
      : current?.required
        ? currentCount > 0
        : true;

  const requirementsOk = categories.every((category) => {
    const amount = (selected[category.id] ?? []).length;
    const limit = selectedSize ? LIMITS[selectedSize]?.[category.id] : undefined;
    if (category.id === "frutas") return limit === undefined || amount <= limit;
    if (limit !== undefined) return amount === limit;
    return category.required ? amount > 0 : true;
  });

  const toggleSingle = (category: IngredientCategory, ingredientId: string) => {
    setSelected((previous) => {
      const updated = { ...previous, [category.id]: [ingredientId] };
      if (category.id === "tamanho-acai") {
        updated["frutas"] = [];
        updated["caldas"] = [];
        updated["acompanhamentos"] = [];
      }
      return updated;
    });
  };

  const changePortion = (category: IngredientCategory, ingredientId: string, delta: 1 | -1) => {
    setSelected((previous) => {
      const currentIds = previous[category.id] ?? [];
      const limit = selectedSize ? LIMITS[selectedSize]?.[category.id] : undefined;
      const ingredientQuantity = currentIds.filter((id) => id === ingredientId).length;
      const ingredientLimit = getIngredientMaxPortions(ingredientId);

      if (delta === 1) {
        if (limit !== undefined && currentIds.length >= limit) return previous;
        if (ingredientLimit !== undefined && ingredientQuantity >= ingredientLimit) return previous;
        return { ...previous, [category.id]: [...currentIds, ingredientId] };
      }
      const index = currentIds.lastIndexOf(ingredientId);
      if (index < 0) return previous;
      return { ...previous, [category.id]: currentIds.filter((_, position) => position !== index) };
    });
  };

  const handleAdd = () => {
    if (!requirementsOk) return;
    const size = chosen.find((item) => item.categoryId === "tamanho-acai");
    addItem({
      type: "montado",
      productId: selectedSize === "acai-750-pais" ? "acai-dia-dos-pais" : "montado-acai",
      name: size ? `Açaí ${size.name}` : "Açaí",
      unitPrice: total,
      quantity: 1,
      nutrition,
      selections: chosen,
    });
    setJustAdded(true);
  };

  if (justAdded) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <PageHeader title="Prontinho!" subtitle="Seu açaí foi adicionado ao carrinho" />
        <main className="mx-auto max-w-3xl px-5 pt-10">
          <section className="rounded-4xl border border-border bg-card p-7 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/30"><Check className="h-7 w-7" /></span>
            <h1 className="font-display mt-5 text-3xl font-semibold">Tudo certo! 💚</h1>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" size="lg" className="rounded-full" onClick={() => { setJustAdded(false); setStep(0); setSelected({}); }}>Pedir outro açaí</Button>
              <Button asChild size="lg" className="rounded-full"><Link to="/checkout"><ShoppingBag className="h-4 w-4" />Ir para o carrinho ({count})</Link></Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-56">
      <PageHeader title="Açaí QUASE!" subtitle={fathersDay ? "Especial de Dia dos Pais" : "Monte do seu jeito"} />
      <main className="mx-auto max-w-3xl px-5 pt-6">
        {fathersDay && (
          <div className="mb-5 rounded-3xl bg-lavender/30 p-4 text-sm">
            <strong>Hoje tem açaí quase saudável!</strong> O especial de 750 ml vem com 3 frutas, 3 caldas e 10 complementos por R$ 25.
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {categories.map((category, index) => <div key={category.id} className={cn("h-0.5 flex-1 rounded-full", index <= step ? "bg-foreground" : "bg-border")} />)}
        </div>
        <p className="mt-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Passo {step + 1} de {categories.length}</p>

        {current && (
          <section className="mt-4 space-y-5">
            <div>
              <h2 className="font-display text-3xl font-semibold">{current.name}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isFruitStep && currentLimit !== undefined
                  ? `Fruta é opcional. Escolha até ${currentLimit} porções ou siga sem fruta. ${currentCount} de ${currentLimit} escolhidas.`
                  : currentLimit !== undefined
                    ? `${current.helper} ${currentCount} de ${currentLimit} porções escolhidas.`
                    : current.helper}
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {current.ingredients.map((ingredient) => {
                const quantity = (selected[current.id] ?? []).filter((id) => id === ingredient.id).length;
                const selectedNow = quantity > 0;
                const repeatable = REPEATABLE.includes(current.id) && currentLimit !== undefined;
                const ingredientLimit = getIngredientMaxPortions(ingredient.id);
                const reachedIngredientLimit = ingredientLimit !== undefined && quantity >= ingredientLimit;

                if (repeatable) {
                  return (
                    <div key={ingredient.id} className={cn("rounded-3xl border p-4", selectedNow ? "border-foreground bg-accent" : "border-border bg-card")}>
                      <div className="flex items-center justify-between gap-4">
                        <IngredientInfo ingredient={ingredient} />
                        <div className="flex shrink-0 items-center gap-2">
                          <button type="button" disabled={quantity === 0} onClick={() => changePortion(current, ingredient.id, -1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background disabled:opacity-35"><Minus className="h-4 w-4" /></button>
                          <span className="w-6 text-center text-lg font-semibold">{quantity}</span>
                          <button type="button" disabled={reachedIngredientLimit || currentCount >= (currentLimit ?? 0)} onClick={() => changePortion(current, ingredient.id, 1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-35"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button key={ingredient.id} type="button" onClick={() => toggleSingle(current, ingredient.id)} className={cn("rounded-3xl border p-4 text-left", selectedNow ? "border-foreground bg-accent" : "border-border bg-card")}>
                    <div className="flex items-start justify-between gap-3">
                      <IngredientInfo ingredient={ingredient} />
                      {current.id === "tamanho-acai" && <span className="rounded-full bg-sage/25 px-2.5 py-1 text-[11px] font-medium">{formatBRL(ingredient.price)}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-8 border-t border-border pt-6"><LiveSummary total={total} nutrition={nutrition} /></section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-5 pt-3 pb-5">
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="rounded-full" disabled={step === 0} onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
            {step < categories.length - 1 ? (
              <Button size="lg" className="flex-1 rounded-full" disabled={!stepValid} onClick={() => setStep(step + 1)}>Continuar<ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button size="lg" className="flex-1 rounded-full" disabled={!requirementsOk} onClick={handleAdd}>Adicionar ao carrinho</Button>
            )}
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
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium">{ingredient.name}</p>
        {ingredient.badge && <span className="rounded-full bg-lavender/45 px-2 py-0.5 text-[10px] font-semibold">{ingredient.badge}</span>}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{ingredient.portion}</p>
    </div>
  );
}
