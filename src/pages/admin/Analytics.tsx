import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Package, DollarSign, Users, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
  totalRevenue: number;
  ordersByService: { name: string; value: number }[];
  ordersByStatus: { name: string; value: number }[];
  dailyOrders: { date: string; orders: number }[];
  avgOrderValue: number;
  totalOrders: number;
}

const COLORS = ["hsl(24, 95%, 53%)", "hsl(38, 92%, 50%)", "hsl(142, 76%, 36%)", "hsl(215, 28%, 17%)", "hsl(0, 84%, 60%)", "hsl(220, 9%, 46%)"];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    ordersByService: [],
    ordersByStatus: [],
    dailyOrders: [],
    avgOrderValue: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*");

      if (error) throw error;

      if (!orders || orders.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, o: any) => sum + (o.total_amount || 0), 0);

      // Group by service type
      const serviceGroups = orders.reduce((acc, order) => {
        const service = order.service_type || "other";
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ordersByService = Object.entries(serviceGroups).map(([name, value]) => ({
        name: name.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
        value,
      }));

      // Group by status
      const statusGroups = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ordersByStatus = Object.entries(statusGroups).map(([name, value]) => ({
        name: name.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
        value,
      }));

      // Daily orders for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const dailyOrders = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        orders: orders.filter(o => o.created_at.split("T")[0] === date).length,
      }));

      setData({
        totalRevenue,
        ordersByService,
        ordersByStatus,
        dailyOrders,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        totalOrders: orders.length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `KES ${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: Package,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Avg Order Value",
      value: `KES ${data.avgOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      trend: "+5%",
      trendUp: true,
    },
  ];

  return (
    <AdminLayout title="Analytics">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? "text-success" : "text-destructive"}`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="orders" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Orders by Service */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {data.ordersByService.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.ordersByService}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.ordersByService.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {data.ordersByStatus.map((status, index) => (
                  <div
                    key={status.name}
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                  >
                    <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                      {status.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{status.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
