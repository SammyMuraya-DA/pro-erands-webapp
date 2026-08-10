import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface TrackingMapProps {
  riderLat: number | null;
  riderLng: number | null;
  deliveryAddress: string;
  pickupAddress: string;
}

const MAPBOX_TOKEN_KEY = 'mapbox_public_token';

const TrackingMap = ({ riderLat, riderLng, deliveryAddress, pickupAddress }: TrackingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(MAPBOX_TOKEN_KEY) || '');
  const [tokenInput, setTokenInput] = useState('');
  const [mapError, setMapError] = useState<string | null>(null);

  // Default to Nairobi if no rider location
  const defaultLat = -1.2921;
  const defaultLng = 36.8219;

  const saveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem(MAPBOX_TOKEN_KEY, tokenInput.trim());
      setToken(tokenInput.trim());
      setMapError(null);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;

      const centerLat = riderLat || defaultLat;
      const centerLng = riderLng || defaultLng;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 13,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add rider marker if location available
      if (riderLat && riderLng) {
        const el = document.createElement('div');
        el.className = 'rider-marker';
        el.innerHTML = `
          <div style="
            background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l2 2"/>
            </svg>
          </div>
        `;

        riderMarker.current = new mapboxgl.Marker(el)
          .setLngLat([riderLng, riderLat])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Rider Location</strong><p>Live tracking</p>'))
          .addTo(map.current);
      }

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Invalid Mapbox token. Please check and try again.');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map. Please check your token.');
    }

    return () => {
      map.current?.remove();
    };
  }, [token, riderLat, riderLng]);

  // Update rider marker position in real-time
  useEffect(() => {
    if (riderMarker.current && riderLat && riderLng && map.current) {
      riderMarker.current.setLngLat([riderLng, riderLat]);
      map.current.flyTo({ center: [riderLng, riderLat], duration: 1000 });
    }
  }, [riderLat, riderLng]);

  if (!token) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Live Map Tracking
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your Mapbox public token to enable live map tracking. Get one free at{' '}
          <a 
            href="https://mapbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="pk.eyJ1..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={saveToken} disabled={!tokenInput.trim()}>
            Enable Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Live Map Tracking
        </h3>
        {riderLat && riderLng && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Rider location live
          </span>
        )}
      </div>
      
      {mapError ? (
        <div className="p-6">
          <p className="text-destructive text-sm mb-4">{mapError}</p>
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem(MAPBOX_TOKEN_KEY);
              setToken('');
              setMapError(null);
            }}
          >
            Reset Token
          </Button>
        </div>
      ) : (
        <div ref={mapContainer} className="h-[300px] w-full" />
      )}
      
      {!riderLat && !riderLng && !mapError && (
        <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground">
          Rider location will appear when the order is picked up
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
