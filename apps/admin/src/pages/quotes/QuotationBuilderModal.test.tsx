// @vitest-environment jsdom
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QuotationBuilderModal } from "./QuotationBuilderModal";
import { quotesApi } from "./quotesApi";
import type { LeadItem } from "@flyora/types";

vi.mock("./quotesApi", () => ({
  quotesApi: {
    createQuotation: vi.fn(),
    fetchQuotationsForLead: vi.fn().mockResolvedValue([]),
    updateQuoteStatus: vi.fn(),
  },
}));

const mockLead: LeadItem = {
  id: "lead-test-01",
  customerId: "cust-01",
  customer: {
    id: "cust-01",
    fullName: "Fatima Zahra",
    phone: "+91 98451 12345",
    email: "fatima@example.com",
    city: "Mumbai",
  },
  serviceId: "srv-dubai",
  serviceName: "Dubai Luxury Holidays",
  packageId: "pkg-dxb",
  packageTitle: "5D/4N Glitz of Dubai",
  assignedToId: "coord-01",
  assignedToName: "Coordinator One",
  claimedAt: new Date().toISOString(),
  status: "CONTACTED",
  source: "WEBSITE_FORM",
  travelDate: "2026-11-20T00:00:00.000Z",
  numberOfAdults: 2,
  numberOfKids: 1,
  estimatedBudget: 150000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const savedQuote = {
  id: "q-1",
  quoteNumber: "FLY-2026-0042",
  shareToken: "share-123",
  sellingPrice: 100000,
  validUntil: "2026-11-25",
};
const show = (onQuoteCreated = vi.fn()) =>
  render(
    <QuotationBuilderModal
      lead={mockLead}
      isOpen
      onClose={vi.fn()}
      onQuoteCreated={onQuoteCreated}
    />,
  );
const next = () =>
  fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
const price = (cost = "80000", sell = "100000") => {
  const inputs = screen.getAllByPlaceholderText("0.00");
  fireEvent.change(inputs[0], { target: { value: cost } });
  fireEvent.change(inputs[1], { target: { value: sell } });
};
const review = () => {
  next();
  next();
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(quotesApi.createQuotation).mockResolvedValue(savedQuote as any);
});
afterEach(cleanup);

