import { Case, Employee, Evidence, HumanReview, ComplianceDeadline } from './types';

// Mock Employee Data (simulating HRIS integration)
export const mockEmployeeData: Employee = {
  id: "MKT-001",
  name: "Sarah Johnson",
  department: "Marketing",
  manager: "David Chen",
  tenure: "2.5 years",
  location: "New York Office",
  email: "sarah.johnson@company.com"
};

// Mock Cases Data
export const mockCases: Case[] = [
  {
    id: "POSH-2024-001",
    status: "new",
    priority: "high",
    evidenceScore: 35,
    needsHumanReview: true,
    submissionDate: "2024-03-15",
    deadline: "2024-06-13",
    complainant: "Sarah Johnson",
    respondent: "John Smith",
    department: "Marketing",
    incidentType: "Harassment/Discrimination",
    description: "Inappropriate comments and behavior during team meetings"
  },
  {
    id: "POSH-2024-002",
    status: "investigating",
    priority: "medium",
    evidenceScore: 75,
    needsHumanReview: false,
    submissionDate: "2024-03-10",
    deadline: "2024-06-08",
    complainant: "Anonymous",
    respondent: "Mike Wilson",
    department: "Sales",
    incidentType: "Policy Violation",
    description: "Unwanted physical contact and inappropriate messages"
  },
  {
    id: "POSH-2024-003",
    status: "resolved",
    priority: "low",
    evidenceScore: 90,
    needsHumanReview: false,
    submissionDate: "2024-02-28",
    deadline: "2024-05-28",
    complainant: "Emma Davis",
    respondent: "Robert Clark",
    department: "Engineering",
    incidentType: "Retaliation",
    description: "Negative performance reviews after reporting concerns"
  }
];

// Mock Evidence Data
export const mockEvidence: Evidence[] = [
  {
    id: "ev-001",
    caseId: "POSH-2024-001",
    type: "document",
    description: "Email thread showing inappropriate messages",
    filePath: "/evidence/email-thread-001.pdf",
    aiAnalysisScore: 40,
    credibilityRating: 4.2,
    metadata: {
      sentiment: "negative",
      keywords: ["inappropriate", "uncomfortable", "harassment"],
      confidence: 0.87
    }
  },
  {
    id: "ev-002",
    caseId: "POSH-2024-001",
    type: "witness",
    description: "Testimony from team meeting attendee",
    aiAnalysisScore: 30,
    credibilityRating: 3.8,
    metadata: {
      consistency: 0.92,
      detail_level: "high"
    }
  }
];

// Mock Human Reviews
export const mockHumanReviews: HumanReview[] = [
  {
    id: "hr-001",
    caseId: "POSH-2024-001",
    reviewerId: "ICC-001",
    reviewerRole: "icc_primary",
    credibilityAssessment: 4,
    mediationRecommended: false,
    investigationPathway: "formal",
    rationale: "Evidence shows consistent pattern of inappropriate behavior requiring formal investigation",
    reviewDate: "2024-03-16"
  }
];

// Mock Compliance Deadlines
export const mockDeadlines: ComplianceDeadline[] = [
  {
    id: "cd-001",
    caseId: "POSH-2024-001",
    deadlineType: "investigation",
    dueDate: "2024-06-13",
    status: "pending",
    alertSent: false,
    daysRemaining: 73
  },
  {
    id: "cd-002",
    caseId: "POSH-2024-002",
    deadlineType: "investigation",
    dueDate: "2024-06-08",
    status: "pending",
    alertSent: true,
    daysRemaining: 68
  }
];

// Evidence scoring logic
export const calculateEvidenceScore = (evidenceList: Evidence[]): number => {
  let score = 0;
  evidenceList.forEach(evidence => {
    switch (evidence.type) {
      case 'witness':
        score += 30;
        break;
      case 'document':
        score += 40;
        break;
      case 'physical':
        score += 50;
        break;
      case 'digital':
        score += 35;
        break;
    }
  });
  return score;
};

// Get evidence level description
export const getEvidenceLevel = (score: number): { level: string; color: string; description: string } => {
  if (score >= 80) {
    return {
      level: "High Evidence",
      color: "evidence-high",
      description: "Formal investigation recommended"
    };
  } else if (score >= 40) {
    return {
      level: "Medium Evidence", 
      color: "evidence-medium",
      description: "Investigation options available"
    };
  } else {
    return {
      level: "Low Evidence",
      color: "evidence-low", 
      description: "Human evaluation required"
    };
  }
};

// n8n Webhook URLs (demo purposes)
export const N8N_WEBHOOKS = {
  CASE_CREATED: "https://n8n.srv979089.hstgr.cloud/webhook/case-created",
  EVIDENCE_UPLOADED: "https://n8n.srv979089.hstgr.cloud/webhook/evidence-uploaded",
  HUMAN_REVIEW_SUBMITTED: "https://n8n.srv979089.hstgr.cloud/webhook/human-review-submitted",
  //CASE_STATUS_CHANGED: "https://demo-n8n.lovable.app/webhook/case-status-changed",
  DEADLINE_APPROACHING: "https://n8n.srv979089.hstgr.cloud/webhook/deadline-approaching"
};