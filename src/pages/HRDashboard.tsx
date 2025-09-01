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
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span>POSH Compliance Progress</span>
              </CardTitle>
              <CardDescription className="mt-2">
                Track key metrics and improvements in workplace safety compliance
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              This Quarter
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cases Resolved Metric */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-success/5 to-success/10 p-6 hover:shadow-md transition-all duration-200">
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-success/60" />
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-success">12</div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">Cases Resolved</div>
                  <div className="text-xs text-muted-foreground">+3 from last quarter</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-success/20 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-xs font-medium text-success">85%</span>
                </div>
              </div>
            </div>

            {/* Average Response Time */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 hover:shadow-md transition-all duration-200">
              <div className="absolute top-4 right-4">
                <Clock className="w-6 h-6 text-primary/60" />
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-primary">2.4hrs</div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">Avg Response Time</div>
                  <div className="text-xs text-muted-foreground">75% faster than before</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-primary/20 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-xs font-medium text-primary">92%</span>
                </div>
              </div>
            </div>

            {/* Training Completion */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-warning/5 to-warning/10 p-6 hover:shadow-md transition-all duration-200">
              <div className="absolute top-4 right-4">
                <Users className="w-6 h-6 text-warning/60" />
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-warning">94%</div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">Staff Training Rate</div>
                  <div className="text-xs text-muted-foreground">268 of 285 employees</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-warning/20 rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                  <span className="text-xs font-medium text-warning">94%</span>
                </div>
              </div>
            </div>

            {/* Policy Compliance */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent/5 to-accent/10 p-6 hover:shadow-md transition-all duration-200">
              <div className="absolute top-4 right-4">
                <FileText className="w-6 h-6 text-accent-foreground/60" />
              </div>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-accent-foreground">100%</div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">Policy Adherence</div>
                  <div className="text-xs text-muted-foreground">All deadlines met</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full bg-accent/40 rounded-full h-2">
                    <div className="bg-accent-foreground h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <span className="text-xs font-medium text-accent-foreground">100%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <main className="px-6 py-0 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Quick Actions Panel */}
          <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
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
              
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/admin/webhook-test">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Test System Integrations
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Active Cases Widget */}
          <Card className="lg:col-span-3 bg-card border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-foreground font-semibold">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <span>Active Cases</span>
                <Badge variant="secondary" className="ml-auto">
                  {mockCases.filter(c => c.status !== 'resolved').length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCases.filter(c => c.status !== 'resolved').map(case_ => (
                <div key={case_.id} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200">
                  {/* Priority indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    case_.priority === 'high' ? 'bg-destructive' :
                    case_.priority === 'medium' ? 'bg-warning' :
                    'bg-success'
                  }`} />
                  
                  <div className="p-4 pl-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-foreground text-base">{case_.id}</h4>
                          <Badge 
                            variant={case_.priority === 'high' ? 'destructive' : case_.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs font-medium"
                          >
                            {case_.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{case_.department}</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            case_.status === 'investigating' ? 'bg-warning' :
                            case_.status === 'new' ? 'bg-primary' :
                            'bg-success'
                          }`} />
                          <span className="text-xs font-medium text-muted-foreground capitalize">
                            {case_.status === 'investigating' ? 'Under Investigation' : case_.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button size="sm" variant="default" className="font-medium" asChild>
                          <Link to={`/human-review/${case_.id}`}>Review</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="font-medium">Assign</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
              
              <div className="bg-success-muted border border-success rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-foreground">Annual Compliance Report</div>
                    <div className="text-xs text-muted-foreground">Due in 45 days</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span>Recent Activity</span>
                <Badge variant="outline" className="ml-auto text-xs">Live</Badge>
              </CardTitle>
              <CardDescription>
                Real-time system updates and case activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="group relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-primary/5 to-transparent hover:shadow-sm transition-all duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <div className="flex items-start space-x-4 p-4 pl-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground mb-1">New complaint filed - POSH-2024-001</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground">5 minutes ago</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Marketing Department</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-success/5 to-transparent hover:shadow-sm transition-all duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-success" />
                <div className="flex items-start space-x-4 p-4 pl-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 flex-shrink-0">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground mb-1">ICC member assigned to POSH-2024-002</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground">2 hours ago</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Sales Department</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-warning/5 to-transparent hover:shadow-sm transition-all duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                <div className="flex items-start space-x-4 p-4 pl-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning/10 flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground mb-1">Evidence uploaded for POSH-2024-003</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground">4 hours ago</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Engineering Department</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-success/5 to-transparent hover:shadow-sm transition-all duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-success" />
                <div className="flex items-start space-x-4 p-4 pl-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground mb-1">Human review completed - POSH-2024-001</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground">6 hours ago</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Marketing Department</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;