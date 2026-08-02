import { WHATSAPP_NUMBER } from "@/config/business";
import { formatBRL } from "@/lib/format";
import type { Order } from "@/types";

const paymentLabel = { pix: "Pix", dinheiro: "Dinheiro" } as const;

export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = [];
  lines.push("*Novo pedido — QUASE! saudável*", "");
  lines.push(`*Cliente:* ${order.customer.name}`);
  lines.push(`*Apartamento:* ${order.customer.apartment}`);
  if (order.customer.whatsapp) lines.push(`*WhatsApp:* ${order.customer.whatsapp}`);
  lines.push(`*Pagamento:* ${paymentLabel[order.payment]}`);
  if (order.payment === "dinheiro") {
    lines.push(
      order.needsChange && order.changeFor
        ? `*Troco para:* ${order.changeFor}`
        : "*Troco:* não precisa",
    );
  }
  lines.push("", "*Itens*");

  order.items.forEach((item) => {
    lines.push(`${item.quantity}x ${item.name} — ${formatBRL(item.unitPrice * item.quantity)}`);
    item.selections.forEach((s) => {
      lines.push(`   • ${s.categoryName}: ${s.name} (${s.portion})`);
    });
  });

  lines.push("", `*Subtotal:* ${formatBRL(order.subtotal)}`);
  if (order.notes?.trim()) lines.push("", `*Observações:* ${order.notes.trim()}`);
  lines.push("", "Enviado pelo site QUASE! saudável");

  return lines.join("\n");
}

export function whatsappLink(order: Order): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}
