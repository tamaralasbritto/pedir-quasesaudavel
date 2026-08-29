import type { Database } from "@/integrations/supabase/types";

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

type OperationalAvailabilityTable = {
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

/**
 * Extende os tipos gerados pelo Supabase sem manter uma segunda cópia do schema.
 * A tabela operacional foi criada depois da última geração automática de types.
 * Quando os types forem regenerados, este alias pode voltar a usar Database diretamente.
 */
export type OperationalDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & {
    Tables: Database["public"]["Tables"] & {
      operational_availability: OperationalAvailabilityTable;
    };
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
