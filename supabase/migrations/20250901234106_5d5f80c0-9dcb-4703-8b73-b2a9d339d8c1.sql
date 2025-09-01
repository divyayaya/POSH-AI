-- Drop the existing insecure RLS policies
DROP POLICY IF EXISTS "Cases are viewable by everyone" ON public.cases;
DROP POLICY IF EXISTS "Cases can be created by everyone" ON public.cases;
DROP POLICY IF EXISTS "Cases can be updated by everyone" ON public.cases;

DROP POLICY IF EXISTS "Evidence is viewable by everyone" ON public.evidence;
DROP POLICY IF EXISTS "Evidence can be created by everyone" ON public.evidence;
DROP POLICY IF EXISTS "Evidence can be updated by everyone" ON public.evidence;

DROP POLICY IF EXISTS "Compliance deadlines are viewable by everyone" ON public.compliance_deadlines;
DROP POLICY IF EXISTS "Compliance deadlines can be created by everyone" ON public.compliance_deadlines;
DROP POLICY IF EXISTS "Compliance deadlines can be updated by everyone" ON public.compliance_deadlines;

-- Create secure RLS policies for cases table
CREATE POLICY "HR admins can view all cases" 
ON public.cases 
FOR SELECT 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can view all cases" 
ON public.cases 
FOR SELECT 
USING (public.is_icc_member());

CREATE POLICY "Investigators can view assigned cases" 
ON public.cases 
FOR SELECT 
USING (
    public.is_investigator() AND 
    (metadata->>'investigator' = auth.uid()::text OR metadata->>'assignedTo' = auth.uid()::text)
);

CREATE POLICY "HR admins can create cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (public.is_hr_admin());

CREATE POLICY "HR admins can update all cases" 
ON public.cases 
FOR UPDATE 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can update cases" 
ON public.cases 
FOR UPDATE 
USING (public.is_icc_member());

CREATE POLICY "Investigators can update assigned cases" 
ON public.cases 
FOR UPDATE 
USING (
    public.is_investigator() AND 
    (metadata->>'investigator' = auth.uid()::text OR metadata->>'assignedTo' = auth.uid()::text)
);

-- Create secure RLS policies for evidence table
CREATE POLICY "HR admins can view all evidence" 
ON public.evidence 
FOR SELECT 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can view all evidence" 
ON public.evidence 
FOR SELECT 
USING (public.is_icc_member());

CREATE POLICY "Investigators can view evidence for assigned cases" 
ON public.evidence 
FOR SELECT 
USING (
    public.is_investigator() AND 
    EXISTS (
        SELECT 1 FROM public.cases 
        WHERE id = evidence.case_id 
        AND (metadata->>'investigator' = auth.uid()::text OR metadata->>'assignedTo' = auth.uid()::text)
    )
);

CREATE POLICY "HR admins can create evidence" 
ON public.evidence 
FOR INSERT 
WITH CHECK (public.is_hr_admin());

CREATE POLICY "Investigators can create evidence for assigned cases" 
ON public.evidence 
FOR INSERT 
WITH CHECK (
    public.is_investigator() AND 
    EXISTS (
        SELECT 1 FROM public.cases 
        WHERE id = evidence.case_id 
        AND (metadata->>'investigator' = auth.uid()::text OR metadata->>'assignedTo' = auth.uid()::text)
    )
);

CREATE POLICY "HR admins can update all evidence" 
ON public.evidence 
FOR UPDATE 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can update evidence" 
ON public.evidence 
FOR UPDATE 
USING (public.is_icc_member());

-- Create secure RLS policies for compliance deadlines table
CREATE POLICY "HR admins can view all compliance deadlines" 
ON public.compliance_deadlines 
FOR SELECT 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can view all compliance deadlines" 
ON public.compliance_deadlines 
FOR SELECT 
USING (public.is_icc_member());

CREATE POLICY "Investigators can view deadlines for assigned cases" 
ON public.compliance_deadlines 
FOR SELECT 
USING (
    public.is_investigator() AND 
    EXISTS (
        SELECT 1 FROM public.cases 
        WHERE id = compliance_deadlines.case_id 
        AND (metadata->>'investigator' = auth.uid()::text OR metadata->>'assignedTo' = auth.uid()::text)
    )
);

CREATE POLICY "HR admins can create compliance deadlines" 
ON public.compliance_deadlines 
FOR INSERT 
WITH CHECK (public.is_hr_admin());

CREATE POLICY "HR admins can update all compliance deadlines" 
ON public.compliance_deadlines 
FOR UPDATE 
USING (public.is_hr_admin());

CREATE POLICY "ICC members can update compliance deadlines" 
ON public.compliance_deadlines 
FOR UPDATE 
USING (public.is_icc_member());