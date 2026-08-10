-- Add payment_status column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';

-- Add payment_method column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add payment reference for M-Pesa or other payment confirmations
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_reference text;

-- Add payment timestamp
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;