import { N8N_WEBHOOKS } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';

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
  // Enhanced logging with analysis tracking
  private async logWebhook(
    webhookType: string,
    caseId: string | null,
    payload: any,
    response: any,
    status: 'success' | 'error',
    errorMessage?: string,
    executionTime?: number
  ) {
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          webhook_type: webhookType,
          case_id: caseId,
          payload: {
            ...payload,
            // Track what AI analysis was requested
            analysisRequested: payload.aiTasks || {},
            evidenceCount: payload.evidenceAnalysis?.totalCount || 0,
            hasWitnesses: payload.witnesses?.hasWitnesses || false
          },
          response,
          status,
          error_message: errorMessage,
          execution_time_ms: executionTime
        });
    } catch (error) {
      console.error('Failed to log webhook:', error);
    }
  }

  private async callWebhook(
    webhookType: keyof typeof N8N_WEBHOOKS, 
    payload: WebhookPayload
  ): Promise<WebhookResponse> {
    const webhookUrl = N8N_WEBHOOKS[webhookType];
    const startTime = Date.now();
    
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

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json().catch(() => ({}));
      
      console.log(`✅ n8n webhook ${webhookType} completed:`, responseData);

      // Log successful webhook
      await this.logWebhook(
        webhookType,
        payload.caseId || null,
        payload,
        responseData,
        'success',
        undefined,
        executionTime
      );
      
      return {
        success: true,
        response: responseData,
        executionId: responseData.executionId || `exec-${Date.now()}`
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ n8n webhook ${webhookType} failed:`, error);

      // Log failed webhook
      await this.logWebhook(
        webhookType,
        payload.caseId || null,
        payload,
        null,
        'error',
        errorMessage,
        executionTime
      );
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Enhanced Case Created Workflow with comprehensive data
  async triggerCaseCreated(data: {
    caseId: string;
    caseNumber?: string;
    incidentDetails?: any;
    evidenceForAnalysis?: any[];
    witnessInformation?: any;
    reportingContext?: any;
    complianceDeadlines?: any[];
    analysisRequirements?: any;
    // Legacy support for existing calls
    evidenceScore?: number;
    needsHumanReview?: boolean;
    formData?: any;
    uploadedFiles?: number;
  }): Promise<WebhookResponse> {
    
    // Handle both new enhanced format and legacy format
    if (data.incidentDetails && data.caseNumber) {
      // New enhanced format
      const enrichedPayload = {
        event: 'case_created',
        caseId: data.caseId,
        caseNumber: data.caseNumber,
      
      // Detailed incident information for AI analysis
      incident: {
        type: data.incidentDetails.type,
        description: data.incidentDetails.description,
        location: data.incidentDetails.location,
        dateTime: {
          date: data.incidentDetails.date,
          time: data.incidentDetails.time,
          timestamp: new Date().toISOString()
        },
        parties: {
          respondent: data.incidentDetails.respondentName,
          isAnonymousComplainant: data.reportingContext.isAnonymous
        },
        additionalContext: data.incidentDetails.additionalContext
      },

      // Evidence requiring AI analysis
      evidenceAnalysis: {
        items: data.evidenceForAnalysis,
        totalCount: data.evidenceForAnalysis.length,
        requiresProcessing: data.analysisRequirements.needsEvidenceAnalysis,
        analysisTypes: data.evidenceForAnalysis.map(e => e.metadata?.analysisType).filter(Boolean)
      },

      // Witness information for evaluation
      witnesses: {
        description: data.witnessInformation.description,
        estimatedCount: data.witnessInformation.estimatedCount,
        hasWitnesses: data.witnessInformation.hasWitnesses,
        requiresContactAttempt: data.witnessInformation.hasWitnesses && !data.reportingContext.isAnonymous
      },

      // AI processing requirements
      aiTasks: {
        generateCaseSummary: true,
        analyzeEvidenceStrength: true,
        assessWitnessReliability: data.witnessInformation.hasWitnesses,
        calculateEvidenceScore: true,
        determineUrgencyLevel: true,
        flagForHumanReview: false // Will be determined by AI analysis
      },

      // Compliance and deadline management
      compliance: {
        deadlines: data.complianceDeadlines,
        requiresCalendarEvents: true,
        poshActCompliance: true,
        urgentDeadlines: data.complianceDeadlines.filter(d => d.urgency === 'high' || d.urgency === 'critical')
      },

      // Callback instructions for n8n
      callbacks: {
        updateCaseWithAnalysis: `/supabase/update-case/${data.caseId}`,
        updateEvidenceScores: `/supabase/update-evidence`,
        flagForHumanReview: `/supabase/flag-review/${data.caseId}`,
        createCalendarEvents: `/calendar/create-events`
      }
    };

      return this.callWebhook('CASE_CREATED', enrichedPayload);
    } else {
      // Legacy format for backwards compatibility
      return this.callWebhook('CASE_CREATED', {
        event: 'case_created',
        caseId: data.caseId,
        status: 'new',
        priority: (data.evidenceScore || 0) < 40 ? 'high' : 'medium',
        evidenceScore: data.evidenceScore || 0,
        needsHumanReview: data.needsHumanReview || false,
        complainant: {
          id: data.formData?.isAnonymous ? 'anonymous' : 'EMP-001',
          department: 'Unknown',
          anonymous: data.formData?.isAnonymous || false
        },
        incidentType: data.formData?.incidentType || 'unknown',
        uploadedFiles: data.uploadedFiles || 0,
        formData: data.formData || {}
      });
    }
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

  // Evidence Analysis Completion Webhook
  async triggerEvidenceAnalysisComplete(data: {
    caseId: string;
    evidenceId: string;
    analysisResults: {
      contentAnalysis: any;
      strengthScore: number;
      keyFindings: string[];
      recommendedActions: string[];
    };
  }): Promise<WebhookResponse> {
    return this.callWebhook('EVIDENCE_UPLOADED', {
      event: 'evidence_analysis_complete',
      caseId: data.caseId,
      evidenceId: data.evidenceId,
      analysis: data.analysisResults,
      requiresUpdate: true,
      timestamp: new Date().toISOString()
    });
  }

  // Case Summary Generation Webhook
  async triggerCaseSummaryGenerated(data: {
    caseId: string;
    summary: {
      executiveSummary: string;
      keyPoints: string[];
      evidenceStrength: 'low' | 'medium' | 'high';
      recommendedPath: 'formal' | 'mediation' | 'coaching' | 'dismissed';
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  }): Promise<WebhookResponse> {
    return this.callWebhook('CASE_CREATED', {
      event: 'case_summary_generated',
      caseId: data.caseId,
      aiSummary: data.summary,
      requiresDatabaseUpdate: true,
      flagForHumanReview: data.summary.evidenceStrength === 'low',
      timestamp: new Date().toISOString()
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