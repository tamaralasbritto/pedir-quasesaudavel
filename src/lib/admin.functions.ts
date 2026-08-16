import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-auth";

const ORDER_STATUSES = ["new", "confirmed", "preparing", "delivered", "cancelled"] as const;

function sumByType(
  rows: Array<{
    type: string;
    amount_cents: number;
    settlement_status: string;
    account_scope: string;
    cash_status: string;
  }>,
  type: string,
  options?: { businessAccountOnly?: boolean },
) {
  return rows
    .filter(
      (row) =>
        row.type === type &&
        row.settlement_status === "settled" &&
        row.cash_status === "cleared" &&
        (!options?.businessAccountOnly || row.account_scope === "business"),
    )
    .reduce((total, row) => total + row.amount_cents, 0);
}

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [ordersResult, paymentsResult, transactionsResult, reservesResult] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select(
          "id, order_number, customer_name, customer_whatsapp, block, apartment, unit_key, subtotal_cents, status, notes, created_at, fulfillment_type, order_items(id, product_name, quantity, line_total_cents, selections)",
        )
        .neq("customer_name", "teste")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("financial_transactions")
        .select("order_id, settlement_status, account_scope")
        .eq("type", "sale")
        .not("order_id", "is", null),
      supabaseAdmin
        .from("financial_transactions")
        .select("type, amount_cents, settlement_status, account_scope, cash_status"),
      supabaseAdmin
        .from("financial_reserves")
        .select("amount_cents")
        .eq("status", "active"),
    ]);

    if (ordersResult.error || paymentsResult.error || transactionsResult.error || reservesResult.error) {
      console.error("[admin] falha ao carregar painel", {
        orders: ordersResult.error,
        payments: paymentsResult.error,
        transactions: transactionsResult.error,
        reserves: reservesResult.error,
      });
      throw new Error("Não foi possível carregar o painel administrativo.");
    }

    const paymentByOrder = new Map(
      (paymentsResult.data ?? []).map((payment) => [payment.order_id, payment]),
    );

    const orders = (ordersResult.data ?? []).map((order) => {
      const payment = paymentByOrder.get(order.id);
      return {
        ...order,
        paymentStatus: payment?.settlement_status ?? "untracked",
        paymentAccountScope: payment?.account_scope ?? null,
      };
    });

    const transactions = transactionsResult.data ?? [];
    const businessSalesCents = sumByType(transactions, "sale");
    const businessExpensesCents = sumByType(transactions, "business_expense");
    const ownerWithdrawalsCents = sumByType(transactions, "owner_withdrawal");
    const ownerContributionsCents = sumByType(transactions, "owner_contribution");
    const loansInCents = sumByType(transactions, "loan_in");
    const loanPaymentsCents = sumByType(transactions, "loan_payment");

    const accountInflowsCents =
      sumByType(transactions, "sale", { businessAccountOnly: true }) +
      sumByType(transactions, "owner_contribution", { businessAccountOnly: true }) +
      sumByType(transactions, "loan_in", { businessAccountOnly: true }) +
      sumByType(transactions, "adjustment", { businessAccountOnly: true });

    const accountOutflowsCents =
      sumByType(transactions, "business_expense", { businessAccountOnly: true }) +
      sumByType(transactions, "owner_withdrawal", { businessAccountOnly: true }) +
      sumByType(transactions, "loan_payment", { businessAccountOnly: true });

    const accountBalanceCents = accountInflowsCents - accountOutflowsCents;
    const activeReservesCents = (reservesResult.data ?? []).reduce(
      (total, reserve) => total + reserve.amount_cents,
      0,
    );

    const pendingSalesCents = transactions
      .filter((row) => row.type === "sale" && row.settlement_status === "pending")
      .reduce((total, row) => total + row.amount_cents, 0);

    return {
      adminRole: context.adminRole,
      orders,
      summary: {
        salesCents: businessSalesCents,
        businessExpensesCents,
        cashOperatingResultCents: businessSalesCents - businessExpensesCents,
        ownerWithdrawalsCents,
        ownerContributionsCents,
        outstandingLoansCents: loansInCents - loanPaymentsCents,
        pendingSalesCents,
        accountBalanceCents,
        activeReservesCents,
        availableForWithdrawalCents: accountBalanceCents - activeReservesCents,
      },
    };
  });

export const confirmOrderPayment = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        accountScope: z.enum(["business", "external"]).default("business"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payment, error } = await supabaseAdmin
      .from("financial_transactions")
      .update({
        settlement_status: "settled",
        account_scope: data.accountScope,
      })
      .eq("type", "sale")
      .eq("order_id", data.orderId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[admin] falha ao confirmar pagamento", error);
      throw new Error("Não foi possível confirmar o pagamento.");
    }

    if (!payment) {
      throw new Error("Venda financeira não encontrada para este pedido.");
    }

    await supabaseAdmin
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", data.orderId)
      .eq("status", "new");

    return { ok: true as const };
  });

export const markOrderPaymentPending = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("financial_transactions")
      .update({ settlement_status: "pending" })
      .eq("type", "sale")
      .eq("order_id", data.orderId);

    if (error) {
      console.error("[admin] falha ao reabrir pagamento", error);
      throw new Error("Não foi possível marcar o pagamento como pendente.");
    }

    return { ok: true as const };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        status: z.enum(ORDER_STATUSES),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);

    if (error) {
      console.error("[admin] falha ao atualizar pedido", error);
      throw new Error("Não foi possível atualizar o pedido.");
    }

    return { ok: true as const };
  });
