import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, Zap, User, Phone, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Rider {
  id: string;
  name: string;
  phone: string;
  status: string;
  vehicle_type: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  total_deliveries: number | null;
  rating: number | null;
}

interface Order {
  id: string;
  order_number: string;
  pickup_address: string;
  delivery_address: string;
}

interface RiderWithDistance extends Rider {
  distance: number | null;
}

interface RiderAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onAssigned: (orderId: string, riderId: string) => void;
  pickupCoordinates?: { lat: number; lng: number } | null;
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode address using Google Maps API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-maps-key');
    if (error || !data?.apiKey) return null;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${data.apiKey}`
    );
    const result = await response.json();
    
    if (result.results && result.results[0]) {
      const location = result.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export default function RiderAssignmentDialog({
  open,
  onOpenChange,
  order,
  onAssigned,
  pickupCoordinates,
}: RiderAssignmentDialogProps) {
  const [riders, setRiders] = useState<RiderWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Fetch available riders with location data
  useEffect(() => {
    if (!open || !order) return;

    async function fetchRidersAndCalculateDistances() {
      setLoading(true);
      try {
        // Get all available riders
        const { data: ridersData, error } = await supabase
          .from('riders')
          .select('*')
          .eq('status', 'available')
          .order('name');

        if (error) throw error;

        // Geocode pickup address if coordinates not provided
        let coords = pickupCoordinates;
        if (!coords && order) {
          coords = await geocodeAddress(order.pickup_address);
          setPickupLocation(coords);
        } else {
          setPickupLocation(coords ?? null);
        }

        // Calculate distances for each rider
        const ridersWithDistance: RiderWithDistance[] = (ridersData || []).map((rider) => {
          let distance: number | null = null;
          if (
            coords &&
            rider.current_latitude !== null &&
            rider.current_longitude !== null
          ) {
            distance = calculateDistance(
              coords.lat,
              coords.lng,
              Number(rider.current_latitude),
              Number(rider.current_longitude)
            );
          }
          return { ...rider, distance };
        });

        // Sort by distance (riders with location first, then by distance)
        ridersWithDistance.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        setRiders(ridersWithDistance);
      } catch (error) {
        console.error('Error fetching riders:', error);
        toast({ title: 'Error loading riders', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    fetchRidersAndCalculateDistances();
  }, [open, order, pickupCoordinates, toast]);

  async function sendRiderNotification(riderId: string) {
    try {
      const { error } = await supabase.functions.invoke('send-rider-notification', {
        body: {
          riderId,
          orderNumber: order?.order_number,
          pickupAddress: order?.pickup_address,
          deliveryAddress: order?.delivery_address,
        },
      });

      if (error) {
        console.error('Notification error:', error);
        toast({ 
          title: 'Order assigned', 
          description: 'Could not send WhatsApp notification to rider',
          variant: 'default' 
        });
      } else {
        toast({ 
          title: 'Rider assigned & notified', 
          description: 'WhatsApp notification sent to rider' 
        });
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }

  async function handleAssign(riderId: string) {
    if (!order) return;
    setAssigning(riderId);

    try {
      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 1);

      // Update order with assigned rider
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          assigned_rider_id: riderId,
          status: 'assigned',
          estimated_delivery_at: estimatedDelivery.toISOString(),
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Update rider status to busy
      const { error: riderError } = await supabase
        .from('riders')
        .update({ status: 'busy' })
        .eq('id', riderId);

      if (riderError) throw riderError;

      // Send WhatsApp notification to rider
      await sendRiderNotification(riderId);

      onAssigned(order.id, riderId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning rider:', error);
      toast({ title: 'Error assigning rider', variant: 'destructive' });
    } finally {
      setAssigning(null);
    }
  }

  async function handleAutoAssign() {
    if (!order) return;

    // Find nearest available rider with location
    const nearestRider = riders.find((r) => r.distance !== null);
    
    if (!nearestRider) {
      toast({ 
        title: 'No riders with location', 
        description: 'No available riders have their location enabled',
        variant: 'destructive' 
      });
      return;
    }

    setAutoAssigning(true);
    await handleAssign(nearestRider.id);
    setAutoAssigning(false);
  }

  const formatDistance = (distance: number | null) => {
    if (distance === null) return 'Unknown';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const ridersWithLocation = riders.filter((r) => r.distance !== null);
  const ridersWithoutLocation = riders.filter((r) => r.distance === null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Rider to {order?.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Pickup location info */}
          {order && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Pickup Location</p>
                  <p className="text-foreground">{order.pickup_address}</p>
                  {pickupLocation && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-assign button */}
          {ridersWithLocation.length > 0 && (
            <Button
              onClick={handleAutoAssign}
              disabled={autoAssigning || loading}
              className="w-full"
              variant="default"
            >
              <Zap className="h-4 w-4 mr-2" />
              {autoAssigning ? 'Assigning...' : `Auto-Assign Nearest Rider (${formatDistance(ridersWithLocation[0]?.distance ?? null)})`}
            </Button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : riders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No available riders at the moment
            </p>
          ) : (
            <>
              {/* Riders with location (sorted by distance) */}
              {ridersWithLocation.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Riders with Location ({ridersWithLocation.length})
                  </h4>
                  <div className="space-y-2">
                    {ridersWithLocation.map((rider, index) => (
                      <div
                        key={rider.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          index === 0 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {index === 0 ? '⚡' : index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{rider.name}</p>
                              {index === 0 && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                  Nearest
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {rider.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {formatDistance(rider.distance)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(rider.location_updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={index === 0 ? 'default' : 'outline'}
                          onClick={() => handleAssign(rider.id)}
                          disabled={assigning === rider.id}
                        >
                          {assigning === rider.id ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Riders without location */}
              {ridersWithoutLocation.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Riders without Location ({ridersWithoutLocation.length})
                  </h4>
                  <div className="space-y-2">
                    {ridersWithoutLocation.map((rider) => (
                      <div
                        key={rider.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{rider.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {rider.phone}
                              </span>
                              {rider.vehicle_type && (
                                <span className="capitalize">🏍️ {rider.vehicle_type}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(rider.id)}
                          disabled={assigning === rider.id}
                        >
                          {assigning === rider.id ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
