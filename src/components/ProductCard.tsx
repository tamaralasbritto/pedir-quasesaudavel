import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NutritionGrid } from "@/components/NutritionGrid";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      type: "pronto",
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      nutrition: product.nutrition,
      selections: [],
      image: product.image,
    });
    toast.success(`${product.name} no carrinho`, { description: "Boa escolha para hoje." });
    setQuantity(1);
  };

  return (
    <article className="overflow-hidden rounded-4xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold text-olive-deep">{product.name}</h3>
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground tabular-nums">
              {formatBRL(product.price)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full border border-sage/60 bg-sage/15 px-3 py-1 text-xs font-medium text-olive-deep"
            >
              {h}
            </span>
          ))}
        </div>

        <NutritionGrid nutrition={product.nutrition} />

        <div className="flex items-center justify-between gap-3 pt-1">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button size="lg" className="flex-1 rounded-full" onClick={handleAdd}>
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </article>
  );
}
