import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, ChevronDown, PackageOpen, Settings2, Store } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { ingredientCategories } from "@/data/ingredients";
import { supabase } from "@/integrations/supabase/client";
import { useOperationalAvailability } from "@/lib/operational-availability";
import { getOperationalAdminAccess, updateOperationalAvailability } from "@/lib/operational.functions";
import {
  OPERATIONAL_PRODUCTS,
  PURE_ACAI_SIZE_ID,
  type OperationalEntityType,
  type OperationalProductId,
} from "@/lib/operational-types";

type OperationalView = "stock" | "settings";
type AdminIngredientSection = {
  id: string;
  name: string;
  ingredients: Array<{ id: string; name: string }>;
};

const EMPTY_GROUPS: Record<OperationalProductId, AdminIngredientSection[]> = {
  acai: [],
  salad: [],
  fruitSalad: [],
  sandwich: [],
};

export function AdminOperationalPanel({ view }: { view: OperationalView }) {
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

  const groupedSections = useMemo(() => {
    const groups: Record<OperationalProductId, AdminIngredientSection[]> = {
      acai: [],
      salad: [],
      fruitSalad: [],
      sandwich: [],
    };

    for (const product of OPERATIONAL_PRODUCTS) {
      groups[product.id] = ingredientCategories
        .filter((category) => category.appliesTo.includes(product.kind))
        .map((category) => {
          const categoryIngredients = category.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
          }));

          if (
            product.id === "acai" &&
            category.id === "tamanho-acai" &&
            !categoryIngredients.some((ingredient) => ingredient.id === PURE_ACAI_SIZE_ID)
          ) {
            categoryIngredients.unshift({ id: PURE_ACAI_SIZE_ID, name: "200 ml — só açaí" });
          }

          return {
            id: category.id,
            name: category.name,
            ingredients: categoryIngredients,
          };
        });
    }

    return groups;
  }, []);

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

  if (view === "settings") {
    return (
      <section id="configuracoes" className="min-h-screen bg-background px-5 py-7">
        <div className="mx-auto max-w-5xl">
          <PanelHeader
            icon={<Settings2 className="h-5 w-5 text-olive" />}
            eyebrow="Administração"
            title="Configurações"
            description="Controles gerais da operação. Alterações aqui refletem imediatamente na loja pública."
          />

          {error ? <OperationalError message={error} /> : null}

          <div className="max-w-2xl">
            <OperationalSection title="Loja">
              <OperationalRow
                label={storeOpen ? "Loja aberta" : "Loja fechada"}
                description="Controla se a loja pública pode receber pedidos."
                checked={storeOpen}
                disabled={loading || workingKey === "store:store"}
                onChange={(next) => void toggle("store", "store", storeOpen, next)}
              />
            </OperationalSection>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="estoque" className="min-h-screen bg-beige/35 px-5 py-7">
      <div className="mx-auto max-w-5xl">
        <PanelHeader
          icon={<PackageOpen className="h-5 w-5 text-olive" />}
          eyebrow="Operação agora"
          title="Estoque"
          description="Produto é a família. Tamanhos e ingredientes ficam organizados dentro dela."
        />

        {error ? <OperationalError message={error} /> : null}

        <div className="space-y-4">
          {OPERATIONAL_PRODUCTS.map((product) => {
            const productAvailable = products[product.id] === true;
            const sections = groupedSections[product.id] ?? EMPTY_GROUPS[product.id];

            return (
              <details
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                open={product.id === "acai"}
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">{product.label}</h2>
                    <p className={productAvailable ? "mt-1 text-xs text-olive" : "mt-1 text-xs text-muted-foreground"}>
                      {productAvailable ? "Disponível para venda" : "Indisponível"}
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>

                <div className="border-t border-border/70">
                  <OperationalRow
                    label={`${product.label} disponível`}
                    description="Liga ou desliga a família inteira sem alterar tamanhos ou ingredientes."
                    checked={productAvailable}
                    disabled={loading || workingKey === `product:${product.id}`}
                    onChange={(next) => void toggle("product", product.id, productAvailable, next)}
                  />

                  {sections.map((section) => (
                    <div key={section.id} className="border-t border-border/70 bg-muted/10">
                      <div className="px-5 py-3">
                        <h3 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">{section.name}</h3>
                      </div>
                      <div className="divide-y divide-border/60 bg-card">
                        {section.ingredients.map((ingredient) => {
                          const checked = ingredients[ingredient.id] === true;
                          return (
                            <OperationalRow
                              key={ingredient.id}
                              label={ingredient.name}
                              checked={checked}
                              disabled={loading || workingKey === `ingredient:${ingredient.id}`}
                              onChange={(next) => void toggle("ingredient", ingredient.id, checked, next)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PanelHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{eyebrow}</p>
      </div>
      <h1 className="font-display mt-2 text-4xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function OperationalError({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" /> {message}
    </div>
  );
}

function OperationalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-olive" />
          <h2 className="font-display text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

function OperationalRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center justify-between gap-4 px-5 py-3 active:bg-muted/40">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className={checked ? "mt-0.5 text-xs text-olive" : "mt-0.5 text-xs text-muted-foreground"}>
          {description ?? (checked ? "Disponível" : "Indisponível")}
        </p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={`${label}: ${checked ? "disponível" : "indisponível"}`}
        className="scale-110"
      />
    </label>
  );
}
