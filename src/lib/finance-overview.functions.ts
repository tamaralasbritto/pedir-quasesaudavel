import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-auth";

const periodSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

function sumAmounts(rows: Array<{ amount_cents: number }> | null | undefined) {
  return (rows ?? []).reduce((total, row) => total + row.amount_cents, 0);
}

export const getFinanceOverview = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => periodSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("finance_settings")
      .select("reporting_start_at, cash_baseline_at, cash_baseline_cents")
      .eq("id", 1)
      .single();

    if (settingsError || !settings) {
      console.error("[finance-v1] configurações indisponíveis", settingsError);
      throw new Error("Não foi possível carregar a configuração financeira.");
    }

    const requestedStart = new Date(data.startAt);
    const requestedEnd = new Date(data.endAt);
    const reportingStart = new Date(settings.reporting_start_at);
    const cashBaselineAt = new Date(settings.cash_baseline_at);

    if (requestedEnd <= requestedStart) {
      throw new Error("Período financeiro inválido.");
    }

    const effectiveStart = requestedStart > reportingStart ? requestedStart : reportingStart;

    const [salesResult, expensesResult, cashSalesResult, cashOutflowsResult] = await Promise.all([
      supabaseAdmin
        .from("financial_transactions")
        .select("amount_cents")
        .eq("type", "sale")
        .eq("settlement_status", "settled")
        .eq("account_scope", "business")
        .eq("cash_status", "cleared")
        .gte("settled_at", effectiveStart.toISOString())
        .lt("settled_at", requestedEnd.toISOString()),
      supabaseAdmin
        .from("financial_transactions")
        .select("amount_cents")
        .eq("type", "business_expense")
        .eq("settlement_status", "settled")
        .eq("account_scope", "business")
        .eq("cash_status", "cleared")
        .gte("occurred_at", effectiveStart.toISOString())
        .lt("occurred_at", requestedEnd.toISOString()),
      supabaseAdmin
        .from("financial_transactions")
        .select("amount_cents")
        .eq("type", "sale")
        .eq("settlement_status", "settled")
        .eq("account_scope", "business")
        .eq("cash_status", "cleared")
        .gt("settled_at", cashBaselineAt.toISOString()),
      supabaseAdmin
        .from("financial_transactions")
        .select("amount_cents, type")
        .in("type", ["business_expense", "owner_withdrawal"])
        .eq("settlement_status", "settled")
        .eq("account_scope", "business")
        .eq("cash_status", "cleared")
        .gt("occurred_at", cashBaselineAt.toISOString()),
    ]);

    const firstError =
      salesResult.error ?? expensesResult.error ?? cashSalesResult.error ?? cashOutflowsResult.error;

    if (firstError) {
      console.error("[finance-v1] falha ao calcular resumo", firstError);
      throw new Error("Não foi possível calcular o financeiro agora.");
    }

    const revenueCents = sumAmounts(salesResult.data);
    const expensesCents = sumAmounts(expensesResult.data);
    const cashInflowsAfterBaselineCents = sumAmounts(cashSalesResult.data);
    const cashOutflowsAfterBaselineCents = sumAmounts(cashOutflowsResult.data);
    const availableForWithdrawalCents = Math.max(
      0,
      settings.cash_baseline_cents + cashInflowsAfterBaselineCents - cashOutflowsAfterBaselineCents,
    );

    return {
      reportingStartAt: settings.reporting_start_at,
      periodStartAt: effectiveStart.toISOString(),
      periodEndAt: requestedEnd.toISOString(),
      revenueCents,
      expensesCents,
      availableForWithdrawalCents,
    };
  });
