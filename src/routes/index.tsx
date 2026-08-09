import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QUASE! saudável — Especial de Dia dos Pais" },
      {
        name: "description",
        content: "Hoje tem açaí QUASE! com opção especial de 750 ml no Torres de Olinda.",
      },
      { property: "og:title", content: "QUASE! saudável — Especial de Dia dos Pais" },
      {
        property: "og:description",
        content: "Hoje tem açaí QUASE! 💚",
      },
    ],
  }),
  component: Home,
});

const categories = [
  { emoji: "🥗", label: "Salada", available: false },
  { emoji: "🍧", label: "Açaí", available: true },
  { emoji: "🥪", label: "Sanduíche", available: false },
  { emoji: "🍓", label: "Frutas", available: false },
];

function Home() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-3xl px-5">
        <header className="flex items-center justify-between py-6">
          <BrandLogo asLink={false} />
          <span className="rounded-full bg-lavender/45 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] uppercase">
            Especial Dia dos Pais
          </span>
        </header>

        <section className="pt-7 pb-8">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Hoje tem açaí quase saudável!
          </p>
          <h1 className="font-display mt-5 text-[2.8rem] leading-[1.02] font-semibold tracking-tight sm:text-6xl">
            Açaí da QUASE!
            <br />
            <span className="font-normal text-olive italic">com edição de Dia dos Pais.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Hoje o cardápio está dedicado ao açaí — e tem um especial de 750 ml com 3 frutas, 3 caldas e 10 complementos por R$ 25. 💚
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <MapPin className="h-4 w-4 text-olive" />
            Entrega no Torres de Olinda
          </div>
        </section>

        <section className="relative overflow-hidden rounded-4xl border border-border bg-beige p-6 shadow-soft sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, #C8B6D9 1.5px, transparent 1.5px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.label}
                  className="rounded-3xl border border-white/70 bg-white/85 p-4 text-center backdrop-blur-sm"
                >
                  <span className="text-3xl" aria-hidden="true">{category.emoji}</span>
                  <p className="mt-2 text-sm font-medium">{category.label}</p>
                  {!category.available && (
                    <p className="mt-1 text-[10px] tracking-[0.1em] text-muted-foreground uppercase">Indisponível hoje</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-background/90 p-5 backdrop-blur-sm">
              <h2 className="font-display text-2xl font-semibold">Qual açaí você vai querer hoje?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Escolha o tamanho, as frutas, as caldas e seus complementos favoritos.
              </p>
              <Button asChild size="lg" className="mt-5 w-full rounded-full">
                <Link to="/dia-dos-pais">
                  Pedir meu açaí
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <p className="font-display mt-10 text-center text-lg leading-relaxed italic text-muted-foreground">
          Mas corre: o tamanho especial é por tempo limitado.
        </p>
      </div>
    </main>
  );
}
