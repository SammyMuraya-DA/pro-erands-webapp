-- Allow public rider applications to be inserted
CREATE POLICY "Anyone can create rider applications"
ON public.riders
FOR INSERT
WITH CHECK (true);

-- Allow public rider applications to be updated only by admins
-- Keep riders readable publicly for tracking and operational visibility
CREATE POLICY "Admins can update riders"
ON public.riders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));
