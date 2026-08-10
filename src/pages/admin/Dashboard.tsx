import { useEffect, useState } from "react";
import { Package, Users, Bike, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiderTrackingMap from "@/components/admin/RiderTrackingMap";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRiders: number;
  availableRiders: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  service_type: string;
  status: string;
  created_at: string;
  pickup_address: string;
  delivery_address: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRiders: 0,
    availableRiders: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch orders stats
      const { data: orders, count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact" });

      const pendingOrders = orders?.filter(o => 
        ["pending", "confirmed", "picked_up", "in_transit"].includes(o.status)
      ).length || 0;

      const completedOrders = orders?.filter(o => o.status === "delivered").length || 0;

      // Fetch riders stats
      const { count: totalRiders } = await supabase
        .from("riders" as any)
        .select("*", { count: "exact" });

      const { count: availableRiders } = await supabase
        .from("riders" as any)
        .select("*", { count: "exact" })
        .eq("status", "available");

      // Fetch customers stats
      const { count: totalCustomers } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      // Fetch recent orders
      const { data: recent } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders,
        completedOrders,
        totalRiders: totalRiders || 0,
        availableRiders: availableRiders || 0,
        totalCustomers: totalCustomers || 0,
      });

      setRecentOrders(recent || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      title: "Total Orders", 
      value: stats.totalOrders, 
      icon: Package, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Pending Orders", 
      value: stats.pendingOrders, 
      icon: Clock, 
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    { 
      title: "Completed", 
      value: stats.completedOrders, 
      icon: CheckCircle, 
      color: "text-success",
      bgColor: "bg-success/10"
    },
    { 
      title: "Total Riders", 
      value: stats.totalRiders, 
      icon: Bike, 
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    { 
      title: "Available Riders", 
      value: stats.availableRiders, 
      icon: TrendingUp, 
      color: "text-success",
      bgColor: "bg-success/10"
    },
    { 
      title: "Customers", 
      value: stats.totalCustomers, 
      icon: Users, 
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "outline",
      picked_up: "outline",
      in_transit: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title} className="border-border">
                <CardContent className="p-4">
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rider Tracking Map */}
          <RiderTrackingMap />

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-semibold text-foreground">
                            {order.order_number}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.service_type} • {order.pickup_address.split(",")[0]} → {order.delivery_address.split(",")[0]}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
