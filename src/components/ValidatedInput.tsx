import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidatedFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  touched?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const ValidatedField = ({ 
  label, 
  error, 
  required = false, 
  touched = false, 
  children, 
  className 
}: ValidatedFieldProps) => {
  const hasError = touched && error;
  const isValid = touched && !error;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hasError && <AlertCircle className="h-3 w-3 text-destructive" />}
        {isValid && <CheckCircle className="h-3 w-3 text-green-600" />}
      </Label>
      <div className={cn(
        "relative",
        hasError && "ring-2 ring-destructive/20 rounded-md"
      )}>
        {children}
      </div>
      {hasError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  touched?: boolean;
}

export const ValidatedInput = ({ 
  label, 
  error, 
  required = false, 
  touched = false, 
  className,
  ...props 
}: ValidatedInputProps) => {
  const hasError = touched && error;

  return (
    <ValidatedField 
      label={label} 
      error={error} 
      required={required} 
      touched={touched}
    >
      <Input
        className={cn(
          hasError && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
    </ValidatedField>
  );
};

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  touched?: boolean;
}

export const ValidatedTextarea = ({ 
  label, 
  error, 
  required = false, 
  touched = false, 
  className,
  ...props 
}: ValidatedTextareaProps) => {
  const hasError = touched && error;

  return (
    <ValidatedField 
      label={label} 
      error={error} 
      required={required} 
      touched={touched}
    >
      <Textarea
        className={cn(
          hasError && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
    </ValidatedField>
  );
};

interface ValidatedSelectProps {
  label: string;
  error?: string;
  required?: boolean;
  touched?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

export const ValidatedSelect = ({ 
  label, 
  error, 
  required = false, 
  touched = false,
  value,
  onValueChange,
  placeholder,
  children
}: ValidatedSelectProps) => {
  const hasError = touched && error;

  return (
    <ValidatedField 
      label={label} 
      error={error} 
      required={required} 
      touched={touched}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(
          hasError && "border-destructive focus:ring-destructive"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </ValidatedField>
  );
};