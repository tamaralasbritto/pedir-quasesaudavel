import { WHATSAPP_NUMBER } from "@/config/business";
import { formatBRL } from "@/lib/format";
import type { CartItemSelection, Order } from "@/types";

const categoryLabels: Record<string, string> = {
  complementos: "Ingredientes",
  proteina: "Proteína",
  molhos: "Molho",
  extras: "Extras",
  frutas: "Frutas",
  "frutas-salada": "Frutas",
  caldas: "Caldas",
  acompanhamentos: "Acompanhamentos",
  "adicionais-frutas": "Adicionais",
};

const sizeCategories = ["tamanho", "tamanho-acai", "tamanho-frutas"];

function compactSelections(selections: CartItemSelection[]): string[] {
  const grouped = selections.reduce<Record<string, string[]>>((acc, selection) => {
    if (sizeCategories.includes(selection.categoryId)) return acc;

    const label = categoryLabels[selection.categoryId] ?? selection.categoryName;
    acc[label] = [...(acc[label] ?? []), selection.name];
    return acc;
  }, {});

  return Object.entries(grouped).map(([label, names]) => `*${label}:* ${names.join(", ")}`);
}

export function buildWhatsAppMessage(order: Order): string {
  const lines: string[] = [
    "*PEDIDO QUASE!*",
    `*Cliente:* ${order.customer.name} — *Apto:* ${order.customer.apartment}`,
    "",
  ];

  order.items.forEach((item, index) => {
    lines.push(`*${item.quantity}x ${item.name} — ${formatBRL(item.unitPrice * item.quantity)}*`);
    lines.push(...compactSelections(item.selections));
    if (index < order.items.length - 1) lines.push("");
  });

  lines.push("", `*Total:* ${formatBRL(order.subtotal)}`);
  if (order.notes?.trim()) lines.push(`*Obs.:* ${order.notes.trim()}`);

  return lines.join("\n");
}

export function whatsappLink(order: Order): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
}
