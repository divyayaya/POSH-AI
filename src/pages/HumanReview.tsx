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

      <main className="w-full max-w-none">
        {/* Header Section - Autolayout Container */}
        <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Link to="/hr-dashboard" className="hover:text-foreground transition-colors">HR Dashboard</Link>
              <span>/</span>
              <span className="text-foreground">Human Review</span>
            </div>
            
            {/* Header Content - Flexible Layout */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2 truncate">Case Review Required</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                  </Badge>
                  <span className="text-sm text-muted-foreground shrink-0">Case ID: {case_.id}</span>
                  {isDraft && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 shrink-0">
                      <Save className="h-3 w-3 mr-1" />
                      Draft Saved
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Progress Indicator - Auto-sized */}
              <div className="flex-shrink-0">
                <div className="text-sm text-muted-foreground mb-1 text-right">Review Progress</div>
                <div className="flex items-center gap-3">
                  <Progress value={calculateProgress()} className="h-2 w-32" />
                  <span className="text-sm font-medium min-w-[3rem] text-right">{Math.round(calculateProgress())}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Autolayout Grid */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col xl:flex-row gap-8 min-h-0">
            {/* Left Sidebar - Case Context Stack */}
            <div className="xl:w-[400px] xl:flex-shrink-0 flex flex-col gap-6">
            {/* Case Overview - Autolayout Card */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="mr-2 h-5 w-5" />
                  Case Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Key Details - Auto Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Incident Type</Label>
                    <div className="text-sm font-medium text-foreground">{case_.incidentType}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</Label>
                    <div className="text-sm font-medium text-foreground">{case_.department}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Submitted</Label>
                    <div className="text-sm font-medium text-foreground">{case_.submissionDate}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline</Label>
                    <div className="text-sm font-medium text-amber-600">{case_.deadline}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Parties - Vertical Stack */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Complainant</Label>
                    <div className="text-sm font-medium text-foreground">{case_.complainant}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Respondent</Label>
                    <div className="text-sm font-medium text-foreground">{case_.respondent}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assessment */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-foreground">
                  <Brain className="mr-2 h-5 w-5 text-blue-600" />
                  AI Assessment
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                    Automated Analysis
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  Machine learning analysis of evidence strength and case complexity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Evidence Strength Indicator */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-foreground">Evidence Strength</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{case_.evidenceScore}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
                      <div className="text-xs text-muted-foreground">Confidence Score</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          case_.evidenceScore >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          case_.evidenceScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-rose-600'
                        }`}
                        style={{ width: `${case_.evidenceScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Weak</span>
                      <span>Moderate</span>
                      <span>Strong</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900 uppercase tracking-wide">Assessment Level</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-800">{evidenceLevel.level}</div>
                    <div className="text-xs text-blue-700 mt-1">{evidenceLevel.description}</div>
                  </div>
                </div>

                <Separator />

                {/* Recommended Action */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-foreground">Recommended Action</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        case_.evidenceScore >= 70 ? 'bg-red-500' :
                        case_.evidenceScore >= 40 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`} />
                      <div>
                        <div className="font-medium text-purple-900">
                          {case_.evidenceScore < 40 ? 'Mediation' : case_.evidenceScore > 70 ? 'Formal Investigation' : 'Alternative Resolution'}
                        </div>
                        <div className="text-xs text-purple-700">
                          {case_.evidenceScore < 40 ? 'Collaborative resolution recommended' : 
                           case_.evidenceScore > 70 ? 'Requires comprehensive investigation' : 
                           'Structured resolution process'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 font-medium">
                      85% Match
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Statements align well with provided evidence
                  </div>
                </div>

                <Separator />

                {/* AI Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-semibold text-foreground">Key Insights</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="text-lg font-bold text-amber-800">{evidence.length}</div>
                          <div className="text-xs text-amber-700">Evidence Items</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="text-lg font-bold text-amber-800">
                            {case_.evidenceScore < 40 ? 'Low' : case_.evidenceScore > 70 ? 'High' : 'Med'}
                          </div>
                          <div className="text-xs text-amber-700">Risk Level</div>
                        </div>
                        <div className="p-2 bg-white/60 rounded border border-amber-200">
                          <div className="text-lg font-bold text-amber-800">3-5</div>
                          <div className="text-xs text-amber-700">Days Est.</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-amber-800 leading-relaxed">
                        <strong>Incident Analysis:</strong> Allegations of {case_.incidentType.toLowerCase()} in {case_.department}. 
                        Evidence quality suggests {case_.evidenceScore < 40 ? 'collaborative resolution may resolve concerns effectively' : 
                        case_.evidenceScore > 70 ? 'formal procedures required due to severity indicators' : 
                        'balanced approach needed with structured resolution process'}.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Summary - Flexible List */}
            <Card className="flex-1 min-h-0">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="text-foreground">Evidence Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="flex flex-col gap-3">
                  {evidence.map((ev) => (
                    <div key={ev.id} className="border border-border rounded-lg p-4 bg-card hover:bg-accent/5 transition-all duration-200 animate-fade-in">
                      {/* Header Row - Auto-justified */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <Badge variant="outline" className={`flex-shrink-0 ${
                          ev.type === 'document' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          ev.type === 'witness' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>{ev.type}</Badge>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              toast.info(`Opening ${ev.type}: ${ev.description.slice(0, 30)}...`);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                            {ev.aiAnalysisScore} pts
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content - Flexible */}
                      <div className="text-sm text-foreground leading-relaxed mb-2">{ev.description}</div>
                      
                      {/* Metadata - Auto-positioned */}
                      {ev.metadata && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span>Credibility: {ev.credibilityRating}/5.0</span>
                          <span className="text-muted-foreground/70">AI Analyzed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Area - Review Form Stack */}
          <div className="flex-1 xl:min-w-0">
            <Card className="h-fit xl:sticky xl:top-24">
              <CardHeader className="pb-6 flex-shrink-0">
                <CardTitle className="flex items-center text-foreground">
                  <User className="mr-2 h-5 w-5 text-green-600" />
                  Human Review Decision
                </CardTitle>
                <CardDescription>
                  Complete all required fields to submit your review decision
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8">
                {/* Step 1: Credibility Assessment - Auto-spaced Container */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                      reviewData.credibilityAssessment ? 'bg-green-100 text-green-700 scale-105' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {reviewData.credibilityAssessment ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold text-foreground">Credibility Assessment</Label>
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consider evidence quality, witness reliability, and consistency of statements</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Rate the overall credibility of the complaint based on available evidence
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-14">
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

                {/* Step 2: Investigation Pathway - Auto-spaced Container */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                      reviewData.investigationPathway ? 'bg-green-100 text-green-700 scale-105' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {reviewData.investigationPathway ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold text-foreground">Investigation Pathway</Label>
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Consider case severity, organizational impact, and legal requirements</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Choose the most appropriate next steps for this case
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-14">
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

                {/* Step 3: Rationale - Auto-spaced Container */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                      reviewData.rationale.length >= 100 ? 'bg-green-100 text-green-700 scale-105' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {reviewData.rationale.length >= 100 ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-base font-semibold text-foreground">Decision Rationale</Label>
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Include evidence assessment, organizational considerations, and legal compliance factors</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Provide detailed justification for your decision (minimum 100 characters)
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-14">
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
                      <div className={`text-xs ${reviewData.rationale.length >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
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

                {/* Optional: Secondary Reviewer - Auto-spaced Container */}
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                      reviewData.secondaryReviewer ? 'bg-green-100 text-green-700 scale-105' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {reviewData.secondaryReviewer ? <Check className="h-4 w-4" /> : '4'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-base font-semibold text-foreground">Secondary Reviewer</Label>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Optional: Assign another ICC member for dual review
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-14">
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

                {/* Action Buttons - Auto-layout Stack */}
                <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-border">
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
        </div>
      </main>
    </div>
  );
};

export default HumanReview;