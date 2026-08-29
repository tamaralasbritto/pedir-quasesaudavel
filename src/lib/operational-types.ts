export type OperationalEntityType = "store" | "product" | "ingredient";

export type OperationalProductId = "salad" | "acai" | "fruitSalad" | "sandwich";

export interface OperationalAvailabilityRow {
  entity_type: OperationalEntityType;
  entity_id: string;
  available: boolean;
  updated_at: string;
}

export const PURE_ACAI_SIZE_ID = "acai-200";

export const OPERATIONAL_PRODUCTS: ReadonlyArray<{
  id: OperationalProductId;
  label: string;
  kind: "salada-folhas" | "acai" | "salada-frutas" | "sanduiche-natural";
}> = [
  { id: "acai", label: "Açaí", kind: "acai" },
  { id: "salad", label: "Salada", kind: "salada-folhas" },
  { id: "fruitSalad", label: "Salada de frutas", kind: "salada-frutas" },
  { id: "sandwich", label: "Sanduíche natural", kind: "sanduiche-natural" },
];
