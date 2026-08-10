import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Rider {
  id: string;
  name: string;
  phone: string;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
  vehicle_type: string | null;
  location_updated_at: string | null;
}

interface RiderTrackingMapProps {
  onRiderSelect?: (rider: Rider) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function RiderTrackingMap({ onRiderSelect }: RiderTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default center (Nairobi)
  const defaultCenter = { lat: -1.2921, lng: 36.8219 };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Fetch API key from edge function
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        
        if (error || !data?.apiKey) {
          throw new Error('Failed to load Maps API key');
        }

        // Check if already loaded
        if (window.google?.maps) {
          setMapLoaded(true);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        script.onerror = () => setError('Failed to load Google Maps');
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check API configuration.');
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map once loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
  }, [mapLoaded]);

  // Fetch riders
  const fetchRiders = async () => {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .order('name');

      if (error) throw error;
      setRiders(data || []);
    } catch (err) {
      console.error('Error fetching riders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('riders-location')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'riders' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRiders(prev => 
              prev.map(r => r.id === payload.new.id ? payload.new as Rider : r)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update markers when riders change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidLocations = false;

    riders.forEach((rider) => {
      const existingMarker = markersRef.current.get(rider.id);
      
      if (rider.current_latitude && rider.current_longitude) {
        const position = { 
          lat: Number(rider.current_latitude), 
          lng: Number(rider.current_longitude) 
        };
        
        hasValidLocations = true;
        bounds.extend(position);

        if (existingMarker) {
          // Update existing marker position
          existingMarker.setPosition(position);
        } else {
          // Create new marker
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: rider.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: rider.status === 'available' ? '#22c55e' : 
                        rider.status === 'busy' ? '#f59e0b' : '#94a3b8',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 150px;">
                <strong style="font-size: 14px;">${rider.name}</strong>
                <p style="margin: 4px 0; color: #666; font-size: 12px;">${rider.phone}</p>
                <p style="margin: 4px 0; font-size: 12px;">
                  <span style="
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background: ${rider.status === 'available' ? '#dcfce7' : 
                                  rider.status === 'busy' ? '#fef3c7' : '#f1f5f9'};
                    color: ${rider.status === 'available' ? '#166534' : 
                            rider.status === 'busy' ? '#92400e' : '#475569'};
                    font-weight: 500;
                    text-transform: capitalize;
                  ">${rider.status}</span>
                </p>
                ${rider.vehicle_type ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🏍️ ${rider.vehicle_type}</p>` : ''}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
            onRiderSelect?.(rider);
          });

          markersRef.current.set(rider.id, marker);
        }
      } else if (existingMarker) {
        // Remove marker if rider no longer has location
        existingMarker.setMap(null);
        markersRef.current.delete(rider.id);
      }
    });

    // Fit bounds if we have locations
    if (hasValidLocations && riders.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      // Don't zoom in too much
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [riders, mapLoaded, onRiderSelect]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'busy': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center text-destructive">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Rider Locations</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-success" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-warning" />
              Busy
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-muted-foreground" />
              Offline
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRiders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {(loading || !mapLoaded) && (
          <div className="absolute inset-0 bg-muted/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        <div ref={mapRef} className="h-[400px] w-full" />
      </div>

      {/* Rider list below map */}
      <div className="p-4 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          {riders.filter(r => r.current_latitude && r.current_longitude).length} of {riders.length} riders with location
        </h4>
        <div className="grid gap-2 max-h-[200px] overflow-y-auto">
          {riders.map((rider) => (
            <div 
              key={rider.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => {
                if (rider.current_latitude && rider.current_longitude && mapInstanceRef.current) {
                  mapInstanceRef.current.panTo({
                    lat: Number(rider.current_latitude),
                    lng: Number(rider.current_longitude)
                  });
                  mapInstanceRef.current.setZoom(15);
                }
                onRiderSelect?.(rider);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  rider.status === 'available' ? 'bg-success' : 
                  rider.status === 'busy' ? 'bg-warning' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm font-medium">{rider.name}</p>
                  <p className="text-xs text-muted-foreground">{rider.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rider.current_latitude && rider.current_longitude ? (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No location</span>
                )}
                <Badge className={`${getStatusColor(rider.status)} capitalize border-0 text-xs`}>
                  {rider.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