it("starts with services and prefilled package details, without developer labels", () => {
  show();
  expect(screen.getByRole("dialog", { name: "Create quotation" })).toBeTruthy();
  expect(screen.getByText(/Fatima Zahra/)).toBeTruthy();
  expect(screen.getByDisplayValue("5D/4N Glitz of Dubai")).toBeTruthy();
  expect(screen.queryByText("Module 5")).toBeNull();
  expect(screen.queryByLabelText("Valid until")).toBeNull();
});
it("adds a service with a preset shortcut", () => {
  show();
  fireEvent.change(screen.getByRole("combobox", { name: "Add service" }), {
    target: { value: "FLIGHT" },
  });
  expect(screen.getByDisplayValue("Flight tickets")).toBeTruthy();
});
it("lets quantity one be cleared and replaced without changing another service", () => {
  show();
  fireEvent.change(screen.getByRole("combobox", { name: "Add service" }), {
    target: { value: "TRANSFER" },
  });
  const [hotel, transfer] = screen.getAllByRole<HTMLInputElement>(
    "spinbutton",
    { name: "Quantity" },
  );
  fireEvent.change(transfer, { target: { value: "" } });
  expect(transfer.value).toBe("");
  expect(hotel.value).toBe("1");
  fireEvent.change(transfer, { target: { value: "12" } });
  fireEvent.blur(transfer);
  expect(transfer.value).toBe("12");
});
it("restores a cleared quantity on blur and enforces the positive minimum", () => {
  show();
  const quantity = screen.getAllByRole<HTMLInputElement>("spinbutton", {
    name: "Quantity",
  })[0];
  fireEvent.change(quantity, { target: { value: "" } });
  fireEvent.blur(quantity);
  expect(quantity.value).toBe("1");
  fireEvent.change(quantity, { target: { value: "0.00" } });
  expect(quantity.value).toBe("1");
  fireEvent.change(quantity, { target: { value: "-2" } });
  expect(quantity.value).toBe("1");
});
it("blocks continuing when the customer total is zero", async () => {
  show();
  next();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "customer price",
  );
  expect(quotesApi.createQuotation).not.toHaveBeenCalled();
});
it("uses a changed quantity for the total and saved payload", async () => {
  show();
  fireEvent.change(screen.getByRole("combobox", { name: "Add service" }), {
    target: { value: "HOTEL" },
  });
  const quantity = screen.getAllByRole<HTMLInputElement>("spinbutton", {
    name: "Quantity",
  })[1];
  fireEvent.change(quantity, { target: { value: "" } });
  fireEvent.change(quantity, { target: { value: "2" } });
  fireEvent.blur(quantity);
  const inputs = screen.getAllByPlaceholderText("0.00");
  fireEvent.change(inputs[2], { target: { value: "20000" } });
  fireEvent.change(inputs[3], { target: { value: "28000" } });
  review();
  expect(screen.getAllByText("₹56,000").length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  await waitFor(() => expect(quotesApi.createQuotation).toHaveBeenCalledOnce());
  expect(
    vi.mocked(quotesApi.createQuotation).mock.calls[0][0].items[1],
  ).toMatchObject({ quantity: 2, supplierCost: 20000, sellingPrice: 28000 });
});
it("shows profit shortfall on review and requires deliberate confirmation below target", async () => {
  show();
  price("100000", "105000");
  review();
  expect(screen.getByText("Below target")).toBeTruthy();
  expect(screen.getByText(/Increase the customer total by/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  expect(quotesApi.createQuotation).not.toHaveBeenCalled();
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save below target" }));
  await waitFor(() => expect(quotesApi.createQuotation).toHaveBeenCalledOnce());
});
it("keeps changes when going back and allows inclusions to be edited", () => {
  show();
  price();
  next();
  expect(
    screen.queryByRole("button", { name: "Remove Daily Breakfast" }),
  ).toBeNull();
  const custom = screen.getByPlaceholderText(/Add something included/);
  fireEvent.change(custom, { target: { value: "VIP Lounge Access" } });
  fireEvent.keyDown(custom, { key: "Enter" });
  expect(screen.getByText("VIP Lounge Access")).toBeTruthy();
  next();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByText("VIP Lounge Access")).toBeTruthy();
});
it("saves after review and replaces the wizard with one share dialog", async () => {
  const created = vi.fn();
  show(created);
  price();
  review();
  expect(screen.getByText("Target met")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  await waitFor(() => expect(created).toHaveBeenCalledOnce());
  expect(
    await screen.findByRole("dialog", { name: "Quotation saved" }),
  ).toBeTruthy();
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByText(/FLY-2026-0042/)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Copy link" })).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Open in WhatsApp" }).getAttribute("href"),
  ).toContain("share-123");
});
it("shows a safe retry message and retains prices after a failed save", async () => {
  vi.mocked(quotesApi.createQuotation).mockRejectedValue(
    new Error("Prisma internal failure PRIVATE_CANARY"),
  );
  show();
  price();
  review();
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).not.toContain("PRIVATE_CANARY");
  expect(screen.getAllByText("₹1,00,000").length).toBeGreaterThan(0);
});

it("starts a hotel quote with one stay and no invented booking details", () => {
  render(
    <QuotationBuilderModal
      lead={{
        ...mockLead,
        packageTitle: undefined,
        serviceName: "Hotel Booking",
        numberOfAdults: 3,
        numberOfKids: 1,
      }}
      isOpen
      onClose={vi.fn()}
    />,
  );
  expect(
    screen.getByRole("combobox", { name: "Service category 1" }),
  ).toHaveProperty("value", "HOTEL");
  expect(screen.getByRole("spinbutton", { name: "Quantity" })).toHaveProperty(
    "value",
    "1",
  );
  expect(
    screen.getByRole("textbox", { name: "Service details 1" }),
  ).toHaveProperty("value", "");
});
it("doesn't add unconfirmed meals, transfers or exclusions to a saved quotation", async () => {
  show();
  price();
  review();
  fireEvent.click(screen.getByRole("button", { name: "Save quotation" }));
  await waitFor(() => expect(quotesApi.createQuotation).toHaveBeenCalledOnce());
  const sent = vi.mocked(quotesApi.createQuotation).mock.calls[0][0];
  expect(sent.inclusions).toEqual([]);
  expect(sent.exclusions).toEqual([]);
  expect(sent.items).toHaveLength(1);
  expect(sent.items[0]).toMatchObject({
    title: "5D/4N Glitz of Dubai",
    quantity: 1,
    description: "",
  });
});
