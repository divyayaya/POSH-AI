import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, FileText, Users, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { mockEmployeeData, calculateEvidenceScore, getEvidenceLevel } from "@/lib/mockData";

const FileComplaint = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incidentType: "",
    respondentName: "",
    incidentDate: "",
    description: "",
    witnesses: [] as string[],
    evidence: [] as File[],
    location: ""
  });

  const incidentTypes = [
    { id: "harassment", label: "Harassment/Discrimination", icon: AlertTriangle },
    { id: "retaliation", label: "Retaliation", icon: Shield },
    { id: "policy", label: "Policy Violation", icon: FileText },
    { id: "unsure", label: "Unsure (Guided Assessment)", icon: Users }
  ];

  const mockEvidenceScore = 65; // Simulated score based on form data
  const evidenceLevel = getEvidenceLevel(mockEvidenceScore);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Simulate case submission with n8n webhook trigger
    const caseId = `POSH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    toast.success(
      `Complaint filed successfully. Case ID: ${caseId}. You will receive updates via email.`
    );

    // Simulate n8n workflow trigger
    console.log("Triggering n8n workflows:", {
      event: "case_created",
      caseId,
      evidenceScore: mockEvidenceScore,
      needsHumanReview: mockEvidenceScore < 40,
      timestamp: new Date().toISOString()
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-text-primary">What type of incident would you like to report?</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">
                We're here to support you through this process. Your report will be handled confidentially 
                and in accordance with POSH Act requirements.
              </p>
              <div className="flex justify-center space-x-4 flex-wrap">
                <div className="flex items-center space-x-2 bg-soft-sage text-white px-3 py-1 rounded-full text-sm">
                  <Shield className="h-3 w-3" />
                  <span>Confidential</span>
                </div>
                <div className="text-sm text-text-muted">Expected timeline: 90 days</div>
                <div className="text-sm text-text-muted">24/7 Support Available</div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card 
                      key={type.id}
                      className={`cursor-pointer transition-all hover:shadow-md bg-bg-elevated border-input-border hover:border-gentle-teal hover:shadow-gentle-teal/10 ${
                        formData.incidentType === type.id 
                          ? 'border-gentle-teal ring-2 ring-gentle-teal/20' 
                          : ''
                      }`}
                      onClick={() => setFormData({ ...formData, incidentType: type.id })}
                    >
                      <CardContent className="p-6 text-center">
                        <Icon className={`h-8 w-8 mx-auto mb-3 ${
                          formData.incidentType === type.id ? 'text-gentle-teal' : 'text-gentle-teal'
                        }`} />
                        <h3 className="font-medium text-text-primary">{type.label}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {formData.incidentType === 'unsure' && (
              <Card className="bg-soft-lavender/20 border border-soft-lavender/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-text-primary">
                    <Users className="mr-2 h-5 w-5 text-gentle-teal" />
                    Guided Assessment Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary">
                    Our AI-powered assessment tool will help determine the most appropriate category 
                    and investigation pathway based on your specific situation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Employee Information</h2>
              <p className="text-muted-foreground">
                We've pre-filled your information from our HR system. Please verify and update as needed.
              </p>
            </div>

            <Card className="border-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-secondary" />
                  Auto-filled from HRIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeName">Employee Name</Label>
                    <Input
                      id="employeeName"
                      value={mockEmployeeData.name}
                      className="border-secondary/30 bg-secondary/5"
                      readOnly
                    />
                    <Badge variant="secondary" className="mt-1 text-xs">Auto-filled</Badge>
                  </div>
                  <div>
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={mockEmployeeData.id}
                      className="border-secondary/30 bg-secondary/5"
                      readOnly
                    />
                    <Badge variant="secondary" className="mt-1 text-xs">Auto-filled</Badge>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={mockEmployeeData.department}
                      className="border-secondary/30 bg-secondary/5"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      value={mockEmployeeData.manager}
                      className="border-secondary/30 bg-secondary/5"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="respondent">Respondent Name *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, respondentName: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select from organization directory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-smith">John Smith - Sales Manager</SelectItem>
                    <SelectItem value="mike-wilson">Mike Wilson - Marketing Director</SelectItem>
                    <SelectItem value="robert-clark">Robert Clark - Engineering Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-warning/5 border-warning/30">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Conflict of Interest Detected</p>
                      <p className="text-xs text-muted-foreground">
                        ICC member conflict detected - alternative member automatically assigned for review.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Evidence Collection</h2>
              <p className="text-muted-foreground">
                Provide details and evidence to support your complaint. Our AI will assess the strength of your case.
              </p>
            </div>

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Evidence Assessment
                  <Badge variant="outline" className={`text-${evidenceLevel.color}`}>
                    {evidenceLevel.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Evidence Score</span>
                    <span>{mockEvidenceScore}/100</span>
                  </div>
                  <Progress value={mockEvidenceScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{evidenceLevel.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-secondary">+30</div>
                    <div className="text-xs text-muted-foreground">Points per witness</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-secondary">+40</div>
                    <div className="text-xs text-muted-foreground">Points per document</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-secondary">+50</div>
                    <div className="text-xs text-muted-foreground">Points per physical evidence</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="incidentDate">Date of Incident *</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location of Incident</Label>
                <Input
                  id="location"
                  placeholder="e.g., Conference Room B, 5th Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe what happened in detail. Include dates, times, and circumstances."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/2000 characters
                </div>
              </div>

              <Card className="bg-accent/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">AI Suggestion</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on similar cases, consider documenting: specific dates/times, 
                    witnesses present, any written communications, and impact on work environment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
              <p className="text-muted-foreground">
                Please review your complaint details before submission.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complaint Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Incident Type</Label>
                    <div className="font-medium">
                      {incidentTypes.find(t => t.id === formData.incidentType)?.label || "Not selected"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Respondent</Label>
                    <div className="font-medium">{formData.respondentName || "Not selected"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date of Incident</Label>
                    <div className="font-medium">{formData.incidentDate || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <div className="font-medium">{formData.location || "Not provided"}</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <div className="text-sm mt-1">{formData.description || "No description provided"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-${evidenceLevel.color}/50 bg-${evidenceLevel.color}/5`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Evidence Assessment Result
                  <Badge variant="outline" className={`text-${evidenceLevel.color}`}>
                    {mockEvidenceScore} Points
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <strong>{evidenceLevel.level}:</strong> {evidenceLevel.description}
                  {mockEvidenceScore < 40 && (
                    <>
                      <br />
                      <span className="text-muted-foreground">
                        ICC member will review within 2 hours and determine next steps.
                      </span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/30">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Case number will be generated: POSH-2024-XXX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm">ICC member assignment within 24 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Investigation begins within 7 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Regular updates via email</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 bg-bg-elevated rounded-lg p-8 border border-input-border">
          <h1 className="text-3xl font-semibold text-text-primary mb-2">
            Report a Concern - Your Voice Matters
          </h1>
          <p className="text-lg text-text-secondary">
            We're here to listen and support you through this process
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step < currentStep
                      ? 'bg-status-success text-white'
                      : step === currentStep
                      ? 'bg-gentle-teal text-white shadow-lg shadow-gentle-teal/30'
                      : 'bg-text-light text-white'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      step < currentStep ? 'bg-status-success' : 'bg-text-light'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-bg-elevated rounded-lg shadow-sm p-8 mb-8 border border-input-border">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="bg-btn-gentle hover:bg-btn-gentle-hover text-btn-gentle-foreground px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all px-6"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all px-6"
            >
              Submit Complaint
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;