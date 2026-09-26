CREATE TABLE IF NOT EXISTS public.rider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'motorcycle',
  vehicle_plate TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rider_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit rider applications"
ON public.rider_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage rider applications"
ON public.rider_applications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rider_applications_updated_at
BEFORE UPDATE ON public.rider_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
