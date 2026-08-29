import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Boxes, LogOut, Settings, WalletCards } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AdminOperationalPanel } from "@/components/AdminOperationalPanel";
import { CartProvider } from "@/lib/cart";
import { getOperationalAdminAccess } from "@/lib/operational.functions";
import { OperationalAvailabilityProvider, useOperationalAvailability } from "@/lib/operational-availability";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Try again</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QUASE! saudável" },
      { name: "description", content: "QUASE! saudável no Torres de Olinda." },
      { name: "author", content: "QUASE! saudável" },
      { property: "og:title", content: "QUASE! saudável" },
      { property: "og:description", content: "Hoje tem QUASE! 💚" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=DM+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}

function ClosedStore() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <section className="w-full max-w-3xl rounded-4xl border border-border bg-card px-6 py-16 text-center shadow-soft sm:px-10">
        <span className="inline-flex rounded-full bg-lavender/45 px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase">Encerramos por hoje</span>
        <h1 className="font-display mt-8 text-4xl font-semibold sm:text-6xl">A cozinha descansou. 💚</h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">Obrigada pelos pedidos de hoje. A QUASE! volta em breve.</p>
        <p className="font-display mt-10 text-2xl text-olive italic">Até já!</p>
      </section>
    </main>
  );
}

type AdminSection = "financeiro" | "estoque" | "configuracoes";

const ADMIN_NAVIGATION: ReadonlyArray<{
  id: AdminSection;
  label: string;
  icon: typeof WalletCards;
}> = [
  { id: "financeiro", label: "Financeiro", icon: WalletCards },
  { id: "estoque", label: "Estoque", icon: Boxes },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

function AdminWorkspace() {
  const [authorized, setAuthorized] = useState(false);
  const [section, setSection] = useState<AdminSection>("financeiro");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as AdminSection;
    if (ADMIN_NAVIGATION.some((item) => item.id === hash)) setSection(hash);
  }, []);

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      try {
        await getOperationalAdminAccess();
        if (active) setAuthorized(true);
      } catch {
        if (active) setAuthorized(false);
      }
    };

    void checkAccess();
    const { data } = supabase.auth.onAuthStateChange(() => void checkAccess());
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!authorized) return <Outlet />;

  const selectSection = (next: AdminSection) => {
    setSection(next);
    window.history.replaceState(null, "", `${window.location.pathname}#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="z-50 border-b border-border bg-card md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:block md:px-5 md:py-6">
          <div>
            <p className="font-display text-xl font-semibold">QUASE!</p>
            <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Painel administrativo</p>
          </div>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut({ scope: "local" })}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted md:mt-8 md:w-full md:justify-start"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:px-3 md:pb-0" aria-label="Áreas do painel">
          {ADMIN_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSection(item.id)}
                aria-pressed={active}
                className={active
                  ? "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-foreground px-4 text-sm font-medium text-background md:w-full"
                  : "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted md:w-full"}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        {section === "financeiro" ? <Outlet /> : null}
        {section === "estoque" ? <AdminOperationalPanel view="stock" /> : null}
        {section === "configuracoes" ? <AdminOperationalPanel view="settings" /> : null}
      </div>
    </div>
  );
}

function StoreGate() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { loading, error, storeOpen } = useOperationalAvailability();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) return <AdminWorkspace />;
  if (loading) return <main className="min-h-screen bg-background px-5 py-12 text-center text-sm text-muted-foreground">Carregando…</main>;
  if (error || !storeOpen) return <ClosedStore />;
  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <OperationalAvailabilityProvider>
        <CartProvider>
          <StoreGate />
          <Toaster position="top-center" />
        </CartProvider>
      </OperationalAvailabilityProvider>
    </QueryClientProvider>
  );
}
