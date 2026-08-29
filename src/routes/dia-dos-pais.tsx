import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dia-dos-pais")({
  head: () => ({
    meta: [
      { title: "Açaí QUASE! saudável" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LegacyAcaiRedirect,
});

function LegacyAcaiRedirect() {
  return <Navigate to="/acai" replace />;
}
