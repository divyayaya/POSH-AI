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
    <div className="min-h-screen bg-background">
      <AppHeader 
        userRole="hr" 
        notifications={notifications}
        customTitle="HR Dashboard"
      />

      {/* Enhanced Header */}
      <div className="text-center mb-8 px-6 pt-8">
        <h1 className="text-3xl font-semibold text-foreground mb-3">HR Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Monitor compliance, track cases, and ensure workplace safety standards.
        </p>
      </div>

      {/* Key Performance Indicators */}
      <Card className="mb-8 mx-6 bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Key Performance Indicators for POSH Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2 p-4 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">+60%</div>
              <div className="text-sm text-muted-foreground">Reporting Rate Increase</div>
              <div className="text-xs text-muted-foreground">vs. previous year</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">75%</div>
              <div className="text-sm text-muted-foreground">Faster Processing</div>
              <div className="text-xs text-muted-foreground">avg. 2 hrs vs. 8 hrs</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-muted-foreground">Compliance Rate</div>
              <div className="text-xs text-muted-foreground">on-time completion</div>
            </div>
            <div className="text-center space-y-2 p-4 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-primary">4.7/5</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
              <div className="text-xs text-muted-foreground">employee feedback</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <main className="px-6 py-0 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Cases Widget */}
          <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground font-semibold">
                <FileText className="w-5 h-5 text-primary" />
                <span>Active Cases</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCases.filter(c => c.status !== 'resolved').map(case_ => (
                  <div key={case_.id} className={`p-4 rounded-lg border-l-4 bg-muted/30 ${
                    case_.priority === 'high' ? 'border-l-destructive' :
                    case_.status === 'investigating' ? 'border-l-orange-500' :
                    'border-l-primary'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{case_.id}</h4>
                        <p className="text-sm text-muted-foreground">{case_.department}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={
                            case_.priority === 'high' ? 'destructive' :
                            case_.priority === 'medium' ? 'secondary' :
                            'outline'
                          }>
                            {case_.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="default" asChild>
                          <Link to={`/human-review/${case_.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="outline">Assign</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status Widget */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Compliance Status
              </CardTitle>
              <CardDescription>
                Deadline tracking and compliance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockDeadlines.map((deadline) => (
                <div key={deadline.id} className="border border-border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-foreground">{deadline.caseId}</div>
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
                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />
                      Urgent: Investigation completion required
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-foreground">Annual Compliance Report</div>
                    <div className="text-xs text-muted-foreground">Due in 45 days</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity Feed */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Real-time system updates and case activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-blue-500 bg-blue-50 rounded-r-lg">
                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">New complaint filed - POSH-2024-001</div>
                  <div className="text-xs text-muted-foreground">5 minutes ago • Marketing Department</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-green-500 bg-green-50 rounded-r-lg">
                <Users className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">ICC member assigned to POSH-2024-002</div>
                  <div className="text-xs text-muted-foreground">2 hours ago • Sales Department</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-orange-500 bg-orange-50 rounded-r-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Evidence uploaded for POSH-2024-003</div>
                  <div className="text-xs text-muted-foreground">4 hours ago • Engineering Department</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border-l-2 border-l-green-500 bg-green-50 rounded-r-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">Human review completed - POSH-2024-001</div>
                  <div className="text-xs text-muted-foreground">6 hours ago • Marketing Department</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
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
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">System Integration Status</div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-foreground">HRIS Connected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-foreground">Email Gateway</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-foreground">Document Storage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-foreground">Calendar Sync</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/webhook-test">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Test System Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;