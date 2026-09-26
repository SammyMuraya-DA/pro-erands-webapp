ALTER TABLE public.rider_applications
ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;