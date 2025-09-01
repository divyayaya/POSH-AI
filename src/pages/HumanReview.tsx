import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Brain, User, CheckCircle, AlertTriangle, FileText, Users, Clock, Save, Info } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const case_ = mockCases.find(c => c.id === caseId);
  const evidence = mockEvidence.filter(e => e.caseId === caseId);
  const evidenceLevel = getEvidenceLevel(case_?.evidenceScore || 0);

  // Calculate form completion progress
  const calculateProgress = () => {
    const requiredFields = ['credibilityAssessment', 'investigationPathway', 'rationale'];
    const completed = requiredFields.filter(field => {
      if (field === 'rationale') return reviewData[field].length >= 100;
      return reviewData[field as keyof typeof reviewData];
    });
    return (completed.length / requiredFields.length) * 100;
  };

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'rationale':
        if (value.length < 100) {
          errors.rationale = `Minimum 100 characters required (${value.length}/100)`;
        } else {
          delete errors.rationale;
        }
        break;
      case 'credibilityAssessment':
        if (!value) {
          errors.credibilityAssessment = 'Credibility assessment is required';
        } else {
          delete errors.credibilityAssessment;
        }
        break;
      case 'investigationPathway':
        if (!value) {
          errors.investigationPathway = 'Investigation pathway is required';
        } else {
          delete errors.investigationPathway;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  // Auto-save draft functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reviewData.credibilityAssessment || reviewData.rationale || reviewData.investigationPathway) {
        setIsDraft(true);
        localStorage.setItem(`draft-${caseId}`, JSON.stringify(reviewData));
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [reviewData, caseId]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`draft-${caseId}`);
    if (draft) {
      setReviewData(JSON.parse(draft));
      setIsDraft(true);
    }
  }, [caseId]);

  if (!case_) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested case could not be located.</p>
            <Button asChild>
              <Link to="/hr-dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    
    // Validate all fields
    validateField('credibilityAssessment', reviewData.credibilityAssessment);
    validateField('investigationPathway', reviewData.investigationPathway);
    validateField('rationale', reviewData.rationale);

    if (!reviewData.credibilityAssessment || !reviewData.investigationPathway || reviewData.rationale.length < 100) {
      toast.error("Please complete all required fields correctly");
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate n8n workflow trigger for human review submission
      const reviewSubmission = {
        caseId: case_.id,
        reviewerId: "ICC-001",
        pathway: reviewData.investigationPathway,
        credibility: reviewData.credibilityAssessment,
        timestamp: new Date().toISOString()
      };

      console.log("Triggering n8n workflow: human-review-submitted", reviewSubmission);

      // Clear draft after successful submission
      localStorage.removeItem(`draft-${caseId}`);
      setIsDraft(false);

      toast.success(
        `Review submitted successfully. Case ${case_.id} has been ${reviewData.investigationPathway === 'formal' ? 'assigned for formal investigation' : 'routed for ' + reviewData.investigationPathway}.`
      );
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`draft-${caseId}`, JSON.stringify(reviewData));
    setIsDraft(true);
    toast.success("Draft saved successfully");
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <AppHeader 
        userRole="icc" 
        customActions={
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/hr-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Case Status Header */}
        <div className="mb-6 text-center bg-status-error/20 px-6 py-4 rounded-lg border border-status-error/30">
          <h1 className="text-xl font-semibold text-status-error">Human Evaluation Required</h1>
          <p className="text-sm text-text-secondary">Case {case_.id}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-3 h-3 bg-status-error rounded-full animate-pulse"></div>
            <span className="text-xs text-text-muted">
              {calculateProgress()}% Complete
            </span>
          </div>
          {isDraft && (
            <Badge variant="secondary" className="mt-2">
              <Save className="h-3 w-3 mr-1" />
              Draft Saved
            </Badge>
          )}
          <Badge variant="outline" className="bg-status-error text-destructive-foreground border-status-error mt-2">High Priority</Badge>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-text-secondary">Review Progress</h2>
            <span className="text-sm text-text-muted">{Math.round(calculateProgress())}% Complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

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
                      <Badge variant="secondary" className="bg-evidence-medium text-secondary-foreground">{ev.aiAnalysisScore} pts</Badge>
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
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium text-status-error">Credibility Assessment *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Consider evidence quality, witness reliability, and consistency of statements</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rate the overall credibility of the complaint (1=Low, 5=High)
                </p>
                <RadioGroup 
                  value={reviewData.credibilityAssessment} 
                  onValueChange={(value) => {
                    setReviewData({...reviewData, credibilityAssessment: value});
                    validateField('credibilityAssessment', value);
                  }}
                  className={validationErrors.credibilityAssessment ? "border border-destructive rounded-md p-2" : ""}
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex-1">
                        {rating} - {rating === 1 ? 'Very Low' : rating === 2 ? 'Low' : rating === 3 ? 'Moderate' : rating === 4 ? 'High' : 'Very High'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {validationErrors.credibilityAssessment && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.credibilityAssessment}
                  </p>
                )}
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

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium text-status-error">Investigation Pathway *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Consider case severity, organizational impact, and legal requirements</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the appropriate next steps for this case
                </p>
                <Select 
                  value={reviewData.investigationPathway}
                  onValueChange={(value) => {
                    setReviewData({...reviewData, investigationPathway: value});
                    validateField('investigationPathway', value);
                  }}
                >
                  <SelectTrigger className={validationErrors.investigationPathway ? "border-destructive" : ""}>
                    <SelectValue placeholder="Choose pathway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">🔍 Formal Investigation</SelectItem>
                    <SelectItem value="mediation">🤝 Mediation Process</SelectItem>
                    <SelectItem value="alternative">⚖️ Alternative Resolution</SelectItem>
                    <SelectItem value="dismiss">❌ Dismiss (Insufficient Evidence)</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.investigationPathway && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.investigationPathway}
                  </p>
                )}
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

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium text-status-error">Decision Rationale *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Include evidence assessment, organizational considerations, and legal compliance factors</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide detailed justification for your decision (minimum 100 characters)
                </p>
                <Textarea
                  placeholder="Explain your reasoning for the chosen pathway, considering evidence quality, case complexity, and organizational context..."
                  value={reviewData.rationale}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReviewData({...reviewData, rationale: value});
                    validateField('rationale', value);
                  }}
                  className={`min-h-[120px] ${validationErrors.rationale ? "border-destructive" : ""}`}
                />
                <div className="flex items-center justify-between">
                  <div className={`text-xs ${reviewData.rationale.length >= 100 ? 'text-success' : 'text-muted-foreground'}`}>
                    {reviewData.rationale.length}/500 characters 
                    {reviewData.rationale.length >= 100 && <CheckCircle className="inline h-3 w-3 ml-1" />}
                  </div>
                  {validationErrors.rationale && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {validationErrors.rationale.split('(')[0]}
                    </p>
                  )}
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

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveDraft}
                    variant="outline" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Flag case for additional support</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full"
                      disabled={!reviewData.credibilityAssessment || !reviewData.investigationPathway || reviewData.rationale.length < 100 || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Review Submission</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit this review for Case {case_.id}? 
                        This will route the case to <strong>{reviewData.investigationPathway}</strong> and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitReview}>
                        Confirm Submission
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HumanReview;