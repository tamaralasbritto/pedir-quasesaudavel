import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  LogOut,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { BrandLogo } from "@/components/BrandLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  confirmOrderPayment,
  getAdminDashboard,
  markOrderPaymentPending,
  updateOrderStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — QUASE! saudável" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Dashboard = Awaited<ReturnType<typeof getAdminDashboard>>;
type Order = Dashboard["orders"][number];

const ORDER_STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  confirmed: "Confirmado",
  preparing: "Preparando",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Recife",
  }).format(new Date(value));
}

function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingOrderId, setWorkingOrderId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<"signed-out" | "signed-in" | "denied">("signed-out");
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setDashboard(null);
      setSessionState("signed-out");
      setLoading(false);
      return;
    }

    setSessionState("signed-in");
    try {
      const next = await getAdminDashboard();
      setDashboard(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível abrir o painel.";
      setDashboard(null);
      setSessionState(message.toLowerCase().includes("não autorizado") ? "denied" : "signed-in");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void loadDashboard();
    });

    return () => data.subscription.unsubscribe();
  }, [loadDashboard]);

  const runOrderAction = useCallback(
    async (orderId: string, action: () => Promise<unknown>) => {
      setWorkingOrderId(orderId);
      setError(null);
      try {
        await action();
        await loadDashboard();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível atualizar o pedido.");
      } finally {
        setWorkingOrderId(null);
      }
    },
    [loadDashboard],
  );

  if (loading && !dashboard) {
    return (
      <main className="min-h-screen bg-background px-5 py-12">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">Carregando…</div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <AdminLogin
        denied={sessionState === "denied"}
        error={error}
        onSignedOut={() => {
          setSessionState("signed-out");
          setError(null);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-6xl px-5">
        <header className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <BrandLogo asLink={false} />
            <Badge variant="outline" className="gap-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadDashboard()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut({ scope: "local" });
                setDashboard(null);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <section className="pt-4 pb-7">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">QUASE! por dentro</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Pedidos e caixa.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pedido feito não é dinheiro disponível. Aqui o caixa só reconhece a venda depois da confirmação do Pix.
          </p>
        </section>

        {error ? (
          <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <FinancialSummary dashboard={dashboard} />

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Operação</p>
              <h2 className="font-display mt-1 text-3xl font-semibold">Pedidos</h2>
            </div>
            <span className="text-sm text-muted-foreground">{dashboard.orders.length} no histórico recente</span>
          </div>

          <div className="grid gap-4">
            {dashboard.orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                working={workingOrderId === order.id}
                onConfirmPayment={() =>
                  runOrderAction(order.id, () =>
                    confirmOrderPayment({ data: { orderId: order.id, accountScope: "business" } }),
                  )
                }
                onReopenPayment={() =>
                  runOrderAction(order.id, () => markOrderPaymentPending({ data: { orderId: order.id } }))
                }
                onStatusChange={(status) =>
                  runOrderAction(order.id, () => updateOrderStatus({ data: { orderId: order.id, status } }))
                }
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function FinancialSummary({ dashboard }: { dashboard: Dashboard }) {
  const cards = useMemo(
    () => [
      {
        label: "Disponível para retirada",
        value: money(dashboard.summary.availableForWithdrawalCents),
        featured: true,
      },
      { label: "Saldo calculado da conta", value: money(dashboard.summary.accountBalanceCents) },
      { label: "Reservado", value: money(dashboard.summary.activeReservesCents) },
      { label: "Vendas pendentes", value: money(dashboard.summary.pendingSalesCents) },
      { label: "Vendas confirmadas", value: money(dashboard.summary.salesCents) },
      { label: "Despesas da QUASE!", value: money(dashboard.summary.businessExpensesCents) },
      { label: "Retiradas pessoais", value: money(dashboard.summary.ownerWithdrawalsCents) },
      { label: "Empréstimos a devolver", value: money(dashboard.summary.outstandingLoansCents) },
    ],
    [dashboard],
  );

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className={card.featured ? "border-olive/30 bg-sage/10" : ""}>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="font-display mt-2 text-2xl font-semibold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function OrderCard({
  order,
  working,
  onConfirmPayment,
  onReopenPayment,
  onStatusChange,
}: {
  order: Order;
  working: boolean;
  onConfirmPayment: () => void;
  onReopenPayment: () => void;
  onStatusChange: (status: "new" | "confirmed" | "preparing" | "delivered" | "cancelled") => void;
}) {
  const paid = order.paymentStatus === "settled";
  const pending = order.paymentStatus === "pending";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b border-border/70 bg-card/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-display text-xl">#{order.order_number} · {order.customer_name}</CardTitle>
            {paid ? (
              <Badge className="gap-1 rounded-full bg-sage text-foreground hover:bg-sage">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pago
              </Badge>
            ) : pending ? (
              <Badge variant="outline" className="gap-1 rounded-full">
                <Clock3 className="h-3.5 w-3.5" /> Aguardando Pix
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full">Sem vínculo financeiro</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateTime(order.created_at)} · {order.fulfillment_type === "pickup" ? "Retirada" : order.unit_key ?? "Entrega"}
          </p>
        </div>
        <p className="font-display text-2xl font-semibold">{money(order.subtotal_cents)}</p>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-muted/40 px-4 py-3">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-medium">{item.quantity}× {item.product_name}</span>
                <span>{money(item.line_total_cents)}</span>
              </div>
              <SelectionText selections={item.selections} />
            </div>
          ))}
          {order.notes ? <p className="text-sm text-muted-foreground">Obs.: {order.notes}</p> : null}
        </div>

        <div className="flex min-w-52 flex-col gap-3">
          {pending ? (
            <Button disabled={working} onClick={onConfirmPayment} className="rounded-full">
              <WalletCards className="h-4 w-4" />
              Pix recebido
            </Button>
          ) : paid ? (
            <Button disabled={working} variant="outline" onClick={onReopenPayment} className="rounded-full">
              Marcar Pix pendente
            </Button>
          ) : null}

          <label className="text-xs font-medium text-muted-foreground" htmlFor={`status-${order.id}`}>
            Status do pedido
          </label>
          <select
            id={`status-${order.id}`}
            value={order.status}
            disabled={working}
            onChange={(event) =>
              onStatusChange(
                event.target.value as "new" | "confirmed" | "preparing" | "delivered" | "cancelled",
              )
            }
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectionText({ selections }: { selections: unknown }) {
  if (!Array.isArray(selections)) return null;
  const labels = selections
    .map((selection) => {
      if (!selection || typeof selection !== "object") return null;
      const name = "name" in selection && typeof selection.name === "string" ? selection.name : null;
      const portion = "portion" in selection && typeof selection.portion === "string" ? selection.portion : "";
      return name ? `${name}${portion ? ` (${portion})` : ""}` : null;
    })
    .filter(Boolean);

  if (!labels.length) return null;
  return <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{labels.join(" · ")}</p>;
}

function AdminLogin({
  denied,
  error,
  onSignedOut,
}: {
  denied: boolean;
  error: string | null;
  onSignedOut: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto max-w-md">
        <BrandLogo asLink={false} />
        <Card className="mt-10">
          <CardHeader>
            <Badge variant="outline" className="mb-2 w-fit gap-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> Área protegida
            </Badge>
            <CardTitle className="font-display text-3xl">Admin QUASE!</CardTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O acesso é por link enviado ao e-mail autorizado. Sem senha para esquecer e sem dados financeiros expostos no navegador.
            </p>
          </CardHeader>
          <CardContent>
            {denied ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm">
                  Esta conta está autenticada, mas ainda não foi autorizada como administradora.
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: "local" });
                    onSignedOut();
                  }}
                >
                  Entrar com outro e-mail
                </Button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setSending(true);
                  setLoginError(null);
                  setSent(false);

                  const { error: authError } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                      emailRedirectTo: `${window.location.origin}/admin`,
                    },
                  });

                  setSending(false);
                  if (authError) {
                    setLoginError(authError.message);
                    return;
                  }
                  setSent(true);
                }}
              >
                <div>
                  <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">E-mail</label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full rounded-full">
                  {sending ? "Enviando…" : "Receber link de acesso"}
                </Button>
                {sent ? (
                  <p className="text-sm text-olive">Link enviado. Abra o e-mail neste dispositivo para entrar.</p>
                ) : null}
                {loginError || error ? (
                  <p className="text-sm text-destructive">{loginError ?? error}</p>
                ) : null}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
