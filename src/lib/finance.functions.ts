import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amountCents: z.number().int().positive(),
  description: z.string().max(500).default(""),
  category: z.string().max(120).nullable().default(null),
  source: z.string().max(60).nullable().default("manual"),
  orderId: z.string().uuid().nullable().default(null),
  occurredAt: z.string().datetime().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const recordTransaction = createServerFn({ method: "POST" })
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
      metadata: { reserve_id: row.id },
    });

    return { ok: true as const, id: row.id };
  });

export const releaseReserve = createServerFn({ method: "POST" })
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
      metadata: { reserve_id: row.id },
    });

    return { ok: true as const, alreadyReleased: false };
  });

export const getFinancialSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: txs, error }, { data: reserves, error: reservesError }] = await Promise.all([
    supabaseAdmin.from("financial_transactions").select("type, amount_cents"),
    supabaseAdmin.from("financial_reserves").select("amount_cents").eq("status", "active"),
  ]);

  if (error || reservesError) throw new Error("Não foi possível carregar o resumo financeiro.");

  const sum = (type: string) =>
    (txs ?? []).filter((t) => t.type === type).reduce((acc, t) => acc + t.amount_cents, 0);

  const salesCents = sum("sale");
  const ownerContributionsCents = sum("owner_contribution");
  const loanInCents = sum("loan_in");
  const businessExpensesCents = sum("business_expense");
  const ownerWithdrawalsCents = sum("owner_withdrawal");
  const loanPaymentsCents = sum("loan_payment");
  const adjustmentsCents = sum("adjustment");

  const inflowsCents = salesCents + ownerContributionsCents + loanInCents + adjustmentsCents;
  const outflowsCents = businessExpensesCents + ownerWithdrawalsCents + loanPaymentsCents;
  const balanceCents = inflowsCents - outflowsCents;
  const activeReservesCents = (reserves ?? []).reduce((acc, r) => acc + r.amount_cents, 0);

  return {
    salesCents,
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
    availableForWithdrawalCents: balanceCents - activeReservesCents,
  };
});
