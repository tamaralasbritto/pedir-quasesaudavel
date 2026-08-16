import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-auth";

const TRANSACTION_TYPES = [
  "sale",
  "business_expense",
  "owner_withdrawal",
  "owner_contribution",
  "loan_in",
  "loan_payment",
  "reserve_set",
  "reserve_release",
  "adjustment",
] as const;

const SETTLEMENT_STATUSES = ["pending", "settled", "cancelled"] as const;
const ACCOUNT_SCOPES = ["business", "external"] as const;

const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amountCents: z.number().int().positive(),
  description: z.string().max(500).default(""),
  category: z.string().max(120).nullable().default(null),
  source: z.string().max(60).nullable().default("manual"),
  orderId: z.string().uuid().nullable().default(null),
  occurredAt: z.string().datetime().nullable().default(null),
  settlementStatus: z.enum(SETTLEMENT_STATUSES).default("settled"),
  accountScope: z.enum(ACCOUNT_SCOPES).default("business"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const recordTransaction = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => transactionSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("financial_transactions")
      .insert({
        type: data.type,
        amount_cents: data.amountCents,
        description: data.description,
        category: data.category,
        source: data.source,
        order_id: data.orderId,
        settlement_status: data.settlementStatus,
        account_scope: data.accountScope,
        metadata: data.metadata as never,
        ...(data.occurredAt ? { occurred_at: data.occurredAt } : {}),
      })
      .select("id")
      .single();

    if (error || !row) throw new Error("Não foi possível registrar a transação.");
    return { ok: true as const, id: row.id };
  });

const reserveSchema = z.object({
  name: z.string().min(1).max(120),
  amountCents: z.number().int().positive(),
  notes: z.string().max(500).nullable().default(null),
});

export const createReserve = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => reserveSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("financial_reserves")
      .insert({ name: data.name, amount_cents: data.amountCents, notes: data.notes })
      .select("id")
      .single();

    if (error || !row) throw new Error("Não foi possível criar a reserva.");

    await supabaseAdmin.from("financial_transactions").insert({
      type: "reserve_set",
      amount_cents: data.amountCents,
      description: `Reserva criada: ${data.name}`,
      source: "manual",
      settlement_status: "settled",
      account_scope: "business",
      metadata: { reserve_id: row.id },
    });

    return { ok: true as const, id: row.id };
  });

export const releaseReserve = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("financial_reserves")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("status", "active")
      .select("id, name, amount_cents")
      .maybeSingle();

    if (error) throw new Error("Não foi possível liberar a reserva.");
    if (!row) return { ok: true as const, alreadyReleased: true };

    await supabaseAdmin.from("financial_transactions").insert({
      type: "reserve_release",
      amount_cents: row.amount_cents,
      description: `Reserva liberada: ${row.name}`,
      source: "manual",
      settlement_status: "settled",
      account_scope: "business",
      metadata: { reserve_id: row.id },
    });

    return { ok: true as const, alreadyReleased: false };
  });

export const getFinancialSummary = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: txs, error }, { data: reserves, error: reservesError }] = await Promise.all([
      supabaseAdmin
        .from("financial_transactions")
        .select("type, amount_cents, settlement_status, account_scope"),
      supabaseAdmin.from("financial_reserves").select("amount_cents").eq("status", "active"),
    ]);

    if (error || reservesError) throw new Error("Não foi possível carregar o resumo financeiro.");

    const activeTransactions = (txs ?? []).filter((t) => t.settlement_status !== "cancelled");
    const settledBusinessTransactions = activeTransactions.filter(
      (t) => t.settlement_status === "settled" && t.account_scope === "business",
    );

    const sum = (
      rows: typeof settledBusinessTransactions,
      type: (typeof TRANSACTION_TYPES)[number],
    ) => rows.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount_cents, 0);

    const pendingSalesCents = activeTransactions
      .filter((t) => t.type === "sale" && t.settlement_status === "pending")
      .reduce((acc, t) => acc + t.amount_cents, 0);

    const externalSettledNetCents = activeTransactions
      .filter((t) => t.settlement_status === "settled" && t.account_scope === "external")
      .reduce((acc, t) => {
        if (["sale", "owner_contribution", "loan_in", "adjustment"].includes(t.type)) {
          return acc + t.amount_cents;
        }
        if (["business_expense", "owner_withdrawal", "loan_payment"].includes(t.type)) {
          return acc - t.amount_cents;
        }
        return acc;
      }, 0);

    const salesCents = sum(settledBusinessTransactions, "sale");
    const ownerContributionsCents = sum(settledBusinessTransactions, "owner_contribution");
    const loanInCents = sum(settledBusinessTransactions, "loan_in");
    const businessExpensesCents = sum(settledBusinessTransactions, "business_expense");
    const ownerWithdrawalsCents = sum(settledBusinessTransactions, "owner_withdrawal");
    const loanPaymentsCents = sum(settledBusinessTransactions, "loan_payment");
    const adjustmentsCents = sum(settledBusinessTransactions, "adjustment");

    const inflowsCents = salesCents + ownerContributionsCents + loanInCents + adjustmentsCents;
    const outflowsCents = businessExpensesCents + ownerWithdrawalsCents + loanPaymentsCents;
    const balanceCents = inflowsCents - outflowsCents;
    const activeReservesCents = (reserves ?? []).reduce((acc, r) => acc + r.amount_cents, 0);

    return {
      salesCents,
      pendingSalesCents,
      ownerContributionsCents,
      loanInCents,
      adjustmentsCents,
      inflowsCents,
      businessExpensesCents,
      ownerWithdrawalsCents,
      loanPaymentsCents,
      outflowsCents,
      balanceCents,
      activeReservesCents,
      externalSettledNetCents,
      availableForWithdrawalCents: balanceCents - activeReservesCents,
    };
  });
