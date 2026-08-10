import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/mini-salada")({
  head: () => ({
    meta: [
      { title: "Mini salada — QUASE! saudável" },
      { name: "description", content: "Hoje tem mini salada QUASE! no Torres de Olinda." },
    ],
  }),
  component: MiniSaladPage,
});

const PRICE = 6;

function MiniSaladPage() {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem, count } = useCart();

  const addToCart = () => {
    addItem({
      type: "pronto",
      productId: "mini-salada-hoje",
      name: "Mini salada 300 ml",
      unitPrice: PRICE,
      quantity,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      selections: [],
    });
    setJustAdded(true);
  };

  if (justAdded) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <PageHeader title="Prontinho!" subtitle="Sua mini salada foi adicionada ao carrinho" />
        <main className="mx-auto max-w-3xl px-5 pt-10">
          <section className="rounded-4xl border border-border bg-card p-7 text-center shadow-soft">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/30">
              <Check className="h-7 w-7" />
            </span>
            <h1 className="font-display mt-5 text-3xl font-semibold">Tudo certo! 💚</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Hoje a cozinha está com mini saladas prontas para pedir.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" size="lg" className="rounded-full" onClick={() => { setJustAdded(false); setQuantity(1); }}>
                Pedir outra
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

  return (
    <div className="min-h-screen bg-background pb-36">
      <PageHeader title="Mini salada" subtitle="Disponível hoje" />
      <main className="mx-auto max-w-3xl px-5 pt-8">
        <section className="rounded-4xl border border-border bg-card p-6 shadow-soft">
          <span className="inline-flex rounded-full bg-lavender/45 px-3 py-1 text-xs font-semibold">Só hoje</span>
          <h1 className="font-display mt-4 text-3xl font-semibold">Mini salada 300 ml</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Alface, tomate, cebola roxa e pepino. Receita fixa para hoje.
          </p>

          <div className="mt-6 rounded-3xl bg-cream p-4">
            <p className="text-xs text-muted-foreground">Hoje vai com</p>
            <p className="mt-2 text-sm font-medium">Alface · Tomate · Cebola roxa · Pepino</p>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-3xl bg-cream p-4">
            <div>
              <p className="text-xs text-muted-foreground">Valor unitário</p>
              <p className="font-display mt-1 text-2xl font-semibold">{formatBRL(PRICE)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Diminuir quantidade" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background disabled:opacity-35">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-xl font-semibold tabular-nums">{quantity}</span>
              <button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => value + 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 pt-3 pb-5 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button size="lg" className="flex-1 rounded-full" onClick={addToCart}>
            Adicionar · {formatBRL(PRICE * quantity)}
          </Button>
          {count > 0 && (
            <Button asChild variant="secondary" size="lg" className="rounded-full px-4">
              <Link to="/checkout"><ShoppingBag className="h-4 w-4" />{count}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
