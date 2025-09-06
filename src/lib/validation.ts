// Form validation utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export const validateField = (value: any, rule: ValidationRule): string | null => {
  // Required field check
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.trim().length < rule.minLength) {
      return `Minimum ${rule.minLength} characters required (current: ${value.length})`;
    }

    if (rule.maxLength && value.trim().length > rule.maxLength) {
      return `Maximum ${rule.maxLength} characters allowed (current: ${value.length})`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: ValidationRules): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([fieldName, rule]) => {
    const value = data[fieldName];
    const error = validateField(value, rule);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  description: { required: true, minLength: 50 },
  shortText: { required: true, minLength: 2, maxLength: 100 },
  longText: { required: true, minLength: 10, maxLength: 2000 },
  rationale: { required: true, minLength: 100, maxLength: 1000 }
};

// Complaint form validation rules
export const complaintFormRules: ValidationRules = {
  incidentType: commonRules.required,
  respondentName: { required: true, minLength: 2, maxLength: 100 },
  incidentDate: commonRules.required,
  description: commonRules.description,
  location: { required: true, minLength: 2, maxLength: 200 },
  contactMethod: commonRules.required
};

// Human review form validation rules
export const reviewFormRules: ValidationRules = {
  credibilityAssessment: {
    required: true,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 5) {
        return 'Please select a credibility assessment (1-5)';
      }
      return null;
    }
  },
  investigationPathway: {
    required: true,
    custom: (value: string) => {
      const validPathways = ['formal', 'mediation', 'coaching', 'dismissed'];
      if (!validPathways.includes(value)) {
        return 'Please select a valid investigation pathway';
      }
      return null;
    }
  },
  rationale: commonRules.rationale
};

export default {
  validateField,
  validateForm,
  commonRules,
  complaintFormRules,
  reviewFormRules
};