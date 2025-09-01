import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, User, CheckCircle, AlertTriangle, FileText, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { mockCases, mockEvidence, getEvidenceLevel } from "@/lib/mockData";

const HumanReview = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [reviewData, setReviewData] = useState({
    credibilityAssessment: "",
    mediationSuitability: "",
    investigationPathway: "",
    rationale: "",
    secondaryReviewer: ""
  });

  const case_ = mockCases.find(c => c.id === caseId);
  const evidence = mockEvidence.filter(e => e.caseId === caseId);
  const evidenceLevel = getEvidenceLevel(case_?.evidenceScore || 0);

  if (!case_) {
    return <div>Case not found</div>;
  }

  const handleSubmitReview = async () => {
    if (!reviewData.credibilityAssessment || !reviewData.investigationPathway || !reviewData.rationale) {
      toast.error("Please complete all required fields");
      return;
    }

    if (reviewData.rationale.length < 100) {
      toast.error("Rationale must be at least 100 characters");
      return;
    }

    // Simulate n8n workflow trigger for human review submission
    const reviewSubmission = {
      caseId: case_.id,
      reviewerId: "ICC-001",
      pathway: reviewData.investigationPathway,
      credibility: reviewData.credibilityAssessment,
      timestamp: new Date().toISOString()
    };

    console.log("Triggering n8n workflow: human-review-submitted", reviewSubmission);

    toast.success(
      `Review submitted successfully. Case ${case_.id} has been ${reviewData.investigationPathway === 'formal' ? 'assigned for formal investigation' : 'routed for ' + reviewData.investigationPathway}.`
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b bg-bg-elevated shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-text-secondary hover:text-text-primary">
              <Link to="/hr-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-center bg-status-error/20 px-6 py-3 rounded-lg border border-status-error/30">
              <h1 className="text-xl font-semibold text-status-error">Human Evaluation Required</h1>
              <p className="text-sm text-text-secondary">Case {case_.id}</p>
              <div className="w-3 h-3 bg-status-error rounded-full animate-pulse mx-auto mt-2"></div>
            </div>
            <Badge variant="outline" className="bg-status-error text-white border-status-error">High Priority</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case Summary (Left Panel) */}
          <Card className="bg-bg-elevated shadow-lg">
            <CardHeader className="border-b-2 border-soft-sage">
              <CardTitle className="flex items-center text-text-primary font-semibold">
                <FileText className="mr-2 h-5 w-5" />
                Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label className="text-xs text-text-muted">Case ID</Label>
                <div className="font-medium text-text-primary">{case_.id}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Incident Type</Label>
                <div className="font-medium text-text-secondary">{case_.incidentType}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Department</Label>
                <div className="font-medium text-text-secondary">{case_.department}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Complainant</Label>
                <div className="font-medium text-text-secondary">{case_.complainant}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Respondent</Label>
                <div className="font-medium text-text-secondary">{case_.respondent}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Submission Date</Label>
                <div className="font-medium text-text-secondary">{case_.submissionDate}</div>
              </div>
              <div>
                <Label className="text-xs text-text-muted">Deadline</Label>
                <div className="font-medium text-text-secondary">{case_.deadline}</div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Evidence Breakdown</h4>
                {evidence.map((ev) => (
                  <div key={ev.id} className="border border-input-border rounded-lg p-3 bg-bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={`${
                        ev.type === 'document' ? 'border-evidence-medium text-evidence-medium' :
                        ev.type === 'witness' ? 'border-evidence-low text-evidence-low' : 
                        'border-evidence-high text-evidence-high'
                      }`}>{ev.type}</Badge>
                      <Badge variant="secondary" className="bg-evidence-medium text-white">{ev.aiAnalysisScore} pts</Badge>
                    </div>
                    <div className="text-sm text-text-secondary">{ev.description}</div>
                    {ev.metadata && (
                      <div className="text-xs text-text-muted mt-1">
                        Credibility: {ev.credibilityRating}/5.0
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Assessment (Center Panel) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                AI Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className={`border-${evidenceLevel.color}/50 bg-${evidenceLevel.color}/5`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    Evidence Score
                    <Badge variant="outline" className={`text-${evidenceLevel.color}`}>
                      {case_.evidenceScore}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Assessment</span>
                      <span className="font-medium">{evidenceLevel.level}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {evidenceLevel.description}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/5 border-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Suggested Pathway</span>
                    <Badge variant="outline" className="text-secondary">
                      {case_.evidenceScore < 40 ? 'Mediation' : case_.evidenceScore > 70 ? 'Formal Investigation' : 'Alternative Resolution'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Consistency Score</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Statements align well, no major contradictions detected. Timeline is consistent with provided evidence.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-accent/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Similar Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>POSH-2023-087</span>
                      <Badge variant="outline" className="text-xs">Mediation ✓</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>POSH-2023-156</span>
                      <Badge variant="outline" className="text-xs">Formal ✓</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>POSH-2024-002</span>
                      <Badge variant="outline" className="text-xs">Alternative ✓</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2">
                    Similar evidence patterns and department context
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Human Decision Interface (Right Panel) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Human Decision Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Credibility Assessment *</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Rate the overall credibility of the complaint (1=Low, 5=High)
                </p>
                <RadioGroup 
                  value={reviewData.credibilityAssessment} 
                  onValueChange={(value) => setReviewData({...reviewData, credibilityAssessment: value})}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="text-sm">
                        {rating} - {rating === 1 ? 'Very Low' : rating === 2 ? 'Low' : rating === 3 ? 'Moderate' : rating === 4 ? 'High' : 'Very High'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Mediation Suitability</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Is this case suitable for mediation processes?
                </p>
                <RadioGroup 
                  value={reviewData.mediationSuitability} 
                  onValueChange={(value) => setReviewData({...reviewData, mediationSuitability: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="mediation-yes" />
                    <Label htmlFor="mediation-yes" className="text-sm">Yes - Suitable for mediation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="mediation-no" />
                    <Label htmlFor="mediation-no" className="text-sm">No - Requires formal investigation</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Investigation Pathway *</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select the appropriate next steps for this case
                </p>
                <Select onValueChange={(value) => setReviewData({...reviewData, investigationPathway: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose pathway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal Investigation</SelectItem>
                    <SelectItem value="mediation">Mediation Process</SelectItem>
                    <SelectItem value="alternative">Alternative Resolution</SelectItem>
                    <SelectItem value="dismiss">Dismiss (Insufficient Evidence)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Secondary Reviewer</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Assign a secondary ICC member for dual review
                </p>
                <Select onValueChange={(value) => setReviewData({...reviewData, secondaryReviewer: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ICC member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icc-002">Dr. Priya Sharma (ICC Member 2)</SelectItem>
                    <SelectItem value="icc-003">Mr. Rajesh Kumar (ICC Member 3)</SelectItem>
                    <SelectItem value="icc-004">Ms. Anita Verma (External Member)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">Decision Rationale *</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Provide detailed justification for your decision (minimum 100 characters)
                </p>
                <Textarea
                  placeholder="Explain your reasoning for the chosen pathway, considering evidence quality, case complexity, and organizational context..."
                  value={reviewData.rationale}
                  onChange={(e) => setReviewData({...reviewData, rationale: e.target.value})}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {reviewData.rationale.length}/500 characters (minimum 100 required)
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-medium">Review Status</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      Primary Reviewer
                    </span>
                    <Badge variant="outline">ICC Member 1 (You)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      Secondary Reviewer
                    </span>
                    <Badge variant="outline" className="text-muted-foreground">
                      {reviewData.secondaryReviewer ? 'Assigned' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleSubmitReview}
                  className="flex-1"
                  disabled={!reviewData.credibilityAssessment || !reviewData.investigationPathway || !reviewData.rationale}
                >
                  Submit Review
                </Button>
                <Button variant="outline" size="icon">
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HumanReview;