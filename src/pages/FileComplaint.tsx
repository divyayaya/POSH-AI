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
import { AppHeader } from "@/components/AppHeader";
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, FileText, Users, CheckCircle, Bell, Lock, Upload } from "lucide-react";
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">What type of concern would you like to report?</h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="incidentType"
                    value="harassment"
                    checked={formData.incidentType === "harassment"}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Harassment/Discrimination</div>
                    <div className="text-sm text-gray-600">Unwelcome conduct based on protected characteristics</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="incidentType"
                    value="retaliation"
                    checked={formData.incidentType === "retaliation"}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Retaliation</div>
                    <div className="text-sm text-gray-600">Adverse action after reporting concerns or participating in investigations</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="incidentType"
                    value="policy"
                    checked={formData.incidentType === "policy"}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Policy Violation</div>
                    <div className="text-sm text-gray-600">Violation of company policies or code of conduct</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="incidentType"
                    value="unsure"
                    checked={formData.incidentType === "unsure"}
                    onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">I'm not sure</div>
                    <div className="text-sm text-gray-600">Help me determine what type of concern this is</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Information</h2>
              <p className="text-sm text-gray-600">
                Information has been automatically populated from your HR profile. Please verify accuracy.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="fullName"
                    value="John Doe"
                    className="bg-blue-50 border-blue-200"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="department"
                    value="Engineering"
                    className="bg-blue-50 border-blue-200"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                    Manager <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="manager"
                    value="Jane Smith"
                    className="bg-blue-50 border-blue-200"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue placeholder="Work Email" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="work-email">Work Email</SelectItem>
                      <SelectItem value="personal-email">Personal Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">About the Incident</h3>
              
              <div>
                <Label htmlFor="whoInvolved" className="block text-sm font-medium text-gray-700 mb-1">
                  Who was involved in this incident? <AlertTriangle className="inline h-4 w-4 ml-1" />
                </Label>
                <Input
                  id="whoInvolved"
                  placeholder="Start typing name or select from directory..."
                  value={formData.respondentName}
                  onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="whenOccurred" className="block text-sm font-medium text-gray-700 mb-1">
                    When did this occur?
                  </Label>
                  <Input
                    id="whenOccurred"
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="timeKnown" className="block text-sm font-medium text-gray-700 mb-1">
                    Time (if known)
                  </Label>
                  <Input
                    id="timeKnown"
                    placeholder="--:--"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whereOccurred" className="block text-sm font-medium text-gray-700 mb-1">
                  Where did this occur?
                </Label>
                <Select>
                  <SelectTrigger className="bg-gray-100">
                    <SelectValue placeholder="Select location..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="conference-room">Conference Room</SelectItem>
                    <SelectItem value="remote">Remote/Virtual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Please describe what happened
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident in as much detail as you feel comfortable sharing."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Character count: {formData.description.length}/2000
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Supporting Evidence</h2>
              <p className="text-sm text-gray-600">
                Please provide any evidence that supports your report. This helps ensure a thorough investigation.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="witnesses" className="block text-sm font-medium text-gray-700 mb-2">
                  Were there any witnesses?
                </Label>
                <Textarea
                  id="witnesses"
                  placeholder="List any witnesses and what they may have seen or heard..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-xs text-gray-500">Supported: PDF, DOC, JPG, PNG, Email files</p>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context
                </Label>
                <Textarea
                  id="additionalContext"
                  placeholder="Any additional information that might be relevant..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Evidence Strength Assessment</h3>
                  <Badge className="bg-red-500 text-white">25/100 points</Badge>
                </div>
                <div className="bg-red-100 border border-red-300 rounded p-3">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-medium text-red-800">Human Review Required</span>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    Based on the information provided, your case will receive additional review by a trained committee member within 2 hours. This ensures your concern receives appropriate attention and consideration for alternative resolution options.
                  </p>
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">What this means:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>A qualified person will review your case personally</li>
                      <li>You may be contacted for additional information</li>
                      <li>Alternative resolution options (like mediation) may be offered</li>
                      <li>You maintain the right to a formal investigation at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
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
    <div className="min-h-screen bg-gray-50">
      <AppHeader userRole="employee" notifications={2} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Report a Workplace Concern</h1>

        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Your privacy is protected</h3>
              <p className="text-sm text-gray-600 mt-1">
                All reports are handled confidentially and in accordance with company policy and legal requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            {[
              { number: 1, label: "Type of Concern" },
              { number: 2, label: "Details" },
              { number: 3, label: "Evidence" },
              { number: 4, label: "Review" }
            ].map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.number === currentStep 
                        ? 'bg-orange-500 text-white' 
                        : step.number < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number < currentStep ? <CheckCircle className="h-5 w-5" /> : step.number}
                  </div>
                  <span className={`mt-2 text-sm ${
                    step.number === currentStep 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? 'Save & Exit' : 'Back'}
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6"
            >
              Continue to Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;