import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import type { PaymentMethod } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido — QUASE! saudável" },
      {
        name: "description",
        content:
          "Confirme seus dados, escolha a forma de pagamento e envie seu pedido pelo WhatsApp.",
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
  const [apartment, setApartment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = name.trim() && whatsapp.trim() && apartment.trim() && items.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Faltou preencher alguns dados", {
        description: "Nome, WhatsApp e apartamento são necessários.",
      });
      return;
    }
    const url = whatsappLink({
      customer: { name: name.trim(), whatsapp: whatsapp.trim(), apartment: apartment.trim() },
      items,
      subtotal,
      payment,
      needsChange,
      changeFor,
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
              <Link to="/prontos">Ver opções prontas</Link>
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-12 rounded-2xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apartment">Apartamento</Label>
                  <Input
                    id="apartment"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Torre / apto"
                    className="h-12 rounded-2xl"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-4xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-olive-deep">Pagamento</h2>
              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as PaymentMethod)}
                className="grid gap-3 sm:grid-cols-2"
              >
                {(
                  [
                    { value: "pix", label: "Pix", hint: "Enviamos a chave no WhatsApp" },
                    { value: "dinheiro", label: "Dinheiro", hint: "Pague na entrega" },
                  ] as const
                ).map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={`pay-${opt.value}`}
                    className="flex cursor-pointer items-center gap-3 rounded-3xl border border-border p-4 transition-colors has-[button[data-state=checked]]:border-olive has-[button[data-state=checked]]:bg-accent"
                  >
                    <RadioGroupItem id={`pay-${opt.value}`} value={opt.value} />
                    <span>
                      <span className="block font-semibold text-olive-deep">{opt.label}</span>
                      <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>

              {payment === "dinheiro" && (
                <div className="space-y-3 rounded-3xl bg-muted p-4">
                  <p className="text-sm font-medium text-olive-deep">Precisa de troco?</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={needsChange ? "default" : "outline"}
                      className="flex-1 rounded-full"
                      onClick={() => setNeedsChange(true)}
                    >
                      Sim
                    </Button>
                    <Button
                      type="button"
                      variant={!needsChange ? "default" : "outline"}
                      className="flex-1 rounded-full"
                      onClick={() => {
                        setNeedsChange(false);
                        setChangeFor("");
                      }}
                    >
                      Não
                    </Button>
                  </div>
                  {needsChange && (
                    <div className="space-y-1.5">
                      <Label htmlFor="change">Troco para quanto?</Label>
                      <Input
                        id="change"
                        inputMode="decimal"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="R$ 100,00"
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="space-y-3 rounded-4xl border border-border bg-card p-5 shadow-soft">
              <Label htmlFor="notes" className="font-display text-lg font-semibold text-olive-deep">
                Observações do pedido
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sem cebola, entregar depois das 12h..."
                className="min-h-24 rounded-2xl"
              />
            </section>

            <section className="space-y-3 rounded-4xl border border-border bg-cream p-5 shadow-soft">
              <h2 className="font-display text-lg font-semibold text-olive-deep">
                Resumo do pedido
              </h2>
              {items.map((item) => (
                <div key={item.id} className="rounded-3xl bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-olive-deep">{item.name}</p>
                      {item.selections.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {item.selections.map((s) => (
                            <li key={s.ingredientId}>
                              {s.categoryName}: {s.name} · {s.portion}
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
                      onChange={(q) => updateQuantity(item.id, q)}
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
                O pagamento é combinado direto no WhatsApp. Valores nutricionais são estimativas.
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
