import type { CartItem, Ingredient, Nutrition } from "@/types";

export const emptyNutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function sumNutrition(list: Nutrition[]): Nutrition {
  return list.reduce<Nutrition>(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein: acc.protein + n.protein,
      carbs: acc.carbs + n.carbs,
      fat: acc.fat + n.fat,
    }),
    { ...emptyNutrition },
  );
}

export function scaleNutrition(n: Nutrition, factor: number): Nutrition {
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
  };
}

export function nutritionFromIngredients(ingredients: Ingredient[]): Nutrition {
  return sumNutrition(ingredients.map((i) => i.nutrition));
}

export function cartNutrition(items: CartItem[]): Nutrition {
  return sumNutrition(items.map((i) => scaleNutrition(i.nutrition, i.quantity)));
}
