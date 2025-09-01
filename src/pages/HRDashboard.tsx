import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">HR Professional Dashboard</h1>
                <p className="text-sm text-muted-foreground">POSH Compliance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <Badge variant="secondary">HR Manager</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Cases Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Active Cases
              </CardTitle>
              <CardDescription>
                Current POSH complaints requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCases.filter(c => c.status !== 'resolved').map((case_) => (
                <div key={case_.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{case_.id}</div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className={`text-${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </Badge>
                      <Badge variant="outline" className={`text-${getPriorityColor(case_.priority)}`}>
                        {case_.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Complainant: {case_.complainant}</div>
                    <div>Respondent: {case_.respondent}</div>
                    <div>Department: {case_.department}</div>
                    <div>Evidence Score: {case_.evidenceScore}/100</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/human-review/${case_.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      Assign Investigator
                    </Button>
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
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