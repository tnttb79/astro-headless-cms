import type { APIRoute } from "astro";
import { submissions } from "@wix/forms";
import { CONTACT_FORM_ID } from "../../lib/wix/config";

export const prerender = false;

/**
 * Server-side submit for the contact form. On Wix-managed Astro the SDK is
 * auto-authenticated, so we call createSubmission directly. Wix enforces field
 * validation server-side; we map any field violations back to the client.
 *
 * We never log the request body (no PII / health data in logs) per project rules.
 */
export const POST: APIRoute = async ({ request }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const rules = {
    first_name: { required: true, max: 80, label: "First name" },
    last_name: { required: true, max: 80, label: "Last name" },
    email: { required: true, max: 254, label: "Email" },
    phone: { required: false, max: 40, label: "Phone" },
    message: { required: true, max: 2000, label: "Message" },
  } as const;
  const data: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};
  for (const [key, rule] of Object.entries(rules)) {
    const v = payload[key];
    if (v != null && typeof v !== "string") {
      fieldErrors[key] = `${rule.label} must be text.`;
      continue;
    }
    const clean = typeof v === "string" ? v.trim() : "";
    if (rule.required && !clean) fieldErrors[key] = `${rule.label} is required.`;
    else if (clean.length > rule.max) fieldErrors[key] = `${rule.label} must be at most ${rule.max} characters.`;
    else if (clean) data[key] = clean;
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fieldErrors.email = "Please enter a valid email address.";
  if (data.phone && !/^[+()\-\s\d]{7,}$/.test(data.phone)) fieldErrors.phone = "Please enter a valid phone number.";
  if (Object.keys(fieldErrors).length) return json({ ok:false,error:"Please correct the highlighted fields.",fieldErrors },422);

  try {
    const result = await submissions.createSubmission({
      formId: CONTACT_FORM_ID,
      submissions: data,
    } as any);
    return json({ ok: true, id: (result as any)?._id ?? null });
  } catch (err: any) {
    const violations = err?.details?.validationError?.fieldViolations ?? [];
    const wixFieldErrors: Record<string, string> = {};
    for (const v of violations) {
      for (const fe of v?.data?.errors ?? []) {
        if (fe.errorPath && !wixFieldErrors[fe.errorPath]) {
          wixFieldErrors[fe.errorPath] = fe.errorMessage ?? "Invalid value";
        }
      }
    }
    const hasFieldErrors = Object.keys(wixFieldErrors).length > 0;
    return json(
      {
        ok: false,
        error: hasFieldErrors ? "Please correct the highlighted fields." : "Something went wrong. Please try again or call us.",
        fieldErrors: wixFieldErrors,
      },
      hasFieldErrors ? 422 : 500
    );
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
