// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AccountPage } from "./AccountPage";
import { useAuthStore } from "../../stores/authStore";
import { usersApi } from "../../lib/usersApi";
import { packagesApi } from "../../lib/packagesApi";

vi.mock("../../lib/usersApi", () => ({
  usersApi: {
    updateProfile: vi.fn(),
  },
}));

vi.mock("../../lib/packagesApi", () => ({
  packagesApi: {
    getPresignedUploadUrl: vi.fn(),
    directUploadToR2: vi.fn(),
  },
}));

vi.mock("../../lib/apiClient", () => ({
  apiClient: {
    patch: vi.fn(),
  },
}));

const mockUser = {
  id: "user-123",
  email: "sara@flyora.test",
  fullName: "Sara Ahmed",
  phone: "+1 555-0199",
  role: "SERVICE_COORDINATOR" as const,
  availability: "AVAILABLE" as const,
  isActive: true,
  avatarUrl: "https://r2.flyora.com/avatars/sara.jpg",
  services: [
    {
      id: "map-1",
      userId: "user-123",
      serviceId: "srv-packages",
      isPrimary: true,
      service: {
        id: "srv-packages",
        name: "Holiday Packages",
        slug: "packages",
        minMarginPercent: 12,
      },
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.resetAllMocks();
  useAuthStore.setState({
    user: mockUser,
    accessToken: "mock-token",
    isAuthenticated: true,
    isLoading: false,
    sessionUnavailable: false,
    generation: 1,
  });
});

afterEach(cleanup);

it("renders user information and shows administrator managed fields as disabled", () => {
  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );

  // Check titles & user display
  expect(screen.getByText("Account Settings")).toBeDefined();
  expect(screen.getAllByText("Sara Ahmed").length).toBeGreaterThan(0);
  expect(screen.getByDisplayValue("sara@flyora.test")).toBeDefined();

  // Name, Username/Email, and Password should be disabled/read-only
  const emailInput = screen.getByDisplayValue("sara@flyora.test");
  expect(emailInput.hasAttribute("disabled")).toBe(true);

  const nameInput = screen.getByDisplayValue("Sara Ahmed");
  expect(nameInput.hasAttribute("disabled")).toBe(true);

  const passwordInput = screen.getByDisplayValue("••••••••••••••••");
  expect(passwordInput.hasAttribute("disabled")).toBe(true);

  // Check admin-managed indicator
  const adminTags = screen.getAllByText(/Managed by Administrator/i);
  expect(adminTags.length).toBeGreaterThan(0);

  // Assigned services
  expect(screen.getByText("Holiday Packages")).toBeDefined();
});

it("allows saving changes to the phone number", async () => {
  vi.mocked(usersApi.updateProfile).mockResolvedValue({
    ...mockUser,
    phone: "+1 555-9999",
  });

  render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );

  const phoneInput = screen.getByLabelText(/Phone Number/i);
  expect((phoneInput as HTMLInputElement).value).toBe("+1 555-0199");

  fireEvent.change(phoneInput, { target: { value: "+1 555-9999" } });
  const saveButton = screen.getByRole("button", { name: /Save changes/i });
  expect(saveButton.hasAttribute("disabled")).toBe(false);

  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(usersApi.updateProfile).toHaveBeenCalledWith({
      phone: "+1 555-9999",
    });
  });

  expect(
    await screen.findByText(/Phone number updated successfully/i),
  ).toBeDefined();
});

it("uploads a profile photo to Cloudflare R2 and updates user profile", async () => {
  vi.mocked(packagesApi.getPresignedUploadUrl).mockResolvedValue({
    uploadUrl: "https://r2.cloudflarestorage.com/avatars/new-avatar.png",
    publicUrl: "https://r2.flyora.com/avatars/new-avatar.png",
    fileKey: "avatars/new-avatar.png",
    isMock: false,
  });
  vi.mocked(packagesApi.directUploadToR2).mockResolvedValue();
  vi.mocked(usersApi.updateProfile).mockResolvedValue({
    ...mockUser,
    avatarUrl: "https://r2.flyora.com/avatars/new-avatar.png",
  });

  const { container } = render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );

  const fileInput = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  expect(fileInput).toBeDefined();

  const file = new File(["dummy content"], "avatar.png", { type: "image/png" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(packagesApi.getPresignedUploadUrl).toHaveBeenCalledWith(
      expect.stringContaining("avatar"),
      expect.any(String),
      "avatars",
    );
    expect(packagesApi.directUploadToR2).toHaveBeenCalled();
    expect(usersApi.updateProfile).toHaveBeenCalledWith({
      avatarUrl: "https://r2.flyora.com/avatars/new-avatar.png",
    });
  });

  expect(await screen.findByText(/Profile photo updated/i)).toBeDefined();
});
