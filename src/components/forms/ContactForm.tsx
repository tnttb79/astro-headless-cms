import { useEffect, useRef, useState } from "react";
import { track } from "../../lib/analytics";

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

function fieldError(field: FieldModel, raw: string): string {
  const v = (raw ?? "").trim();
  if (field.required && !v) return `${field.label} is required.`;
  if (!v) return "";
  if (field.minLength && v.length < field.minLength) return `${field.label} must be at least ${field.minLength} characters.`;
  if (field.maxLength && v.length > field.maxLength) return `${field.label} must be at most ${field.maxLength} characters.`;
  if (field.format === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
  if (field.format === "URL" && !/^https?:\/\/.+/.test(v)) return "Please enter a valid URL.";
  if (field.format === "PHONE" && !/^[+()\-\s\d]{7,}$/.test(v)) return "Please enter a valid phone number.";
  if (field.pattern && !new RegExp(field.pattern).test(v)) return `${field.label} is not in the expected format.`;
  return "";
}

function inputType(format?: string): string {
  if (format === "EMAIL") return "email";
  if (format === "PHONE") return "tel";
  if (format === "URL") return "url";
  return "text";
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({ fields }: { fields: FieldModel[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const started = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formError || Object.keys(errors).length > 0) errorSummary.current?.focus();
  }, [formError, errors]);

  const setValue = (target: string, v: string) => setValues((s) => ({ ...s, [target]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      const msg = fieldError(f, values[f.target] ?? "");
      if (msg) nextErrors[f.target] = msg;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please correct the highlighted fields.");
      track("form_failure", "contact_form_validation");
      return;
    }
    if (!consent) {
      setFormError("Please confirm you agree to be contacted.");
      track("form_failure", "contact_form_consent");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        track("form_success", "contact_form");
      } else {
        setStatus("error");
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? "Something went wrong.");
        track("form_failure", "contact_form_server");
      }
    } catch {
      setStatus("error");
      setFormError("Network error. Please try again or call us.");
      track("form_failure", "contact_form_network");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <h3>Thank you — your message has been sent.</h3>
        <p>We'll be in touch soon. For urgent matters, please call the clinic.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate onFocus={() => { if (!started.current) { started.current = true; track("form_start", "contact_form"); } }}>
      <p className="notice">
        Please do not include private medical details or sensitive health information in this form.
      </p>

      {(formError || Object.keys(errors).length > 0) && (
        <div ref={errorSummary} className="error-summary" role="alert" aria-labelledby="error-summary-title" tabIndex={-1}>
          <h3 id="error-summary-title">Please check the form</h3>
          {formError && <p>{formError}</p>}
          {Object.entries(errors).length > 0 && <ul>{Object.entries(errors).map(([target,message]) => <li key={target}><a href={`#${target}`}>{message}</a></li>)}</ul>}
        </div>
      )}

      {fields.map((field) => {
        const err = errors[field.target];
        const common = {
          id: field.target,
          name: field.target,
          value: values[field.target] ?? "",
          required: field.required,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": err ? `${field.target}-error` : undefined,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setValue(field.target, e.target.value),
        };
        return (
          <div className="field" key={field.target}>
            <label htmlFor={field.target}>
              {field.label}{field.required && <span aria-hidden="true"> *</span>}
            </label>
            {field.options?.length ? (
              <select {...(common as any)}>
                <option value="" disabled>{field.placeholder || "Select…"}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : field.viewFieldType === "TEXT_AREA" || field.target === "message" ? (
              <textarea {...(common as any)} rows={4} minLength={field.minLength} maxLength={field.maxLength} />
            ) : (
              <input
                {...(common as any)}
                type={inputType(field.format)}
                placeholder={field.placeholder}
                minLength={field.minLength}
                maxLength={field.maxLength}
                pattern={field.pattern}
              />
            )}
            {err && <p className="field-error" id={`${field.target}-error`}>{err}</p>}
          </div>
        );
      })}

      <div className="field consent">
        <label>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {" "}I agree to be contacted about my inquiry.
        </label>
      </div>

      <button className="submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      <style>{`
        .contact-form { max-width: 40rem; }
        .notice { background: var(--dawn-pale); border-left: 4px solid var(--dawn); padding: .8rem 1rem; font-size: .88rem; color: var(--pine-deep); }
        .error-summary { margin: 1rem 0 1.4rem; padding: 1rem 1.2rem; border: 2px solid var(--error); border-radius: var(--radius-md); background: color-mix(in srgb, var(--surface) 92%, var(--dawn-pale)); }
        .error-summary h3 { margin: 0 0 .35rem; font-size: 1.2rem; color: var(--error); }
        .error-summary p { margin: 0 0 .4rem; }
        .error-summary ul { margin: .4rem 0 0; }
        .field { margin-bottom: 1rem; }
        .field label { display: block; font-weight: 600; margin-bottom: 0.3rem; color: var(--pine-deep); }
        .field input, .field textarea, .field select {
          width: 100%; min-height: 46px; padding: 0.7rem 0.8rem; border: 1px solid var(--ridge); border-radius: var(--radius-sm); font: inherit; background: var(--surface);
        }
        .field textarea { min-height: 9rem; }
        .field input[aria-invalid="true"], .field textarea[aria-invalid="true"], .field select[aria-invalid="true"] { border-color: var(--error); border-width: 2px; }
        .field-error { color: var(--error); font-size: 0.85rem; margin: 0.3rem 0 0; }
        .consent label { min-height: 44px; font-weight: 400; display: flex; align-items: center; gap: 0.3rem; }
        .form-success { background: color-mix(in srgb, var(--surface) 88%, var(--paper)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 1.25rem; }
        .submit { min-height: 46px; background: var(--dawn); color: var(--pine-deep); border: 0; padding: 0.75rem 1.35rem; border-radius: 999px; font-weight: 600; cursor: pointer; }
        .submit:disabled { opacity: 0.6; cursor: default; }
      `}</style>
    </form>
  );
}
