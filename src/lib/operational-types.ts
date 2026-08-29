export type OperationalEntityType = "store" | "product" | "ingredient";

export type OperationalProductId =
  | "miniSalad"
  | "salad"
  | "acai"
  | "miniAcai"
  | "fruitSalad"
  | "sandwich";

export interface OperationalAvailabilityRow {
  entity_type: OperationalEntityType;
  entity_id: string;
  available: boolean;
  updated_at: string;
}

export const OPERATIONAL_PRODUCTS: ReadonlyArray<{
  id: OperationalProductId;
  label: string;
}> = [
  { id: "acai", label: "Açaí" },
  { id: "miniAcai", label: "Mini açaí 200 ml" },
  { id: "miniSalad", label: "Mini salada" },
  { id: "salad", label: "Salada" },
  { id: "fruitSalad", label: "Salada de frutas" },
  { id: "sandwich", label: "Sanduíche natural" },
];
