import saladaFolhas from "@/assets/salada-folhas.jpg";
import sanduicheFrango from "@/assets/sanduiche-frango.jpg";
import saladaFrutas from "@/assets/salada-frutas.jpg";
import type { Product } from "@/types";

/** Dados mock tipados — prontos para virem do banco no futuro. */
export const products: Product[] = [
  {
    id: "pronto-salada-folhas",
    kind: "salada-folhas",
    name: "Salada de Folhas",
    description: "Mix de folhas frescas, tomate, cenoura, pepino e molho separado.",
    price: 15,
    image: saladaFolhas,
    nutrition: { calories: 180, protein: 5, carbs: 18, fat: 9 },
    highlights: ["Preparada hoje", "Molho separado", "Rica em fibras"],
    available: true,
  },
  {
    id: "pronto-sanduiche-frango",
    kind: "sanduiche-natural",
    name: "Sanduíche Natural de Frango",
    description: "Pão integral, frango cremoso, cenoura, milho e folhas frescas.",
    price: 8,
    image: sanduicheFrango,
    nutrition: { calories: 380, protein: 26, carbs: 38, fat: 12 },
    highlights: ["Pão integral", "26 g de proteína", "Feito no dia"],
    available: true,
  },
  {
    id: "pronto-salada-frutas",
    kind: "salada-frutas",
    name: "Salada de Frutas",
    description: "Seleção de frutas frescas preparadas no dia.",
    price: 10,
    image: saladaFrutas,
    nutrition: { calories: 150, protein: 2, carbs: 34, fat: 1 },
    highlights: ["Frutas da estação", "Sem açúcar adicionado", "Leve e refrescante"],
    available: true,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
