import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();
    const payload = await req.json();

    console.log('Received n8n callback:', endpoint, payload);

    switch (endpoint) {
      case 'case-analysis-complete':
        await handleCaseAnalysisComplete(supabase, payload);
        break;
        
      case 'evidence-analysis-complete':
        await handleEvidenceAnalysisComplete(supabase, payload);
        break;
        
      case 'investigation-task-created':
        await handleInvestigationTaskCreated(supabase, payload);
        break;
        
      case 'deadline-alert-sent':
        await handleDeadlineAlertSent(supabase, payload);
        break;
        
      case 'notification-sent':
        await handleNotificationSent(supabase, payload);
        break;
        
      default:
        console.warn(`Unknown n8n callback endpoint: ${endpoint}`);
        return new Response(
          JSON.stringify({ error: 'Unknown endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, processed: endpoint }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in n8n-callbacks function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCaseAnalysisComplete(supabase: any, payload: any): Promise<void> {
  console.log('Updating case with AI analysis:', payload.caseId, payload.analysis);
  
  try {
    const { error } = await supabase
      .from('cases')
      .update({
        ai_analysis: {
          ...(payload.analysis || {}),
          processedAt: new Date().toISOString(),
          source: 'n8n-openai'
        }
      })
      .eq('id', payload.caseId);

    if (error) {
      console.error('Error updating case with AI analysis:', error);
      throw error;
    }

    console.log('Case AI analysis updated successfully');
  } catch (error) {
    console.error('Failed to update case with AI analysis:', error);
    throw error;
  }
}

async function handleEvidenceAnalysisComplete(supabase: any, payload: any): Promise<void> {
  console.log('Updating evidence with AI analysis:', payload.evidenceId, payload.analysis);
  
  try {
    const { error } = await supabase
      .from('evidence')
      .update({
        ai_analysis: {
          ...(payload.analysis || {}),
          processedAt: new Date().toISOString(),
          source: 'n8n-openai'
        },
        score: payload.analysis?.credibilityScore || payload.score
      })
      .eq('id', payload.evidenceId);

    if (error) {
      console.error('Error updating evidence with AI analysis:', error);
      throw error;
    }

    console.log('Evidence AI analysis updated successfully');
  } catch (error) {
    console.error('Failed to update evidence with AI analysis:', error);
    throw error;
  }
}

async function handleInvestigationTaskCreated(supabase: any, payload: any): Promise<void> {
  console.log('Processing investigation task creation:', payload.caseId, payload.assigneeId);
  
  try {
    // Update case with investigation assignment
    const { error } = await supabase
      .from('cases')
      .update({
        status: 'investigating',
        metadata: supabase.sql`metadata || ${JSON.stringify({
          investigator: payload.assigneeId,
          investigationStarted: new Date().toISOString(),
          taskId: payload.taskId
        })}`
      })
      .eq('id', payload.caseId);

    if (error) {
      console.error('Error updating case with investigation assignment:', error);
      throw error;
    }

    console.log('Investigation task processed successfully');
  } catch (error) {
    console.error('Failed to process investigation task:', error);
    throw error;
  }
}

async function handleDeadlineAlertSent(supabase: any, payload: any): Promise<void> {
  console.log('Marking deadline alert as sent:', payload.caseId, payload.deadlineType);
  
  try {
    const { error } = await supabase
      .from('compliance_deadlines')
      .update({
        status: 'alert_sent'
      })
      .eq('case_id', payload.caseId)
      .eq('deadline_type', payload.deadlineType);

    if (error) {
      console.error('Error marking deadline alert as sent:', error);
      throw error;
    }

    console.log('Deadline alert marked as sent successfully');
  } catch (error) {
    console.error('Failed to mark deadline alert as sent:', error);
    throw error;
  }
}

async function handleNotificationSent(supabase: any, payload: any): Promise<void> {
  console.log('Processing notification sent callback:', payload);
  
  try {
    // Log notification activity - you could store this in a notifications table
    console.log('Notification sent successfully:', {
      type: payload.notificationType,
      recipient: payload.recipient,
      caseId: payload.caseId
    });

    // Could update case metadata with notification history
    if (payload.caseId) {
      const { error } = await supabase
        .from('cases')
        .update({
          metadata: supabase.sql`metadata || ${JSON.stringify({
            lastNotification: {
              type: payload.notificationType,
              sentAt: new Date().toISOString(),
              recipient: payload.recipient
            }
          })}`
        })
        .eq('id', payload.caseId);

      if (error) {
        console.error('Error updating case with notification info:', error);
      }
    }

    console.log('Notification callback processed successfully');
  } catch (error) {
    console.error('Failed to process notification callback:', error);
    throw error;
  }
}