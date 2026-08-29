import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type {
  OperationalAvailabilityRow,
  OperationalDatabase,
  OperationalEntityType,
  OperationalProductId,
} from "@/lib/operational-types";

type AvailabilityMap = Record<string, boolean>;

type OperationalAvailabilityContextValue = {
  loading: boolean;
  error: string | null;
  storeOpen: boolean;
  products: AvailabilityMap;
  ingredients: AvailabilityMap;
  isProductAvailable: (id: OperationalProductId) => boolean;
  isIngredientAvailable: (id: string) => boolean;
  setOptimisticAvailability: (entityType: OperationalEntityType, entityId: string, available: boolean) => void;
  refresh: () => Promise<void>;
};

const OperationalAvailabilityContext = createContext<OperationalAvailabilityContextValue | null>(null);

const operationalSupabase = supabase as unknown as SupabaseClient<OperationalDatabase>;

function reduceRows(rows: OperationalAvailabilityRow[]) {
  let storeOpen = false;
  const products: AvailabilityMap = {};
  const ingredients: AvailabilityMap = {};

  for (const row of rows) {
    if (row.entity_type === "store" && row.entity_id === "store") storeOpen = row.available;
    if (row.entity_type === "product") products[row.entity_id] = row.available;
    if (row.entity_type === "ingredient") ingredients[row.entity_id] = row.available;
  }

  return { storeOpen, products, ingredients };
}

export function OperationalAvailabilityProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<OperationalAvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const { data, error: queryError } = await operationalSupabase
      .from("operational_availability")
      .select("entity_type, entity_id, available, updated_at")
      .order("entity_type")
      .order("entity_id");

    if (queryError) {
      setError("Não foi possível carregar a disponibilidade da loja.");
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const channel = operationalSupabase
      .channel("operational-availability")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operational_availability" },
        (payload) => {
          const next = payload.new as Partial<OperationalAvailabilityRow>;
          if (
            !next.entity_type ||
            !next.entity_id ||
            typeof next.available !== "boolean" ||
            !next.updated_at
          ) {
            void refresh();
            return;
          }

          const nextRow = next as OperationalAvailabilityRow;
          setRows((current) => {
            const index = current.findIndex(
              (row) => row.entity_type === nextRow.entity_type && row.entity_id === nextRow.entity_id,
            );
            if (index < 0) return [...current, nextRow];
            const copy = [...current];
            copy[index] = nextRow;
            return copy;
          });
        },
      )
      .subscribe();

    return () => {
      void operationalSupabase.removeChannel(channel);
    };
  }, [refresh]);

  const state = useMemo(() => reduceRows(rows), [rows]);

  const setOptimisticAvailability = useCallback(
    (entityType: OperationalEntityType, entityId: string, available: boolean) => {
      setRows((current) => {
        const index = current.findIndex(
          (row) => row.entity_type === entityType && row.entity_id === entityId,
        );
        const nextRow: OperationalAvailabilityRow = {
          entity_type: entityType,
          entity_id: entityId,
          available,
          updated_at: new Date().toISOString(),
        };
        if (index < 0) return [...current, nextRow];

        const existing = current[index];
        if (!existing) return [...current, nextRow];

        const copy = [...current];
        copy[index] = { ...existing, available, updated_at: nextRow.updated_at };
        return copy;
      });
    },
    [],
  );

  const value = useMemo<OperationalAvailabilityContextValue>(
    () => ({
      loading,
      error,
      storeOpen: state.storeOpen,
      products: state.products,
      ingredients: state.ingredients,
      isProductAvailable: (id) => state.products[id] === true,
      isIngredientAvailable: (id) => state.ingredients[id] === true,
      setOptimisticAvailability,
      refresh,
    }),
    [error, loading, refresh, setOptimisticAvailability, state],
  );

  return (
    <OperationalAvailabilityContext.Provider value={value}>
      {children}
    </OperationalAvailabilityContext.Provider>
  );
}

export function useOperationalAvailability() {
  const context = useContext(OperationalAvailabilityContext);
  if (!context) throw new Error("useOperationalAvailability deve ser usado dentro do provider operacional.");
  return context;
}
