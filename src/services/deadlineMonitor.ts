import { supabase } from '@/integrations/supabase/client';
import { webhookService } from './webhookService';

class DeadlineMonitorService {
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Check for approaching deadlines
  async checkDeadlines() {
    try {
      console.log('🕒 Checking compliance deadlines...');
      
      const { data: deadlines, error } = await supabase
        .from('compliance_deadlines')
        .select(`
          *,
          cases (
            id,
            case_number,
            title,
            status
          )
        `)
        .eq('status', 'pending')
        .lte('deadline_date', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()); // Next 14 days

      if (error) {
        console.error('Error fetching deadlines:', error);
        return;
      }

      console.log(`📋 Found ${deadlines?.length || 0} approaching deadlines`);

      for (const deadline of deadlines || []) {
        const daysRemaining = Math.ceil(
          (new Date(deadline.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining <= 7 && daysRemaining > 0) {
          console.log(`⚠️ Deadline approaching for case ${deadline.case_id}: ${daysRemaining} days remaining`);
          
          // Determine urgency level
          let urgency = 'medium';
          if (daysRemaining <= 1) urgency = 'critical';
          else if (daysRemaining <= 3) urgency = 'high';
          else if (daysRemaining <= 7) urgency = 'medium';

          // Trigger n8n workflow for approaching deadline
          const webhookResponse = await webhookService.triggerDeadlineApproaching({
            caseId: deadline.case_id,
            deadlineType: deadline.deadline_type,
            dueDate: deadline.deadline_date,
            daysRemaining,
            urgency
          });

          if (webhookResponse.success) {
            // Update deadline status and urgency to prevent duplicate alerts
            await supabase
              .from('compliance_deadlines')
              .update({ 
                status: 'alert_sent',
                urgency_level: urgency,
                alert_sent_date: new Date().toISOString()
              })
              .eq('id', deadline.id);

            console.log(`✅ Deadline alert sent for case ${deadline.case_id}`);
          } else {
            console.error(`❌ Failed to send deadline alert for case ${deadline.case_id}:`, webhookResponse.error);
          }
        } else if (daysRemaining <= 0) {
          // Overdue deadline
          console.log(`🚨 OVERDUE: Deadline passed for case ${deadline.case_id} by ${Math.abs(daysRemaining)} days`);
          
          await webhookService.triggerDeadlineApproaching({
            caseId: deadline.case_id,
            deadlineType: deadline.deadline_type,
            dueDate: deadline.deadline_date,
            daysRemaining,
            urgency: 'critical'
          });

          // Mark as overdue
          await supabase
            .from('compliance_deadlines')
            .update({ 
              status: 'overdue',
              urgency_level: 'critical',
              alert_sent_date: new Date().toISOString()
            })
            .eq('id', deadline.id);
        }
      }
    } catch (error) {
      console.error('Deadline monitoring error:', error);
    }
  }

  // Create deadline for a case
  async createDeadline(caseId: string, deadlineType: string, daysFromNow: number, description: string) {
    try {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + daysFromNow);

      const { data, error } = await supabase
        .from('compliance_deadlines')
        .insert({
          case_id: caseId,
          deadline_type: deadlineType,
          deadline_date: deadlineDate.toISOString(),
          description,
          status: 'pending',
          urgency_level: daysFromNow <= 7 ? 'high' : 'medium'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`📅 Created deadline for case ${caseId}: ${deadlineType} due in ${daysFromNow} days`);
      return data;
    } catch (error) {
      console.error('Error creating deadline:', error);
      throw error;
    }
  }

  // Start periodic monitoring (call this in App.tsx or main component)
  startMonitoring() {
    console.log('🚀 Starting deadline monitoring service...');
    
    // Check deadlines every hour
    this.monitoringInterval = setInterval(() => {
      this.checkDeadlines();
    }, 60 * 60 * 1000);

    // Initial check after 5 seconds to avoid startup conflicts
    setTimeout(() => {
      this.checkDeadlines();
    }, 5000);

    return this;
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Deadline monitoring stopped');
    }
  }

  // Get upcoming deadlines for a specific case
  async getCaseDeadlines(caseId: string) {
    try {
      const { data, error } = await supabase
        .from('compliance_deadlines')
        .select('*')
        .eq('case_id', caseId)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching case deadlines:', error);
      return [];
    }
  }

  // Get all overdue deadlines
  async getOverdueDeadlines() {
    try {
      const { data, error } = await supabase
        .from('compliance_deadlines')
        .select(`
          *,
          cases (
            id,
            case_number,
            title,
            status
          )
        `)
        .lt('deadline_date', new Date().toISOString())
        .in('status', ['pending', 'alert_sent'])
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching overdue deadlines:', error);
      return [];
    }
  }
}

// Export singleton instance
export const deadlineMonitor = new DeadlineMonitorService();