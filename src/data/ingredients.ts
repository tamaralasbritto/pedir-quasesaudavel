import type { IngredientCategory, ProductKind } from "@/types";

export interface BuildableProduct {
  kind: ProductKind;
  name: string;
  description: string;
  basePrice: number;
  includes: string[];
  available: boolean;
}

const zero = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export const buildableProducts: BuildableProduct[] = [
  {
    kind: "salada-folhas",
    name: "Salada",
    description: "Escolha o tamanho, os ingredientes, o molho e, se quiser, uma proteína.",
    basePrice: 8,
    includes: ["300, 500 ou 750 ml", "ingredientes à sua escolha", "1 molho"],
    available: true,
  },
  {
    kind: "acai",
    name: "Açaí",
    description: "Escolha o tamanho, as frutas, as caldas e os complementos.",
    basePrice: 12,
    includes: ["300, 400 ou 500 ml", "2 frutas", "caldas e complementos inclusos"],
    available: true,
  },
  {
    kind: "sanduiche-natural",
    name: "Sanduíche natural",
    description: "Escolha o recheio e os complementos do seu jeito.",
    basePrice: 8,
    includes: ["Personalização em breve"],
    available: false,
  },
  {
    kind: "salada-frutas",
    name: "Salada de frutas",
    description: "Combine as frutas do dia e um toque a mais, se quiser.",
    basePrice: 10,
    includes: ["Personalização em breve"],
    available: false,
  },
];

