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

export type OperationalDatabase = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      operational_availability: {
        Row: OperationalAvailabilityRow;
        Insert: {
          entity_type: OperationalEntityType;
          entity_id: string;
          available: boolean;
          updated_at?: string;
        };
        Update: {
          entity_type?: OperationalEntityType;
          entity_id?: string;
          available?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

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
