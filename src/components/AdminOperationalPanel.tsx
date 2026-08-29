import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, Store } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { ingredientCategories } from "@/data/ingredients";
import { supabase } from "@/integrations/supabase/client";
import { getOperationalAdminAccess, updateOperationalAvailability } from "@/lib/operational.functions";
import { OPERATIONAL_PRODUCTS, type OperationalEntityType } from "@/lib/operational-types";
import { useOperationalAvailability } from "@/lib/operational-availability";

const HIDDEN_CATEGORY_IDS = new Set(["tamanho", "tamanho-acai", "tamanho-frutas"]);

export function AdminOperationalPanel() {
  const { loading, error, storeOpen, products, ingredients, setOptimisticAvailability } = useOperationalAvailability();
  const [authorized, setAuthorized] = useState(false);
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      try {
        await getOperationalAdminAccess();
        if (active) setAuthorized(true);
      } catch {
        if (active) setAuthorized(false);
      }
    };

    void checkAccess();
    const { data } = supabase.auth.onAuthStateChange(() => void checkAccess());
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const sections = useMemo(
    () =>
      ingredientCategories
        .filter((category) => !HIDDEN_CATEGORY_IDS.has(category.id))
        .map((category) => ({
          id: category.id,
          name: category.name,
          ingredients: category.ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name })),
        })),
    [],
  );

  if (!authorized) return null;

  const toggle = async (entityType: OperationalEntityType, entityId: string, previous: boolean, next: boolean) => {
    const key = `${entityType}:${entityId}`;
    setWorkingKey(key);
    setOptimisticAvailability(entityType, entityId, next);
    try {
      await updateOperationalAvailability({ data: { entityType, entityId, available: next } });
    } catch (updateError) {
      setOptimisticAvailability(entityType, entityId, previous);
      toast.error(updateError instanceof Error ? updateError.message : "Não foi possível atualizar.");
    } finally {
      setWorkingKey(null);
    }
  };

  return (
    <section className="border-b border-border/70 bg-beige/60 px-5 py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-olive" />
          <div>
            <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">Operação agora</p>
            <h1 className="font-display text-2xl font-semibold">Disponibilidade</h1>
          </div>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <OperationalSection title="Loja">
              <OperationalRow label={storeOpen ? "Loja aberta" : "Loja fechada"} checked={storeOpen} disabled={loading || workingKey === "store:store"} onChange={(next) => void toggle("store", "store", storeOpen, next)} />
            </OperationalSection>

            <OperationalSection title="Produtos">
              {OPERATIONAL_PRODUCTS.map((product) => {
                const checked = products[product.id] === true;
                return <OperationalRow key={product.id} label={product.label} checked={checked} disabled={loading || workingKey === `product:${product.id}`} onChange={(next) => void toggle("product", product.id, checked, next)} />;
              })}
            </OperationalSection>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <OperationalSection key={section.id} title={section.name}>
                {section.ingredients.map((ingredient) => {
                  const checked = ingredients[ingredient.id] === true;
                  return <OperationalRow key={ingredient.id} label={ingredient.name} checked={checked} disabled={loading || workingKey === `ingredient:${ingredient.id}`} onChange={(next) => void toggle("ingredient", ingredient.id, checked, next)} />;
                })}
              </OperationalSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OperationalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/70 px-4 py-3"><h2 className="font-display text-xl font-semibold">{title}</h2></div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

function OperationalRow({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 px-4 py-3 active:bg-muted/40">
      <div>
        <p className="font-medium">{label}</p>
        <p className={checked ? "text-xs text-olive" : "text-xs text-muted-foreground"}>{checked ? "Disponível" : "Indisponível"}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} aria-label={`${label}: ${checked ? "disponível" : "indisponível"}`} className="scale-110" />
    </label>
  );
}
