import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ProductUnavailable({ name }: { name: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <section className="w-full max-w-xl rounded-4xl border border-border bg-card px-6 py-12 text-center shadow-soft">
        <span className="inline-flex rounded-full bg-muted px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
          Indisponível agora
        </span>
        <h1 className="font-display mt-6 text-4xl font-semibold">{name} esgotou por enquanto.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Volte para a loja para ver o que está disponível neste momento.
        </p>
        <Button asChild className="mt-7 rounded-full">
          <Link to="/">Ver a loja</Link>
        </Button>
      </section>
    </main>
  );
}
