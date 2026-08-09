import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/monte")({
  head: () => ({
    meta: [
      { title: "Açaí QUASE! — Especial de Dia dos Pais" },
      { name: "description", content: "Hoje o cardápio da QUASE! está dedicado ao açaí." },
    ],
  }),
  component: FathersDayRedirect,
});

function FathersDayRedirect() {
  return <Navigate to="/dia-dos-pais" replace />;
}
