-- Insert just a few unique additional records to populate the database
INSERT INTO public.cases (case_number, title, description, complainant_name, respondent_name, status, priority, evidence_score, created_at, assigned_to, metadata) VALUES
('POSH-2024-020', 'Inappropriate Email Communications', 'Persistent inappropriate emails and messages sent to junior employees', 'Rebecca Smith', 'Senior Manager A', 'pending', 'medium', 55, '2024-03-20 14:30:00+00', NULL, '{"incidentDetails": {"type": "email_harassment", "location": "Digital Communications", "date": "2024-03-18"}, "reportingDetails": {"isAnonymous": false, "contactMethod": "email"}}'),
('POSH-2024-021', 'Workplace Intimidation', 'Aggressive behavior and intimidation in the workplace affecting team morale', 'Anonymous', 'Team Leader B', 'investigating', 'high', 70, '2024-03-18 11:15:00+00', 'investigator@company.com', '{"incidentDetails": {"type": "intimidation", "location": "Office Floor 2", "date": "2024-03-15"}, "reportingDetails": {"isAnonymous": true, "contactMethod": "hotline"}}'),
('POSH-2024-022', 'Gender-Based Comments', 'Inappropriate comments about appearance and gender roles during meetings', 'Meera Patel', 'Director C', 'under_review', 'medium', 65, '2024-03-16 09:45:00+00', 'icc.chair@company.com', '{"incidentDetails": {"type": "gender_discrimination", "location": "Board Room", "date": "2024-03-14"}, "reportingDetails": {"isAnonymous": false, "contactMethod": "formal_complaint"}}');

-- Add just a few evidence records for these new cases
INSERT INTO public.evidence (case_id, type, description, score, ai_analysis, metadata) 
SELECT 
    c.id,
    'email'::evidence_type,
    'Email evidence for case ' || c.case_number,
    35,
    '{"contentAnalysis": "Evidence of inappropriate communication", "keyFindings": ["inappropriate language"], "confidenceLevel": 0.75}',
    '{"fileDetails": {"name": "evidence.pdf", "size": 150000, "type": "application/pdf"}}'
FROM cases c 
WHERE c.case_number IN ('POSH-2024-020', 'POSH-2024-021', 'POSH-2024-022')
LIMIT 3;

-- Add compliance deadlines for these new cases
INSERT INTO public.compliance_deadlines (case_id, deadline_type, deadline_date, description, status, urgency_level)
SELECT 
    c.id,
    'acknowledgment'::text,
    c.created_at + INTERVAL '2 days',
    'Acknowledge receipt of complaint (48 hours)',
    'pending'::text,
    'high'::text
FROM cases c 
WHERE c.case_number IN ('POSH-2024-020', 'POSH-2024-021', 'POSH-2024-022');

-- Add some webhook activity logs
INSERT INTO public.webhook_logs (webhook_type, case_id, payload, response, status, execution_time_ms)
SELECT 
    'CASE_CREATED',
    c.id,
    '{"event": "case_created", "caseNumber": "' || c.case_number || '"}',
    '{"status": "success"}',
    'success',
    850
FROM cases c 
WHERE c.case_number IN ('POSH-2024-020', 'POSH-2024-021', 'POSH-2024-022')
LIMIT 3;