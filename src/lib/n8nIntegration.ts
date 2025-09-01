// Integration layer for connecting Lovable POSH-AI to n8n workflows

import { Case, Evidence, HumanReview, ComplianceDeadline } from './types';

export class N8nWorkflowTrigger {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private async triggerWebhook(endpoint: string, payload: any): Promise<any> {
    const url = `${this.baseUrl}/webhook/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          source: 'posh-ai-lovable'
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`n8n workflow trigger failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Trigger when a new case is created
  async triggerCaseCreated(caseData: Case & { complainant: any; respondent: any }): Promise<void> {
    const payload = {
      caseId: caseData.id,
      status: caseData.status,
      priority: caseData.priority,
      evidenceScore: caseData.evidenceScore,
      needsHumanReview: caseData.needsHumanReview,
      complainant: {
        id: caseData.complainant.id,
        department: caseData.complainant.department,
        manager: caseData.complainant.manager
      },
      respondent: {
        id: caseData.respondent?.id,
        department: caseData.respondent?.department
      },
      submissionDate: caseData.submissionDate,
      deadline: caseData.deadline,
      incidentType: caseData.incidentType,
      description: caseData.description
    };

    await this.triggerWebhook('case-created', payload);
  }

  // Trigger when evidence is uploaded
  async triggerEvidenceUploaded(evidence: Evidence): Promise<void> {
    const payload = {
      caseId: evidence.caseId,
      evidenceId: evidence.id,
      type: evidence.type,
      description: evidence.description,
      aiAnalysisScore: evidence.aiAnalysisScore,
      credibilityRating: evidence.credibilityRating,
      needsProcessing: true,
      metadata: evidence.metadata
    };

    await this.triggerWebhook('evidence-uploaded', payload);
  }

  // Trigger when human review is submitted
  async triggerHumanReviewSubmitted(review: HumanReview): Promise<void> {
    const payload = {
      caseId: review.caseId,
      reviewerId: review.reviewerId,
      reviewerRole: review.reviewerRole,
      credibilityAssessment: review.credibilityAssessment,
      mediationRecommended: review.mediationRecommended,
      pathway: review.investigationPathway,
      rationale: review.rationale,
      reviewDate: review.reviewDate
    };

    await this.triggerWebhook('human-review-submitted', payload);
  }

  // Trigger when case status changes
  async triggerCaseStatusChanged(caseId: string, oldStatus: string, newStatus: string, assignedTo?: string): Promise<void> {
    const payload = {
      caseId,
      oldStatus,
      newStatus,
      assignedTo,
      updatedBy: 'system', // or actual user ID
    };

    await this.triggerWebhook('case-status-changed', payload);
  }

  // Trigger for approaching deadlines
  async triggerDeadlineApproaching(deadline: ComplianceDeadline): Promise<void> {
    const payload = {
      caseId: deadline.caseId,
      deadlineType: deadline.deadlineType,
      dueDate: deadline.dueDate,
      daysRemaining: deadline.daysRemaining,
      urgency: deadline.daysRemaining <= 3 ? 'critical' : deadline.daysRemaining <= 7 ? 'high' : 'medium',
      status: deadline.status
    };

    await this.triggerWebhook('deadline-approaching', payload);
  }

  // Health check for n8n connection
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Initialize the n8n integration
export const n8nTrigger = new N8nWorkflowTrigger(
  import.meta.env?.VITE_N8N_WEBHOOK_BASE_URL || 'https://your-n8n-instance.com',
  import.meta.env?.VITE_N8N_API_KEY
);