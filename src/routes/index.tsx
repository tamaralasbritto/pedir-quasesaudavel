import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Leaf, MapPin } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QUASE! saudável — Comida fresca entregue no seu condomínio" },
      {
        name: "description",
        content:
          "Saladas, sanduíches naturais e frutas preparados hoje. Peça pronto ou monte do seu jeito e finalize pelo WhatsApp.",
      },
      { property: "og:title", content: "QUASE! saudável — Comida fresca, preparada hoje" },
      {
        property: "og:description",
        content: "Escolha uma opção e faça seu pedido em poucos minutos.",
      },
    ],
  }),
  component: Home,
});

const navCards = [
  {
    to: "/prontos" as const,
    title: "Prontos para você",
    description: "Opções equilibradas, preparadas no dia e prontas para pedir.",
    cta: "Ver opções",
  },
  {
    to: "/monte" as const,
    title: "Monte o seu",
    description: "Escolha a base, a proteína, os complementos e deixe tudo do seu jeito.",
    cta: "Começar",
  },
];

function Home() {
  return (
    <main className="min-h-screen bg-background pb-28">
      <div className="mx-auto max-w-3xl px-5">
        <div className="flex items-center justify-between py-5">
          <BrandLogo asLink={false} />
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Feito hoje
          </span>
        </div>

        <section className="overflow-hidden rounded-4xl bg-cream shadow-soft">
          <div className="space-y-5 px-6 pt-8 pb-6">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-sage/25 px-3 py-1.5 text-xs font-medium text-olive-deep">
              <Leaf className="h-3.5 w-3.5" />
              Uma escolha melhor hoje já é o bastante
            </p>
            <h1 className="font-display text-4xl leading-[1.1] font-semibold text-olive-deep sm:text-5xl">
              Comida fresca.
              <br />
              Preparada hoje.
              <br />
              <span className="text-olive">Entregue no seu condomínio.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Escolha uma opção e faça seu pedido em poucos minutos.
            </p>
          </div>
          <img
            src={heroImage}
            alt="Refeições frescas em potes: saladas, frutas e sanduíches naturais"
            width={1536}
            height={1024}
            className="h-56 w-full object-cover sm:h-72"
          />
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {navCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col justify-between rounded-4xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-olive-deep">{card.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </div>
              <Button
                size="lg"
                className="mt-6 w-full rounded-full"
                variant={card.to === "/prontos" ? "default" : "secondary"}
                asChild={false}
                tabIndex={-1}
              >
                <span className="flex items-center justify-center gap-2">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Clock3, label: "Pronto no dia" },
            { icon: MapPin, label: "Entrega no prédio" },
            { icon: Leaf, label: "Ingredientes frescos" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-3xl bg-muted px-3 py-5">
              <Icon className="mx-auto h-5 w-5 text-olive" />
              <p className="mt-2 text-xs font-medium text-olive-deep">{label}</p>
            </div>
          ))}
        </section>

        <p className="mt-10 text-center text-sm leading-relaxed text-muted-foreground">
          Ninguém precisa ser perfeito. Só precisa fazer uma escolha melhor hoje.
        </p>
      </div>
    </main>
  );
}
