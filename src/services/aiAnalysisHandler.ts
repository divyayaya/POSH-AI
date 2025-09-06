import { supabase } from '@/integrations/supabase/client';
import { webhookService } from './webhookService';

export class AIAnalysisHandler {
  // Handle AI analysis results from n8n
  static async handleAnalysisResults(data: {
    caseId: string;
    analysisType: 'evidence' | 'case_summary' | 'witness_evaluation';
    results: any;
  }) {
    try {
      switch (data.analysisType) {
        case 'evidence':
          await this.updateEvidenceAnalysis(data.caseId, data.results);
          break;
        case 'case_summary':
          await this.updateCaseSummary(data.caseId, data.results);
          break;
        case 'witness_evaluation':
          await this.updateWitnessEvaluation(data.caseId, data.results);
          break;
      }
    } catch (error) {
      console.error('Error handling AI analysis results:', error);
    }
  }

  private static async updateEvidenceAnalysis(caseId: string, analysisResults: any) {
    // Update evidence records with AI analysis
    const { data: evidence, error: evidenceError } = await supabase
      .from('evidence')
      .select('*')
      .eq('case_id', caseId);

    if (evidenceError) throw evidenceError;

    for (const evidenceItem of evidence || []) {
      const itemAnalysis = analysisResults.evidenceItems?.find(
        (item: any) => item.evidenceId === evidenceItem.id
      );

      if (itemAnalysis) {
        await supabase
          .from('evidence')
          .update({
            score: itemAnalysis.strengthScore,
            ai_analysis: {
              contentAnalysis: itemAnalysis.contentAnalysis,
              keyFindings: itemAnalysis.keyFindings,
              confidenceLevel: itemAnalysis.confidenceLevel,
              analysisDate: new Date().toISOString()
            }
          })
          .eq('id', evidenceItem.id);
      }
    }

    // Update case evidence score
    const totalEvidenceScore = analysisResults.overallEvidenceScore || 0;
    await this.updateCaseEvidenceScore(caseId, totalEvidenceScore);
  }

  private static async updateCaseSummary(caseId: string, summaryResults: any) {
    // Update case with AI-generated summary and recommendations
    await supabase
      .from('cases')
      .update({
        ai_analysis: {
          summary: summaryResults.executiveSummary,
          keyPoints: summaryResults.keyPoints,
          evidenceStrength: summaryResults.evidenceStrength,
          recommendedPath: summaryResults.recommendedPath,
          urgencyLevel: summaryResults.urgencyLevel,
          riskAssessment: summaryResults.riskAssessment,
          analysisDate: new Date().toISOString(),
          aiConfidence: summaryResults.confidenceScore
        },
        priority: this.mapUrgencyToPriority(summaryResults.urgencyLevel) as 'low' | 'medium' | 'high' | 'critical'
      })
      .eq('id', caseId);

    // Flag for human review if evidence is weak
    if (summaryResults.evidenceStrength === 'low' || summaryResults.urgencyLevel === 'critical') {
      await this.flagForHumanReview(caseId, summaryResults);
    }
  }

  private static async updateWitnessEvaluation(caseId: string, witnessResults: any) {
    // Update case metadata with witness analysis
    const { data: currentCase } = await supabase
      .from('cases')
      .select('metadata')
      .eq('id', caseId)
      .single();

    if (currentCase) {
      const currentMetadata = (currentCase.metadata as Record<string, any>) || {};
      await supabase
        .from('cases')
        .update({
          metadata: {
            ...currentMetadata,
            witnessAnalysis: {
              reliability: witnessResults.reliability,
              availability: witnessResults.availability,
              contactRecommendations: witnessResults.contactRecommendations,
              analysisDate: new Date().toISOString()
            }
          }
        })
        .eq('id', caseId);
    }
  }

  private static async updateCaseEvidenceScore(caseId: string, score: number) {
    await supabase
      .from('cases')
      .update({ evidence_score: score })
      .eq('id', caseId);
  }

  private static async flagForHumanReview(caseId: string, analysisResults: any) {
    // Update case metadata to flag for review
    const { data: currentCase } = await supabase
      .from('cases')
      .select('metadata')
      .eq('id', caseId)
      .single();

    if (currentCase) {
      const currentMetadata = (currentCase.metadata as Record<string, any>) || {};
      await supabase
        .from('cases')
        .update({
          metadata: {
            ...currentMetadata,
            flaggedForReview: true,
            flagReason: analysisResults.evidenceStrength === 'low' ? 'low_evidence' : 'high_urgency',
            flagDate: new Date().toISOString(),
            aiRecommendation: analysisResults.recommendedPath
          }
        })
        .eq('id', caseId);
    }

    // Trigger webhook to notify ICC members
    await webhookService.triggerHumanReviewSubmitted({
      caseId: caseId,
      reviewerId: 'AI_SYSTEM',
      pathway: 'requires_human_review',
      credibility: 0 // Will be assessed by human
    });
  }

  private static mapUrgencyToPriority(urgency: string): string {
    const mapping: Record<string, string> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'critical': 'critical'
    };
    return mapping[urgency] || 'medium';
  }
}