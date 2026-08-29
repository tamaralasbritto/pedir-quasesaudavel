import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-auth";
import type { OperationalDatabase } from "@/lib/operational-types";

const updateSchema = z.object({
  entityType: z.enum(["store", "product", "ingredient"]),
  entityId: z.string().min(1).max(120),
  available: z.boolean(),
});

export const getOperationalAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => ({ ok: true as const }));

export const updateOperationalAvailability = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as SupabaseClient<OperationalDatabase>;

    const { data: updated, error } = await db
      .from("operational_availability")
      .update({ available: data.available, updated_at: new Date().toISOString() })
      .eq("entity_type", data.entityType)
      .eq("entity_id", data.entityId)
      .select("entity_type, entity_id, available, updated_at")
      .maybeSingle();

    if (error) {
      console.error("[operacao] falha ao atualizar disponibilidade", error);
      throw new Error("Não foi possível atualizar a disponibilidade.");
    }
    if (!updated) throw new Error("Item operacional não encontrado.");

    return updated;
  });
