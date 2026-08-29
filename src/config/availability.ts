import type { Ingredient } from "@/types";

export interface IngredientAvailability {
  available?: boolean;
  badge?: string | null;
  maxPortions?: number;
}

/**
 * Metadados/regras estáticas de ingredientes.
 *
 * O estado operacional de disponibilidade agora vive no Supabase.
 * Os campos `available` abaixo são mantidos apenas como registro da migração
 * e não participam mais da decisão de venda em runtime.
 */
export const INGREDIENT_AVAILABILITY: Record<string, IngredientAvailability> = {
  "comp-alface": { available: false },
  "comp-cebola-roxa": { available: false },
  "comp-pepino": { available: false },
  "comp-tomate": { available: false },
  "comp-cenoura": { available: false },
  "comp-ovo-codorna": { available: false },
  "comp-milho": { available: false },
  "comp-manga": { available: false },
  "comp-tomate-cereja": { available: false },
  "comp-rucula": { available: false },
  "comp-brocolis": { available: false },
  "prot-frango-desfiado": { available: false },
  "prot-ovo": { available: false },
  "prot-soja": { available: false },
  "molho-creme-milho": { available: false },
  "molho-iogurte-ervas": { available: false },
  "molho-vinagrete-classico": { available: false },
  "molho-mostarda-mel": { available: false },
  "extra-croutons": { available: false },
  "extra-queijo-parmesao": { available: false },
  "extra-castanhas": { available: false },
  "extra-sementes": { available: false },
  "acai-300": { available: true },
  "acai-400": { available: true },
  "acai-500": { available: true },
  "acai-fruta-morango": { available: false, maxPortions: 1, badge: null },
  "acai-fruta-banana": { available: true, badge: null },
  "acai-fruta-uva": { available: false, badge: null },
  "acai-fruta-melancia": { available: false, badge: null },
  "acai-fruta-melao": { available: false, badge: null },
  "acai-fruta-mamao": { available: false, badge: null },
  "calda-morango": { available: true },
  "calda-leite-condensado": { available: true },
  "calda-chocolate": { available: true },
  "acai-leite-po": { available: true },
  "acai-sucrilhos": { available: true },
  "acai-cereal-nescau": { available: true },
  "acai-amendoim": { available: true },
  "acai-jujuba": { available: true },
  "acai-farinha-lactea": { available: false },
  "acai-pacoca": { available: false },
  "acai-maria-mole": { available: true },
  "acai-mms": { available: true },
  "acai-gotas-chocolate": { available: true },
  "acai-canudinho": { available: false },
  "acai-granola": { available: true },
  "sf-banana": { available: false },
  "sf-melao": { available: false },
  "sf-mamao": { available: false },
  "sf-maca": { available: false },
  "sf-uva": { available: false },
  "sf-manga": { available: false },
  "sf-kiwi": { available: false },
  "sf-abacaxi": { available: false },
  "sf-morango": { available: false },
  "sf-granola": { available: false },
  "sf-leite-condensado": { available: false },
  "sf-leite-po": { available: false },
};

export const getIngredientAvailability = (ingredientId: string) => INGREDIENT_AVAILABILITY[ingredientId];
export const getIngredientMaxPortions = (ingredientId: string) => INGREDIENT_AVAILABILITY[ingredientId]?.maxPortions;

export const applyIngredientAvailability = (ingredient: Ingredient): Ingredient => {
  const config = getIngredientAvailability(ingredient.id);
  if (!config) return { ...ingredient, available: true };

  const badge = config.badge === null ? undefined : (config.badge ?? ingredient.badge);
  return {
    ...ingredient,
    available: true,
    ...(badge === undefined ? {} : { badge }),
  };
};
