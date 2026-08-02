import { useState } from "react";

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
    if (Object.keys(nextErrors).length > 0) return;
    if (!consent) {
      setFormError("Please confirm you agree to be contacted.");
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
      } else {
        setStatus("error");
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setFormError("Network error. Please try again or call us.");
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
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <p className="notice">
        Please do not include private medical details or sensitive health information in this form.
      </p>

      {fields.map((field) => {
        const err = errors[field.target];
        const common = {
          id: field.target,
          name: field.target,
          value: values[field.target] ?? "",
          required: field.required,
          "aria-invalid": err ? true : undefined,
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
            {err && <p className="field-error">{err}</p>}
          </div>
        );
      })}

      <div className="field consent">
        <label>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {" "}I agree to be contacted about my inquiry.
        </label>
      </div>

      {formError && <p className="form-error" role="alert">{formError}</p>}

      <button className="btn" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      <style>{`
        .contact-form { max-width: 34rem; }
        .notice { background: #fff7e6; border: 1px solid #f0d9a8; border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.88rem; color: #7a5c14; }
        .field { margin-bottom: 1rem; }
        .field label { display: block; font-weight: 600; margin-bottom: 0.3rem; color: #244a40; }
        .field input, .field textarea, .field select {
          width: 100%; padding: 0.6rem 0.7rem; border: 1px solid #cdd6d1; border-radius: 8px; font: inherit; background: #fff;
        }
        .field input[aria-invalid="true"], .field textarea[aria-invalid="true"] { border-color: #c0392b; }
        .field-error { color: #c0392b; font-size: 0.85rem; margin: 0.3rem 0 0; }
        .consent label { font-weight: 400; display: flex; align-items: center; gap: 0.3rem; }
        .form-error { color: #c0392b; font-weight: 600; }
        .form-success { background: #eaf1ee; border: 1px solid #bcd6cb; border-radius: 12px; padding: 1.25rem; }
        .btn { background: #2f5d50; color: #fff; border: 0; padding: 0.7rem 1.3rem; border-radius: 999px; font-weight: 600; cursor: pointer; }
        .btn:disabled { opacity: 0.6; cursor: default; }
      `}</style>
    </form>
  );
}
