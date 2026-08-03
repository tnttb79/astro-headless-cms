export interface FieldModel {
  target: string;
  label: string;
  placeholder: string;
  required: boolean;
  format?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  viewFieldType?: string;
  options?: { value: string; label: string }[];
}

export interface SubmissionValidation {
  data: Record<string, string>;
  fieldErrors: Record<string, string>;
  hasUnexpectedFields: boolean;
}

const FIELD_FALLBACK_LIMITS: Record<string, number> = {
  first_name: 80,
  last_name: 80,
  email: 254,
  phone: 40,
  message: 2000,
};

export function projectFormFields(form: unknown): FieldModel[] {
  const rawFields = Array.isArray((form as { fields?: unknown[] } | null)?.fields)
    ? (form as { fields: any[] }).fields
    : [];

  return rawFields
    .filter((field) => typeof field?.target === "string" && field.target && !field.hidden)
    .map((field) => ({
      target: field.target,
      label: field.view?.label ?? field.target,
      placeholder: field.view?.placeholder ?? "",
      required: field.validation?.required ?? false,
      format: field.validation?.string?.format,
      minLength: field.validation?.string?.minLength,
      maxLength: field.validation?.string?.maxLength ?? FIELD_FALLBACK_LIMITS[field.target],
      pattern: field.validation?.string?.pattern,
      viewFieldType: field.view?.fieldType,
      options: field.view?.options?.map((option: any) => ({
        value: option.value ?? option.label ?? "",
        label: option.label ?? option.value ?? "",
      })),
    }));
}

/**
 * Converts a valid phone number to the compact format Wix Forms accepts.
 * Local 10-digit numbers default to the US country code; international
 * numbers must include their leading plus sign.
 */
export function normalizePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "";
  if (!/^\+?[\d().\-\s]+$/.test(value) || value.slice(1).includes("+")) return null;

  const digits = value.replace(/\D/g, "");
  if (value.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function fieldError(field: FieldModel, raw: string): string {
  const value = (raw ?? "").trim();
  if (field.required && !value) return `${field.label} is required.`;
  if (!value) return "";
  if (field.minLength && value.length < field.minLength) {
    return `${field.label} must be at least ${field.minLength} characters.`;
  }
  if (field.maxLength && value.length > field.maxLength) {
    return `${field.label} must be at most ${field.maxLength} characters.`;
  }
  if (field.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address.";
  }
  if (field.format === "URL" && !/^https?:\/\/.+/i.test(value)) {
    return "Please enter a valid URL.";
  }
  if (field.format === "PHONE" && normalizePhone(value) === null) {
    return "Enter a 10-digit U.S. number or an international number beginning with +.";
  }
  if (field.pattern) {
    try {
      if (!new RegExp(field.pattern).test(value)) return `${field.label} is not in the expected format.`;
    } catch {
      // A malformed dashboard pattern must not make the contact form unusable.
    }
  }
  return "";
}

export function validateSubmission(fields: FieldModel[], payload: Record<string, unknown>): SubmissionValidation {
  const allowedTargets = new Set(fields.map((field) => field.target));
  const hasUnexpectedFields = Object.keys(payload).some((key) => !allowedTargets.has(key));
  const data: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of fields) {
    const raw = payload[field.target];
    if (raw != null && typeof raw !== "string") {
      fieldErrors[field.target] = `${field.label} must be text.`;
      continue;
    }

    const value = typeof raw === "string" ? raw.trim() : "";
    const error = fieldError(field, value);
    if (error) {
      fieldErrors[field.target] = error;
      continue;
    }
    if (!value) continue;

    data[field.target] = field.format === "PHONE" ? normalizePhone(value) ?? value : value;
  }

  return { data, fieldErrors, hasUnexpectedFields };
}
