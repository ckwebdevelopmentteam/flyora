import { publicEnquirySchema } from "@flyora/validators";

// Keep the shared API contract and add the public form's stricter input rules.
export const enquiryFormSchema = publicEnquirySchema.superRefine(
  (data, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (data.fullName.trim().length < 2)
      issue("fullName", "Enter your full name");
    if (!/^\d{10}$/.test(data.phone))
      issue("phone", "Enter a 10-digit phone number");
    if (data.numberOfAdults > 50) issue("numberOfAdults", "Maximum 50 adults");
    if (data.numberOfKids > 20) issue("numberOfKids", "Maximum 20 children");
    if (data.travelDate) {
      const parsed = new Date(`${data.travelDate}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data.travelDate) ||
        !Number.isFinite(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== data.travelDate
      )
        issue("travelDate", "Enter a valid travel date");
    }
  },
);

export function whatsappLink(
  number: string | undefined,
  message: string,
): string | undefined {
  const digits = (number || "").replace(/[+\s()-]/g, "");
  return /^[1-9]\d{7,14}$/.test(digits)
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : undefined;
}
