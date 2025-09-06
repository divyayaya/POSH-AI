// Human Review Component - Database Integration
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
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, Brain, CheckCircle, AlertTriangle, FileText, Clock, Save, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { webhookService } from "@/services/webhookService";
import { supabase } from "@/integrations/supabase/client";

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
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch case data and evidence from database
  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;
      
      try {
        // Fetch case details
        const { data: caseResponse, error: caseError } = await supabase
          .from('cases')
          .select(`
            *,
            compliance_deadlines (deadline_date, deadline_type, urgency_level)
          `)
          .eq('id', caseId)
          .single();

        if (caseError) throw caseError;

        // Fetch evidence for this case
        const { data: evidenceResponse, error: evidenceError } = await supabase
          .from('evidence')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        if (evidenceError) throw evidenceError;

        setCaseData(caseResponse);
        setEvidence(evidenceResponse || []);
      } catch (error) {
        console.error('Error fetching case data:', error);
        toast.error('Failed to load case data');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  const getEvidenceLevel = (score: number) => {
    if (score >= 70) return { level: "Strong", description: "Substantial evidence with clear patterns indicating policy violation" };
    if (score >= 40) return { level: "Moderate", description: "Some evidence present but may require additional investigation" };
    return { level: "Weak", description: "Limited evidence, consider mediation or coaching approach" };
  };

  const evidenceLevel = getEvidenceLevel(caseData?.evidence_score || 0);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Loading Case Data...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the case details.</p>
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
      // 1. Save review to database
      const { data: reviewResponse, error: reviewError } = await supabase
        .from('case_reviews')
        .insert({
          case_id: caseData.id,
          reviewer_id: "ICC-001", // Would come from auth context
          credibility_assessment: parseInt(reviewData.credibilityAssessment),
          investigation_pathway: reviewData.investigationPathway,
          rationale: reviewData.rationale,
          review_type: 'human_review',
          metadata: {
            mediationSuitability: reviewData.mediationSuitability,
            secondaryReviewer: reviewData.secondaryReviewer
          }
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // 2. Update case status based on pathway
      const newStatus = reviewData.investigationPathway === 'formal' ? 'investigating' : 'mediation';
      
      const { error: caseUpdateError } = await supabase
        .from('cases')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseData.id);

      if (caseUpdateError) throw caseUpdateError;

      // 3. Trigger n8n workflow
      const webhookResponse = await webhookService.triggerHumanReviewSubmitted({
        caseId: caseData.id,
        reviewerId: "ICC-001",
        pathway: reviewData.investigationPathway,
        credibility: parseInt(reviewData.credibilityAssessment)
      });

      if (!webhookResponse.success) {
        // Log webhook failure for admin review, but don't fail the form submission
        console.warn('Webhook notification failed, but review was still submitted:', webhookResponse.error);
      }

      // Clear draft after successful submission
      localStorage.removeItem(`draft-${caseId}`);
      setIsDraft(false);

      toast.success(
        `Review submitted successfully. Case ${caseData.case_number} has been ${reviewData.investigationPathway === 'formal' ? 'assigned for formal investigation' : 'routed for ' + reviewData.investigationPathway}.`
      );
    } catch (error) {
      console.error('Review submission error:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDeadlineDate = () => {
    const deadline = caseData.compliance_deadlines?.[0]?.deadline_date;
    return deadline ? formatDate(deadline) : 'TBD';
  };

  return (
    <div className="min-h-screen bg-background">
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
                <span className="text-sm text-muted-foreground">Case ID: {caseData.case_number}</span>
                {isDraft && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
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
                    <div className="text-sm font-medium text-foreground mt-1">
                      {caseData.metadata?.incidentType?.replace('_', ' ').toUpperCase() || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
                    <div className="text-sm font-medium text-foreground mt-1 capitalize">{caseData.priority}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Submitted</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{formatDate(caseData.created_at)}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline</Label>
                    <div className="text-sm font-medium text-amber-600 mt-1">{getDeadlineDate()}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Complainant</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{caseData.complainant_name}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Respondent</Label>
                    <div className="text-sm font-medium text-foreground mt-1">{caseData.respondent_name}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
                    <div className="text-sm text-foreground mt-1 p-3 bg-muted/50 rounded-lg">
                      {caseData.description}
                    </div>
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
                    <div className="text-2xl font-bold text-primary">{caseData.evidence_score}</div>
                    <div className="text-xs text-muted-foreground">Confidence Score</div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Evidence Strength Analysis</h3>
                    <Badge 
                      variant="outline" 
                      className={`${
                        caseData.evidence_score >= 70 ? 'bg-green-50 text-green-700 border-green-200' :
                        caseData.evidence_score >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {evidenceLevel.level}
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          caseData.evidence_score >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                          caseData.evidence_score >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-rose-600'
                        }`}
                        style={{ width: `${caseData.evidence_score}%` }}
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

                  {/* Evidence Summary */}
                  <div className="mt-4">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Evidence Files</Label>
                    <div className="mt-2 space-y-2">
                      {evidence.length > 0 ? (
                        evidence.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <span className="text-sm">{item.description}</span>
                            <Badge variant="secondary">Score: {item.score}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No evidence files uploaded</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Review Form */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Human Review Assessment</CardTitle>
                <CardDescription>
                  Please evaluate this case and determine the appropriate investigation pathway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Credibility Assessment */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Credibility Assessment *
                    {validationErrors.credibilityAssessment && (
                      <span className="text-destructive text-xs ml-2">{validationErrors.credibilityAssessment}</span>
                    )}
                  </Label>
                  <RadioGroup
                    value={reviewData.credibilityAssessment}
                    onValueChange={(value) => {
                      setReviewData({ ...reviewData, credibilityAssessment: value });
                      validateField('credibilityAssessment', value);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5" id="cred-5" />
                      <Label htmlFor="cred-5" className="text-sm">High (90%) - Strong evidence, clear pattern</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4" id="cred-4" />
                      <Label htmlFor="cred-4" className="text-sm">Moderate (70%) - Some evidence, requires investigation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id="cred-3" />
                      <Label htmlFor="cred-3" className="text-sm">Low (40%) - Limited evidence, consider alternatives</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="cred-1" />
                      <Label htmlFor="cred-1" className="text-sm">Very Low (20%) - Insufficient evidence</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Investigation Pathway */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Investigation Pathway *
                    {validationErrors.investigationPathway && (
                      <span className="text-destructive text-xs ml-2">{validationErrors.investigationPathway}</span>
                    )}
                  </Label>
                  <Select
                    value={reviewData.investigationPathway}
                    onValueChange={(value) => {
                      setReviewData({ ...reviewData, investigationPathway: value });
                      validateField('investigationPathway', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select investigation pathway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal Investigation</SelectItem>
                      <SelectItem value="mediation">Mediation</SelectItem>
                      <SelectItem value="coaching">Coaching/Training</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Rationale */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Rationale and Recommendations *
                    {validationErrors.rationale && (
                      <span className="text-destructive text-xs ml-2">{validationErrors.rationale}</span>
                    )}
                  </Label>
                  <Textarea
                    placeholder="Provide detailed rationale for your assessment and pathway recommendation..."
                    value={reviewData.rationale}
                    onChange={(e) => {
                      setReviewData({ ...reviewData, rationale: e.target.value });
                      validateField('rationale', e.target.value);
                    }}
                    className="min-h-[120px]"
                  />
                  <div className="text-xs text-muted-foreground">
                    {reviewData.rationale.length}/100 characters minimum
                  </div>
                </div>

                <Separator />

                {/* Optional Fields */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Mediation Suitability (Optional)</Label>
                    <Select
                      value={reviewData.mediationSuitability}
                      onValueChange={(value) => setReviewData({ ...reviewData, mediationSuitability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assess mediation suitability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High - Good candidate for mediation</SelectItem>
                        <SelectItem value="moderate">Moderate - May benefit from mediation</SelectItem>
                        <SelectItem value="low">Low - Formal process recommended</SelectItem>
                        <SelectItem value="not-suitable">Not Suitable - Serious violations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Secondary Reviewer (Optional)</Label>
                    <Select
                      value={reviewData.secondaryReviewer}
                      onValueChange={(value) => setReviewData({ ...reviewData, secondaryReviewer: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign secondary reviewer if needed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="icc-member-2">ICC Member #2</SelectItem>
                        <SelectItem value="external-expert">External Expert</SelectItem>
                        <SelectItem value="senior-hr">Senior HR Representative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/hr-dashboard">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
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