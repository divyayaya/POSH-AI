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
import { ArrowLeft, Brain, User, CheckCircle, AlertTriangle, FileText, Users, Clock, Save, Info, Eye, Check, TrendingUp, Target, Lightbulb, Shield } from "lucide-react";
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
      <AppHeader userRole="icc" />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Breadcrumb and Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/hr-dashboard" className="hover:text-foreground transition-colors">HR Dashboard</Link>
            <span>/</span>
            <span className="text-foreground">Human Review</span>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Case Review Required</h1>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
                <span className="text-sm text-muted-foreground">Case ID: {case_.id}</span>
                {isDraft && (
                  <Badge variant="secondary" className="bg-success-muted text-success border-success/20">
                    <Save className="h-3 w-3 mr-1" />
                    Draft Saved
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Review Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={calculateProgress()} className="h-2 w-32" />
                <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Sidebar - Case Context */}
          <div className="xl:col-span-2 space-y-6">
            {/* Case Overview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="mr-2 h-5 w-5" />
                  Case Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Incident Type</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{case_.incidentType}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{case_.department}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Submitted</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{case_.submissionDate}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline</Label>
                    <div className="text-sm font-medium text-amber-600 mt-1">{case_.deadline}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Complainant</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{case_.complainant}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Respondent</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{case_.respondent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assessment */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">AI Assessment</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        Analysis of case evidence
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{case_.evidenceScore}</div>
                    <div className="text-xs text-muted-foreground">Confidence Score</div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Evidence Strength - Primary Focus */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Evidence Strength Analysis</h3>
                    <Badge 
                      variant="outline" 
                      className={`${
                        case_.evidenceScore >= 70 ? 'bg-success-muted text-success border-success/20' :
                        case_.evidenceScore >= 40 ? 'bg-warning-muted text-warning border-warning/20' :
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}
                    >
                      {evidenceLevel.level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-700 ${
                            case_.evidenceScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            case_.evidenceScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                            'bg-gradient-to-r from-red-500 to-rose-600'
                          }`}
                          style={{ width: `${case_.evidenceScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Weak (0-39)</span>
                        <span>Moderate (40-69)</span>
                        <span>Strong (70-100)</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground mb-1">{evidenceLevel.level} Evidence Quality</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">{evidenceLevel.description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recommended Action - Clear Decision Support */}
                <div className="p-6">
                  <h3 className="text-base font-semibold text-foreground mb-4">Recommended Resolution Path</h3>
                  
                  <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          case_.evidenceScore >= 70 ? 'bg-red-500' :
                          case_.evidenceScore >= 40 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-semibold text-foreground text-lg">
                            {case_.evidenceScore < 40 ? 'Mediation' : case_.evidenceScore > 70 ? 'Formal Investigation' : 'Alternative Resolution'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {case_.evidenceScore < 40 ? 'Collaborative approach recommended' : 
                             case_.evidenceScore > 70 ? 'Comprehensive investigation required' : 
                             'Structured resolution with documentation'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                          85% Match
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">AI Confidence</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Evidence patterns align with recommended pathway</span>
                  </div>
                </div>

                <Separator />

                {/* Key Metrics & Summary */}
                <div className="p-6">
                  <h3 className="text-base font-semibold text-foreground mb-4">Case Analytics</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{evidence.length}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Evidence Items</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">
                        {case_.evidenceScore < 40 ? 'Low' : case_.evidenceScore > 70 ? 'High' : 'Med'}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">3-5</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Days Est.</div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground mb-2">AI Summary</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          Analysis of {case_.incidentType.toLowerCase()} allegations in {case_.department} indicates{' '}
                          {case_.evidenceScore < 40 ? 'potential for collaborative resolution through mediation. Evidence suggests misunderstandings may be addressed through facilitated dialogue' : 
                          case_.evidenceScore > 70 ? 'serious concerns requiring formal investigation. Evidence quality supports comprehensive review with potential disciplinary outcomes' : 
                          'moderate complexity suitable for structured alternative resolution. Documentation and clear process recommended'}.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Summary */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="mr-2 h-5 w-5" />
                  Evidence Summary
                </CardTitle>
                <CardDescription className="text-sm">
                  Documentation and witness statements collected for this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {evidence.map((ev) => (
                  <div key={ev.id} className="border border-border rounded-lg p-3 bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className={`${
                        ev.type === 'document' ? 'bg-warning-muted text-warning border-warning/20' :
                        ev.type === 'witness' ? 'bg-success-muted text-success border-success/20' : 
                        'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>{ev.type}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/5"
                          onClick={() => {
                            toast.info(`Opening ${ev.type}: ${ev.description.slice(0, 30)}...`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">{ev.aiAnalysisScore} pts</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-foreground">{ev.description}</div>
                    {ev.metadata && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Credibility: {ev.credibilityRating}/5.0
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Main Area - Review Form */}
          <div className="xl:col-span-3">
            <Card className="sticky top-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-foreground">
                  <User className="mr-2 h-5 w-5 text-accent-foreground" />
                  Human Review Decision
                </CardTitle>
                <CardDescription>
                  Complete all required fields to submit your review decision
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Step 1: Credibility Assessment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      reviewData.credibilityAssessment ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
                    }`}>
                      {reviewData.credibilityAssessment ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-foreground">Credibility Assessment</Label>
                        <span className="text-destructive">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consider evidence quality, witness reliability, and consistency of statements</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rate the overall credibility of the complaint based on available evidence
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <RadioGroup 
                      value={reviewData.credibilityAssessment} 
                      onValueChange={(value) => {
                        setReviewData({...reviewData, credibilityAssessment: value});
                        validateField('credibilityAssessment', value);
                      }}
                      className={`grid grid-cols-1 gap-2 ${validationErrors.credibilityAssessment ? "border border-destructive rounded-lg p-3" : ""}`}
                    >
                      {[
                        { value: '1', label: 'Very Low Credibility', desc: 'Evidence lacks reliability or consistency' },
                        { value: '2', label: 'Low Credibility', desc: 'Some concerns about evidence quality' },
                        { value: '3', label: 'Moderate Credibility', desc: 'Mixed evidence requiring careful consideration' },
                        { value: '4', label: 'High Credibility', desc: 'Strong, consistent evidence' },
                        { value: '5', label: 'Very High Credibility', desc: 'Compelling, well-documented evidence' }
                      ].map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                          <RadioGroupItem value={option.value} id={`rating-${option.value}`} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={`rating-${option.value}`} className="text-sm font-medium cursor-pointer block">
                              {option.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    {validationErrors.credibilityAssessment && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                        <AlertTriangle className="h-3 w-3" />
                        {validationErrors.credibilityAssessment}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Step 2: Investigation Pathway */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      reviewData.investigationPathway ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
                    }`}>
                      {reviewData.investigationPathway ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-foreground">Investigation Pathway</Label>
                        <span className="text-destructive">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consider case severity, organizational impact, and legal requirements</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose the most appropriate next steps for this case
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <Select 
                      value={reviewData.investigationPathway}
                      onValueChange={(value) => {
                        setReviewData({...reviewData, investigationPathway: value});
                        validateField('investigationPathway', value);
                      }}
                    >
                      <SelectTrigger className={`h-12 ${validationErrors.investigationPathway ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select investigation pathway" />
                      </SelectTrigger>
                      <SelectContent className="text-left">
                        <SelectItem value="formal" className="py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-lg">🔍</span>
                            <div className="text-left">
                              <div className="font-medium text-left">Formal Investigation</div>
                              <div className="text-xs text-muted-foreground text-left">Comprehensive inquiry with formal procedures</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="mediation" className="py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-lg">🤝</span>
                            <div className="text-left">
                              <div className="font-medium text-left">Mediation Process</div>
                              <div className="text-xs text-muted-foreground text-left">Facilitated resolution between parties</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="alternative" className="py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-lg">⚖️</span>
                            <div className="text-left">
                              <div className="font-medium text-left">Alternative Resolution</div>
                              <div className="text-xs text-muted-foreground text-left">Tailored approach based on case specifics</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="dismiss" className="py-3">
                          <div className="flex items-center gap-3 text-left">
                            <span className="text-lg">❌</span>
                            <div className="text-left">
                              <div className="font-medium text-left">Dismiss Case</div>
                              <div className="text-xs text-muted-foreground text-left">Insufficient evidence to proceed</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.investigationPathway && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-2">
                        <AlertTriangle className="h-3 w-3" />
                        {validationErrors.investigationPathway}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Step 3: Rationale */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      reviewData.rationale.length >= 100 ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
                    }`}>
                      {reviewData.rationale.length >= 100 ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold text-foreground">Decision Rationale</Label>
                        <span className="text-destructive">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Include evidence assessment, organizational considerations, and legal compliance factors</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Provide detailed justification for your decision (minimum 100 characters)
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <Textarea
                      placeholder="Explain your reasoning for the chosen pathway, considering evidence quality, case complexity, organizational context, and compliance requirements..."
                      value={reviewData.rationale}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReviewData({...reviewData, rationale: value});
                        validateField('rationale', value);
                      }}
                      className={`min-h-[100px] resize-none ${validationErrors.rationale ? "border-destructive" : ""}`}
                    />
                    <div className="flex items-center justify-between mt-2">
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
                </div>

                <Separator />

                {/* Optional: Secondary Reviewer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      reviewData.secondaryReviewer ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
                    }`}>
                      {reviewData.secondaryReviewer ? <Check className="h-4 w-4" /> : '4'}
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-foreground">Secondary Reviewer</Label>
                      <p className="text-sm text-muted-foreground">
                        Optional: Assign another ICC member for dual review
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-11">
                    <Select onValueChange={(value) => setReviewData({...reviewData, secondaryReviewer: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select ICC member (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="icc-002">Dr. Priya Sharma (ICC Member 2)</SelectItem>
                        <SelectItem value="icc-003">Mr. Rajesh Kumar (ICC Member 3)</SelectItem>
                        <SelectItem value="icc-004">Ms. Anita Verma (External Member)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="lg"
                        className="w-full h-12"
                        disabled={!reviewData.credibilityAssessment || !reviewData.investigationPathway || reviewData.rationale.length < 100 || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Review...
                          </>
                        ) : (
                          'Submit Review Decision'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Review Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to submit your review for Case {case_.id}. This will route the case to <strong>{reviewData.investigationPathway}</strong> and cannot be undone.
                          <br /><br />
                          Please ensure all information is accurate before proceeding.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Review Again</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmitReview}>
                          Confirm & Submit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button 
                    onClick={handleSaveDraft}
                    variant="outline" 
                    size="lg"
                    className="w-full h-12"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HumanReview;