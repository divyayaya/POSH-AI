import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Shield,
  Eye,
  Download,
  Plus,
  MessageSquare,
  Target,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Investigation = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [investigationStatus, setInvestigationStatus] = useState<any>("");
  const [newInterviewNote, setNewInterviewNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch comprehensive case data
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;
      
      try {
        // Fetch case details
        const { data: caseResponse, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single();

        if (caseError) throw caseError;

        // Fetch evidence
        const { data: evidenceResponse } = await supabase
          .from('evidence')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        // Fetch reviews
        const { data: reviewsResponse } = await supabase
          .from('case_reviews')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        // Fetch deadlines
        const { data: deadlinesResponse } = await supabase
          .from('compliance_deadlines')
          .select('*')
          .eq('case_id', caseId)
          .order('deadline_date', { ascending: true });

        setCaseData(caseResponse);
        setEvidence(evidenceResponse || []);
        setReviews(reviewsResponse || []);
        setDeadlines(deadlinesResponse || []);
        setInvestigationStatus(String(caseResponse?.status || ''));
      } catch (error) {
        console.error('Error fetching case data:', error);
        toast.error('Failed to load case data');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const handleStatusUpdate = async () => {
    if (!caseData || !investigationStatus) return;

    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status: investigationStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success('Case status updated successfully');
      setCaseData(prev => ({ ...prev, status: investigationStatus }));
    } catch (error) {
      console.error('Error updating case status:', error);
      toast.error('Failed to update case status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (deadlineDate: string) => {
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mediation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Loading Case Details...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the case information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested case could not be located.</p>
            <Button asChild>
              <Link to="/icc-dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userRole="icc" />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/icc-dashboard" className="hover:text-foreground transition-colors">ICC Dashboard</Link>
            <span>/</span>
            <span className="text-foreground">Case Investigation</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Case Investigation</h1>
              <div className="flex items-center gap-4">
                <Badge className={getPriorityColor(caseData.priority)}>
                  {caseData.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge className={getStatusColor(caseData.status)}>
                  {caseData.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">Case ID: {caseData.case_number}</span>
              </div>
            </div>
            
            <Button variant="outline" asChild>
              <Link to="/icc-dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Case Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Case Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                    <p className="text-lg font-semibold">{caseData.title}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{caseData.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Complainant</Label>
                      <p className="font-medium">{caseData.complainant_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Respondent</Label>
                      <p className="font-medium">{caseData.respondent_name}</p>
                    </div>
                  </div>

                  {caseData.metadata && (
                    <div className="space-y-3">
                      <Separator />
                      <h4 className="font-medium">Additional Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {caseData.metadata.incidentType && (
                          <div>
                            <Label className="text-muted-foreground">Incident Type</Label>
                            <p className="capitalize">{caseData.metadata.incidentType.replace('_', ' ')}</p>
                          </div>
                        )}
                        {caseData.metadata.location && (
                          <div>
                            <Label className="text-muted-foreground">Location</Label>
                            <p>{caseData.metadata.location}</p>
                          </div>
                        )}
                        {caseData.metadata.incidentDate && (
                          <div>
                            <Label className="text-muted-foreground">Incident Date</Label>
                            <p>{new Date(caseData.metadata.incidentDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {caseData.metadata.witnesses && (
                          <div>
                            <Label className="text-muted-foreground">Witnesses</Label>
                            <p>{caseData.metadata.witnesses || 'None specified'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Key Information */}
              <div className="space-y-6">
                {/* Evidence Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Evidence Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{caseData.evidence_score}/100</div>
                      <div className="text-sm text-muted-foreground mb-4">Confidence Score</div>
                      <Progress value={caseData.evidence_score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Deadlines */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Compliance Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deadlines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No deadlines set</p>
                    ) : (
                      <div className="space-y-3">
                        {deadlines.map((deadline, index) => {
                          const daysRemaining = getDaysRemaining(deadline.deadline_date);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {deadline.deadline_type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(deadline.deadline_date)}
                                </p>
                              </div>
                              <Badge variant={daysRemaining <= 7 ? 'destructive' : daysRemaining <= 30 ? 'default' : 'secondary'}>
                                {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Update Status</Label>
                      <Select value={investigationStatus} onValueChange={(value) => setInvestigationStatus(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="mediation">Mediation</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleStatusUpdate} className="w-full" size="sm">
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Evidence & Documentation
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {evidence.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium mb-2">No Evidence Files</p>
                    <p className="text-sm">Evidence and supporting documents will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evidence.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {item.type} • Score: {item.score}/100
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Added: {formatDate(item.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Interview Notes & Records
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="interview-notes">Add Interview Note</Label>
                    <Textarea
                      id="interview-notes"
                      placeholder="Record interview details, observations, and key findings..."
                      value={newInterviewNote}
                      onChange={(e) => setNewInterviewNote(e.target.value)}
                      className="mt-2"
                    />
                    <Button className="mt-3" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium mb-2">No Interview Records</p>
                    <p className="text-sm">Interview notes and recordings will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Case Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Case Created */}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Case Filed</p>
                      <p className="text-sm text-muted-foreground">
                        Case {caseData.case_number} was submitted
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(caseData.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Reviews */}
                  {reviews.map((review, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Case Reviewed</p>
                        <p className="text-sm text-muted-foreground">
                          Investigation pathway: {review.investigation_pathway}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Current Status */}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Status: {caseData.status.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        Current case status
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(caseData.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Investigation Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Schedule Interviews
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Parties
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Review Policies
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Case Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Recommend Mediation
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Escalate Case
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Close Investigation
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Investigation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Document investigation progress, findings, and recommendations..."
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button className="mt-3">
                  Save Investigation Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Investigation;