import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import {
  Star, Clock, MapPin, ArrowLeft, Plus, Loader2, ShoppingCart, Flame
} from "lucide-react";

import storeGrocery from "@/assets/store-grocery.png";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string;
  rating: number | null;
  total_ratings: number | null;
  delivery_fee: number | null;
  estimated_delivery_minutes: number | null;
  is_open: boolean | null;
  opening_hours: string | null;
  phone: string | null;
  min_order_amount: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean | null;
  is_popular: boolean | null;
}

export default function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState<StoreData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addItem, itemCount } = useCart();

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) return;
      setLoading(true);
      const [{ data: storeData }, { data: itemsData }] = await Promise.all([
        (supabase as any).from("stores").select("*").eq("id", id).single(),
        (supabase as any).from("menu_items").select("*").eq("store_id", id).eq("is_available", true).order("sort_order"),
      ]);
      setStore(storeData as StoreData | null);
      setMenuItems((itemsData as MenuItem[]) || []);
      setLoading(false);
    };
    fetchStore();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="font-display text-2xl font-bold text-foreground">Store not found</h2>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/stores">Back to Stores</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const categories = [...new Set(menuItems.map((i) => i.category))];
  const filteredItems = activeCategory
    ? menuItems.filter((i) => i.category === activeCategory)
    : menuItems;

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Layout>
      {/* Store Hero */}
      <section className="relative">
        <div className="h-48 md:h-64 overflow-hidden">
          <img
            src={store.image_url || storeGrocery}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        </div>
        <div className="container-custom relative -mt-16 z-10">
          <Button variant="outline" size="sm" className="mb-4 bg-background" asChild>
            <Link to="/stores">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{store.name}</h1>
                {store.description && (
                  <p className="text-muted-foreground mt-1">{store.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{store.rating || "4.5"}</span>
                    ({store.total_ratings || 0} ratings)
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {store.estimated_delivery_minutes || 30} min
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {store.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!store.is_open && <Badge variant="destructive">Closed</Badge>}
                <Badge variant="outline" className="text-sm">
                  {store.delivery_fee === 0 ? "Free Delivery" : `KES ${store.delivery_fee} delivery`}
                </Badge>
                {store.min_order_amount && store.min_order_amount > 0 && (
                  <Badge variant="outline" className="text-sm">Min KES {store.min_order_amount}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <section className="border-b border-border bg-background sticky top-[108px] z-40">
          <div className="container-custom">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              <Button
                variant={activeCategory === null ? "default" : "ghost"}
                size="sm"
                className="shrink-0 rounded-full"
                onClick={() => setActiveCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "ghost"}
                  size="sm"
                  className="shrink-0 rounded-full"
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Menu Items */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {menuItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No items available right now</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">{category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
                      >
                        {item.image_url && (
                          <div className="h-36 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                                {item.is_popular && (
                                  <Flame className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-foreground">KES {item.price}</span>
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => addItem(store.id, item.id)}
                              disabled={!store.is_open}
                            >
                              <Plus className="h-4 w-4" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Button (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
          <Button className="w-full h-14 text-base gap-2 rounded-2xl shadow-glow">
            <ShoppingCart className="h-5 w-5" />
            View Cart ({itemCount} items)
          </Button>
        </div>
      )}
    </Layout>
  );
}