export const ingredientCategories: IngredientCategory[] = [
  {
    id: "tamanho",
    name: "Escolha o tamanho",
    helper: "Cada tamanho inclui uma quantidade diferente de ingredientes.",
    selection: "single",
    required: true,
    included: 0,
    appliesTo: ["salada-folhas"],
    ingredients: [
      { id: "salada-300", name: "300 ml", portion: "4 ingredientes · acompanhamento", price: 8, nutrition: zero, available: true },
      { id: "salada-500", name: "500 ml", portion: "6 ingredientes · refeição leve", price: 12, nutrition: zero, available: true },
      { id: "salada-750", name: "750 ml", portion: "8 ingredientes · refeição completa", price: 15, nutrition: zero, available: true },
    ],
  },
  {
    id: "complementos",
    name: "Escolha os ingredientes",
    helper: "Distribua suas porções dentro do limite do tamanho escolhido.",
    selection: "multiple",
    required: true,
    included: 8,
    appliesTo: ["salada-folhas"],
    ingredients: [
      { id: "comp-alface", name: "Alface", portion: "porção", price: 0, nutrition: { calories: 12, protein: 0.9, carbs: 2.2, fat: 0.1 }, available: true },
      { id: "comp-cebola-roxa", name: "Cebola roxa", portion: "porção", price: 0, nutrition: { calories: 16, protein: 0.4, carbs: 3.7, fat: 0 }, available: true },
      { id: "comp-pepino", name: "Pepino", portion: "porção", price: 0, nutrition: { calories: 6, protein: 0.3, carbs: 1.4, fat: 0 }, available: true },
      { id: "comp-tomate", name: "Tomate", portion: "porção", price: 0, nutrition: { calories: 9, protein: 0.4, carbs: 2, fat: 0.1 }, available: true },
      { id: "comp-cenoura", name: "Cenoura", portion: "porção", price: 0, nutrition: { calories: 16, protein: 0.4, carbs: 3.8, fat: 0.1 }, available: true },
      { id: "comp-ovo-codorna", name: "Ovo de codorna", portion: "porção", price: 0, nutrition: { calories: 42, protein: 3.6, carbs: 0.2, fat: 3 }, available: true },
      { id: "comp-milho", name: "Milho", portion: "porção", price: 0, nutrition: { calories: 34, protein: 1.3, carbs: 7.5, fat: 0.5 }, available: true },
      { id: "comp-manga", name: "Manga", portion: "porção", price: 0, nutrition: { calories: 30, protein: 0.4, carbs: 7.5, fat: 0.2 }, available: false },
      { id: "comp-tomate-cereja", name: "Tomate-cereja", portion: "porção", price: 0, nutrition: { calories: 9, protein: 0.4, carbs: 2, fat: 0.1 }, available: false },
      { id: "comp-rucula", name: "Rúcula", portion: "porção", price: 0, nutrition: { calories: 10, protein: 1, carbs: 1.5, fat: 0.2 }, available: false },
      { id: "comp-brocolis", name: "Brócolis", portion: "porção", price: 0, nutrition: { calories: 20, protein: 1.7, carbs: 4, fat: 0.2 }, available: false },
    ],
  },
  {
    id: "proteina",
    name: "Quer acrescentar uma proteína?",
    helper: "Disponível nos tamanhos de 500 ml e 750 ml por mais R$ 3,00.",
    selection: "single",
    required: false,
    included: 0,
    appliesTo: ["salada-folhas"],
    ingredients: [
      { id: "prot-frango-desfiado", name: "Frango desfiado", portion: "1 porção", price: 3, badge: "Disponível hoje", nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }, available: true },
      { id: "prot-ovo", name: "Ovo cozido", portion: "1 porção", price: 3, badge: "Disponível hoje", nutrition: { calories: 143, protein: 12.6, carbs: 1.1, fat: 9.5 }, available: true },
      { id: "prot-soja", name: "Proteína de soja", portion: "1 porção", price: 3, nutrition: { calories: 120, protein: 16, carbs: 9, fat: 2 }, available: false },
    ],
  },
  {
    id: "molhos",
    name: "Qual combina mais com sua salada?",
    helper: "Um molho incluso, enviado separadamente.",
    selection: "single",
    required: true,
    included: 1,
    appliesTo: ["salada-folhas"],
    ingredients: [
      { id: "molho-creme-milho", name: "Creme de milho", portion: "Cremoso e levemente adocicado", price: 0, badge: "Disponível hoje", nutrition: { calories: 75, protein: 1.5, carbs: 10, fat: 3.2 }, available: true },
      { id: "molho-iogurte-ervas", name: "Iogurte com ervas", portion: "Leve e refrescante", price: 0, nutrition: { calories: 45, protein: 2, carbs: 3, fat: 2.5 }, available: false },
      { id: "molho-vinagrete-classico", name: "Vinagrete Clássico", portion: "Vinagre, azeite, sal e pimenta-do-reino", price: 0, nutrition: { calories: 70, protein: 0, carbs: 0.5, fat: 7.5 }, available: false },
      { id: "molho-mostarda-mel", name: "Mostarda e mel", portion: "Agridoce na medida", price: 0, nutrition: { calories: 95, protein: 0.5, carbs: 9, fat: 6 }, available: false },
    ],
  },
  {
    id: "extras",
    name: "Extras QUASE!",
    helper: "Um toque a mais também pode fazer parte.",
    selection: "multiple",
    required: false,
    included: 0,
    appliesTo: ["salada-folhas"],
    ingredients: [
      { id: "extra-croutons", name: "Croutons", portion: "porção", price: 0, nutrition: { calories: 80, protein: 2, carbs: 13, fat: 2.5 }, available: false },
      { id: "extra-queijo-parmesao", name: "Queijo parmesão", portion: "porção", price: 0, nutrition: { calories: 84, protein: 7.6, carbs: 0.7, fat: 5.6 }, available: false },
      { id: "extra-castanhas", name: "Castanhas", portion: "porção", price: 0, nutrition: { calories: 100, protein: 3, carbs: 4, fat: 9 }, available: false },
      { id: "extra-sementes", name: "Mix de sementes", portion: "porção", price: 0, nutrition: { calories: 90, protein: 4, carbs: 3, fat: 7 }, available: false },
    ],
  },
  {
    id: "tamanho-acai",
    name: "Escolha o tamanho",
    helper: "Todos incluem duas frutas. Caldas e complementos variam conforme o tamanho.",
    selection: "single",
    required: true,
    included: 0,
    appliesTo: ["acai"],
    ingredients: [
      { id: "acai-300", name: "300 ml", portion: "2 frutas · 1 calda · 4 complementos", price: 12, nutrition: { calories: 330, protein: 4, carbs: 58, fat: 9 }, available: true },
      { id: "acai-400", name: "400 ml", portion: "2 frutas · 2 caldas · 5 complementos", price: 16, nutrition: { calories: 440, protein: 5, carbs: 77, fat: 12 }, available: true },
      { id: "acai-500", name: "500 ml", portion: "2 frutas · 2 caldas · 6 complementos", price: 18, nutrition: { calories: 550, protein: 6, carbs: 96, fat: 15 }, available: true },
    ],
  },
  {
    id: "frutas",
    name: "Escolha as frutas",
    helper: "Escolha duas porções. Você pode repetir sua favorita.",
    selection: "multiple",
    required: true,
    included: 2,
    appliesTo: ["acai"],
    ingredients: [
      { id: "acai-fruta-morango", name: "Morango", portion: "1 porção", price: 0, nutrition: { calories: 19, protein: 0.4, carbs: 4.6, fat: 0.2 }, available: true },
      { id: "acai-fruta-banana", name: "Banana", portion: "1 porção", price: 0, nutrition: { calories: 53, protein: 0.7, carbs: 13.7, fat: 0.2 }, available: true },
    ],
  },
  {
    id: "caldas",
    name: "Escolha as caldas",
    helper: "A quantidade inclusa depende do tamanho escolhido.",
    selection: "multiple",
    required: true,
    included: 2,
    appliesTo: ["acai"],
    ingredients: [
      { id: "calda-morango", name: "Morango", portion: "1 porção", price: 0, nutrition: { calories: 45, protein: 0, carbs: 11, fat: 0 }, available: true },
      { id: "calda-leite-condensado", name: "Leite condensado", portion: "1 porção", price: 0, nutrition: { calories: 64, protein: 1.6, carbs: 11, fat: 1.7 }, available: true },
      { id: "calda-chocolate", name: "Chocolate", portion: "1 porção", price: 0, nutrition: { calories: 70, protein: 0.8, carbs: 12, fat: 2.2 }, available: true },
    ],
  },
  {
    id: "acompanhamentos",
    name: "O que não pode faltar?",
    helper: "Distribua as porções como preferir. Você pode repetir seus favoritos.",
    selection: "multiple",
    required: true,
    included: 6,
    appliesTo: ["acai"],
    ingredients: [
      { id: "acai-leite-po", name: "Leite em pó", portion: "1 porção", price: 0, nutrition: { calories: 75, protein: 3.8, carbs: 5.8, fat: 4 }, available: true },
      { id: "acai-sucrilhos", name: "Sucrilhos", portion: "1 porção", price: 0, nutrition: { calories: 72, protein: 1.4, carbs: 16.8, fat: 0.2 }, available: true },
      { id: "acai-cereal-nescau", name: "Cereal de Nescau", portion: "1 porção", price: 0, nutrition: { calories: 78, protein: 1.5, carbs: 15, fat: 1.4 }, available: true },
      { id: "acai-amendoim", name: "Amendoim xerém", portion: "1 porção", price: 0, nutrition: { calories: 114, protein: 5.2, carbs: 3.2, fat: 9.8 }, available: true },
      { id: "acai-jujuba", name: "Jujuba", portion: "1 porção", price: 0, nutrition: { calories: 68, protein: 0.8, carbs: 16, fat: 0 }, available: true },
      { id: "acai-farinha-lactea", name: "Farinha láctea", portion: "1 porção", price: 0, nutrition: { calories: 83, protein: 2, carbs: 15, fat: 1.5 }, available: false },
      { id: "acai-pacoca", name: "Paçoca", portion: "1 porção", price: 0, nutrition: { calories: 105, protein: 3, carbs: 10, fat: 6 }, available: true },
      { id: "acai-maria-mole", name: "Maria mole", portion: "1 porção", price: 0, nutrition: { calories: 65, protein: 0.6, carbs: 15, fat: 0.3 }, available: true },
      { id: "acai-mms", name: "M&Ms", portion: "1 porção", price: 0, nutrition: { calories: 98, protein: 1, carbs: 14, fat: 4.4 }, available: true },
      { id: "acai-gotas-chocolate", name: "Gotas de chocolate", portion: "1 porção", price: 0, nutrition: { calories: 150, protein: 1.8, carbs: 17, fat: 8.5 }, available: true },
      { id: "acai-canudinho", name: "Canudinho", portion: "1 unidade", price: 0, nutrition: { calories: 45, protein: 0.7, carbs: 7, fat: 1.6 }, available: true },
      { id: "acai-granola", name: "Granola", portion: "1 porção", price: 0, nutrition: { calories: 93, protein: 2.3, carbs: 13.3, fat: 3.3 }, available: true },
    ],
  },
];

export const categoriesForKind = (kind: ProductKind) =>
  ingredientCategories.filter((category) => category.appliesTo.includes(kind));
