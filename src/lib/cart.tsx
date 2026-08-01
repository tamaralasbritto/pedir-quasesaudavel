import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "quase-saudavel-cart-v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* armazenamento indisponível */
    }
  }, [items, hydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item) => {
    setItems((prev) => {
      const signature = (i: Pick<CartItem, "productId" | "selections">) =>
        `${i.productId}|${i.selections
          .map((s) => s.ingredientId)
          .slice()
          .sort()
          .join(",")}`;
      const existing = prev.find((i) => signature(i) === signature(item));
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      const id =
        item.id ?? `${item.productId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      return [...prev, { ...item, id }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return { items, subtotal, count, addItem, updateQuantity, removeItem, clear, hydrated };
  }, [items, addItem, updateQuantity, removeItem, clear, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider");
  return ctx;
}
