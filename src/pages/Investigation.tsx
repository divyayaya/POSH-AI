import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Users, Calendar, BarChart3, Clock, Brain, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { mockCases, mockEvidence, getEvidenceLevel } from "@/lib/mockData";

const Investigation = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const case_ = mockCases.find(c => c.id === caseId);
  const evidence = mockEvidence.filter(e => e.caseId === caseId);
  const evidenceLevel = getEvidenceLevel(case_?.evidenceScore || 0);

  const [investigationProgress] = useState(65);

  if (!case_) {
    return <div>Case not found</div>;
  }

  const timelineEvents = [
    { date: "2024-03-15", event: "Complaint Filed", type: "filing" },
    { date: "2024-03-16", event: "Human Review Completed", type: "review" },
    { date: "2024-03-17", event: "Formal Investigation Assigned", type: "assignment" },
    { date: "2024-03-20", event: "Initial Evidence Review", type: "evidence" },
    { date: "2024-03-25", event: "Witness Interview - Sarah Johnson", type: "interview" },
    { date: "2024-03-28", event: "Respondent Interview Scheduled", type: "pending" }
  ];

  const complianceChecklist = [
    { item: "Complaint acknowledgment within 48 hours", status: "completed" },
    { item: "ICC member assignment", status: "completed" },
    { item: "Initial evidence collection", status: "completed" },
    { item: "Complainant interview", status: "in-progress" },
    { item: "Respondent interview", status: "pending" },
    { item: "Witness interviews", status: "pending" },
    { item: "Final report preparation", status: "pending" },
    { item: "Investigation completion within 90 days", status: "on-track" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/hr-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold">Investigation Dashboard</h1>
              <p className="text-sm text-muted-foreground">Case {case_.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`text-${getStatusColor(case_.status)}`}>
                {case_.status}
              </Badge>
              <Badge variant="outline" className={`text-${getPriorityColor(case_.priority)}`}>
                {case_.priority}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Investigation Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Investigation Progress</span>
              <span>{investigationProgress}% Complete</span>
            </div>
            <Progress value={investigationProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-fireground">
              <span>Started: {case_.submissionDate}</span>
              <span>Deadline: {case_.deadline}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="case-details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="case-details" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Case Details
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="case-details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Case Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Case ID</div>
                      <div className="font-medium">{case_.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Incident Type</div>
                      <div className="font-medium">{case_.incidentType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Department</div>
                      <div className="font-medium">{case_.department}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Priority</div>
                      <Badge variant="outline" className={`text-${getPriorityColor(case_.priority)}`}>
                        {case_.priority}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Description</div>
                    <div className="text-sm">{case_.description}</div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Investigation Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    AI Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card className="bg-secondary/5 border-secondary/30">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-2">Pattern Recognition</div>
                      <div className="text-xs text-muted-foreground">
                        Similar language patterns found in 2 witness statements. High consistency score (92%).
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-accent/50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-2">Smart Scheduling</div>
                      <div className="text-xs text-muted-foreground">
                        Optimal meeting times for all parties: March 28, 2:00 PM - 4:00 PM
                      </div>
                      <Button size="sm" className="mt-2 w-full">
                        <Calendar className="mr-2 h-3 w-3" />
                        Schedule Meeting
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-success/5 border-success/30">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-2">Interview Questions</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        AI-generated questions based on case specifics
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Generate Questions
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Progress */}
            <Card>
              <CardHeader>
                <CardTitle>POSH Act Compliance Checklist</CardTitle>
                <CardDescription>
                  Progress against regulatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceChecklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : item.status === 'in-progress' ? (
                        <Clock className="h-5 w-5 text-warning" />
                      ) : item.status === 'on-track' ? (
                        <CheckCircle className="h-5 w-5 text-secondary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={`text-sm ${
                        item.status === 'completed' ? 'text-success' : 
                        item.status === 'in-progress' ? 'text-warning' :
                        item.status === 'on-track' ? 'text-secondary' : 'text-muted-foreground'
                      }`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Evidence Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Evidence Timeline</CardTitle>
                  <CardDescription>
                    Chronological view of all evidence and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="mt-1.5">
                          <div className={`w-3 h-3 rounded-full ${
                            event.type === 'filing' ? 'bg-primary' :
                            event.type === 'review' ? 'bg-secondary' :
                            event.type === 'assignment' ? 'bg-success' :
                            event.type === 'evidence' ? 'bg-warning' :
                            event.type === 'interview' ? 'bg-accent' :
                            'bg-muted'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{event.event}</div>
                          <div className="text-xs text-muted-foreground">{event.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`border rounded-lg p-4 border-${evidenceLevel.color}/50 bg-${evidenceLevel.color}/5`}>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{case_.evidenceScore}</div>
                      <div className="text-xs text-muted-foreground mb-2">Evidence Score</div>
                      <Badge variant="outline" className={`text-${evidenceLevel.color}`}>
                        {evidenceLevel.level}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {evidence.map((ev) => (
                      <Card key={ev.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{ev.type}</Badge>
                            <div className="text-xs text-muted-foreground">
                              +{ev.aiAnalysisScore} pts
                            </div>
                          </div>
                          <div className="text-sm mb-2">{ev.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Credibility: {ev.credibilityRating}/5.0
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Meeting Schedule & Interviews
                </CardTitle>
                <CardDescription>
                  Manage investigation meetings and interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-success/50 bg-success/5">
                    <CardContent className="p-4">
                      <div className="font-medium text-sm mb-2">Complainant Interview</div>
                      <div className="text-xs text-muted-foreground mb-2">March 25, 2024 - 10:00 AM</div>
                      <Badge variant="outline" className="text-success">Completed</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="p-4">
                      <div className="font-medium text-sm mb-2">Respondent Interview</div>
                      <div className="text-xs text-muted-foreground mb-2">March 28, 2024 - 2:00 PM</div>
                      <Badge variant="outline" className="text-warning">Scheduled</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-muted">
                    <CardContent className="p-4">
                      <div className="font-medium text-sm mb-2">Witness Interviews</div>
                      <div className="text-xs text-muted-foreground mb-2">TBD</div>
                      <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                    </CardContent>
                  </Card>
                </div>

                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule New Meeting
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investigation Reports</CardTitle>
                <CardDescription>
                  Generate and manage investigation documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="mb-2 h-6 w-6" />
                    Interim Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="mb-2 h-6 w-6" />
                    Evidence Summary
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="mb-2 h-6 w-6" />
                    Interview Transcripts
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="mb-2 h-6 w-6" />
                    Final Report (Draft)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Helper functions
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

export default Investigation;