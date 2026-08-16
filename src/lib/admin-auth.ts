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

    let resolvedAdmin = admin;

    // Bootstrap seguro: somente quando ainda não existe nenhum admin e existe
    // exatamente um usuário autenticado no projeto. Depois do primeiro owner,
    // este caminho deixa de ser elegível para qualquer outra conta.
    if (!resolvedAdmin) {
      const [{ count: adminCount, error: countError }, usersResult] = await Promise.all([
        supabaseAdmin.from("admin_users").select("user_id", { count: "exact", head: true }),
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 2 }),
      ]);

      if (countError) {
        console.error("[admin] falha ao contar administradores", countError);
        throw new Error("Não foi possível validar o acesso administrativo.");
      }

      if (
        adminCount === 0 &&
        !usersResult.error &&
        usersResult.data.users.length === 1 &&
        usersResult.data.users[0]?.id === context.userId
      ) {
        const { data: createdAdmin, error: bootstrapError } = await supabaseAdmin
          .from("admin_users")
          .insert({ user_id: context.userId, role: "owner" })
          .select("role")
          .single();

        if (bootstrapError) {
          console.error("[admin] falha ao criar primeiro owner", bootstrapError);
          throw new Error("Não foi possível concluir a autorização administrativa.");
        }

        resolvedAdmin = createdAdmin;
      }
    }

    if (!resolvedAdmin) {
      throw new Error("Acesso administrativo não autorizado.");
    }

    return next({
      context: {
        adminRole: resolvedAdmin.role,
      },
    });
  });
