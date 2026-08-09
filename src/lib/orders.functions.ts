import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

    const subtotalCents = data.items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0,
    );

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

    return { ok: true as const, orderId: order.id };
  });
