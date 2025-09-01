// Test utilities for n8n integration

import { n8nTrigger } from './n8nIntegration';
import { complianceMonitor } from './complianceMonitoring';

export class N8nTestUtils {
  
  static async testAllWebhooks(): Promise<void> {
    console.log('🧪 Testing all n8n webhook integrations...');
    
    // Test case creation
    const testCase = {
      id: 'test-case-' + Date.now(),
      status: 'new' as const,
      priority: 'high' as const,
      evidenceScore: 25,
      needsHumanReview: true,
      submissionDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      complainant: 'Test Complainant',
      respondent: 'Test Respondent',
      incidentType: 'verbal-harassment',
      description: 'Test case for n8n integration',
      department: 'Engineering'
    };

    try {
      await n8nTrigger.triggerCaseCreated(testCase);
      console.log('✅ Case creation webhook test passed');
    } catch (error) {
      console.error('❌ Case creation webhook test failed:', error);
    }

    // Test evidence upload
    const testEvidence = {
      id: 'ev-test-' + Date.now(),
      caseId: testCase.id,
      type: 'document' as const,
      description: 'Test evidence upload',
      aiAnalysisScore: 35,
      credibilityRating: 7,
      metadata: { fileType: 'pdf', size: '1.2MB' }
    };

    try {
      await n8nTrigger.triggerEvidenceUploaded(testEvidence);
      console.log('✅ Evidence upload webhook test passed');
    } catch (error) {
      console.error('❌ Evidence upload webhook test failed:', error);
    }

    // Test human review
    const testReview = {
      id: 'review-test-' + Date.now(),
      caseId: testCase.id,
      reviewerId: 'ICC-001',
      reviewerRole: 'icc_primary' as const,
      credibilityAssessment: 4,
      mediationRecommended: false,
      investigationPathway: 'formal' as const,
      rationale: 'Based on evidence analysis, formal investigation is recommended due to severity of allegations and credibility of complainant.',
      reviewDate: new Date().toISOString()
    };

    try {
      await n8nTrigger.triggerHumanReviewSubmitted(testReview);
      console.log('✅ Human review webhook test passed');
    } catch (error) {
      console.error('❌ Human review webhook test failed:', error);
    }

    // Test case status change
    try {
      await n8nTrigger.triggerCaseStatusChanged(testCase.id, 'new', 'investigating', 'INV-001');
      console.log('✅ Case status change webhook test passed');
    } catch (error) {
      console.error('❌ Case status change webhook test failed:', error);
    }

    // Test deadline approaching
    const testDeadline = {
      id: 'deadline-test-' + Date.now(),
      caseId: testCase.id,
      deadlineType: 'investigation' as const,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      status: 'pending' as const,
      alertSent: false,
      daysRemaining: 5
    };

    try {
      await n8nTrigger.triggerDeadlineApproaching(testDeadline);
      console.log('✅ Deadline approaching webhook test passed');
    } catch (error) {
      console.error('❌ Deadline approaching webhook test failed:', error);
    }

    console.log('🎉 n8n integration testing complete');
  }

  static async testComplianceMonitoring(): Promise<void> {
    console.log('🧪 Testing compliance monitoring...');
    
    try {
      const approachingDeadlines = await complianceMonitor.checkApproachingDeadlines();
      console.log(`✅ Compliance monitoring test passed. Found ${approachingDeadlines.length} approaching deadlines`);
    } catch (error) {
      console.error('❌ Compliance monitoring test failed:', error);
    }
  }

  static async testN8nConnection(): Promise<boolean> {
    console.log('🧪 Testing n8n connection...');
    
    try {
      const isHealthy = await n8nTrigger.healthCheck();
      if (isHealthy) {
        console.log('✅ n8n connection test passed');
        return true;
      } else {
        console.log('❌ n8n connection test failed - service not healthy');
        return false;
      }
    } catch (error) {
      console.error('❌ n8n connection test failed:', error);
      return false;
    }
  }

  static async runFullTestSuite(): Promise<void> {
    console.log('🚀 Running full n8n integration test suite...');
    console.log('==========================================');
    
    // Test connection first
    const connectionOk = await this.testN8nConnection();
    
    if (connectionOk) {
      // Run webhook tests
      await this.testAllWebhooks();
      
      // Test compliance monitoring
      await this.testComplianceMonitoring();
      
      console.log('==========================================');
      console.log('🎉 Full test suite completed');
    } else {
      console.log('❌ Skipping webhook tests due to connection failure');
      console.log('💡 Check your n8n configuration and ensure the service is running');
    }
  }

  // Utility to generate test data
  static generateTestCase(overrides: any = {}): any {
    return {
      id: 'test-case-' + Date.now(),
      status: 'new',
      priority: 'medium',
      evidenceScore: Math.floor(Math.random() * 100),
      needsHumanReview: Math.random() > 0.5,
      submissionDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      complainant: 'Test Complainant',
      respondent: 'Test Respondent',
      incidentType: 'test-incident',
      description: 'Generated test case',
      department: 'Test Department',
      ...overrides
    };
  }

  static generateTestEvidence(caseId: string, overrides: any = {}): any {
    return {
      id: 'ev-test-' + Date.now(),
      caseId,
      type: 'document',
      description: 'Generated test evidence',
      aiAnalysisScore: Math.floor(Math.random() * 100),
      credibilityRating: Math.floor(Math.random() * 10) + 1,
      metadata: { 
        source: 'test-generator',
        timestamp: new Date().toISOString()
      },
      ...overrides
    };
  }
}

// Export for easy testing in console
(window as any).N8nTestUtils = N8nTestUtils;