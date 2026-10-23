import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnquiryModal } from "./EnquiryModal";
import { FloatingWhatsApp } from "./FloatingWhatsApp";
const service = {
  id: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
  name: "Holidays",
  slug: "holidays",
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async () => response({ data: [service] })),
  );
  vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
async function fill() {
  await screen.findByRole("option", { name: "Holidays" });
  fireEvent.change(screen.getByLabelText("Full Name *"), {
    target: { value: "  Ahmed Ali  " },
  });
  fireEvent.change(screen.getByLabelText("Phone / WhatsApp Number *"), {
    target: { value: "9876543210" },
  });
}
describe("public capture", () => {
  it("shows a real service loading error, blocks submission and can retry", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ message: "Unavailable" }, 503),
    );
    render(<EnquiryModal isOpen onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Services are unavailable"),
    );
    expect(
      screen.getByRole("button", { name: "Submit Travel Enquiry" }),
    ).toHaveProperty("disabled", true);
    expect(
      screen.queryByRole("option", { name: "Visa Assistance" }),
    ).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Retry loading services" }),
    );
    expect(
      await screen.findByRole("option", { name: "Holidays" }),
    ).toBeTruthy();
  });
  it("only confirms a real returned reference and submits trimmed contract fields", async () => {
    render(<EnquiryModal isOpen onClose={vi.fn()} />);
    await fill();
    fireEvent.change(
      screen.getByLabelText("Special Preferences or Itinerary Requests"),
      { target: { value: "Vegetarian meals" } },
    );
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        { data: { success: true, leadId: "real-ref", message: "Received" } },
        201,
      ),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Submit Travel Enquiry" }),
    );
    expect(await screen.findByText("real-ref")).toBeTruthy();
    const options = vi.mocked(fetch).mock.calls[1][1];
    expect(JSON.parse(String(options?.body))).toMatchObject({
      fullName: "Ahmed Ali",
      serviceId: service.id,
      notes: "Vegetarian meals",
    });
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();
  });
  it("rejects malformed success payloads instead of inventing a reference", async () => {
    render(<EnquiryModal isOpen onClose={vi.fn()} />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(response({ data: {} }, 201));
    await userEvent.click(
      screen.getByRole("button", { name: "Submit Travel Enquiry" }),
    );
    expect(await screen.findByText(/We could not confirm/)).toBeTruthy();
    expect(screen.queryByText("Enquiry Submitted!")).toBeNull();
  });
  it("prevents duplicate submissions and closing during an in-flight write", async () => {
    const onClose = vi.fn();
    render(<EnquiryModal isOpen onClose={onClose} />);
    await fill();
    let resolve!: (value: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const button = screen.getByRole("button", {
      name: "Submit Travel Enquiry",
    });
    fireEvent.submit(button.closest("form")!);
    fireEvent.submit(button.closest("form")!);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole("button", { name: "Close enquiry" }),
    ).toHaveProperty("disabled", true);
    resolve(response({ data: { success: true, leadId: "one-ref" } }, 201));
    await screen.findByText("one-ref");
    expect(onClose).not.toHaveBeenCalled();
  });
  it("clears personal details and success state when reopened", async () => {
    const props = { isOpen: true, onClose: vi.fn() };
    const view = render(<EnquiryModal {...props} />);
    await fill();
    view.rerender(<EnquiryModal {...props} isOpen={false} />);
    view.rerender(<EnquiryModal {...props} />);
    await screen.findByRole("option", { name: "Holidays" });
    expect(screen.getByLabelText("Full Name *")).toHaveProperty("value", "");
  });
  it("keeps form values on a failed submission and offers configured WhatsApp fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+919876543210");
    render(<EnquiryModal isOpen onClose={vi.fn()} />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ message: "Please try later" }, 503),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Submit Travel Enquiry" }),
    );
    expect(await screen.findByText(/Please try later/)).toBeTruthy();
    expect(screen.getByLabelText("Full Name *")).toHaveProperty(
      "value",
      "  Ahmed Ali  ",
    );
    expect(
      screen
        .getByRole("link", { name: "Contact us on WhatsApp" })
        .getAttribute("href"),
    ).toMatch(/^https:\/\/wa.me\/919876543210/);
  });
  it("offers callback without a fake WhatsApp link when no number is configured", async () => {
    const open = vi.fn();
    render(<FloatingWhatsApp onOpenEnquiry={open} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Contact Flyora" }),
    );
    expect(screen.queryByRole("link", { name: "Chat on WhatsApp" })).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: "Request a Callback" }),
    );
    await waitFor(() => expect(open).toHaveBeenCalledOnce());
  });
});
