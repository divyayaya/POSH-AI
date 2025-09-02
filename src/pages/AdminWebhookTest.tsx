import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Send, CheckCircle, AlertTriangle, Clock, Zap, Database, Webhook } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { N8N_WEBHOOKS } from "@/lib/mockData";
import { webhookService } from '@/services/webhookService';

const AdminWebhookTest = () => {
  const [selectedWebhook, setSelectedWebhook] = useState("");
  const [customPayload, setCustomPayload] = useState("");
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    webhook: string;
    status: 'success' | 'error' | 'pending';
    response?: string;
    timestamp: string;
  }>>([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    n8nConnection: 'healthy',
    webhookQueue: 'healthy',
    lastSync: '2 minutes ago'
  });

  const webhookOptions = [
    { value: "CASE_CREATED", label: "Case Created", description: "Triggers when a new complaint is filed" },
    { value: "EVIDENCE_UPLOADED", label: "Evidence Uploaded", description: "Triggers when evidence is added to a case" },
    { value: "HUMAN_REVIEW_SUBMITTED", label: "Human Review Submitted", description: "Triggers when ICC completes review" },
    { value: "CASE_STATUS_CHANGED", label: "Case Status Changed", description: "Triggers when case status updates" },
    { value: "DEADLINE_APPROACHING", label: "Deadline Approaching", description: "Triggers for compliance deadlines" }
  ];

  const defaultPayloads = {
    CASE_CREATED: JSON.stringify({
      caseId: "POSH-2024-TEST",
      status: "new",
      priority: "high",
      evidenceScore: 35,
      needsHumanReview: true,
      complainant: { id: "EMP-001", department: "Marketing" },
      respondent: { id: "EMP-002", department: "Sales" },
      timestamp: new Date().toISOString()
    }, null, 2),
    EVIDENCE_UPLOADED: JSON.stringify({
      caseId: "POSH-2024-TEST",
      evidenceId: "ev-test-001",
      type: "document",
      aiAnalysisScore: 40,
      needsProcessing: true,
      timestamp: new Date().toISOString()
    }, null, 2),
    HUMAN_REVIEW_SUBMITTED: JSON.stringify({
      caseId: "POSH-2024-TEST",
      reviewerId: "ICC-001",
      pathway: "formal",
      credibilityScore: 4,
      timestamp: new Date().toISOString()
    }, null, 2),
    CASE_STATUS_CHANGED: JSON.stringify({
      caseId: "POSH-2024-TEST",
      oldStatus: "new",
      newStatus: "investigating",
      assignedTo: "ICC-001",
      timestamp: new Date().toISOString()
    }, null, 2),
    DEADLINE_APPROACHING: JSON.stringify({
      caseId: "POSH-2024-TEST",
      deadlineType: "investigation",
      dueDate: "2024-06-13",
      daysRemaining: 7,
      urgency: "high",
      timestamp: new Date().toISOString()
    }, null, 2)
  };

  const handleWebhookChange = (value: string) => {
    setSelectedWebhook(value);
    if (value && defaultPayloads[value as keyof typeof defaultPayloads]) {
      setCustomPayload(defaultPayloads[value as keyof typeof defaultPayloads]);
    }
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook) {
      toast.error("Please select a webhook to test");
      return;
    }

    const testId = `test-${Date.now()}`;
    const newTest = {
      id: testId,
      webhook: selectedWebhook,
      status: 'pending' as const,
      timestamp: new Date().toLocaleString()
    };

    setTestResults(prev => [newTest, ...prev.slice(0, 9)]);

    try {
      let payload: any = {};
      if (customPayload.trim()) {
        try {
          payload = JSON.parse(customPayload);
        } catch (parseError) {
          throw new Error(`Invalid JSON payload: ${parseError.message}`);
        }
      }

      let webhookResponse;
      
      // Call appropriate webhook service method based on selection
      switch (selectedWebhook) {
        case 'CASE_CREATED':
          webhookResponse = await webhookService.triggerCaseCreated({
            caseId: payload.caseId || "POSH-2024-TEST",
            evidenceScore: payload.evidenceScore || 35,
            needsHumanReview: payload.needsHumanReview || true,
            formData: payload.formData || {},
            uploadedFiles: payload.uploadedFiles || 0
          });
          break;
          
        case 'HUMAN_REVIEW_SUBMITTED':
          webhookResponse = await webhookService.triggerHumanReviewSubmitted({
            caseId: payload.caseId || "POSH-2024-TEST",
            reviewerId: payload.reviewerId || "ICC-001",
            pathway: payload.pathway || "formal",
            credibility: payload.credibilityScore || 4
          });
          break;
          
        case 'EVIDENCE_UPLOADED':
          webhookResponse = await webhookService.triggerEvidenceUploaded({
            caseId: payload.caseId || "POSH-2024-TEST",
            evidenceId: payload.evidenceId || "ev-test-001",
            type: payload.type || "document",
            aiAnalysisScore: payload.aiAnalysisScore || 40
          });
          break;
          
        case 'DEADLINE_APPROACHING':
          webhookResponse = await webhookService.triggerDeadlineApproaching({
            caseId: payload.caseId || "POSH-2024-TEST",
            deadlineType: payload.deadlineType || "investigation",
            dueDate: payload.dueDate || "2024-06-13",
            daysRemaining: payload.daysRemaining || 7,
            urgency: payload.urgency || "high"
          });
          break;
          
        default:
          throw new Error(`Unsupported webhook type: ${selectedWebhook}`);
      }

      // Update results with actual n8n response
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: webhookResponse.success ? 'success' : 'error',
              response: JSON.stringify(webhookResponse, null, 2)
            }
          : test
      ));

      if (webhookResponse.success) {
        toast.success(`n8n webhook ${selectedWebhook} triggered successfully`);
      } else {
        toast.error(`n8n webhook failed: ${webhookResponse.error}`);
      }

    } catch (error) {
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'error',
              response: JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }, null, 2)
            }
          : test
      ));
      
      toast.error(`Webhook test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRetryWebhook = async (testId: string) => {
    setTestResults(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'pending' } : test
    ));

    // Simulate retry
    setTimeout(() => {
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'success', response: '{"status": "success", "retry": true}' }
          : test
      ));
      toast.success("Webhook retry successful");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        userRole="hr"
        customTitle="n8n Webhook Testing Interface"
        customActions={
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center">
              <Zap className="mr-1 h-3 w-3" />
              Admin Access
            </Badge>
            <Button variant="ghost" asChild>
              <Link to="/hr-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Webhook Test Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="mr-2 h-5 w-5" />
                Webhook Test Interface
              </CardTitle>
              <CardDescription>
                Test n8n webhook endpoints with custom or predefined payloads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-select">Select Webhook Event</Label>
                  <Select onValueChange={handleWebhookChange}>
                    <SelectTrigger id="webhook-select">
                      <SelectValue placeholder="Choose a webhook to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {webhookOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWebhook && (
                    <div className="text-xs text-muted-foreground">
                      {webhookOptions.find(w => w.value === selectedWebhook)?.description}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    value={selectedWebhook ? N8N_WEBHOOKS[selectedWebhook as keyof typeof N8N_WEBHOOKS] : ""}
                    readOnly
                    className="text-xs bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payload">Payload Data (JSON)</Label>
                <Textarea
                  id="payload"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder="Enter custom JSON payload or select a webhook to auto-populate"
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleTestWebhook} disabled={!selectedWebhook}>
                  <Send className="mr-2 h-4 w-4" />
                  Test Webhook
                </Button>
                <Button variant="outline" onClick={() => setCustomPayload("")}>
                  Clear Payload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Connection</span>
                  <Badge variant="outline" className="text-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {systemHealth.database}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">n8n Connection</span>
                  <Badge variant="outline" className="text-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {systemHealth.n8nConnection}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webhook Queue</span>
                  <Badge variant="outline" className="text-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {systemHealth.webhookQueue}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Sync</span>
                  <span className="text-xs text-muted-foreground">{systemHealth.lastSync}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Quick Stats</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-success/5 rounded border border-success/20">
                    <div className="font-bold text-success">24</div>
                    <div className="text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center p-2 bg-warning/5 rounded border border-warning/20">
                    <div className="font-bold text-warning">1</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-2 bg-destructive/5 rounded border border-destructive/20">
                    <div className="font-bold text-destructive">2</div>
                    <div className="text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center p-2 bg-secondary/5 rounded border border-secondary/20">
                    <div className="font-bold text-secondary">98%</div>
                    <div className="text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Refresh Status
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Results History</CardTitle>
            <CardDescription>
              Recent webhook test executions and their responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No webhook tests run yet. Select a webhook above and click "Test Webhook" to begin.
              </div>
            ) : (
              <div className="space-y-4">
                {testResults.map((result) => (
                  <Card key={result.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-sm">{result.webhook}</div>
                          <Badge 
                            variant="outline" 
                            className={
                              result.status === 'success' ? 'text-success' :
                              result.status === 'error' ? 'text-destructive' :
                              'text-warning'
                            }
                          >
                            {result.status === 'success' ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : result.status === 'error' ? (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            ) : (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {result.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                          {result.status === 'error' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleRetryWebhook(result.id)}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                      {result.response && (
                        <div className="bg-muted rounded p-3">
                          <div className="text-xs font-medium mb-1">Response:</div>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                            {result.response}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminWebhookTest;