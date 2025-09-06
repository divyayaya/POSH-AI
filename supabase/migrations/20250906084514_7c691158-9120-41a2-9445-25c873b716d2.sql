-- Add public read access for demo purposes
-- This allows unauthenticated users to view cases and evidence

-- Allow public to view cases
CREATE POLICY "Public can view cases for demo" 
ON public.cases 
FOR SELECT 
USING (true);

-- Allow public to view evidence
CREATE POLICY "Public can view evidence for demo" 
ON public.evidence 
FOR SELECT 
USING (true);

-- Allow public to view compliance deadlines
CREATE POLICY "Public can view compliance deadlines for demo" 
ON public.compliance_deadlines 
FOR SELECT 
USING (true);

-- Allow public to view case reviews
CREATE POLICY "Public can view case reviews for demo" 
ON public.case_reviews 
FOR SELECT 
USING (true);

-- Allow public to view case assignments
CREATE POLICY "Public can view case assignments for demo" 
ON public.case_assignments 
FOR SELECT 
USING (true);

-- Allow public to view webhook logs
CREATE POLICY "Public can view webhook logs for demo" 
ON public.webhook_logs 
FOR SELECT 
USING (true);