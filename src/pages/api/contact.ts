import type { APIRoute } from "astro";
import { forms, submissions } from "@wix/forms";
import { CONTACT_FORM_ID } from "../../lib/wix/config";
import { projectFormFields, validateSubmission } from "../../lib/contact-form";

export const prerender = false;

/**
 * Server-side submit for the contact form. On Wix-managed Astro the SDK is
 * auto-authenticated, so we call createSubmission directly. Wix enforces field
 * validation server-side; we map any field violations back to the client.
 *
 * We never log the request body (no PII / health data in logs) per project rules.
 */
export const POST: APIRoute = async ({ request }) => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_768) return json({ ok: false, error: "Request is too large." }, 413);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  let fields;
  try {
    fields = projectFormFields(await forms.getForm(CONTACT_FORM_ID));
  } catch {
    return json({ ok: false, error: "The contact form is temporarily unavailable. Please call or email us." }, 503);
  }
  if (!fields.length) {
    return json({ ok: false, error: "The contact form is temporarily unavailable. Please call or email us." }, 503);
  }

  const { data, fieldErrors, hasUnexpectedFields } = validateSubmission(fields, payload);
  if (hasUnexpectedFields) return json({ ok: false, error: "Invalid form data. Please refresh and try again." }, 400);
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
