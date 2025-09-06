import { supabase } from '@/integrations/supabase/client';

export class CalendarIntegrationService {
  static async createComplianceEvents(caseId: string) {
    try {
      // Fetch case and deadlines
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          *,
          compliance_deadlines (*)
        `)
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      // Create calendar events for each deadline
      const calendarEvents = caseData.compliance_deadlines?.map((deadline: any) => ({
        title: `POSH Compliance: ${deadline.description}`,
        description: `Case ${caseData.case_number} - ${deadline.deadline_type.replace('_', ' ').toUpperCase()}`,
        startDateTime: deadline.deadline_date,
        endDateTime: deadline.deadline_date,
        attendees: this.getAttendeesForDeadlineType(deadline.deadline_type),
        reminders: this.getRemindersForUrgency(deadline.urgency_level),
        metadata: {
          caseId: caseId,
          caseNumber: caseData.case_number,
          deadlineType: deadline.deadline_type,
          urgencyLevel: deadline.urgency_level
        }
      }));

      // Here you would integrate with your calendar system (Google Calendar, Outlook, etc.)
      // For now, we'll store in a calendar_events table or trigger n8n to handle calendar creation
      
      return calendarEvents;
    } catch (error) {
      console.error('Error creating calendar events:', error);
      throw error;
    }
  }

  private static getAttendeesForDeadlineType(deadlineType: string): string[] {
    const attendeeMap: Record<string, string[]> = {
      'acknowledgment': ['hr@company.com', 'icc-primary@company.com'],
      'investigation_start': ['icc-primary@company.com', 'investigator@company.com'],
      'investigation_completion': ['icc-primary@company.com', 'hr-director@company.com', 'legal@company.com']
    };
    return attendeeMap[deadlineType] || ['hr@company.com'];
  }

  private static getRemindersForUrgency(urgencyLevel: string): number[] {
    // Return reminder times in minutes before event
    const reminderMap: Record<string, number[]> = {
      'critical': [10080, 2880, 1440, 60], // 1 week, 2 days, 1 day, 1 hour
      'high': [2880, 1440, 240], // 2 days, 1 day, 4 hours
      'medium': [1440, 480], // 1 day, 8 hours
      'low': [1440] // 1 day
    };
    return reminderMap[urgencyLevel] || [1440];
  }

  static async scheduleDeadlineReminders(caseId: string) {
    try {
      const { data: deadlines, error } = await supabase
        .from('compliance_deadlines')
        .select('*')
        .eq('case_id', caseId)
        .eq('status', 'pending');

      if (error) throw error;

      for (const deadline of deadlines || []) {
        const reminders = this.getRemindersForUrgency(deadline.urgency_level);
        
        // Schedule each reminder
        for (const reminderMinutes of reminders) {
          const reminderDate = new Date(deadline.deadline_date);
          reminderDate.setMinutes(reminderDate.getMinutes() - reminderMinutes);

          // In a real implementation, you would schedule these with a job queue
          console.log(`Scheduled reminder for ${deadline.description} at ${reminderDate.toISOString()}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling deadline reminders:', error);
    }
  }

  static async getUpcomingDeadlines(daysAhead: number = 14) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const { data: deadlines, error } = await supabase
        .from('compliance_deadlines')
        .select(`
          *,
          cases (case_number, title)
        `)
        .eq('status', 'pending')
        .lte('deadline_date', futureDate.toISOString())
        .order('deadline_date', { ascending: true });

      if (error) throw error;

      return deadlines?.map(deadline => ({
        ...deadline,
        daysUntilDeadline: Math.ceil(
          (new Date(deadline.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      }));
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      return [];
    }
  }
}