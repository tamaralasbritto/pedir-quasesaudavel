import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";

export function CartWidget() {
  const [open, setOpen] = useState(false);
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/checkout") return null;

  return (
    <>
      {count > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-1/2 z-50 flex w-[min(92vw,26rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-full bg-primary px-5 py-4 text-primary-foreground shadow-lift transition-transform active:scale-[0.98] animate-in slide-in-from-bottom-4"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
              <ShoppingBag className="h-4.5 w-4.5" />
            </span>
            Ver carrinho · {count} {count === 1 ? "item" : "itens"}
          </span>
          <span className="text-base font-semibold tabular-nums">{formatBRL(subtotal)}</span>
        </button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] rounded-t-4xl border-0 p-0">
          <SheetHeader className="px-5 pt-6 pb-2 text-left">
            <SheetTitle className="font-display text-2xl text-olive-deep">Seu carrinho</SheetTitle>
            <SheetDescription>Confira os itens antes de finalizar.</SheetDescription>
          </SheetHeader>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto px-5 pb-2">
            {items.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Seu carrinho está vazio por enquanto.
              </p>
            )}
            {items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-olive-deep">{item.name}</h4>
                    {item.selections.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                        {item.selections.map((s) => (
                          <li key={s.ingredientId}>
                            {s.categoryName}: {s.name} · {s.portion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remover ${item.name}`}
                    onClick={() => removeItem(item.id)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    min={1}
                    onChange={(q) => updateQuantity(item.id, q)}
                  />
                  <span className="font-semibold tabular-nums text-olive-deep">
                    {formatBRL(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border bg-muted/50 px-5 pt-4 pb-6">
            <div className="flex items-center justify-between text-base">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-semibold tabular-nums text-olive-deep">
                {formatBRL(subtotal)}
              </span>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full rounded-full"
              disabled={items.length === 0}
            >
              <Link to="/checkout" onClick={() => setOpen(false)}>
                Ir para o checkout
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
