// Compliance monitoring service

import { supabase } from '@/integrations/supabase/client';
import { n8nTrigger } from './n8nIntegration';
import { ComplianceDeadline } from './types';

export class ComplianceMonitor {
  
  // Check all cases for approaching deadlines (called daily by n8n)
  async checkApproachingDeadlines(): Promise<ComplianceDeadline[]> {
    try {
      const allDeadlines = await this.getAllPendingDeadlines();
      
      const approachingDeadlines = allDeadlines.filter(deadline => {
        const daysRemaining = Math.ceil(
          (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysRemaining <= 7 && !deadline.alertSent;
      });

      console.log(`Found ${approachingDeadlines.length} approaching deadlines`);

      // Trigger n8n workflows for each approaching deadline
      for (const deadline of approachingDeadlines) {
        try {
          await n8nTrigger.triggerDeadlineApproaching(deadline);
          await this.markDeadlineAlertSent(deadline.id);
          console.log(`Triggered deadline alert for case ${deadline.caseId}`);
        } catch (error) {
          console.error(`Failed to trigger deadline alert for ${deadline.id}:`, error);
        }
      }

      return approachingDeadlines;
    } catch (error) {
      console.error('Error checking approaching deadlines:', error);
      return [];
    }
  }

  private async getAllPendingDeadlines(): Promise<ComplianceDeadline[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_deadlines')
        .select(`
          *,
          cases (
            id,
            case_number,
            status,
            priority
          )
        `)
        .eq('status', 'pending')
        .order('deadline_date', { ascending: true });

      if (error) {
        console.error('Error fetching pending deadlines:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        caseId: item.case_id,
        deadlineType: item.deadline_type as any,
        dueDate: item.deadline_date,
        status: item.status as any,
        alertSent: false, // This would come from your database
        daysRemaining: Math.ceil(
          (new Date(item.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      }));
    } catch (error) {
      console.error('Error in getAllPendingDeadlines:', error);
      return [];
    }
  }

  private async markDeadlineAlertSent(deadlineId: string): Promise<void> {
    try {
      await supabase
        .from('compliance_deadlines')
        .update({ 
          status: 'alert_sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', deadlineId);
      
      console.log(`Marked deadline alert sent for ${deadlineId}`);
    } catch (error) {
      console.error(`Error marking deadline alert sent for ${deadlineId}:`, error);
    }
  }

  // Generate compliance report
  async generateComplianceReport(startDate: string, endDate: string): Promise<any> {
    try {
      const { data: cases } = await supabase
        .from('cases')
        .select(`
          *,
          compliance_deadlines (*)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const report = {
        totalCases: cases?.length || 0,
        completedOnTime: 0,
        overdueCases: 0,
        pendingCases: 0,
        averageResolutionTime: 0,
        complianceRate: 0,
        generatedAt: new Date().toISOString()
      };

      // Calculate compliance metrics
      if (cases) {
        report.completedOnTime = cases.filter(c => c.status === 'closed').length;
        report.overdueCases = cases.filter(c => {
          if (c.compliance_deadlines?.length > 0) {
            const deadline = c.compliance_deadlines[0];
            return new Date(deadline.deadline_date) < new Date() && c.status !== 'closed';
          }
          return false;
        }).length;
        report.pendingCases = cases.filter(c => 
          !['closed', 'resolved'].includes(c.status)
        ).length;
        report.complianceRate = report.totalCases > 0 ? 
          (report.completedOnTime / report.totalCases) * 100 : 0;
      }

      return report;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // Schedule automatic deadline monitoring
  async scheduleDeadlineMonitoring(): Promise<void> {
    // This would typically be called by a cron job or scheduled task
    console.log('Starting scheduled deadline monitoring...');
    
    try {
      const approachingDeadlines = await this.checkApproachingDeadlines();
      
      if (approachingDeadlines.length > 0) {
        console.log(`⚠️ Found ${approachingDeadlines.length} cases with approaching deadlines`);
        
        // Log critical cases (3 days or less)
        const criticalCases = approachingDeadlines.filter(d => d.daysRemaining <= 3);
        if (criticalCases.length > 0) {
          console.log(`🚨 CRITICAL: ${criticalCases.length} cases have deadlines within 3 days!`);
        }
      } else {
        console.log('✅ No approaching deadlines found');
      }
    } catch (error) {
      console.error('Error in scheduled deadline monitoring:', error);
    }
  }
}

// Initialize compliance monitor
export const complianceMonitor = new ComplianceMonitor();