// Enhanced case filing with n8n integration

import { supabase } from '@/integrations/supabase/client';
import { calculateEvidenceScore } from './mockData';
import { n8nTrigger } from './n8nIntegration';
import { Case, Evidence, HumanReview } from './types';

export class EnhancedCaseManager {
  
  async createCase(formData: any, evidenceList: any[], uploadedFiles: File[]): Promise<string> {
    // Calculate evidence score using existing logic
    const evidenceScore = calculateEvidenceScore(evidenceList);
    const needsHumanReview = evidenceScore < 40;
    
    // Generate case ID
    const caseId = `POSH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Create case object for database
    const caseData = {
      case_number: caseId,
      title: formData.incidentType || 'POSH Complaint',
      description: formData.description || '',
      complainant_name: formData.complainant?.name || 'Anonymous',
      respondent_name: formData.respondent?.name || 'Not specified',
      status: 'pending' as const,
      priority: needsHumanReview ? 'high' as const : 'medium' as const,
      evidence_score: evidenceScore,
      ai_analysis: {
        needsHumanReview,
        riskLevel: evidenceScore > 60 ? 'high' : evidenceScore > 30 ? 'medium' : 'low',
        recommendedAction: needsHumanReview ? 'immediate_review' : 'standard_process'
      },
      metadata: {
        submissionDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        complainant: formData.complainant,
        respondent: formData.respondent,
        department: formData.complainant?.department,
        incidentType: formData.incidentType
      }
    };

    try {
      // Save case to database
      const { data, error } = await supabase
        .from('cases')
        .insert(caseData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to save case to database');
      }

      console.log('Case saved to database:', data);

      // Create compliance deadline
      await supabase
        .from('compliance_deadlines')
        .insert({
          case_id: data.id,
          deadline_type: 'investigation',
          deadline_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Complete investigation within 90 days as per POSH Act',
          status: 'pending'
        });

      // Trigger n8n workflow for case creation
      const workflowData = {
        id: data.id,
        status: 'new' as const, // Map database status to interface status
        priority: data.priority,
        evidenceScore,
        needsHumanReview,
        submissionDate: caseData.metadata.submissionDate,
        deadline: caseData.metadata.deadline,
        complainant: formData.complainant?.name || 'Anonymous',
        respondent: formData.respondent?.name || 'Not specified',
        department: formData.complainant?.department || '',
        incidentType: formData.incidentType,
        description: formData.description
      };

      await n8nTrigger.triggerCaseCreated(workflowData);
      
      // If low evidence, immediately trigger human review alert
      if (needsHumanReview) {
        console.log(`🚨 Low evidence case ${caseId} requires immediate human review`);
      }
      
      return data.id;
    } catch (error) {
      console.error('Failed to create case and trigger workflow:', error);
      throw new Error('Case creation failed. Please try again.');
    }
  }

  async uploadEvidence(caseId: string, evidence: Evidence): Promise<void> {
    try {
      // Save evidence to database
      const { data, error } = await supabase
        .from('evidence')
        .insert({
          case_id: caseId,
          type: evidence.type as any,
          description: evidence.description,
          file_url: evidence.filePath,
          score: evidence.aiAnalysisScore,
          ai_analysis: {
            credibilityRating: evidence.credibilityRating,
            processingComplete: true
          },
          metadata: evidence.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      
      // Trigger n8n workflow for evidence processing
      await n8nTrigger.triggerEvidenceUploaded(evidence);
      
      // Recalculate case evidence score
      await this.recalculateCaseScore(caseId);
      
    } catch (error) {
      console.error('Failed to upload evidence and trigger workflow:', error);
      throw error;
    }
  }

  async submitHumanReview(review: HumanReview): Promise<void> {
    try {
      // Update case status based on pathway
      const newStatus = review.investigationPathway === 'formal' ? 'investigating' : 
                       review.investigationPathway === 'mediation' ? 'mediation' : 'under_review';
                       
      await this.updateCaseStatus(review.caseId, newStatus);
      
      // Trigger n8n workflow for human review submission
      await n8nTrigger.triggerHumanReviewSubmitted(review);
      
    } catch (error) {
      console.error('Failed to submit human review and trigger workflow:', error);
      throw error;
    }
  }

  async updateCaseStatus(caseId: string, newStatus: string, assignedTo?: string): Promise<void> {
    try {
      // Get current case
      const { data: currentCase } = await supabase
        .from('cases')
        .select('status')
        .eq('id', caseId)
        .single();

      const oldStatus = currentCase?.status || 'unknown';
      
      // Update case in database
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: newStatus as any
        })
        .eq('id', caseId);

      if (error) throw error;
      
      // Trigger n8n workflow for status change
      await n8nTrigger.triggerCaseStatusChanged(caseId, oldStatus, newStatus, assignedTo);
      
    } catch (error) {
      console.error('Failed to update case status and trigger workflow:', error);
      throw error;
    }
  }

  async getCaseById(caseId: string): Promise<any> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      return null;
    }

    return data;
  }
  
  private async recalculateCaseScore(caseId: string): Promise<void> {
    try {
      // Get all evidence for the case
      const { data: evidenceList } = await supabase
        .from('evidence')
        .select('type, score')
        .eq('case_id', caseId);

      if (evidenceList) {
        const totalScore = evidenceList.reduce((sum, ev) => sum + (ev.score || 0), 0);
        
        // Update case with new evidence score
        await supabase
          .from('cases')
          .update({ 
            evidence_score: totalScore
          })
          .eq('id', caseId);
      }
    } catch (error) {
      console.error('Failed to recalculate case score:', error);
    }
  }
}

// Initialize enhanced case manager
export const caseManager = new EnhancedCaseManager();