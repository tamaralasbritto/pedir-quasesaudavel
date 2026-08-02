import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
        <div className="flex items-center justify-between py-6">
          <BrandLogo asLink={false} />
          <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Feito hoje
          </span>
        </div>

        <section className="pt-6 pb-8">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Uma escolha melhor hoje já é o bastante
          </p>
          <h1 className="font-display mt-5 text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            Comida fresca.
            <br />
            Preparada hoje.
            <br />
            <span className="italic font-normal text-olive">Entregue no seu condomínio.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Escolha uma opção e faça seu pedido em poucos minutos.
          </p>
        </section>

        <img
          src={heroImage}
          alt="Refeições frescas em potes: saladas, frutas e sanduíches naturais"
          width={1536}
          height={1024}
          className="h-64 w-full rounded-4xl object-cover sm:h-80"
        />

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          {navCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex flex-col justify-between rounded-4xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-soft"
            >
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">{card.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </div>
              <Button
                size="lg"
                className="mt-8 w-full rounded-full"
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

        <section className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8 text-center">
          {["Pronto no dia", "Entrega no prédio", "Ingredientes frescos"].map((label) => (
            <p key={label} className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {label}
            </p>
          ))}
        </section>

        <p className="font-display mt-12 text-center text-lg leading-relaxed italic text-muted-foreground">
          Ninguém precisa ser perfeito. Só precisa fazer uma escolha melhor hoje.
        </p>
      </div>
    </main>
  );
}
