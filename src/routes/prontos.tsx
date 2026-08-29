import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";
import { useOperationalAvailability } from "@/lib/operational-availability";

export const Route = createFileRoute("/prontos")({
  head: () => ({
    meta: [
      { title: "Prontos para você — QUASE! saudável" },
      { name: "description", content: "Opções QUASE! prontas para pedir." },
    ],
  }),
  component: ProntosPage,
});

function ProntosPage() {
  const { isProductAvailable } = useOperationalAvailability();
  const enabledProducts = products.filter((product) => {
    if (product.kind === "sanduiche-natural") return isProductAvailable("sandwich");
    if (product.kind === "salada-folhas") return isProductAvailable("salad");
    if (product.kind === "salada-frutas") return isProductAvailable("fruitSalad");
    return false;
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title="Prontos para você" subtitle="Preparados para pedir" />
      <main className="mx-auto max-w-3xl space-y-5 px-5 pt-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {enabledProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!enabledProducts.length ? <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma opção pronta disponível agora.</p> : null}
      </main>
    </div>
  );
}
