import { N8N_WEBHOOKS } from '@/lib/mockData';

interface WebhookPayload {
  [key: string]: any;
}

interface WebhookResponse {
  success: boolean;
  executionId?: string;
  error?: string;
  response?: any;
}

class WebhookService {
  private async callWebhook(
    webhookType: keyof typeof N8N_WEBHOOKS, 
    payload: WebhookPayload
  ): Promise<WebhookResponse> {
    const webhookUrl = N8N_WEBHOOKS[webhookType];
    
    if (!webhookUrl) {
      throw new Error(`Webhook URL not found for type: ${webhookType}`);
    }

    try {
      console.log(`🚀 Triggering n8n webhook: ${webhookType}`, payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'POSH-Compliance-System/1.0',
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          source: 'posh-compliance-system'
        }),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json().catch(() => ({}));
      
      console.log(`✅ n8n webhook ${webhookType} completed:`, responseData);
      
      return {
        success: true,
        response: responseData,
        executionId: responseData.executionId || `exec-${Date.now()}`
      };

    } catch (error) {
      console.error(`❌ n8n webhook ${webhookType} failed:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Case Created Workflow
  async triggerCaseCreated(data: {
    caseId: string;
    evidenceScore: number;
    needsHumanReview: boolean;
    formData: any;
    uploadedFiles: number;
  }): Promise<WebhookResponse> {
    return this.callWebhook('CASE_CREATED', {
      event: 'case_created',
      caseId: data.caseId,
      status: 'new',
      priority: data.evidenceScore < 40 ? 'high' : 'medium',
      evidenceScore: data.evidenceScore,
      needsHumanReview: data.needsHumanReview,
      complainant: {
        id: data.formData.isAnonymous ? 'anonymous' : 'EMP-001',
        department: 'Unknown', // Would come from HRIS integration
        anonymous: data.formData.isAnonymous
      },
      incidentType: data.formData.incidentType,
      uploadedFiles: data.uploadedFiles,
      formData: data.formData
    });
  }

  // Human Review Submitted Workflow  
  async triggerHumanReviewSubmitted(data: {
    caseId: string;
    reviewerId: string;
    pathway: string;
    credibility: number;
  }): Promise<WebhookResponse> {
    return this.callWebhook('HUMAN_REVIEW_SUBMITTED', {
      event: 'human_review_submitted',
      caseId: data.caseId,
      reviewerId: data.reviewerId,
      pathway: data.pathway,
      credibilityScore: data.credibility,
      nextAction: data.pathway === 'formal' ? 'assign_investigator' : 'route_mediation'
    });
  }

  // Evidence Uploaded Workflow
  async triggerEvidenceUploaded(data: {
    caseId: string;
    evidenceId: string;
    type: string;
    aiAnalysisScore: number;
  }): Promise<WebhookResponse> {
    return this.callWebhook('EVIDENCE_UPLOADED', {
      event: 'evidence_uploaded',
      caseId: data.caseId,
      evidenceId: data.evidenceId,
      type: data.type,
      aiAnalysisScore: data.aiAnalysisScore,
      needsProcessing: data.aiAnalysisScore < 60
    });
  }

  // Case Status Changed Workflow
  async triggerCaseStatusChanged(data: {
    caseId: string;
    oldStatus: string;
    newStatus: string;
    assignedTo?: string;
  }): Promise<WebhookResponse> {
    return this.callWebhook('CASE_STATUS_CHANGED', {
      event: 'case_status_changed',
      caseId: data.caseId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      assignedTo: data.assignedTo,
      requiresNotification: true
    });
  }

  // Deadline Approaching Workflow
  async triggerDeadlineApproaching(data: {
    caseId: string;
    deadlineType: string;
    dueDate: string;
    daysRemaining: number;
    urgency: string;
  }): Promise<WebhookResponse> {
    return this.callWebhook('DEADLINE_APPROACHING', {
      event: 'deadline_approaching',
      caseId: data.caseId,
      deadlineType: data.deadlineType,
      dueDate: data.dueDate,
      daysRemaining: data.daysRemaining,
      urgency: data.urgency,
      requiresImmedateAction: data.daysRemaining <= 7
    });
  }
}

// Export singleton instance
export const webhookService = new WebhookService();