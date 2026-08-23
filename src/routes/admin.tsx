import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, LogOut, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";

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
import { getFinanceOverview } from "@/lib/finance-overview.functions";

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
type FinanceOverview = Awaited<ReturnType<typeof getFinanceOverview>>;
type PeriodKey = "today" | "7d" | "30d" | "all" | "custom";

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

function recifeYmd(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftYmd(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toPeriodIso(startYmd: string, endYmd: string) {
  return {
    startAt: new Date(`${startYmd}T00:00:00-03:00`).toISOString(),
    endAt: new Date(`${shiftYmd(endYmd, 1)}T00:00:00-03:00`).toISOString(),
  };
}

function resolvePeriod(period: PeriodKey, customStart: string, customEnd: string) {
  const today = recifeYmd();
  if (period === "today") return toPeriodIso(today, today);
  if (period === "7d") return toPeriodIso(shiftYmd(today, -6), today);
  if (period === "30d") return toPeriodIso(shiftYmd(today, -29), today);
  if (period === "all") return toPeriodIso("2000-01-01", today);
  return toPeriodIso(customStart || today, customEnd || today);
}

function AdminPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [finance, setFinance] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [workingOrderId, setWorkingOrderId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<"signed-out" | "signed-in" | "denied">("signed-out");
  const [error, setError] = useState<string | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [customStart, setCustomStart] = useState(recifeYmd());
  const [customEnd, setCustomEnd] = useState(recifeYmd());

  const periodRange = useMemo(
    () => resolvePeriod(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const loadFinance = useCallback(async () => {
    setFinanceLoading(true);
    setFinanceError(null);
    try {
      const next = await getFinanceOverview({ data: periodRange });
      setFinance(next);
    } catch (err) {
      setFinanceError(err instanceof Error ? err.message : "Não foi possível carregar o financeiro.");
    } finally {
      setFinanceLoading(false);
    }
  }, [periodRange]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setDashboard(null);
      setFinance(null);
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
    const { data } = supabase.auth.onAuthStateChange(() => void loadDashboard());
    return () => data.subscription.unsubscribe();
  }, [loadDashboard]);

  useEffect(() => {
    if (dashboard) void loadFinance();
  }, [dashboard, loadFinance]);

  const runOrderAction = useCallback(
    async (orderId: string, action: () => Promise<unknown>) => {
      setWorkingOrderId(orderId);
      setError(null);
      try {
        await action();
        await Promise.all([loadDashboard(), loadFinance()]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível atualizar o pedido.");
      } finally {
        setWorkingOrderId(null);
      }
    },
    [loadDashboard, loadFinance],
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
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void Promise.all([loadDashboard(), loadFinance()])}
            >
              <RefreshCw className="h-4 w-4" /> Atualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut({ scope: "local" });
                setDashboard(null);
                setFinance(null);
              }}
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </header>

        <section className="pt-4 pb-7">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">QUASE! por dentro</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">O que importa agora.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Faturamento do período e quanto já pode sair da QUASE! para você sem misturar o histórico antigo.
          </p>
        </section>

        {error ? (
          <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <FinancePanel
          finance={finance}
          loading={financeLoading}
          error={financeError}
          period={period}
          setPeriod={setPeriod}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
        />

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Operação</p>
              <h2 className="font-display mt-1 text-3xl font-semibold">Pedidos</h2>
            </div>
            <span className="text-sm text-muted-foreground">{dashboard.orders.length} recentes</span>
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

function FinancePanel({
  finance,
  loading,
  error,
  period,
  setPeriod,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}: {
  finance: FinanceOverview | null;
  loading: boolean;
  error: string | null;
  period: PeriodKey;
  setPeriod: (value: PeriodKey) => void;
  customStart: string;
  setCustomStart: (value: string) => void;
  customEnd: string;
  setCustomEnd: (value: string) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Financeiro</p>
          <h2 className="font-display mt-1 text-3xl font-semibold">Resumo</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["today", "7d", "30d", "all"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={period === value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPeriod(value)}
            >
              {value === "today" ? "Hoje" : value === "7d" ? "7 dias" : value === "30d" ? "30 dias" : "Tudo"}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={period === "custom" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setPeriod("custom")}
          >
            Personalizado
          </Button>
        </div>
      </div>

      {period === "custom" ? (
        <div className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <label className="text-xs text-muted-foreground">
            De
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Até
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="mt-1" />
          </label>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Faturamento no período</p>
            <p className="font-display mt-2 text-4xl font-semibold">{finance ? money(finance.revenueCents) : "—"}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Só entra venda com pagamento confirmado.
            </p>
          </CardContent>
        </Card>
        <Card className="border-olive/30 bg-sage/10">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Disponível para retirar agora</p>
            <p className="font-display mt-2 text-4xl font-semibold">
              {finance ? money(finance.availableForWithdrawalCents) : "—"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              É o dinheiro livre da QUASE! que pode virar dinheiro pessoal.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Despesas da QUASE! no período</span>
        <strong>{finance ? money(finance.expensesCents) : "—"}</strong>
      </div>

      {finance ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Nova verdade financeira válida desde {new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife" }).format(new Date(finance.reportingStartAt))}.
        </p>
      ) : loading ? (
        <p className="mt-2 text-xs text-muted-foreground">Atualizando financeiro…</p>
      ) : null}
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
              <WalletCards className="h-4 w-4" /> Pix recebido
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
              onStatusChange(event.target.value as "new" | "confirmed" | "preparing" | "delivered" | "cancelled")
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
              Acesso por link enviado ao e-mail autorizado.
            </p>
          </CardHeader>
          <CardContent>
            {denied ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm">
                  Esta conta está autenticada, mas não tem acesso administrativo.
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
                      shouldCreateUser: false,
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
                {sent ? <p className="text-sm text-olive">Link enviado. Abra o e-mail neste dispositivo.</p> : null}
                {loginError || error ? <p className="text-sm text-destructive">{loginError ?? error}</p> : null}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
