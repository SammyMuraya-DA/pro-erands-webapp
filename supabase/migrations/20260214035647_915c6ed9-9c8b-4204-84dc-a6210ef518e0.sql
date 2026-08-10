
-- Create dispatch_requests table to track rider accept/decline flow
CREATE TABLE public.dispatch_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, declined, expired, cancelled
  dispatched_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '2 minutes'),
  distance_km numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispatch_requests ENABLE ROW LEVEL SECURITY;

-- Admins can manage all dispatch requests
CREATE POLICY "Admins can manage dispatch requests"
ON public.dispatch_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view dispatch requests (needed for rider portal with token-based auth)
CREATE POLICY "Anyone can view dispatch requests"
ON public.dispatch_requests
FOR SELECT
USING (true);

-- Anyone can update dispatch requests (rider responding)
CREATE POLICY "Anyone can update dispatch requests"
ON public.dispatch_requests
FOR UPDATE
USING (true);

-- Enable realtime for dispatch_requests and riders
ALTER PUBLICATION supabase_realtime ADD TABLE public.dispatch_requests;

-- Add rider auth token for simple rider portal authentication
ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS auth_token text DEFAULT encode(gen_random_bytes(32), 'hex');

-- Create index for faster dispatch queries
CREATE INDEX idx_dispatch_requests_order ON public.dispatch_requests(order_id);
CREATE INDEX idx_dispatch_requests_rider ON public.dispatch_requests(rider_id);
CREATE INDEX idx_dispatch_requests_status ON public.dispatch_requests(status);
CREATE INDEX idx_riders_auth_token ON public.riders(auth_token);
