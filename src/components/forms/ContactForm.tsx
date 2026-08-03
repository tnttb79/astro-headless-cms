import { useEffect, useRef, useState } from "react";
import { track } from "../../lib/analytics";
import { fieldError, type FieldModel } from "../../lib/contact-form";

export type { FieldModel } from "../../lib/contact-form";

function inputType(format?: string): string {
  if (format === "EMAIL") return "email";
  if (format === "PHONE") return "tel";
  if (format === "URL") return "url";
  return "text";
}

function autocompleteFor(field: FieldModel): string | undefined {
  if (field.target === "first_name") return "given-name";
  if (field.target === "last_name") return "family-name";
  if (field.format === "EMAIL") return "email";
  if (field.format === "PHONE") return "tel";
  if (field.format === "URL") return "url";
  return undefined;
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

  const setValue = (target: string, v: string) => {
    setValues((current) => ({ ...current, [target]: v }));
    setErrors((current) => {
      if (!current[target]) return current;
      const next = { ...current };
      delete next[target];
      return next;
    });
  };

  const validateOne = (field: FieldModel) => {
    const message = fieldError(field, values[field.target] ?? "");
    setErrors((current) => {
      const next = { ...current };
      if (message) next[field.target] = message;
      else delete next[field.target];
      return next;
    });
  };

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
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus("success");
        track("form_success", "contact_form");
      } else {
        setStatus("error");
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data?.error ?? "Something went wrong. Please try again or call us.");
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

      <div className="form-fields">
      {fields.map((field) => {
        const err = errors[field.target];
        const isTextarea = field.viewFieldType === "TEXT_AREA" || field.target === "message";
        const hintId = field.format === "PHONE" ? `${field.target}-hint` : undefined;
        const describedBy = [err ? `${field.target}-error` : "", hintId ?? ""].filter(Boolean).join(" ") || undefined;
        const common = {
          id: field.target,
          name: field.target,
          value: values[field.target] ?? "",
          required: field.required,
          "aria-invalid": err ? true : undefined,
          "aria-describedby": describedBy,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setValue(field.target, e.target.value),
          onBlur: () => validateOne(field),
        };
        return (
          <div className={`field${isTextarea || field.options?.length ? " field--wide" : ""}`} key={field.target}>
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
            ) : isTextarea ? (
              <textarea {...(common as any)} rows={3} minLength={field.minLength} maxLength={field.maxLength} />
            ) : (
              <input
                {...(common as any)}
                type={inputType(field.format)}
                placeholder={field.placeholder || (field.format === "PHONE" ? "(480) 555-0123" : undefined)}
                autoComplete={autocompleteFor(field)}
                inputMode={field.format === "PHONE" ? "tel" : undefined}
                minLength={field.minLength}
                maxLength={field.maxLength}
                pattern={field.pattern}
              />
            )}
            {field.format === "PHONE" && <p className="field-hint" id={hintId}>10-digit U.S. or + international</p>}
            {err && <p className="field-error" id={`${field.target}-error`}>{err}</p>}
          </div>
        );
      })}
      </div>

      <div className="form-actions">
        <div className="consent">
          <label>
            <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setFormError(""); }} />
            <span>I agree to be contacted about my inquiry.</span>
          </label>
        </div>

        <button className="submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
      </div>

      <style>{`
        .contact-form { max-width: 43rem; }
        .notice { margin-bottom: .85rem; background: var(--dawn-pale); border-left: 3px solid var(--dawn); padding: .6rem .8rem; font-size: .8rem; line-height: 1.45; color: var(--pine-deep); }
        .error-summary { margin: .8rem 0 1rem; padding: .8rem 1rem; border: 2px solid var(--error); border-radius: var(--radius-md); background: color-mix(in srgb, var(--surface) 92%, var(--dawn-pale)); }
        .error-summary h3 { margin: 0 0 .35rem; font-size: 1.2rem; color: var(--error); }
        .error-summary p { margin: 0 0 .4rem; }
        .error-summary ul { margin: .4rem 0 0; }
        .form-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem .85rem; }
        .field--wide { grid-column: 1 / -1; }
        .field label { display: block; font-size: .88rem; font-weight: 600; margin-bottom: .2rem; color: var(--pine-deep); }
        .field input:not([type="checkbox"]), .field textarea, .field select {
          width: 100%; min-height: 42px; padding: .52rem .7rem; border: 1px solid var(--ridge); border-radius: var(--radius-sm); font: inherit; background: var(--surface);
        }
        .field textarea { display: block; min-height: 6.25rem; resize: vertical; }
        .field input[aria-invalid="true"], .field textarea[aria-invalid="true"], .field select[aria-invalid="true"] { border-color: var(--error); border-width: 2px; }
        .field-hint, .field-error { font-size: .76rem; line-height: 1.35; margin: .2rem 0 0; }
        .field-hint { color: var(--muted); }
        .field-error { color: var(--error); }
        .form-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: .85rem; }
        .consent { flex: 1; }
        .consent label { min-height: 42px; font-size: .86rem; font-weight: 400; line-height: 1.4; display: flex; align-items: center; gap: .55rem; color: var(--pine-deep); cursor: pointer; }
        .consent input { width: 1.15rem; height: 1.15rem; margin: 0; flex: 0 0 auto; accent-color: var(--pine); }
        .form-success { background: color-mix(in srgb, var(--surface) 88%, var(--paper)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 1.25rem; }
        .submit { min-height: 42px; flex: 0 0 auto; background: var(--dawn); color: var(--pine-deep); border: 0; padding: .6rem 1.15rem; border-radius: 999px; font-weight: 600; cursor: pointer; }
        .submit:disabled { opacity: 0.6; cursor: default; }
        @media (max-width: 560px) {
          .form-fields { grid-template-columns: 1fr; gap: .65rem; }
          .field--wide { grid-column: auto; }
          .form-actions { align-items: stretch; flex-direction: column; gap: .65rem; }
          .submit { width: 100%; }
        }
      `}</style>
    </form>
  );
}
