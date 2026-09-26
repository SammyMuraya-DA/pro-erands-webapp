import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Phone, CheckCircle, XCircle, Navigation, Package, Clock,
  Truck, Star, Loader2, Power, PowerOff, RefreshCw
} from "lucide-react";

interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  status: string;
  vehicle_type: string | null;
  rating: number | null;
  total_deliveries: number | null;
}

interface DispatchRequest {
  id: string;
  order_id: string;
  status: string;
  dispatched_at: string;
  expires_at: string;
  distance_km: number | null;
  orders: {
    id: string;
    order_number: string;
    pickup_address: string;
    delivery_address: string;
    package_description: string | null;
    total_amount: number | null;
    service_type: string;
  };
}

interface ActiveOrder {
  id: string;
  order_number: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  package_description: string | null;
  total_amount: number | null;
  created_at: string;
  estimated_delivery_at: string | null;
}

async function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "context" in error && error.context instanceof Response) {
    try {
      const responseBody = await error.context.clone().json();
      if (typeof responseBody.error === "string") return responseBody.error;
    } catch {
      // Fall back to the SDK error message when the response has no JSON body.
    }
  }

  return error instanceof Error ? error.message : "Unable to verify rider token";
}

export default function RiderPortal() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  const [token, setToken] = useState(tokenParam || localStorage.getItem("rider_token") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [pendingRequests, setPendingRequests] = useState<DispatchRequest[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<ActiveOrder[]>([]);
  const [responding, setResponding] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [locationWatching, setLocationWatching] = useState(false);
  const [countdown, setCountdown] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const apiCall = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("rider-respond", {
      body: { ...body, riderToken: token },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiCall({ action: "get-profile" });
      if (data.success) {
        setRider(data.rider);
        setPendingRequests(data.pendingRequests || []);
        setActiveOrders(data.activeOrders || []);
        setCompletedOrders(data.completedOrders || []);
        setAuthenticated(true);
        localStorage.setItem("rider_token", token);
      }
    } catch (error) {
      const message = await getErrorMessage(error);
      const invalidToken = message.toLowerCase().includes("token");
      toast({
        title: invalidToken ? "Invalid rider token" : "Rider sign-in failed",
        description: message,
        variant: "destructive",
      });
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [token, apiCall, toast]);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  // Countdown timer for pending requests
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCountdown: Record<string, number> = {};
      pendingRequests.forEach((req) => {
        const remaining = Math.max(0, Math.floor((new Date(req.expires_at).getTime() - now) / 1000));
        newCountdown[req.id] = remaining;
        if (remaining === 0) {
          fetchProfile(); // Refresh when expired
        }
      });
      setCountdown(newCountdown);
    }, 1000);
    return () => clearInterval(interval);
  }, [pendingRequests, fetchProfile]);

  // Real-time subscription for dispatch requests
  useEffect(() => {
    if (!rider) return;
    const channel = supabase
      .channel("rider-dispatch")
      .on("postgres_changes", { event: "*", schema: "public", table: "dispatch_requests", filter: `rider_id=eq.${rider.id}` }, () => {
        fetchProfile();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => {
        fetchProfile();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [rider, fetchProfile]);

  // GPS location watching
  const startLocationWatch = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setLocationWatching(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await apiCall({ action: "update-location", latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        } catch (e) {
          console.error("Location update failed:", e);
        }
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    // Store watch ID for cleanup
    (window as unknown as Record<string, number>).__geoWatchId = id;
  };

  const stopLocationWatch = () => {
    const id = (window as unknown as Record<string, number>).__geoWatchId;
    if (id !== undefined) navigator.geolocation.clearWatch(id);
    setLocationWatching(false);
  };

  const handleRespond = async (requestId: string, action: "accept" | "decline") => {
    setResponding(requestId);
    try {
      await apiCall({ action, dispatchRequestId: requestId });
      toast({ title: action === "accept" ? "✅ Order accepted!" : "Order declined" });
      fetchProfile();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setResponding(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      await apiCall({ action: "update-order-status", orderId, status });
      toast({ title: `Order ${status.replace("_", " ")}` });
      fetchProfile();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleToggleOnline = async () => {
    try {
      const action = rider?.status === "available" ? "go-offline" : "go-online";
      await apiCall({ action });
      if (action === "go-online") startLocationWatch();
      else stopLocationWatch();
      fetchProfile();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Error", variant: "destructive" });
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Rider Portal</h1>
            <p className="text-muted-foreground mt-1">Enter your rider token to get started</p>
          </div>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              <Input placeholder="Enter rider token..." value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />
              <Button className="w-full" onClick={() => setToken(tokenInput)} disabled={!tokenInput.trim()}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const nextStatusMap: Record<string, { label: string; status: string }> = {
    assigned: { label: "Mark Picked Up", status: "picked_up" },
    picked_up: { label: "Start Transit", status: "in_transit" },
    in_transit: { label: "Mark Delivered", status: "delivered" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {rider?.name?.[0] || "R"}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{rider?.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3" /> {rider?.rating?.toFixed(1) || "5.0"}
                <span>•</span>
                {rider?.total_deliveries || 0} trips
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchProfile}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant={rider?.status === "available" ? "default" : "outline"}
              size="sm"
              onClick={handleToggleOnline}
              className={rider?.status === "available" ? "bg-success hover:bg-success/90" : ""}
            >
              {rider?.status === "available" ? <Power className="h-4 w-4 mr-1" /> : <PowerOff className="h-4 w-4 mr-1" />}
              {rider?.status === "available" ? "Online" : "Offline"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* GPS Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-sm">
            <Navigation className={`h-4 w-4 ${locationWatching ? "text-success" : "text-muted-foreground"}`} />
            <span className="text-foreground">GPS Location Sharing</span>
          </div>
          <Button size="sm" variant={locationWatching ? "default" : "outline"} onClick={locationWatching ? stopLocationWatch : startLocationWatch}>
            {locationWatching ? "Sharing" : "Start"}
          </Button>
        </div>

        {/* Pending Dispatch Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              New Delivery Requests
            </h2>
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border-2 border-warning/50 p-4 space-y-3 animate-pulse-slow">
                <div className="flex items-center justify-between">
                  <Badge className="bg-warning/10 text-warning border-0">{req.orders?.service_type?.replace("-", " ")}</Badge>
                  <div className="flex items-center gap-1 text-sm font-mono">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className={`font-bold ${(countdown[req.id] || 0) < 30 ? "text-destructive" : "text-warning"}`}>
                      {Math.floor((countdown[req.id] || 0) / 60)}:{((countdown[req.id] || 0) % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-3 w-3 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-foreground">{req.orders?.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-foreground">{req.orders?.delivery_address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {req.distance_km ? `${req.distance_km.toFixed(1)}km away` : "Distance unknown"}
                  </span>
                  {req.orders?.total_amount && (
                    <span className="font-semibold text-foreground">KES {req.orders.total_amount}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleRespond(req.id, "accept")}
                    disabled={responding === req.id}
                  >
                    {responding === req.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    Accept
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleRespond(req.id, "decline")}
                    disabled={responding === req.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Active Orders
            </h2>
            {activeOrders.map((order) => {
              const next = nextStatusMap[order.status];
              return (
                <div key={order.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium text-foreground">{order.order_number}</span>
                    <Badge className="bg-primary/10 text-primary border-0 capitalize">{order.status.replace("_", " ")}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <p className="text-foreground">{order.pickup_address}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-foreground">{order.delivery_address}</p>
                    </div>
                  </div>

                  {next && (
                    <Button
                      className="w-full"
                      onClick={() => handleUpdateOrderStatus(order.id, next.status)}
                      disabled={updatingStatus === order.id}
                    >
                      {updatingStatus === order.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Truck className="h-4 w-4 mr-1" />}
                      {next.label}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Recent Deliveries
            </h2>
            {completedOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm text-foreground">{order.order_number}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{order.delivery_address}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-success/10 text-success border-0">Delivered</Badge>
                  {order.total_amount && <p className="text-xs text-muted-foreground mt-1">KES {order.total_amount}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {pendingRequests.length === 0 && activeOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {rider?.status === "available" ? "Waiting for delivery requests..." : "Go online to receive delivery requests"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
