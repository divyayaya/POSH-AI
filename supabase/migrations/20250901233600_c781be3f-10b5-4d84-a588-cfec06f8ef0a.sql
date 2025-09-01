-- Create enum types for cases
CREATE TYPE case_status AS ENUM ('pending', 'under_review', 'investigating', 'mediation', 'closed', 'escalated');
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE evidence_type AS ENUM ('witness_statement', 'document', 'physical_evidence', 'digital_evidence', 'email', 'chat_log');

-- Create cases table
CREATE TABLE public.cases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    complainant_name TEXT NOT NULL,
    respondent_name TEXT NOT NULL,
    status case_status NOT NULL DEFAULT 'pending',
    priority case_priority NOT NULL DEFAULT 'medium',
    evidence_score INTEGER NOT NULL DEFAULT 0,
    ai_analysis JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evidence table
CREATE TABLE public.evidence (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    type evidence_type NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    ai_analysis JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compliance deadlines table
CREATE TABLE public.compliance_deadlines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    deadline_type TEXT NOT NULL,
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases
CREATE POLICY "Cases are viewable by everyone" 
ON public.cases 
FOR SELECT 
USING (true);

CREATE POLICY "Cases can be created by everyone" 
ON public.cases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Cases can be updated by everyone" 
ON public.cases 
FOR UPDATE 
USING (true);

-- Create RLS policies for evidence
CREATE POLICY "Evidence is viewable by everyone" 
ON public.evidence 
FOR SELECT 
USING (true);

CREATE POLICY "Evidence can be created by everyone" 
ON public.evidence 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Evidence can be updated by everyone" 
ON public.evidence 
FOR UPDATE 
USING (true);

-- Create RLS policies for compliance deadlines
CREATE POLICY "Compliance deadlines are viewable by everyone" 
ON public.compliance_deadlines 
FOR SELECT 
USING (true);

CREATE POLICY "Compliance deadlines can be created by everyone" 
ON public.compliance_deadlines 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Compliance deadlines can be updated by everyone" 
ON public.compliance_deadlines 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
    BEFORE UPDATE ON public.evidence
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_deadlines_updated_at
    BEFORE UPDATE ON public.compliance_deadlines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_priority ON public.cases(priority);
CREATE INDEX idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX idx_compliance_deadlines_case_id ON public.compliance_deadlines(case_id);
CREATE INDEX idx_compliance_deadlines_date ON public.compliance_deadlines(deadline_date);
CREATE INDEX idx_compliance_deadlines_status ON public.compliance_deadlines(status);