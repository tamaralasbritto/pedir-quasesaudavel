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
    <article className="overflow-hidden rounded-4xl border border-border bg-card transition-shadow hover:shadow-soft">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-semibold">{product.name}</h3>
            <span className="shrink-0 text-base font-semibold tabular-nums">
              {formatBRL(product.price)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] tracking-wide text-muted-foreground uppercase">
          {product.highlights.map((h) => (
            <span key={h} className="after:ml-3 after:text-border after:content-['·'] last:after:content-['']">
              {h}
            </span>
          ))}
        </div>

        <NutritionGrid nutrition={product.nutrition} />

        <div className="flex items-center justify-between gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button size="lg" className="flex-1 rounded-full" onClick={handleAdd}>
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </article>
  );
}
