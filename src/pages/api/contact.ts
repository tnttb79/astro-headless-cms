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

  // Only forward known-safe string values; keys must equal the schema targets.
  const allowed = ["first_name", "last_name", "email", "phone", "message"];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    const v = payload[key];
    if (typeof v === "string" && v.trim()) data[key] = v.trim();
  }

  try {
    const result = await submissions.createSubmission({
      formId: CONTACT_FORM_ID,
      submissions: data,
    } as any);
    return json({ ok: true, id: (result as any)?._id ?? null });
  } catch (err: any) {
    const violations = err?.details?.validationError?.fieldViolations ?? [];
    const fieldErrors: Record<string, string> = {};
    for (const v of violations) {
      for (const fe of v?.data?.errors ?? []) {
        if (fe.errorPath && !fieldErrors[fe.errorPath]) {
          fieldErrors[fe.errorPath] = fe.errorMessage ?? "Invalid value";
        }
      }
    }
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    return json(
      {
        ok: false,
        error: hasFieldErrors ? "Please correct the highlighted fields." : "Something went wrong. Please try again or call us.",
        fieldErrors,
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
