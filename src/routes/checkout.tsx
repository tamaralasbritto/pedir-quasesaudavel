import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

const blocks = ["A", "B", "C", "D"];
const apartments = Array.from({ length: 10 }, (_, floor) =>
  Array.from({ length: 10 }, (_, unit) => `${floor}${String(unit + 1).padStart(2, "0")}`),
).flat();

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido — QUASE! saudável" },
      {
        name: "description",
        content: "Confirme seus dados e envie seu pedido pelo WhatsApp.",
      },
      { property: "og:title", content: "Finalizar pedido — QUASE! saudável" },
      { property: "og:description", content: "Poucos campos e seu pedido está feito." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, updateQuantity, removeItem, clear } = useCart();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [block, setBlock] = useState("");
  const [apartment, setApartment] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit =
    name.trim() && whatsapp.trim() && block && apartment && items.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Faltou preencher alguns dados", {
        description: "Nome, WhatsApp, bloco e apartamento são necessários.",
      });
      return;
    }

    const url = whatsappLink({
      customer: {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        apartment: `Bloco ${block} · Apto ${apartment}`,
      },
      items,
      subtotal,
      payment: "pix",
      needsChange: false,
      notes,
    });

    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Pedido enviado para o WhatsApp");
    clear();
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <PageHeader title="Finalizar pedido" subtitle="Só mais alguns dados" />

      <main className="mx-auto max-w-3xl space-y-6 px-5 pt-6">
        {items.length === 0 ? (
          <div className="rounded-4xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild className="mt-4 rounded-full">
              <Link to="/monte">Escolher produtos</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-4 rounded-4xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-olive-deep">Seus dados</h2>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="(81) 99999-9999"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="block">Bloco</Label>
                  <Select value={block} onValueChange={setBlock}>
                    <SelectTrigger id="block" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Selecione o bloco" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((option) => (
                        <SelectItem key={option} value={option}>
                          Bloco {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apartment">Apartamento</Label>
                  <Select value={apartment} onValueChange={setApartment}>
                    <SelectTrigger id="apartment" className="h-12 rounded-2xl">
                      <SelectValue placeholder="Selecione o apartamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="rounded-4xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-olive-deep">Pagamento</h2>
              <div className="mt-4 rounded-3xl border border-olive bg-accent p-4">
                <p className="font-semibold text-olive-deep">Pix</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A chave e as orientações serão enviadas pelo WhatsApp.
                </p>
              </div>
            </section>

            <section className="space-y-3 rounded-4xl border border-border bg-card p-5 shadow-soft">
              <Label htmlFor="notes" className="font-display text-lg font-semibold text-olive-deep">
                Observações do pedido
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Sem cebola, entregar depois das 12h..."
                className="min-h-24 rounded-2xl"
              />
            </section>

            <section className="space-y-3 rounded-4xl border border-border bg-cream p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-olive-deep">Resumo do pedido</h2>
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-olive-deep">{item.name}</p>
                      {item.selections.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {item.selections.map((selection) => (
                            <li key={`${selection.categoryId}-${selection.ingredientId}`}>
                              {selection.categoryName}: {selection.name} · {selection.portion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-olive-deep">
                      {formatBRL(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      onChange={(quantity) => updateQuantity(item.id, quantity)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-destructive"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-2xl font-semibold tabular-nums text-olive-deep">
                  {formatBRL(subtotal)}
                </span>
              </div>
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Pagamento exclusivamente por Pix. Valores nutricionais são estimativas.
              </p>
            </section>
          </>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-5 pt-3 pb-5 backdrop-blur-md">
          <div className="mx-auto max-w-3xl">
            <Button size="lg" className="h-14 w-full rounded-full text-base" onClick={handleSubmit}>
              Finalizar pedido no WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
