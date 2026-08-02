import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3.5">
        <Link
          to="/"
          aria-label="Voltar para o início"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4.5 w-4.5" strokeWidth={1.6} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display truncate text-lg font-semibold">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="ml-auto">
          <BrandLogo variant="mark" className="h-7" />
        </div>
      </div>
    </header>
  );
}
