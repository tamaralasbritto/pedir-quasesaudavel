import { createFileRoute, Navigate } from "@tanstack/react-router";
import { STORE_CONFIG } from "@/config/store";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Monte seu QUASE!" },
      { name: "description", content: "Monte seu pedido QUASE! do seu jeito." },
    ],
  }),
  component: MenuRedirect,
});

function MenuRedirect() {
  if (STORE_CONFIG.activeCampaign === "dia-dos-pais") {
    return <Navigate to="/dia-dos-pais" replace />;
  }

  return <Navigate to="/prontos" replace />;
}
