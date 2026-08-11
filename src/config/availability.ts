import type { Ingredient } from "@/types";

export interface IngredientAvailability {
  available?: boolean;
  badge?: string | null;
  maxPortions?: number;
}

/**
 * Central operacional de disponibilidade.
 *
 * Use este arquivo para ligar/desligar ingredientes, adicionar selos temporários
 * e limitar quantas porções do mesmo ingrediente podem ser escolhidas.
 * Campos omitidos preservam o valor padrão cadastrado em data/ingredients.ts.
 */
export const INGREDIENT_AVAILABILITY: Record<string, IngredientAvailability> = {
  // Saladas — ingredientes
  "comp-alface": { available: true },
  "comp-cebola-roxa": { available: true },
  "comp-pepino": { available: true },
  "comp-tomate": { available: true },
  "comp-cenoura": { available: true },
  "comp-ovo-codorna": { available: true },
  "comp-milho": { available: true },
  "comp-manga": { available: false },
  "comp-tomate-cereja": { available: false },
  "comp-rucula": { available: false },
  "comp-brocolis": { available: false },

  // Saladas — proteínas
  "prot-frango-desfiado": { available: true, badge: "Disponível hoje" },
  "prot-ovo": { available: true, badge: "Disponível hoje" },
  "prot-soja": { available: false },

  // Saladas — molhos
  "molho-creme-milho": { available: true, badge: "Disponível hoje" },
  "molho-iogurte-ervas": { available: false },
  "molho-vinagrete-classico": { available: false },
  "molho-mostarda-mel": { available: false },

  // Saladas — extras
  "extra-croutons": { available: false },
  "extra-queijo-parmesao": { available: false },
  "extra-castanhas": { available: false },
  "extra-sementes": { available: false },

  // Açaí — frutas
  "acai-fruta-morango": { available: true, maxPortions: 1, badge: null },
  "acai-fruta-banana": { available: true, badge: null },
  "acai-fruta-uva": { available: true, badge: null },
  "acai-fruta-melancia": { available: false, badge: null },
  "acai-fruta-melao": { available: false, badge: null },
  "acai-fruta-mamao": { available: false, badge: null },

  // Açaí — caldas
  "calda-morango": { available: true },
  "calda-leite-condensado": { available: true },
  "calda-chocolate": { available: true },

  // Açaí — complementos
  "acai-leite-po": { available: true },
  "acai-sucrilhos": { available: true },
  "acai-cereal-nescau": { available: true },
  "acai-amendoim": { available: true },
  "acai-jujuba": { available: true },
  "acai-farinha-lactea": { available: false },
  "acai-pacoca": { available: true },
  "acai-maria-mole": { available: true },
  "acai-mms": { available: true },
  "acai-gotas-chocolate": { available: true },
  "acai-canudinho": { available: true },
  "acai-granola": { available: true },

  // Salada de frutas
  "sf-banana": { available: true },
  "sf-melao": { available: true },
  "sf-mamao": { available: true },
  "sf-maca": { available: true },
  "sf-uva": { available: true },
  "sf-manga": { available: false },
  "sf-kiwi": { available: false },
  "sf-abacaxi": { available: true },
  "sf-morango": { available: true },
  "sf-granola": { available: true },
  "sf-leite-condensado": { available: true },
  "sf-leite-po": { available: true },
};

export const getIngredientAvailability = (ingredientId: string) =>
  INGREDIENT_AVAILABILITY[ingredientId];

export const getIngredientMaxPortions = (ingredientId: string) =>
  INGREDIENT_AVAILABILITY[ingredientId]?.maxPortions;

export const applyIngredientAvailability = (ingredient: Ingredient): Ingredient => {
  const config = getIngredientAvailability(ingredient.id);
  if (!config) return ingredient;

  return {
    ...ingredient,
    available: config.available ?? ingredient.available,
    badge: config.badge === null ? undefined : (config.badge ?? ingredient.badge),
  };
};
