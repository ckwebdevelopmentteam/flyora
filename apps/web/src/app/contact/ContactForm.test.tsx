import React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ContactForm, type ContactFormHandle } from "./ContactForm";
const dialogMethods = {
  showModal: Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    "showModal",
  ),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
};
beforeAll(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value() {
        this.setAttribute("open", "");
      },
    },
    close: {
      configurable: true,
      value() {
        this.removeAttribute("open");
      },
    },
  });
});
afterAll(() => {
  for (const [name, descriptor] of Object.entries(dialogMethods)) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
const service = {
  id: "7fcdf946-37af-4b1b-a994-c5509a5605ae",
  name: "Holiday Packages",
  slug: "holiday-packages",
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const postCalls = () =>
  vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === "POST");
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async () => response({ data: [service] })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
async function fill() {
  await screen.findByRole("radio", { name: "Holiday Packages" });
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "  Sana Ali  " },
  });
  fireEvent.change(screen.getByLabelText("Phone number"), {
    target: { value: "+91 98765 43210" },
  });
  fireEvent.change(screen.getByLabelText(/Email/), {
    target: { value: "  sana@example.com  " },
  });
  fireEvent.click(screen.getByRole("radio", { name: service.name }));
  fireEvent.change(screen.getByLabelText("Your message"), {
    target: { value: "  A quiet trip to Bali.\nPlease suggest dates.  " },
  });
}
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "Send enquiry" }));
describe("Contact form", () => {
  it("uses live services and requires an explicit selection", async () => {
    render(<ContactForm />);
    await screen.findByRole("radio", { name: service.name });
    expect(
      (screen.getByRole("radio", { name: service.name }) as HTMLInputElement)
        .checked,
    ).toBe(false);
    expect(screen.queryByRole("radio", { name: "General enquiry" })).toBeNull();
  });
  it("focuses an accessible error summary without posting invalid data", async () => {
    render(<ContactForm />);
    await screen.findByRole("radio", { name: service.name });
    submit();
    const alert = await screen.findByRole("alert");
    expect(document.activeElement).toBe(alert);
    expect(
      screen.getByLabelText("Full name").getAttribute("aria-invalid"),
    ).toBe("true");
    expect(postCalls()).toHaveLength(0);
  });
  it("submits normalized contact details and the complete customer message", async () => {
    render(<ContactForm />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        {
          data: {
            success: true,
            leadId: "b2eb1083-2b34-4f8c-8289-8741504c721c",
          },
        },
        201,
      ),
    );
    submit();
    await screen.findByRole("dialog", { name: "Enquiry received." });
    const [url, options] = postCalls()[0];
    expect(url).toContain("/public/enquiry");
    expect(JSON.parse(String(options?.body))).toMatchObject({
      fullName: "Sana Ali",
      phone: "9876543210",
      email: "sana@example.com",
      serviceId: service.id,
      notes: "A quiet trip to Bali.\nPlease suggest dates.",
      numberOfAdults: 1,
      numberOfKids: 0,
    });
    expect(screen.getByText("Reference B2EB1083")).toBeTruthy();
    expect(screen.getByRole("form")).toBeTruthy();
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe(
      "  Sana Ali  ",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "OK" }),
    );
    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Tab",
      shiftKey: true,
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "OK" }),
    );
    // Even a programmatic submit cannot duplicate the accepted enquiry.
    fireEvent.submit(screen.getByRole("form"));
    expect(postCalls()).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Send enquiry" }),
    );
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe(
      "",
    );
    expect(screen.getByRole("form")).toBeTruthy();
  });
  it("prevents repeated submissions while the first request is running", async () => {
    render(<ContactForm />);
    await fill();
    vi.mocked(fetch).mockImplementationOnce(() => new Promise(() => {}));
    submit();
    fireEvent.submit(screen.getByRole("form"));
    expect(postCalls()).toHaveLength(1);
    expect(
      (screen.getByLabelText("Full name") as HTMLInputElement).disabled ||
        screen.getByLabelText("Full name").closest("fieldset")?.disabled,
    ).toBe(true);
  });
  it("retains input and shows a safe error instead of server internals", async () => {
    render(<ContactForm />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        { message: "PrismaClientInitializationError secret-database-url" },
        500,
      ),
    );
    submit();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Your details are still here",
    );
    expect(screen.queryByText(/PrismaClient/)).toBeNull();
    expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe(
      "  Sana Ali  ",
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send enquiry",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("avoids false success and prevents another send when delivery is uncertain", async () => {
    render(<ContactForm />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ data: { success: true } }, 201),
    );
    submit();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "couldn’t confirm delivery",
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send enquiry",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.queryByRole("heading", { name: /Thank you/ })).toBeNull();
  });
  it("can retry loading services after a network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    render(<ContactForm />);
    await screen.findByRole("alert");
    expect(
      (
        screen.getByRole("button", {
          name: "Send enquiry",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("radio", { name: service.name });
    expect(
      (
        screen.getByRole("button", {
          name: "Send enquiry",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("opens optional fields when their input needs correcting", async () => {
    render(<ContactForm />);
    await fill();
    fireEvent.change(screen.getByLabelText("Adults"), {
      target: { value: "" },
    });
    submit();
    await waitFor(() =>
      expect(
        screen.getByText("Add travel details").closest("details")?.open,
      ).toBe(true),
    );
    expect(postCalls()).toHaveLength(0);
  });
  it("selects the matching real service when requested by shared navigation", async () => {
    const ref = React.createRef<ContactFormHandle>();
    render(<ContactForm ref={ref} />);
    await screen.findByRole("radio", { name: service.name });
    act(() => ref.current?.begin("Custom Holidays"));
    await waitFor(() =>
      expect(
        (screen.getByRole("radio", { name: service.name }) as HTMLInputElement)
          .checked,
      ).toBe(true),
    );
  });
  it("acknowledges success on Escape and leaves the form ready for another enquiry", async () => {
    render(<ContactForm />);
    await fill();
    vi.mocked(fetch).mockResolvedValueOnce(
      response(
        {
          data: {
            success: true,
            leadId: "b2eb1083-2b34-4f8c-8289-8741504c721c",
          },
        },
        201,
      ),
    );
    submit();
    const dialog = await screen.findByRole("dialog", {
      name: "Enquiry received.",
    });
    fireEvent(
      dialog,
      new Event("cancel", { bubbles: false, cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      (screen.getByLabelText("Your message") as HTMLTextAreaElement).value,
    ).toBe("");
    expect(
      (screen.getByRole("radio", { name: service.name }) as HTMLInputElement)
        .checked,
    ).toBe(false);
    expect(postCalls()).toHaveLength(1);
  });
});
