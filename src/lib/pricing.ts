import type { Ingredient, IngredientCategory } from "@/types";

/**
 * REGRAS DE PREÇO
 * Cada produto montado já inclui uma cota de escolhas (category.included).
 * Só há valor adicional quando:
 *  - a proteína escolhida é premium;
 *  - a escolha ultrapassa a cota inclusa (ex.: 5º complemento);
 *  - é um extra (cota inclusa = 0).
 */
export function chargeFor(
  category: Pick<IngredientCategory, "included">,
  ingredient: Pick<Ingredient, "price" | "premium">,
  /** Posição da escolha dentro da categoria (0 = primeira). */
  index: number,
): number {
  if (ingredient.premium) return ingredient.price;
  return index < category.included ? 0 : ingredient.price;
}

export interface PriceLine {
  categoryId: string;
  categoryName: string;
  ingredient: Ingredient;
  charge: number;
}

export function buildPriceLines(
  categories: IngredientCategory[],
  selected: Record<string, string[]>,
): PriceLine[] {
  const lines: PriceLine[] = [];
  categories.forEach((cat) => {
    (selected[cat.id] ?? []).forEach((id, index) => {
      const ingredient = cat.ingredients.find((i) => i.id === id);
      if (!ingredient) return;
      lines.push({
        categoryId: cat.id,
        categoryName: cat.name,
        ingredient,
        charge: chargeFor(cat, ingredient, index),
      });
    });
  });
  return lines;
}

/** Valor que será cobrado se o cliente escolher este item agora. */
export function previewCharge(
  category: IngredientCategory,
  ingredient: Ingredient,
  selectedIds: string[],
): number {
  const index = selectedIds.indexOf(ingredient.id);
  return chargeFor(category, ingredient, index >= 0 ? index : selectedIds.length);
}
