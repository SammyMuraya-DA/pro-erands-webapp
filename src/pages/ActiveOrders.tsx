import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Package, Truck, MapPin, Clock, CheckCircle, Search, Loader2, ChevronRight, Phone
} from "lucide-react";

interface ActiveOrder {
  id: string;
  order_number: string;
  status: string;
  service_type: string;
  pickup_address: string;
  delivery_address: string;
  total_amount: number | null;
  created_at: string;
  estimated_delivery_at: string | null;
  items: any;
  store_id: string | null;
  assigned_rider_id: string | null;
  rider?: { name: string; phone: string; current_latitude: number | null; current_longitude: number | null } | null;
}

const statusConfig: Record<string, { label: string; icon: typeof Package; color: string; bgColor: string }> = {
  pending: { label: "Order Placed", icon: Package, color: "text-warning", bgColor: "bg-warning/10" },
  searching: { label: "Finding Rider", icon: Search, color: "text-warning", bgColor: "bg-warning/10" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-primary", bgColor: "bg-primary/10" },
  assigned: { label: "Rider On The Way", icon: Truck, color: "text-primary", bgColor: "bg-primary/10" },
  picked_up: { label: "Picked Up", icon: Package, color: "text-accent", bgColor: "bg-accent/10" },
  in_transit: { label: "On Its Way", icon: Truck, color: "text-success", bgColor: "bg-success/10" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
};

const statusProgress: Record<string, number> = {
  pending: 10,
  searching: 25,
  confirmed: 35,
  assigned: 50,
  picked_up: 65,
  in_transit: 80,
  delivered: 100,
};

export default function ActiveOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "searching", "confirmed", "assigned", "picked_up", "in_transit"])
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch riders for assigned orders
        const ordersWithRiders = await Promise.all(
          data.map(async (order: any) => {
            if (order.assigned_rider_id) {
              const { data: riderData } = await supabase
                .from("riders")
                .select("name, phone, current_latitude, current_longitude")
                .eq("id", order.assigned_rider_id)
                .single();
              return { ...order, rider: riderData };
            }
            return { ...order, rider: null };
          })
        );
        setOrders(ordersWithRiders as ActiveOrder[]);
      }
      setLoading(false);
    };
    fetchOrders();

    // Real-time updates
    const channel = supabase
      .channel("active-orders")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchOrders(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign in to view orders</h2>
          <Button asChild className="mt-4">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-background min-h-screen">
        <div className="container-custom max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Your Orders</h1>
          <p className="text-muted-foreground mb-8">Track your active deliveries in real-time</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No active orders</h3>
              <p className="text-muted-foreground mb-4">Your deliveries will appear here</p>
              <Button asChild>
                <Link to="/stores">Browse Stores</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                const progress = statusProgress[order.status] || 10;
                const itemsList = Array.isArray(order.items) ? order.items : [];

                return (
                  <Link
                    key={order.id}
                    to={`/track?order=${order.order_number}`}
                    className="block bg-card rounded-2xl border border-border p-5 hover:border-primary/50 transition-all group"
                  >
                    {/* Status Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${config.color}`}>{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.order_number}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Order Details */}
                    <div className="space-y-2 text-sm">
                      {itemsList.length > 0 && (
                        <p className="text-foreground font-medium">
                          {itemsList.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{order.delivery_address}</span>
                      </div>
                      {order.estimated_delivery_at && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            ETA: {new Date(order.estimated_delivery_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rider Info */}
                    {order.rider && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {order.rider.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{order.rider.name}</p>
                            <p className="text-xs text-muted-foreground">Your rider</p>
                          </div>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild onClick={(e) => e.stopPropagation()}>
                          <a href={`tel:${order.rider.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Total */}
                    {order.total_amount && (
                      <div className="text-right mt-3">
                        <span className="font-bold text-foreground">KES {order.total_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
