import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Users, 
  CheckCircle, 
  Bell, 
  Lock, 
  Upload,
  Save,
  Info,
  Heart,
  Phone,
  MessageCircle,
  HelpCircle,
  Camera,
  X,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { mockEmployeeData, calculateEvidenceScore, getEvidenceLevel } from "@/lib/mockData";

// Form data interface
interface FormData {
  incidentType: string;
  respondentName: string;
  incidentDate: string;
  incidentTime: string;
  description: string;
  witnesses: string;
  location: string;
  additionalContext: string;
  contactMethod: string;
  isAnonymous: boolean;
}

// Uploaded file interface
interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded';
  id: number;
}

const FileComplaint = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    incidentType: "",
    respondentName: "",
    incidentDate: "",
    incidentTime: "",
    description: "",
    witnesses: "",
    location: "",
    additionalContext: "",
    contactMethod: "work-email",
    isAnonymous: false
  });

  const [validation, setValidation] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (Object.keys(formData).some(key => formData[key])) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [formData]);

  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsAutoSaving(false);
      setLastSaved(new Date());
      toast.success("Progress saved automatically", { duration: 2000 });
    }, 500);
  };

  const incidentTypes = [
    { 
      id: "harassment", 
      label: "Harassment/Discrimination", 
      icon: AlertTriangle,
      description: "Unwelcome conduct based on protected characteristics",
      examples: "Comments about gender, race, religion, age, or other protected characteristics",
      recommended: false
    },
    { 
      id: "retaliation", 
      label: "Retaliation", 
      icon: Shield,
      description: "Adverse action after reporting concerns or participating in investigations",
      examples: "Demotion, exclusion, or negative treatment after filing a complaint",
      recommended: false
    },
    { 
      id: "policy", 
      label: "Policy Violation", 
      icon: FileText,
      description: "Violation of company policies or code of conduct",
      examples: "Inappropriate behavior, ethics violations, or misconduct",
      recommended: false
    },
    { 
      id: "unsure", 
      label: "I'm not sure", 
      icon: HelpCircle,
      description: "Get help determining what type of concern this is",
      examples: "We'll ask you a few questions to help categorize your concern appropriately",
      recommended: true
    }
  ];

  const validateField = (fieldName: keyof FormData, value: string) => {
    const errors: Record<string, string> = {};
    
    switch (fieldName) {
      case 'incidentType':
        if (!value) errors.incidentType = "Please select the type of concern";
        break;
      case 'description':
        if (value && value.length > 2000) {
          errors.description = `Description is too long (${value.length}/2000 characters)`;
        } else if (value && value.length < 10) {
          errors.description = "Please provide a bit more detail to help us understand the situation";
        }
        break;
      case 'incidentDate':
        if (value && new Date(value) > new Date()) {
          errors.incidentDate = "Please select a date in the past";
        }
        break;
    }
    
    return errors;
  };

  const handleFieldChange = (fieldName: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation after field is touched (only for string fields)
    if (touchedFields[fieldName] && typeof value === 'string') {
      const fieldErrors = validateField(fieldName, value);
      setValidation(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
    }
  };

  const handleFieldBlur = (fieldName: keyof FormData) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const fieldValue = formData[fieldName];
    if (typeof fieldValue === 'string') {
      const fieldErrors = validateField(fieldName, fieldValue);
      setValidation(prev => ({ ...prev, [fieldName]: fieldErrors[fieldName] }));
    }
  };

  const mockEvidenceScore = 45; // Based on form data
  const evidenceLevel = getEvidenceLevel(mockEvidenceScore);

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files) as File[];
    const validFiles = fileArray.filter((file: File) => {
      // File size validation (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles.map((file: File) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      id: Date.now() + Math.random()
    }))]);

    // Simulate upload
    validFiles.forEach((file: File, index: number) => {
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.name === file.name && f.status === 'uploading' 
            ? { ...f, status: 'uploaded' as const } 
            : f
        ));
      }, 1000 + (index * 500));
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success("File removed");
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Supportive header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                What would you like to report?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Thank you for speaking up. Your courage helps create a safer workplace for everyone. 
                Please select the option that best describes your concern.
              </p>
            </div>

            {/* Incident type selection */}
            <div className="space-y-4">
              {incidentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.incidentType === type.id;
                
                return (
                  <div key={type.id} className="relative">
                    <label className={`
                      block cursor-pointer group transition-all duration-200
                      ${isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50 hover:border-gray-300'
                      }
                      border-2 rounded-xl p-6 ${type.recommended ? 'border-green-300 bg-green-50' : 'border-gray-200'}
                    `}>
                      <input
                        type="radio"
                        name="incidentType"
                        value={type.id}
                        checked={isSelected}
                        onChange={(e) => handleFieldChange('incidentType', e.target.value)}
                        className="sr-only"
                      />
                      
                      {/* Recommended badge */}
                      {type.recommended && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Recommended
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <Icon className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                        
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-1 relative">
                          {isSelected && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg mb-2">{type.label}</h3>
                          <p className="text-gray-700 mb-3 leading-relaxed">{type.description}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{type.examples}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Validation error */}
            {validation.incidentType && (
              <div className="text-red-600 text-sm flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {validation.incidentType}
              </div>
            )}

            {/* Helpful note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Not sure which option fits your situation?</p>
                  <p>Choose "I'm not sure" and we'll help guide you through some questions to determine the best category. You can always change this later.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Your Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Information</h2>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-800 font-medium mb-1">Information automatically filled from your HR profile</p>
                    <p className="text-blue-700">Please verify accuracy and update any incorrect information. All fields are editable.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="fullName"
                    value="John Doe"
                    className="border-2 border-blue-200 bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Department
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="department"
                    value="Engineering"
                    className="border-2 border-blue-200 bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager" className="text-sm font-medium text-gray-700">
                    Manager
                    <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">Auto-filled</Badge>
                  </Label>
                  <Input
                    id="manager"
                    value="Jane Smith"
                    className="border-2 border-blue-200 bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactMethod" className="text-sm font-medium text-gray-700">
                    Preferred Contact Method
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={formData.contactMethod} onValueChange={(value) => handleFieldChange('contactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work-email">Work Email (recommended for privacy)</SelectItem>
                      <SelectItem value="personal-email">Personal Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="secure-message">Secure Internal Messaging</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Choose how you'd like to receive updates about your case. Work email is recommended for security.
                  </p>
                </div>
              </div>
            </div>

            {/* Incident Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">About the Incident</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="personInvolved" className="text-sm font-medium text-gray-700">
                    Who was involved in this incident?
                    <button 
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      title="You can be as specific or general as you'd like"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </Label>
                  <Input
                    id="personInvolved"
                    placeholder="Start typing name or select from directory..."
                    value={formData.respondentName}
                    onChange={(e) => handleFieldChange('respondentName', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    You can search our employee directory or enter the name manually. If you prefer not to name the person at this time, you can describe them by role or department.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate" className="text-sm font-medium text-gray-700">
                      When did this occur?
                      <span className="text-gray-500 font-normal ml-1">(approximate is fine)</span>
                    </Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => handleFieldChange('incidentDate', e.target.value)}
                      onBlur={() => handleFieldBlur('incidentDate')}
                      max={new Date().toISOString().split('T')[0]}
                      className={validation.incidentDate ? 'border-red-500' : ''}
                    />
                    {validation.incidentDate && (
                      <p className="text-red-600 text-sm">{validation.incidentDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incidentTime" className="text-sm font-medium text-gray-700">
                      Time (if known)
                      <span className="text-gray-500 font-normal ml-1">(optional)</span>
                    </Label>
                    <Input
                      id="incidentTime"
                      type="time"
                      value={formData.incidentTime}
                      onChange={(e) => handleFieldChange('incidentTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Where did this occur?
                  </Label>
                  <Select value={formData.location} onValueChange={(value) => handleFieldChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office-conference-room">Office - Conference Room</SelectItem>
                      <SelectItem value="office-workstation">Office - Workstation/Desk Area</SelectItem>
                      <SelectItem value="office-break-room">Office - Break Room/Kitchen</SelectItem>
                      <SelectItem value="video-call">Video Call/Virtual Meeting</SelectItem>
                      <SelectItem value="phone-call">Phone Call</SelectItem>
                      <SelectItem value="chat-message">Chat/Message Platform</SelectItem>
                      <SelectItem value="other">Other (please specify in description)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Please describe what happened
                    <span className="text-gray-500 font-normal ml-1">(Share what feels comfortable)</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      onBlur={() => handleFieldBlur('description')}
                      className={`resize-none ${validation.description ? 'border-red-500' : ''}`}
                      placeholder="Describe the incident in as much detail as you feel comfortable sharing. Include what was said or done, how it made you feel, and any other relevant context."
                      maxLength={2000}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1">
                      {formData.description.length}/2000
                    </div>
                  </div>
                  {validation.description && (
                    <p className="text-red-600 text-sm">{validation.description}</p>
                  )}
                  
                  {/* Writing prompts */}
                  <details className="text-xs">
                    <summary className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      Need help getting started? ▼
                    </summary>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-medium text-blue-800 mb-2">Consider including:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• What exactly was said or done?</li>
                        <li>• How did this behavior affect you?</li>
                        <li>• Were there any witnesses present?</li>
                        <li>• Is this part of a pattern of behavior?</li>
                        <li>• Have you documented this incident elsewhere?</li>
                      </ul>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Privacy reminder */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Heart className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-1">Privacy Reminder</p>
                  <p className="text-yellow-700">
                    Only share information you're comfortable providing. You can always add more details later, 
                    and our team will work with whatever level of detail you're able to provide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Supporting Evidence</h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Any evidence you can provide helps ensure a thorough investigation. Everything is optional, 
                and you can always add more later if you remember additional details.
              </p>
            </div>

            {/* Witnesses Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Witnesses</h3>
                  <p className="text-sm text-gray-600">Anyone who may have seen or heard what happened</p>
                </div>
                <div className="flex items-center text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  +30 points each
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="witnesses" className="text-sm font-medium text-gray-700">
                  Were there any witnesses?
                  <span className="text-gray-500 font-normal ml-1">(optional)</span>
                </Label>
                <Textarea
                  id="witnesses"
                  rows={4}
                  value={formData.witnesses}
                  onChange={(e) => handleFieldChange('witnesses', e.target.value)}
                  placeholder="List any witnesses and what they may have seen or heard..."
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Include names if you know them, or describe them by role (e.g., "a colleague from accounting").
                </p>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Supporting Documents</h3>
                  <p className="text-sm text-gray-600">Screenshots, emails, messages, or other documentation</p>
                </div>
                <div className="flex items-center text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  +40 points each
                </div>
              </div>

              {/* Mobile-friendly file upload options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-gray-400 mr-3" />
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Take Photo</p>
                    <p className="text-sm text-gray-500">Use camera</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mr-3" />
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Choose Files</p>
                    <p className="text-sm text-gray-500">From device</p>
                  </div>
                </button>
              </div>

              {/* Drag and drop area */}
              <div 
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
                  ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">
                  {isDragOver ? "Drop files here" : "Drag and drop files here or click to browse"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: PDF, DOC, JPG, PNG, Email files (Max 10MB each)
                </p>
              </div>

              {/* Hidden file inputs */}
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                className="hidden" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.eml,.msg"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <input 
                ref={cameraInputRef}
                type="file" 
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {/* Uploaded files display */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-800">Uploaded Files ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'uploading' ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 p-1 rounded-md"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Context */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Context</h3>
              <p className="text-sm text-gray-600 mb-4">Any other information that might be relevant or helpful</p>
              
              <Textarea 
                rows={4}
                value={formData.additionalContext}
                onChange={(e) => handleFieldChange('additionalContext', e.target.value)}
                className="resize-none"
                placeholder="Any additional information that might be relevant..."
              />
            </div>

            {/* Evidence Assessment */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Evidence Strength Assessment</h3>
                  <p className="text-sm text-gray-600">Our system analyzes the evidence to determine next steps</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      mockEvidenceScore >= 80 ? 'text-green-600' :
                      mockEvidenceScore >= 40 ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {mockEvidenceScore}/100
                    </div>
                    <div className="text-xs text-gray-500">Evidence Points</div>
                  </div>
                </div>
              </div>

              {/* Evidence breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { 
                    label: 'Description', 
                    count: formData.description ? 1 : 0, 
                    points: formData.description ? 30 : 0, 
                    icon: '📝'
                  },
                  { 
                    label: 'Witnesses', 
                    count: formData.witnesses ? 1 : 0, 
                    points: formData.witnesses ? 30 : 0, 
                    icon: '👥'
                  },
                  { 
                    label: 'Documents', 
                    count: uploadedFiles.filter(f => f.status === 'uploaded').length, 
                    points: uploadedFiles.filter(f => f.status === 'uploaded').length * 40, 
                    icon: '📄'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-gray-800">{item.count}</div>
                    <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                    <div className={`text-sm font-medium mt-2 ${
                      item.points > 0 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      +{item.points} points
                    </div>
                  </div>
                ))}
              </div>

              {/* Assessment result */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800 text-lg mb-2">Personal Review Scheduled</h4>
                    <p className="text-blue-700 mb-4">
                      A trained ICC member will personally review your case within 2 hours. Many concerns can be addressed effectively 
                      through various approaches, and we'll work with you to find the best resolution.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="text-sm">
                        <h5 className="font-medium text-blue-800 mb-2">What happens next:</h5>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Personal attention to your specific situation</li>
                          <li>• Discussion of resolution options with you</li>
                          <li>• Additional support and resources</li>
                          <li>• Choice in how to proceed</li>
                        </ul>
                      </div>
                      
                      <div className="text-sm">
                        <h5 className="font-medium text-blue-800 mb-2">Your rights are protected:</h5>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Right to formal investigation anytime</li>
                          <li>• Full confidentiality maintained</li>
                          <li>• No retaliation tolerance</li>
                          <li>• Professional support throughout</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
              <p className="text-gray-600">
                Please review your complaint details before submission.
              </p>
            </div>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Complaint Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Incident Type</Label>
                    <div className="font-medium text-gray-800">
                      {incidentTypes.find(t => t.id === formData.incidentType)?.label || "Not selected"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Person Involved</Label>
                    <div className="font-medium text-gray-800">{formData.respondentName || "Not specified"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Date of Incident</Label>
                    <div className="font-medium text-gray-800">
                      {formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : "Not provided"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Location</Label>
                    <div className="font-medium text-gray-800">{formData.location || "Not provided"}</div>
                  </div>
                </div>
                
                {formData.description && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Description</Label>
                      <div className="text-sm mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                        {formData.description}
                      </div>
                    </div>
                  </>
                )}

                {(formData.witnesses || uploadedFiles.length > 0 || formData.additionalContext) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Supporting Evidence</Label>
                      {formData.witnesses && (
                        <div className="text-sm">
                          <span className="font-medium">Witnesses:</span> {formData.witnesses}
                        </div>
                      )}
                      {uploadedFiles.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Documents:</span> {uploadedFiles.length} files uploaded
                        </div>
                      )}
                      {formData.additionalContext && (
                        <div className="text-sm">
                          <span className="font-medium">Additional Context:</span> {formData.additionalContext}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Case number assigned</p>
                    <p className="text-sm text-green-700">You'll receive a unique case ID for tracking (POSH-2024-XXX)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">ICC member review</p>
                    <p className="text-sm text-green-700">A trained committee member will review your case within 2 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Resolution discussion</p>
                    <p className="text-sm text-green-700">We'll contact you to discuss the best path forward</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Regular updates</p>
                    <p className="text-sm text-green-700">You'll receive status updates throughout the process</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support reminder */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Heart className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Support is always available</p>
                    <p className="text-sm text-blue-700">
                      If you need immediate support, our crisis helpline (1-800-HELP) and live chat are available 24/7.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.incidentType) {
      setValidation({ incidentType: "Please select the type of concern" });
      setTouchedFields({ incidentType: true });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      toast.success(`Step ${currentStep} completed`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const caseId = `POSH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    toast.success(
      `Thank you for your courage in speaking up. Your complaint has been filed successfully. Case ID: ${caseId}`,
      { duration: 5000 }
    );

    // Simulate n8n workflow trigger
    console.log("Triggering n8n workflows:", {
      event: "case_created",
      caseId,
      evidenceScore: mockEvidenceScore,
      needsHumanReview: mockEvidenceScore < 80,
      formData,
      uploadedFiles: uploadedFiles.length,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Company Portal
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link to="/hr-services" className="text-gray-600 hover:text-gray-900 transition-colors">HR Services</Link>
              <span className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium">
                Report a Concern
              </span>
              <Link to="/resources" className="text-gray-600 hover:text-gray-900 transition-colors">Resources</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Auto-save indicator */}
            <div className="flex items-center text-sm text-gray-500">
              {isAutoSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-pulse text-blue-500" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>

            {/* Support button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSupportOptions(!showSupportOptions)}
              className="relative"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Need Help?
            </Button>

            <div className="text-gray-700 font-medium">John Doe</div>
          </div>
        </div>

        {/* Support options dropdown */}
        {showSupportOptions && (
          <div className="absolute top-full right-4 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Immediate Support</h3>
            </div>
            <div className="p-4 space-y-3">
              <a 
                href="tel:1-800-HELP" 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Crisis Helpline</p>
                  <p className="text-sm text-gray-600">1-800-HELP (24/7)</p>
                </div>
              </a>
              <button className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left">
                <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Live Chat</p>
                  <p className="text-sm text-gray-600">Connect with trained counselors</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-3">Report a Workplace Concern</h1>
          <p className="text-gray-600 mb-6">
            Your voice matters. We're here to support you through this process.
          </p>

          {/* Enhanced Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-green-800 text-lg mb-2">Your privacy is protected</h3>
                <p className="text-green-700 mb-4 leading-relaxed">
                  All reports are handled confidentially and in accordance with company policy and legal requirements. 
                  Your information is secure and will only be shared with authorized personnel involved in the resolution process.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700">Encrypted & Secure</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700">No Retaliation Policy</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700">24/7 Support Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Filing Progress</h2>
            <p className="text-sm text-gray-600 mt-1">Estimated time: 5-10 minutes total</p>
          </div>
          
          <Progress value={getStepProgress()} className="mb-4" />
          
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {[
                { number: 1, label: "Type of Concern", timeEstimate: "1-2 min" },
                { number: 2, label: "Details", timeEstimate: "2-3 min" },
                { number: 3, label: "Evidence", timeEstimate: "2-4 min" },
                { number: 4, label: "Review", timeEstimate: "1-2 min" }
              ].map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-200 ${
                        step.number === currentStep 
                          ? 'bg-orange-500 text-white ring-4 ring-orange-200' 
                          : step.number < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {step.number < currentStep ? <CheckCircle className="h-6 w-6" /> : step.number}
                    </div>
                    <div className={`text-sm font-medium mb-1 ${
                      step.number === currentStep ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {step.timeEstimate}
                    </div>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 transition-colors duration-200 ${
                      step.number < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8 shadow-sm">
          {renderStepContent()}
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 order-2 sm:order-1">
            <Button
              onClick={currentStep === 1 ? () => window.history.back() : handlePrev}
              variant="outline"
              className="px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Save & Exit' : 'Back'}
            </Button>

            {currentStep > 1 && (
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                <HelpCircle className="w-4 h-4 mr-2" />
                Need Help?
              </Button>
            )}
          </div>

          <div className="order-1 sm:order-2">
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.incidentType}
                className={`px-8 py-3 font-medium transition-all duration-200 ${
                  currentStep === 1 && formData.incidentType
                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                    : currentStep !== 1
                    ? 'bg-gray-800 hover:bg-gray-900 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                }`}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Submit Report
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress save indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2 text-green-500" />
            Your progress is automatically saved and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileComplaint;