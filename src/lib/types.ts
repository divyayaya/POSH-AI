// POSH System Types

export interface Employee {
  id: string;
  name: string;
  department: string;
  manager: string;
  tenure: string;
  location: string;
  email?: string;
}

export interface Case {
  id: string;
  status: 'new' | 'assigned' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidenceScore: number;
  needsHumanReview: boolean;
  submissionDate: string;
  deadline: string;
  complainant: string;
  respondent: string;
  department: string;
  incidentType?: string;
  description?: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  type: 'document' | 'witness' | 'physical' | 'digital';
  description: string;
  filePath?: string;
  aiAnalysisScore: number;
  credibilityRating: number;
  metadata?: Record<string, any>;
}

export interface HumanReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerRole: 'icc_primary' | 'icc_secondary' | 'hr_manager';
  credibilityAssessment: number;
  mediationRecommended: boolean;
  investigationPathway: 'formal' | 'mediation' | 'alternative' | 'dismiss';
  rationale: string;
  reviewDate: string;
}

export interface WorkflowEvent {
  id: string;
  caseId?: string;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt?: string;
  createdAt: string;
}

export interface ComplianceDeadline {
  id: string;
  caseId: string;
  deadlineType: 'filing' | 'investigation' | 'resolution' | 'reporting';
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  alertSent: boolean;
  daysRemaining: number;
}

export interface N8nWorkflowTrigger {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}