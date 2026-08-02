import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

export const Route = createFileRoute("/prontos")({
  head: () => ({
    meta: [
      { title: "Prontos para você — QUASE! saudável" },
      {
        name: "description",
        content:
          "Saladas de folhas, sanduíche natural de frango e salada de frutas preparados no dia, prontos para pedir.",
      },
      { property: "og:title", content: "Prontos para você — QUASE! saudável" },
      {
        property: "og:description",
        content: "Opções equilibradas, preparadas no dia e prontas para pedir.",
      },
    ],
  }),
  component: ProntosPage,
});

function ProntosPage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader title="Prontos para você" subtitle="Preparados hoje pela manhã" />
      <main className="mx-auto max-w-3xl space-y-5 px-5 pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Opções equilibradas, prontas para pedir. Os valores nutricionais são estimativas com base
          nas porções servidas.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
