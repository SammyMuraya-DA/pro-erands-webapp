import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  menu_item_id: string;
  store_id: string;
  quantity: number;
  special_instructions: string | null;
  menu_item: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    description: string | null;
  };
  store: {
    id: string;
    name: string;
    delivery_fee: number;
    image_url: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  storeId: string | null;
  storeName: string | null;
  addItem: (storeId: string, menuItemId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("cart_items")
        .select(`
          id, menu_item_id, store_id, quantity, special_instructions,
          menu_items!inner(id, name, price, image_url, description),
          stores!inner(id, name, delivery_fee, image_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        store_id: item.store_id,
        quantity: item.quantity,
        special_instructions: item.special_instructions,
        menu_item: item.menu_items,
        store: item.stores,
      }));
      setItems(mapped);
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (storeId: string, menuItemId: string, quantity = 1) => {
    if (!user) {
      toast({ title: "Please sign in to add items to cart", variant: "destructive" });
      return;
    }

    if (items.length > 0 && items[0].store_id !== storeId) {
      toast({
        title: "Different store",
        description: "Your cart has items from another store. Clear cart first?",
        variant: "destructive",
      });
      return;
    }

    const existing = items.find((i) => i.menu_item_id === menuItemId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity);
      return;
    }

    const { error } = await (supabase as any).from("cart_items").insert({
      user_id: user.id,
      store_id: storeId,
      menu_item_id: menuItemId,
      quantity,
    });

    if (error) {
      toast({ title: "Failed to add item", variant: "destructive" });
      return;
    }
    toast({ title: "Added to cart ✓" });
    await fetchCart();
  };

  const removeItem = async (itemId: string) => {
    await (supabase as any).from("cart_items").delete().eq("id", itemId);
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId);
      return;
    }
    await (supabase as any).from("cart_items").update({ quantity }).eq("id", itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await (supabase as any).from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0);
  const deliveryFee = items.length > 0 ? items[0].store.delivery_fee : 0;
  const total = subtotal + deliveryFee;
  const storeId = items.length > 0 ? items[0].store_id : null;
  const storeName = items.length > 0 ? items[0].store.name : null;

  return (
    <CartContext.Provider value={{
      items, loading, itemCount, subtotal, deliveryFee, total, storeId, storeName,
      addItem, removeItem, updateQuantity, clearCart, refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
