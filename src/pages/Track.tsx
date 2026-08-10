import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, Phone, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TrackingMap from "@/components/tracking/TrackingMap";

interface Order {
  id: string;
  order_number: string;
  service_type: string;
  status: string;
  pickup_address: string;
  delivery_address: string;
  package_description: string | null;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
  estimated_delivery_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  assigned_rider_id: string | null;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  rating: number | null;
  total_deliveries: number | null;
  current_latitude: number | null;
  current_longitude: number | null;
}

const Track = () => {
  const [trackingId, setTrackingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [rider, setRider] = useState<Rider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getStatusSteps = (order: Order) => {
    const steps = [
      { 
        icon: Package, 
        label: "Order Placed", 
        time: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
        description: "Your order has been received", 
        done: true 
      },
      { 
        icon: Search, 
        label: "Finding Rider", 
        time: order.status === 'searching' ? "Now" : order.assigned_rider_id ? "✓" : "--:--", 
        description: order.status === 'searching' ? "Searching for the nearest available rider..." : order.assigned_rider_id ? "Rider found and assigned" : "Waiting to dispatch", 
        done: order.status !== 'pending' && order.status !== 'confirmed',
        active: order.status === 'searching'
      },
      { 
        icon: CheckCircle2, 
        label: "Rider Assigned", 
        time: order.assigned_rider_id ? new Date(order.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "--:--", 
        description: order.assigned_rider_id ? "Rider accepted and heading to pickup" : "Waiting for rider acceptance", 
        done: !!order.assigned_rider_id,
        active: order.status === 'assigned'
      },
      { 
        icon: Package, 
        label: "Picked Up", 
        time: order.picked_up_at ? new Date(order.picked_up_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "--:--", 
        description: order.picked_up_at ? "Package collected from pickup location" : "Waiting for pickup", 
        done: !!order.picked_up_at,
        active: order.status === 'picked_up'
      },
      { 
        icon: Truck, 
        label: "In Transit", 
        time: order.status === 'in_transit' || order.status === 'delivered' ? new Date(order.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "--:--", 
        description: order.status === 'in_transit' ? "On the way to delivery address" : "Pending", 
        done: order.status === 'in_transit' || order.status === 'delivered',
        active: order.status === 'in_transit'
      },
      { 
        icon: MapPin, 
        label: "Delivered", 
        time: order.delivered_at ? new Date(order.delivered_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : order.estimated_delivery_at ? `ETA ${new Date(order.estimated_delivery_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : "--:--", 
        description: order.status === 'delivered' ? "Package delivered successfully" : "Pending delivery", 
        done: order.status === 'delivered' 
      },
    ];
    return steps;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Pending", color: "bg-warning/10 text-warning" },
      searching: { label: "Finding Rider", color: "bg-warning/10 text-warning" },
      confirmed: { label: "Confirmed", color: "bg-primary/10 text-primary" },
      assigned: { label: "Rider Assigned", color: "bg-primary/10 text-primary" },
      picked_up: { label: "Picked Up", color: "bg-accent/10 text-accent" },
      in_transit: { label: "In Transit", color: "bg-success/10 text-success" },
      delivered: { label: "Delivered", color: "bg-success/10 text-success" },
      cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive" },
    };
    return statusMap[status] || { label: status, color: "bg-muted text-muted-foreground" };
  };

  const fetchOrder = async (orderNumber: string) => {
    setIsLoading(true);
    setError(null);
    setOrder(null);
    setRider(null);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber.toUpperCase())
        .single();

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          setError("Order not found. Please check your order ID and try again.");
        } else {
          throw orderError;
        }
        return;
      }

      setOrder(orderData as unknown as Order);

      // Fetch rider if assigned
      if (orderData.assigned_rider_id) {
        const { data: riderData } = await supabase
          .from("riders")
          .select("id, name, phone, rating, total_deliveries, current_latitude, current_longitude")
          .eq("id", orderData.assigned_rider_id)
          .single();

        if (riderData) {
          setRider(riderData as unknown as Rider);
        }
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel('order-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          setOrder(payload.new as unknown as Order);
        }
      )
      .subscribe();

    // Also subscribe to rider location updates if rider is assigned
    let riderChannel: ReturnType<typeof supabase.channel> | null = null;
    if (order.assigned_rider_id) {
      riderChannel = supabase
        .channel('rider-tracking')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'riders',
            filter: `id=eq.${order.assigned_rider_id}`
          },
          (payload) => {
            console.log('Rider updated:', payload);
            setRider(payload.new as unknown as Rider);
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
      if (riderChannel) {
        supabase.removeChannel(riderChannel);
      }
    };
  }, [order?.id, order?.assigned_rider_id]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      fetchOrder(trackingId.trim());
    }
  };

  const formatServiceType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const statusInfo = order ? getStatusLabel(order.status) : null;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Order Tracking
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Track Your Order
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Enter your order ID to see real-time status updates and estimated delivery time.
            </p>

            {/* Search Form */}
            <form onSubmit={handleTrack} className="flex gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter order ID (e.g., PE-20250102-1234)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="pl-12 h-14 text-base"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-14" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tracking Result */}
      {order && (
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              {/* Live Update Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Live updates enabled
              </div>

              {/* Order Header */}
              <div className="bg-card rounded-2xl p-6 border border-border mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Order ID</div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {order.order_number}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className={`inline-flex items-center gap-2 ${statusInfo?.color} px-3 py-1 rounded-full font-semibold`}>
                      {order.status === 'in_transit' && (
                        <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      )}
                      {statusInfo?.label}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Service</div>
                    <div className="font-semibold text-foreground">{formatServiceType(order.service_type)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ordered</div>
                    <div className="font-semibold text-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Est. Delivery</div>
                    <div className="font-semibold text-primary">
                      {order.estimated_delivery_at 
                        ? new Date(order.estimated_delivery_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        : "Pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-card rounded-2xl p-6 border border-border mb-8">
                <h3 className="font-display text-lg font-bold text-foreground mb-6">Delivery Progress</h3>
                
                <div className="space-y-0">
                  {getStatusSteps(order).map((step, index, arr) => (
                    <div key={step.label} className="relative flex gap-4">
                      {/* Timeline Line */}
                      {index < arr.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-full ${
                            step.done ? "bg-success" : "bg-border"
                          }`}
                        />
                      )}
                      
                      {/* Icon */}
                      <div
                        className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          step.done
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground"
                        } ${step.active ? "ring-4 ring-success/30" : ""}`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="pb-8">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                          <span className="text-sm text-muted-foreground">{step.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rider Info */}
              {rider && (
                <div className="bg-card rounded-2xl p-6 border border-border mb-8">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Your Rider</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {rider.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{rider.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {rider.rating?.toFixed(1) || '5.0'} rating • {rider.total_deliveries || 0} deliveries
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <a href={`tel:${rider.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`https://wa.me/${rider.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Rider Location (if available) */}
                  {rider.current_latitude && rider.current_longitude && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Rider location is being tracked in real-time</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live Map */}
              <TrackingMap
                riderLat={rider?.current_latitude || null}
                riderLng={rider?.current_longitude || null}
                deliveryAddress={order.delivery_address}
                pickupAddress={order.pickup_address}
              />

              {/* Addresses */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Delivery Details</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Pickup</div>
                      <div className="font-semibold text-foreground">{order.pickup_address}</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Delivery</div>
                      <div className="font-semibold text-foreground">{order.delivery_address}</div>
                    </div>
                  </div>
                  {order.package_description && (
                    <div className="flex gap-4 pt-4 border-t border-border">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Package</div>
                        <div className="font-semibold text-foreground">{order.package_description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Help Section */}
      <section className="section-padding bg-muted">
        <div className="container-custom text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Need Help with Your Order?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is available 24/7 to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="tel:+254711301315">
                <Phone className="mr-2 h-4 w-4" />
                Call Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://wa.me/254711301315" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Track;