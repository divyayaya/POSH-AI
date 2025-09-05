-- Allow public complaint submissions and related inserts while keeping updates restricted

-- 1) Cases: permit INSERT for pending cases (public submission)
CREATE POLICY "Public can file complaints (insert pending cases)"
ON public.cases
FOR INSERT
TO public
WITH CHECK (
  status = 'pending'::case_status
  AND assigned_to IS NULL
);

-- 2) Evidence: allow INSERT only when linked case is pending
CREATE POLICY "Public can add evidence to pending cases"
ON public.evidence
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = evidence.case_id
      AND cases.status = 'pending'::case_status
  )
);

-- 3) Compliance deadlines: allow creation of the initial investigation deadline for pending cases
CREATE POLICY "Public can create initial investigation deadline"
ON public.compliance_deadlines
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = compliance_deadlines.case_id
      AND cases.status = 'pending'::case_status
  )
  AND deadline_type = 'investigation_completion'
);

-- 4) Maintain updated_at automatically (idempotent via conditional trigger creation)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_cases_updated_at'
    ) THEN
        CREATE TRIGGER update_cases_updated_at
        BEFORE UPDATE ON public.cases
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_evidence_updated_at'
    ) THEN
        CREATE TRIGGER update_evidence_updated_at
        BEFORE UPDATE ON public.evidence
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_compliance_deadlines_updated_at'
    ) THEN
        CREATE TRIGGER update_compliance_deadlines_updated_at
        BEFORE UPDATE ON public.compliance_deadlines
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 5) Indexes for performance (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS uq_cases_case_number ON public.cases (case_number);
CREATE INDEX IF NOT EXISTS idx_cases_status_created ON public.cases (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence (case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_case_id ON public.compliance_deadlines (case_id, deadline_date);
