-- Case reviews table
CREATE TABLE public.case_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    review_type TEXT NOT NULL DEFAULT 'human_review',
    credibility_assessment INTEGER NOT NULL CHECK (credibility_assessment >= 1 AND credibility_assessment <= 5),
    investigation_pathway TEXT NOT NULL CHECK (investigation_pathway IN ('formal', 'mediation', 'coaching', 'dismissed')),
    rationale TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook logs table for debugging
CREATE TABLE public.webhook_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type TEXT NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    response JSONB,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Case assignments table
CREATE TABLE public.case_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    assignee_id TEXT NOT NULL,
    assignee_role TEXT NOT NULL CHECK (assignee_role IN ('icc_member', 'investigator', 'mediator', 'hr_manager')),
    assigned_by TEXT NOT NULL,
    assignment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to existing tables
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS assigned_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMP WITH TIME ZONE;

-- Update compliance_deadlines to include urgency levels
ALTER TABLE public.compliance_deadlines 
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS alert_sent_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX idx_case_reviews_case_id ON public.case_reviews(case_id);
CREATE INDEX idx_case_reviews_reviewer ON public.case_reviews(reviewer_id);
CREATE INDEX idx_webhook_logs_case_id ON public.webhook_logs(case_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_case_assignments_case_id ON public.case_assignments(case_id);
CREATE INDEX idx_case_assignments_assignee ON public.case_assignments(assignee_id);
CREATE INDEX idx_cases_assigned_to ON public.cases(assigned_to);
CREATE INDEX idx_compliance_deadlines_urgency ON public.compliance_deadlines(urgency_level);

-- Enable RLS on new tables
ALTER TABLE public.case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "HR admins can view all case reviews" ON public.case_reviews FOR SELECT USING (is_hr_admin());
CREATE POLICY "ICC members can view all case reviews" ON public.case_reviews FOR SELECT USING (is_icc_member());
CREATE POLICY "Investigators can view reviews for assigned cases" ON public.case_reviews FOR SELECT USING (
    is_investigator() AND EXISTS (
        SELECT 1 FROM cases WHERE cases.id = case_reviews.case_id 
        AND (cases.metadata->>'investigator' = auth.uid()::text OR cases.metadata->>'assignedTo' = auth.uid()::text)
    )
);

CREATE POLICY "HR admins can create case reviews" ON public.case_reviews FOR INSERT WITH CHECK (is_hr_admin());
CREATE POLICY "ICC members can create case reviews" ON public.case_reviews FOR INSERT WITH CHECK (is_icc_member());

CREATE POLICY "HR admins can update case reviews" ON public.case_reviews FOR UPDATE USING (is_hr_admin());
CREATE POLICY "ICC members can update case reviews" ON public.case_reviews FOR UPDATE USING (is_icc_member());

-- Webhook logs policies
CREATE POLICY "HR admins can view webhook logs" ON public.webhook_logs FOR SELECT USING (is_hr_admin());
CREATE POLICY "ICC members can view webhook logs" ON public.webhook_logs FOR SELECT USING (is_icc_member());
CREATE POLICY "System can create webhook logs" ON public.webhook_logs FOR INSERT WITH CHECK (true);

-- Case assignments policies
CREATE POLICY "HR admins can view all case assignments" ON public.case_assignments FOR SELECT USING (is_hr_admin());
CREATE POLICY "ICC members can view all case assignments" ON public.case_assignments FOR SELECT USING (is_icc_member());
CREATE POLICY "Investigators can view their assignments" ON public.case_assignments FOR SELECT USING (
    is_investigator() AND assignee_id = auth.uid()::text
);

CREATE POLICY "HR admins can create case assignments" ON public.case_assignments FOR INSERT WITH CHECK (is_hr_admin());
CREATE POLICY "ICC members can create case assignments" ON public.case_assignments FOR INSERT WITH CHECK (is_icc_member());

CREATE POLICY "HR admins can update case assignments" ON public.case_assignments FOR UPDATE USING (is_hr_admin());
CREATE POLICY "ICC members can update case assignments" ON public.case_assignments FOR UPDATE USING (is_icc_member());