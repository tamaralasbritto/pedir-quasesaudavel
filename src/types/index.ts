export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type ProductKind = "salada-folhas" | "acai" | "sanduiche-natural" | "salada-frutas";

export interface Product {
  id: string;
  kind: ProductKind;
  name: string;
  description: string;
  price: number;
  image: string;
  nutrition: Nutrition;
  highlights: string[];
  available: boolean;
}

export type IngredientCategoryId =
  | "tamanho"
  | "base"
  | "proteina"
  | "complementos"
  | "frutas"
  | "molhos"
  | "extras";

export interface IngredientCategory {
  id: IngredientCategoryId;
  name: string;
  helper: string;
  /** "single" = escolha uma opção, "multiple" = pode escolher várias */
  selection: "single" | "multiple";
  required: boolean;
  /** Quantas escolhas desta categoria já estão inclusas no preço base. */
  included: number;
  appliesTo: ProductKind[];
  ingredients: Ingredient[];
}

export interface Ingredient {
  id: string;
  name: string;
  portion: string;
  /** Valor usado como preço base ou adicional, conforme a categoria. */
  price: number;
  premium?: boolean;
  /** Texto opcional exibido como selo. Para remover, basta apagar o campo. */
  badge?: string;
  nutrition: Nutrition;
  image?: string;
  available: boolean;
}

export interface CartItemSelection {
  categoryId: IngredientCategoryId;
  categoryName: string;
  ingredientId: string;
  name: string;
  portion: string;
  price: number;
}

export interface CartItem {
  id: string;
  type: "pronto" | "montado";
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  nutrition: Nutrition;
  selections: CartItemSelection[];
  image?: string;
}

export type PaymentMethod = "pix" | "dinheiro";

export interface Customer {
  name: string;
  whatsapp: string;
  apartment: string;
}

export interface Order {
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  payment: PaymentMethod;
  needsChange: boolean;
  changeFor?: string;
  notes?: string;
}
