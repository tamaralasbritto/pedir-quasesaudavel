import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { OperationalDatabase, OperationalProductId } from "@/lib/operational-types";

const selectionSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  ingredientId: z.string(),
  name: z.string(),
  portion: z.string(),
  price: z.number(),
});

const orderSchema = z.object({
  checkoutToken: z.string().uuid(),
  customerName: z.string().min(1).max(120),
  customerWhatsapp: z.string().max(40).nullable(),
  block: z.enum(["A", "B", "C", "D"]),
  apartment: z.string().min(1).max(10),
  notes: z.string().max(1000).nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().max(120).nullable(),
        productName: z.string().min(1).max(200),
        quantity: z.number().int().min(1).max(99),
        unitPriceCents: z.number().int().min(0),
        selections: z.array(selectionSchema).max(50),
      }),
    )
    .min(1)
    .max(50),
});

const PRODUCT_OPERATIONAL_ID: Record<string, OperationalProductId> = {
  "pronto-salada-folhas": "salad",
  "pronto-sanduiche-frango": "sandwich",
  "pronto-salada-frutas": "fruitSalad",
  "mini-salada-hoje": "miniSalad",
  "acai-puro-200": "miniAcai",
  "montado-acai": "acai",
  "acai-dia-dos-pais": "acai",
};

async function assertOperationalAvailability(
  supabaseAdmin: unknown,
  items: z.infer<typeof orderSchema>["items"],
) {
  const db = supabaseAdmin as SupabaseClient<OperationalDatabase>;
  const { data: rows, error } = await db
    .from("operational_availability")
    .select("entity_type, entity_id, available, updated_at");

  if (error || !rows) throw new Error("Não foi possível validar a disponibilidade do pedido.");

  const lookup = new Map(rows.map((row) => [`${row.entity_type}:${row.entity_id}`, row.available]));
  if (lookup.get("store:store") !== true) throw new Error("A loja acabou de fechar. Atualize a página antes de pedir.");

  for (const item of items) {
    if (!item.productId) throw new Error("Produto sem identificação operacional.");
    const operationalProductId = PRODUCT_OPERATIONAL_ID[item.productId];
    if (!operationalProductId || lookup.get(`product:${operationalProductId}`) !== true) {
      throw new Error(`${item.productName} não está mais disponível. Atualize o carrinho.`);
    }

    for (const selection of item.selections) {
      if (lookup.get(`ingredient:${selection.ingredientId}`) !== true) {
        throw new Error(`${selection.name} não está mais disponível. Atualize o carrinho.`);
      }
    }
  }
}

export const saveOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const existing = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("checkout_token", data.checkoutToken)
      .maybeSingle();
    if (existing.data) return { ok: true as const, orderId: existing.data.id };

    await assertOperationalAvailability(supabaseAdmin, data.items);

    const subtotalCents = data.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        checkout_token: data.checkoutToken,
        customer_name: data.customerName,
        customer_whatsapp: data.customerWhatsapp,
        block: data.block,
        apartment: data.apartment,
        unit_key: `${data.block}-${data.apartment}`,
        subtotal_cents: subtotalCents,
        status: "new",
        notes: data.notes,
      })
      .select("id")
      .single();

    if (error || !order) throw new Error("Não foi possível salvar o pedido.");

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
      data.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price_cents: item.unitPriceCents,
        line_total_cents: item.unitPriceCents * item.quantity,
        selections: item.selections,
      })),
    );

    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw new Error("Não foi possível salvar os itens do pedido.");
    }

    const { error: financeError } = await supabaseAdmin.from("financial_transactions").insert({
      type: "sale",
      amount_cents: subtotalCents,
      description: `Pedido de ${data.customerName}`,
      category: "vendas",
      source: "order",
      order_id: order.id,
      settlement_status: "pending",
      account_scope: "business",
      metadata: { unit_key: `${data.block}-${data.apartment}` } as never,
    });
    if (financeError && financeError.code !== "23505") console.error("[finance] falha ao registrar venda", financeError);

    return { ok: true as const, orderId: order.id };
  });
