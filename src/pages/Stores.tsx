import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Star, Clock, MapPin, Loader2, Store, ShoppingBag,
  Pill, UtensilsCrossed, Package, Briefcase
} from "lucide-react";

import storeGrocery from "@/assets/store-grocery.png";
import storePharmacy from "@/assets/store-pharmacy.png";
import storeRestaurant from "@/assets/store-restaurant.png";

const fallbackImages: Record<string, string> = {
  grocery: storeGrocery,
  pharmacy: storePharmacy,
  restaurant: storeRestaurant,
};

const categoryIcons: Record<string, typeof Store> = {
  Grocery: ShoppingBag,
  Pharmacy: Pill,
  Restaurant: UtensilsCrossed,
  Errands: Package,
  Corporate: Briefcase,
  Store: Store,
};

interface StoreCategory {
  id: string;
  name: string;
  icon: string;
}

interface StoreItem {
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
  category_id: string | null;
}

export default function Stores() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: catData }, { data: storeData }] = await Promise.all([
        (supabase as any).from("store_categories").select("*").order("sort_order"),
        (supabase as any).from("stores").select("*").order("rating", { ascending: false }),
      ]);
      setCategories(catData || []);
      setStores(storeData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesCategory = !selectedCategory || store.category_id === selectedCategory;
    const matchesSearch = !searchQuery ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (iconName: string) => categoryIcons[iconName] || Store;

  return (
    <Layout>
      {/* Hero Search */}
      <section className="bg-secondary text-secondary-foreground py-8 md:py-12">
        <div className="container-custom">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            What do you need delivered?
          </h1>
          <p className="text-secondary-foreground/70 mb-6">
            Browse stores and get anything delivered to your door
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search stores, items, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base bg-background text-foreground border-0"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-background sticky top-[108px] z-40">
        <div className="container-custom">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 rounded-full gap-1.5"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  <Icon className="h-4 w-4" />
                  {cat.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Store Grid */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-20">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No stores found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Check back soon for new stores"}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name || "Stores"
                    : "All Stores"}
                </h2>
                <span className="text-sm text-muted-foreground">{filteredStores.length} stores</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((store) => {
                  const cat = categories.find((c) => c.id === store.category_id);
                  const imgSrc = store.image_url || fallbackImages[cat?.name?.toLowerCase() || ""] || storeGrocery;

                  return (
                    <Link
                      key={store.id}
                      to={`/stores/${store.id}`}
                      className="group bg-card rounded-2xl border border-border overflow-hidden hover-lift"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {!store.is_open && (
                          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                            <Badge className="bg-background text-foreground">Closed</Badge>
                          </div>
                        )}
                        {store.delivery_fee === 0 && (
                          <Badge className="absolute top-3 left-3 bg-success text-success-foreground">
                            Free Delivery
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-display font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                            {store.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm shrink-0">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-semibold text-foreground">{store.rating || "4.5"}</span>
                            <span className="text-muted-foreground">({store.total_ratings || 0})</span>
                          </div>
                        </div>
                        {store.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{store.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {store.estimated_delivery_minutes || 30} min
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {store.address.split(",")[0]}
                          </span>
                          {store.delivery_fee && store.delivery_fee > 0 ? (
                            <span>KES {store.delivery_fee} delivery</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
