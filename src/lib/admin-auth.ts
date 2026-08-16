import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: admin, error } = await supabaseAdmin
      .from("admin_users")
      .select("role")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      console.error("[admin] falha ao validar permissão", error);
      throw new Error("Não foi possível validar o acesso administrativo.");
    }

    if (!admin) {
      throw new Error("Acesso administrativo não autorizado.");
    }

    return next({
      context: {
        adminRole: admin.role,
      },
    });
  });
