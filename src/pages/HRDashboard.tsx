import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Bell, Users, FileText, Clock, AlertTriangle, CheckCircle, BarChart3, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { mockCases, mockDeadlines } from "@/lib/mockData";

const HRDashboard = () => {
  const [notifications] = useState(3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'investigating': return 'status-investigating';
      case 'resolved': return 'status-resolved';
      default: return 'muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'muted';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <AppHeader 
        userRole="hr" 
        notifications={notifications}
        customTitle="HR Dashboard"
      />

      {/* Metrics Banner */}
      <div className="bg-gradient-to-r from-primary-navy to-gentle-teal p-8 text-white">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">+60%</div>
            <div className="text-sm opacity-90">Reporting Rate Increase</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">75%</div>
            <div className="text-sm opacity-90">Faster Processing</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-sm opacity-90">Compliance Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">4.7/5</div>
            <div className="text-sm opacity-90">User Satisfaction</div>
          </div>
        </div>
      </div>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Active Cases Widget */}
          <Card className="lg:col-span-2 bg-bg-elevated shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary font-semibold">
                <FileText className="w-5 h-5" />
                <span>Active Cases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCases.filter(c => c.status !== 'resolved').map(case_ => (
                  <div key={case_.id} className={`p-4 rounded-lg border-l-4 ${
                    case_.priority === 'high' ? 'border-l-status-error bg-status-error/5' :
                    case_.status === 'investigating' ? 'border-l-status-warning bg-status-warning/5' :
                    'border-l-status-info bg-status-info/5'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-text-primary">{case_.id}</h4>
                        <p className="text-sm text-text-secondary">{case_.department}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            case_.priority === 'high' ? 'bg-status-error text-white' :
                            case_.priority === 'medium' ? 'bg-status-warning text-text-primary' :
                            'bg-text-light text-text-secondary'
                          }`}>
                            {case_.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-btn-gentle hover:bg-btn-gentle-hover text-btn-gentle-foreground" asChild>
                          <Link to={`/human-review/${case_.id}`}>View</Link>
                        </Button>
                        <Button size="sm" className="bg-btn-gentle hover:bg-btn-gentle-hover text-btn-gentle-foreground">Assign</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Compliance Status
              </CardTitle>
              <CardDescription>
                Deadline tracking and compliance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDeadlines.map((deadline) => (
                <div key={deadline.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{deadline.caseId}</div>
                    <Badge 
                      variant={deadline.daysRemaining < 7 ? "destructive" : deadline.daysRemaining < 30 ? "secondary" : "outline"}
                    >
                      {deadline.daysRemaining} days remaining
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {deadline.deadlineType.charAt(0).toUpperCase() + deadline.deadlineType.slice(1)} deadline: {deadline.dueDate}
                  </div>
                  {deadline.daysRemaining < 7 && (
                    <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded text-xs text-destructive">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />
                      Urgent: Investigation completion required
                    </div>
                  )}
                </div>
              ))}
              
              <Card className="bg-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Annual Compliance Report</div>
                      <div className="text-xs text-muted-foreground">Due in 45 days</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Real-time system updates and case activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-status-new bg-accent/30">
                <FileText className="h-4 w-4 text-status-new mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">New complaint filed - POSH-2024-001</div>
                  <div className="text-xs text-muted-foreground">5 minutes ago • Marketing Department</div>
                  <div className="text-xs text-muted-foreground">n8n workflow: case_created ✓ triggered</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-secondary bg-accent/30">
                <Users className="h-4 w-4 text-secondary mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">ICC member assigned to POSH-2024-002</div>
                  <div className="text-xs text-muted-foreground">2 hours ago • Sales Department</div>
                  <div className="text-xs text-muted-foreground">n8n workflow: investigator_assigned ✓ completed</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-warning bg-accent/30">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Evidence uploaded for POSH-2024-003</div>
                  <div className="text-xs text-muted-foreground">4 hours ago • Engineering Department</div>
                  <div className="text-xs text-muted-foreground">n8n workflow: evidence_analysis ⏳ processing</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-success bg-accent/30">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Human review completed - POSH-2024-001</div>
                  <div className="text-xs text-muted-foreground">6 hours ago • Marketing Department</div>
                  <div className="text-xs text-muted-foreground">n8n workflow: pathway_determination ✓ completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and system management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Compliance Report
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule ICC Meeting
              </Button>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/human-review/POSH-2024-001">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Pending Cases
                </Link>
              </Button>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">System Integration Status</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>HRIS Connected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>n8n Workflows</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span>Email Gateway</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    <span>Calendar Sync</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/webhook-test">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Test n8n Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for POSH compliance system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-success">+60%</div>
                <div className="text-sm text-muted-foreground">Reporting Rate Increase</div>
                <div className="text-xs text-muted-foreground">vs. previous year</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-secondary">75%</div>
                <div className="text-sm text-muted-foreground">Faster Processing</div>
                <div className="text-xs text-muted-foreground">avg. 2 hrs vs. 8 hrs</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-success">100%</div>
                <div className="text-sm text-muted-foreground">Compliance Rate</div>
                <div className="text-xs text-muted-foreground">on-time completion</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-secondary">4.7/5</div>
                <div className="text-sm text-muted-foreground">User Satisfaction</div>
                <div className="text-xs text-muted-foreground">employee feedback</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HRDashboard;