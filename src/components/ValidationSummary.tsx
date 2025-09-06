import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ValidationSummaryProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  className?: string;
}

export const ValidationSummary = ({ errors, touched, className }: ValidationSummaryProps) => {
  const touchedErrors = Object.entries(errors).filter(([field]) => touched[field]);
  
  if (touchedErrors.length === 0) {
    return null;
  }

  return (
    <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Please fix the following issues:
          <Badge variant="destructive" className="ml-auto">
            {touchedErrors.length} error{touchedErrors.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {touchedErrors.map(([field, error]) => (
          <div key={field} className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="text-muted-foreground ml-1">{error}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface StepValidationProps {
  currentStep: number;
  totalSteps: number;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  stepFields: Record<number, string[]>;
}

export const StepValidation = ({ 
  currentStep, 
  totalSteps, 
  errors, 
  touched, 
  stepFields 
}: StepValidationProps) => {
  const getStepStatus = (step: number) => {
    const fields = stepFields[step] || [];
    const stepErrors = fields.filter(field => errors[field] && touched[field]);
    const stepTouched = fields.some(field => touched[field]);
    
    if (stepErrors.length > 0) return 'error';
    if (stepTouched && stepErrors.length === 0) return 'complete';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const status = getStepStatus(step);
        const isActive = step === currentStep;
        
        return (
          <div key={step} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive 
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/20' 
                  : status === 'complete' 
                    ? 'bg-green-600 text-white' 
                    : status === 'error'
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {status === 'complete' ? (
                <CheckCircle className="h-4 w-4" />
              ) : status === 'error' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div 
                className={`
                  w-12 h-0.5 mx-2
                  ${status === 'complete' ? 'bg-green-600' : 'bg-muted'}
                `} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};