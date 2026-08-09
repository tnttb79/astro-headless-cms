import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../../lib/analytics";

/** Shapes passed in from book.astro (server-loaded, CMS-driven). */
export interface WizardService { key: string; label: string; allowsFirstTime: boolean; allowsExisting: boolean }
export interface WizardLocation { slug: string; name: string; status: string; city: string; state: string }
export interface WizardProps {
  services: WizardService[];
  locations: WizardLocation[];
  cancellationPolicyText: string;
  slotMinutes: number;
  maxAdvanceDays: number;
  clinicPhone: string;
}

type PatientType = "first_time" | "existing";
type Step = "patientType" | "service" | "location" | "datetime" | "form" | "success";
type SlotsState = "idle" | "loading" | "loaded" | "error" | "closed" | "configPending";

interface FormValues {
  name: string; email: string; phone: string;
  insuranceCompany: string; insuranceId: string; dateOfBirth: string; message: string;
}
const EMPTY_FORM: FormValues = { name: "", email: "", phone: "", insuranceCompany: "", insuranceId: "", dateOfBirth: "", message: "" };

const phoenixTime = (utcIso: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" }).format(new Date(utcIso));

function todayLocalISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STEP_ORDER: Step[] = ["patientType", "service", "location", "datetime", "form"];

export default function BookingWizard({ services, locations, cancellationPolicyText, slotMinutes, maxAdvanceDays, clinicPhone }: WizardProps) {
  const [step, setStep] = useState<Step>("patientType");
  const [patientType, setPatientType] = useState<PatientType | "">("");
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsState, setSlotsState] = useState<SlotsState>("idle");
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; service: string; location: string; appointmentTime: string } | null>(null);
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const availableServices = useMemo(
    () => services.filter((s) => (patientType === "first_time" ? s.allowsFirstTime : patientType === "existing" ? s.allowsExisting : true)),
    [services, patientType],
  );
  const serviceLabel = services.find((s) => s.key === service)?.label ?? "";
  const locationName = locations.find((l) => l.slug === location)?.name ?? "";

  const beginOnce = () => { if (!started.current) { started.current = true; track("form_start", "direct_booking"); } };

  // Move focus to the step heading on each step change (accessibility).
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  // Load availability whenever we're on the datetime step with a date chosen.
  useEffect(() => {
    if (step !== "datetime" || !date || !location) return;
    let cancelled = false;
    setSlotsState("loading");
    setSlots([]);
    setSlotStart("");
    fetch(`/api/booking/availability?date=${encodeURIComponent(date)}&location=${encodeURIComponent(location)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data?.ok) { setSlotsState("error"); return; }
        if (data.configPending) { setSlotsState("configPending"); return; }
        if (data.closed) { setSlotsState("closed"); return; }
        setSlots(data.slots ?? []);
        setSlotsState("loaded");
      })
      .catch(() => { if (!cancelled) setSlotsState("error"); });
    return () => { cancelled = true; };
  }, [step, date, location]);

  const goTo = (s: Step) => { setFormError(""); setStep(s); };

  function validateForm(): Record<string, string> {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Please enter a valid email address.";
    if (!/^\+?[\d().\-\s]{7,40}$/.test(form.phone.trim())) e.phone = "Please enter a valid phone number.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) e.dateOfBirth = "Please enter your date of birth.";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm();
    setFieldErrors(errs);
    if (Object.keys(errs).length) { setFormError("Please correct the highlighted fields."); track("form_failure", "direct_booking_validation"); return; }

    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientType, service, location, slotStart, ...form }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setResult({ referenceId: data.referenceId, service: data.service, location: data.location, appointmentTime: data.appointmentTime });
        setStep("success");
        track("form_success", "direct_booking");
        return;
      }
      if (data?.code === "SLOT_TAKEN") {
        setFormError("That time was just taken. Please choose another slot.");
        setStep("datetime");
        track("form_failure", "direct_booking_slot_taken");
        return;
      }
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
      setFormError(data?.error ?? "Something went wrong. Please try again or call us.");
      track("form_failure", "direct_booking_server");
    } catch {
      setFormError("Network error. Please try again or call us.");
      track("form_failure", "direct_booking_network");
    } finally {
      setSubmitting(false);
    }
  }

  const setField = (k: keyof FormValues, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((c) => { if (!c[k]) return c; const n = { ...c }; delete n[k]; return n; });
  };

  // ── Success screen ──
  if (step === "success" && result) {
    return (
      <div className="bw">
        <div className="bw-success" role="status">
          <p className="bw-success-badge">Appointment confirmed</p>
          <h3 tabIndex={-1} ref={headingRef}>You're booked, {form.name.split(/\s+/)[0]}.</h3>
          <dl className="bw-summary">
            <div><dt>Service</dt><dd>{result.service}</dd></div>
            <div><dt>Location</dt><dd>{result.location}</dd></div>
            <div><dt>When</dt><dd>{result.appointmentTime}</dd></div>
            <div><dt>Reference</dt><dd>{result.referenceId}</dd></div>
          </dl>
          <p>A confirmation email is on its way to <strong>{form.email}</strong>.</p>
          <p className="bw-policy">{cancellationPolicyText}</p>
        </div>
        <Styles />
      </div>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="bw" onFocus={beginOnce}>
      <ol className="bw-steps" aria-hidden="true">
        {STEP_ORDER.map((s, i) => (
          <li key={s} className={i === stepIndex ? "is-active" : i < stepIndex ? "is-done" : ""} />
        ))}
      </ol>

      {step === "patientType" && (
        <section className="bw-step">
          <h3 tabIndex={-1} ref={headingRef}>Have you visited us before?</h3>
          <div className="bw-choices">
            <button className="bw-choice" onClick={() => { beginOnce(); setPatientType("first_time"); setService(""); goTo("service"); }}>
              <span className="bw-choice-title">First-time patient</span>
              <span className="bw-choice-sub">This is my first visit</span>
            </button>
            <button className="bw-choice" onClick={() => { beginOnce(); setPatientType("existing"); setService(""); goTo("service"); }}>
              <span className="bw-choice-title">Existing patient</span>
              <span className="bw-choice-sub">I've been seen here before</span>
            </button>
          </div>
        </section>
      )}

      {step === "service" && (
        <section className="bw-step">
          <BackBtn onClick={() => goTo("patientType")} />
          <h3 tabIndex={-1} ref={headingRef}>Which service would you like?</h3>
          <div className="bw-choices">
            {availableServices.map((s) => (
              <button key={s.key} className="bw-choice" onClick={() => { setService(s.key); goTo("location"); }} aria-pressed={service === s.key}>
                <span className="bw-choice-title">{s.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "location" && (
        <section className="bw-step">
          <BackBtn onClick={() => goTo("service")} />
          <h3 tabIndex={-1} ref={headingRef}>Choose a location</h3>
          <div className="bw-choices">
            {locations.map((l) => {
              const open = l.status === "open";
              return (
                <button
                  key={l.slug}
                  className={`bw-choice${open ? "" : " is-disabled"}`}
                  disabled={!open}
                  aria-disabled={!open}
                  onClick={() => { if (open) { setLocation(l.slug); setDate(""); goTo("datetime"); } }}
                >
                  <span className="bw-choice-title">{l.name}</span>
                  <span className="bw-choice-sub">{open ? `${l.city}, ${l.state}` : "Coming soon"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === "datetime" && (
        <section className="bw-step">
          <BackBtn onClick={() => goTo("location")} />
          <h3 tabIndex={-1} ref={headingRef}>Pick a date and time</h3>
          {formError && <p className="bw-inline-error" role="alert">{formError}</p>}
          <label className="bw-date">
            <span>Date</span>
            <input
              type="date"
              value={date}
              min={todayLocalISO(0)}
              max={todayLocalISO(maxAdvanceDays)}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {!date && <p className="bw-hint">Choose a date to see available {slotMinutes}-minute times.</p>}
          {date && slotsState === "loading" && <p className="bw-hint">Finding available times…</p>}
          {date && slotsState === "error" && <p className="bw-inline-error" role="alert">We couldn't load times right now. Please try again, or call {clinicPhone}.</p>}
          {date && slotsState === "configPending" && <p className="bw-hint">Online booking is being set up. Please call {clinicPhone} to book.</p>}
          {date && slotsState === "closed" && <p className="bw-hint">The clinic isn't open for booking on that date. Please choose another day.</p>}
          {date && slotsState === "loaded" && slots.length === 0 && <p className="bw-hint">No times are available on that date. Please choose another day.</p>}
          {date && slotsState === "loaded" && slots.length > 0 && (
            <div className="bw-slots" role="group" aria-label="Available times">
              {slots.map((iso) => (
                <button key={iso} className={`bw-slot${slotStart === iso ? " is-selected" : ""}`} onClick={() => { setSlotStart(iso); goTo("form"); }}>
                  {phoenixTime(iso)}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {step === "form" && (
        <section className="bw-step">
          <BackBtn onClick={() => goTo("datetime")} />
          <h3 tabIndex={-1} ref={headingRef}>Your details</h3>
          <p className="bw-review">
            {serviceLabel} · {locationName} · <strong>{slotStart && `${new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "short", month: "short", day: "numeric" }).format(new Date(slotStart))} at ${phoenixTime(slotStart)}`}</strong>
          </p>

          {formError && <p className="bw-inline-error" role="alert">{formError}</p>}

          <form onSubmit={submit} noValidate className="bw-form">
            <Field id="name" label="Name" required value={form.name} err={fieldErrors.name} onChange={(v) => setField("name", v)} autoComplete="name" />
            <Field id="email" label="Email" required type="email" value={form.email} err={fieldErrors.email} onChange={(v) => setField("email", v)} autoComplete="email" />
            <Field id="phone" label="Phone number" required type="tel" value={form.phone} err={fieldErrors.phone} onChange={(v) => setField("phone", v)} autoComplete="tel" />
            <Field id="dateOfBirth" label="Date of birth" required type="date" value={form.dateOfBirth} err={fieldErrors.dateOfBirth} onChange={(v) => setField("dateOfBirth", v)} autoComplete="bday" />
            <Field id="insuranceCompany" label="Insurance company" value={form.insuranceCompany} err={fieldErrors.insuranceCompany} onChange={(v) => setField("insuranceCompany", v)} />
            <Field id="insuranceId" label="Insurance ID #" value={form.insuranceId} err={fieldErrors.insuranceId} onChange={(v) => setField("insuranceId", v)} />
            <div className="bw-field bw-field--wide">
              <label htmlFor="message">Message <span className="bw-optional">(optional)</span></label>
              <textarea id="message" rows={3} maxLength={2000} value={form.message} onChange={(e) => setField("message", e.target.value)} />
            </div>

            <p className="bw-policy bw-field--wide">{cancellationPolicyText}</p>

            <button className="bw-submit bw-field--wide" type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Book appointment"}
            </button>
          </form>
        </section>
      )}

      <Styles />
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return <button type="button" className="bw-back" onClick={onClick}>← Back</button>;
}

function Field({ id, label, value, onChange, err, type = "text", required = false, autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; err?: string; type?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div className="bw-field">
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : <span className="bw-optional"> (optional)</span>}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {err && <p className="bw-field-error" id={`${id}-error`}>{err}</p>}
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      .bw { max-width: 44rem; }
      .bw-steps { list-style: none; display: flex; gap: .4rem; padding: 0; margin: 0 0 1.4rem; }
      .bw-steps li { height: 4px; flex: 1; border-radius: 999px; background: var(--line); }
      .bw-steps li.is-active { background: var(--dawn); }
      .bw-steps li.is-done { background: var(--pine); }
      .bw-step h3 { font-size: var(--step-1); margin: 0 0 1rem; }
      .bw-back { background: none; border: 0; color: var(--pine); font: 600 var(--step--1)/1 var(--font-body); cursor: pointer; padding: .2rem 0; margin-bottom: .6rem; }
      .bw-choices { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .7rem; }
      .bw-choice { display: flex; flex-direction: column; align-items: flex-start; gap: .2rem; text-align: left; padding: 1rem 1.1rem; min-height: 64px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); cursor: pointer; transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease; }
      .bw-choice:hover:not(:disabled) { border-color: var(--pine); transform: translateY(-1px); box-shadow: var(--shadow); }
      .bw-choice.is-disabled { opacity: .55; cursor: not-allowed; border-style: dashed; }
      .bw-choice-title { font-weight: 600; color: var(--pine-deep); }
      .bw-choice-sub { font-size: var(--step--1); color: var(--muted); }
      .bw-date { display: flex; flex-direction: column; gap: .3rem; max-width: 16rem; font-weight: 600; color: var(--pine-deep); }
      .bw-date input { min-height: 44px; padding: .5rem .7rem; border: 1px solid var(--ridge); border-radius: var(--radius-sm); font: inherit; background: var(--surface); }
      .bw-hint { color: var(--muted); margin: 1rem 0 0; }
      .bw-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(5.2rem, 1fr)); gap: .5rem; margin-top: 1rem; }
      .bw-slot { min-height: 44px; padding: .5rem; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface); font: 600 var(--step--1)/1 var(--font-body); color: var(--pine-deep); cursor: pointer; }
      .bw-slot:hover, .bw-slot.is-selected { border-color: var(--pine); background: color-mix(in srgb, var(--pine) 10%, var(--surface)); }
      .bw-review { color: var(--muted); margin: 0 0 1rem; padding-bottom: .8rem; border-bottom: 1px solid var(--line); }
      .bw-form { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .7rem .85rem; }
      .bw-field--wide { grid-column: 1 / -1; }
      .bw-field label { display: block; font-size: .88rem; font-weight: 600; margin-bottom: .2rem; color: var(--pine-deep); }
      .bw-optional { font-weight: 400; color: var(--muted); }
      .bw-field input, .bw-field textarea { width: 100%; min-height: 44px; padding: .52rem .7rem; border: 1px solid var(--ridge); border-radius: var(--radius-sm); font: inherit; background: var(--surface); }
      .bw-field textarea { min-height: 5.5rem; resize: vertical; }
      .bw-field input[aria-invalid="true"] { border-color: var(--error); border-width: 2px; }
      .bw-field-error { font-size: .76rem; color: var(--error); margin: .2rem 0 0; }
      .bw-inline-error { background: color-mix(in srgb, var(--surface) 92%, var(--dawn-pale)); border-left: 3px solid var(--error); padding: .55rem .75rem; color: var(--error); font-size: .86rem; margin: 0 0 1rem; border-radius: var(--radius-sm); }
      .bw-policy { font-size: .82rem; color: var(--muted); background: var(--dawn-pale); border-left: 3px solid var(--dawn); padding: .6rem .8rem; border-radius: var(--radius-sm); margin: .2rem 0 0; }
      .bw-submit { min-height: 46px; margin-top: .3rem; background: var(--dawn); color: var(--pine-deep); border: 0; border-radius: 999px; font-weight: 600; cursor: pointer; }
      .bw-submit:disabled { opacity: .6; cursor: default; }
      .bw-success { background: color-mix(in srgb, var(--surface) 88%, var(--paper)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 1.4rem; }
      .bw-success-badge { display: inline-block; font: 600 var(--step--1)/1.2 var(--font-utility); text-transform: uppercase; letter-spacing: .04em; color: var(--pine-deep); background: color-mix(in srgb, var(--pine) 12%, var(--surface)); padding: .35rem .65rem; border-radius: 999px; margin: 0 0 .8rem; }
      .bw-success h3 { font-size: var(--step-1); margin: 0 0 1rem; }
      .bw-summary { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .6rem 1rem; margin: 0 0 1rem; }
      .bw-summary dt { font-size: .76rem; text-transform: uppercase; letter-spacing: .03em; color: var(--muted); }
      .bw-summary dd { margin: .1rem 0 0; font-weight: 600; color: var(--pine-deep); }
      @media (max-width: 560px) {
        .bw-choices, .bw-form, .bw-summary { grid-template-columns: 1fr; }
        .bw-field--wide { grid-column: auto; }
      }
    `}</style>
  );
}
