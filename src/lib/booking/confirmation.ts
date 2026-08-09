/**
 * SERVER-ONLY. On a successful booking, inserts a row into the `BookingEmails`
 * CMS collection. A Wix Automation (trigger: "Item added" to BookingEmails →
 * action: Send email) sends the patient the confirmation. Using a real CMS
 * collection — rather than a Wix Form — means every field (service, location,
 * appointment time, reference, email) is a first-class collection field the
 * Automation can insert into the email; Wix Form *custom* fields cannot be used
 * that way (they show a "not in the collection" warning).
 *
 * Best-effort: a failure here never fails the booking (the Google event +
 * Appointments record are the authoritative outcome). Only email-safe fields
 * are written here — DOB / insurance / message stay in the ADMIN Appointments
 * collection.
 */
import { items } from "@wix/data";
import { auth } from "@wix/essentials";

const COLLECTION = "BookingEmails";

export interface ConfirmationInput {
  firstName: string;
  email: string;
  service: string; // human label
  location: string; // human label
  appointmentTime: string; // Phoenix-readable label
  referenceId: string;
  clinicAddress: string; // one-line address of the booked clinic
  clinicPhone: string; // phone of the booked clinic
}

export async function sendBookingConfirmation(input: ConfirmationInput): Promise<void> {
  try {
    await auth.elevate(items.insert)(COLLECTION, {
      firstName: input.firstName,
      email: input.email,
      service: input.service,
      location: input.location,
      appointmentTime: input.appointmentTime,
      referenceId: input.referenceId,
      clinicAddress: input.clinicAddress,
      clinicPhone: input.clinicPhone,
      status: "sent",
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[booking] BookingEmails insert failed (confirmation email may not send)", err);
  }
}
