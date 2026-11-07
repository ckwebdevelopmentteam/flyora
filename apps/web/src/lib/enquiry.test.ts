import { describe, expect, it } from "vitest";
import { enquiryFormSchema, whatsappLink } from "./enquiry";
const valid = {
  fullName: "Ahmed Ali",
  phone: "9876543210",
  serviceId: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
  numberOfAdults: 1,
  numberOfKids: 0,
};
describe("public enquiry input", () => {
  it("keeps notes and valid fields in the shared contract", () => {
    expect(
      enquiryFormSchema.parse({
        ...valid,
        notes: "Vegetarian meals",
        travelDate: "2026-12-23",
      }).notes,
    ).toBe("Vegetarian meals");
  });
  it.each([
    { fullName: "  " },
    { phone: "abcdefghij" },
    { phone: "12345678901" },
    { travelDate: "2026-02-30" },
    { travelDate: "invalid" },
    { numberOfAdults: 0 },
    { numberOfAdults: 51 },
    { numberOfKids: -1 },
    { numberOfKids: 21 },
    { notes: "x".repeat(1001) },
  ])("rejects invalid input %j", (overrides) => {
    expect(
      enquiryFormSchema.safeParse({ ...valid, ...overrides }).success,
    ).toBe(false);
  });
  it("does not invent a WhatsApp destination", () => {
    expect(whatsappLink(undefined, "Hello")).toBeUndefined();
    expect(whatsappLink("invalid", "Hello")).toBeUndefined();
    expect(whatsappLink("+91 98765 43210", "Hi & hello")).toBe(
      "https://wa.me/919876543210?text=Hi%20%26%20hello",
    );
  });
});
