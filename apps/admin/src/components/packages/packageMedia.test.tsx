// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { R2GalleryUploader, R2ImageDropzone } from "./R2ImageDropzone";
import { PackageImage } from "./PackageImage";
import { PackagePreview } from "./PackagePreview";
import { packagesApi } from "../../lib/packagesApi";
import type { PackageDetails } from "@flyora/types";
vi.mock("../../lib/packagesApi", () => ({
  packagesApi: { getPresignedUploadUrl: vi.fn(), directUploadToR2: vi.fn() },
}));
const file = (name = "photo.jpg", type = "image/jpeg") =>
  new File(["photo"], name, { type });
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(packagesApi.getPresignedUploadUrl).mockImplementation(
    async (name) => ({
      uploadUrl: "https://upload.test/" + name,
      publicUrl: "https://photos.test/" + name,
      fileKey: name,
      isMock: false,
    }),
  );
  vi.mocked(packagesApi.directUploadToR2).mockResolvedValue();
});
afterEach(cleanup);
it("uploads multiple selected photos and preserves existing gallery photos", async () => {
  const changed = vi.fn();
  render(
    <R2GalleryUploader
      urls={["https://photos.test/existing.jpg"]}
      onChange={changed}
    />,
  );
  fireEvent.change(screen.getByLabelText("Package gallery photos"), {
    target: { files: [file("one.jpg"), file("two.jpg")] },
  });
  await waitFor(() =>
    expect(changed).toHaveBeenCalledWith([
      "https://photos.test/existing.jpg",
      "https://photos.test/one.jpg",
      "https://photos.test/two.jpg",
    ]),
  );
  expect(packagesApi.directUploadToR2).toHaveBeenCalledTimes(2);
});
it("keeps successful photos when a later upload fails, and reports the partial failure", async () => {
  vi.mocked(packagesApi.directUploadToR2)
    .mockResolvedValueOnce()
    .mockRejectedValueOnce(new Error("SECRET_PROVIDER_ERROR"));
  const changed = vi.fn();
  render(<R2GalleryUploader urls={[]} onChange={changed} />);
  fireEvent.change(screen.getByLabelText("Package gallery photos"), {
    target: { files: [file("one.jpg"), file("two.jpg")] },
  });
  expect((await screen.findByRole("alert")).textContent).toContain(
    "1 of 2 photos uploaded",
  );
  expect(changed).toHaveBeenCalledWith(["https://photos.test/one.jpg"]);
  expect(screen.queryByText(/SECRET_PROVIDER_ERROR/)).toBeNull();
});
it("rejects unsupported files and oversized images before making upload requests", async () => {
  render(<R2GalleryUploader urls={[]} onChange={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Package gallery photos"), {
    target: { files: [file("drawing.svg", "image/svg+xml")] },
  });
  expect(screen.getByRole("alert").textContent).toContain("Choose JPG");
  const oversized = file();
  Object.defineProperty(oversized, "size", { value: 11 * 1024 * 1024 });
  fireEvent.change(screen.getByLabelText("Package gallery photos"), {
    target: { files: [oversized] },
  });
  expect(screen.getByRole("alert").textContent).toContain("10 MB");
  expect(packagesApi.getPresignedUploadUrl).not.toHaveBeenCalled();
});
it("never treats a mock upload as a saved photo", async () => {
  vi.mocked(packagesApi.getPresignedUploadUrl).mockResolvedValue({
    uploadUrl: "/mock",
    publicUrl: "https://fake.test/photo.jpg",
    fileKey: "photo",
    isMock: true,
  });
  const changed = vi.fn();
  render(<R2ImageDropzone onChange={changed} />);
  fireEvent.change(screen.getByLabelText("Package cover photo"), {
    target: { files: [file()] },
  });
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(changed).not.toHaveBeenCalled();
  expect(packagesApi.directUploadToR2).not.toHaveBeenCalled();
});
it("uses a neutral missing-image state rather than substituting an unrelated photo", () => {
  render(<PackageImage src="https://photos.test/broken.jpg" alt="Bali" />);
  fireEvent.error(screen.getByAltText("Bali"));
  expect(screen.getByRole("img", { name: "No photo for Bali" })).toBeTruthy();
  expect(screen.queryByAltText("Bali")).toBeNull();
});
it("switches package gallery photos while keeping itinerary and optional details visible", () => {
  const pkg = {
    id: "bali",
    title: "Bali",
    coverImageUrl: "https://photos.test/cover.jpg",
    galleryImageUrls: ["https://photos.test/two.jpg"],
    durationDays: 1,
    durationNights: 0,
    destination: "Bali",
    startingPrice: 40000,
    overview: "Explore Bali",
    itinerary: [
      {
        day: 1,
        title: "Arrival",
        description: "Airport transfer",
        meals: "Breakfast",
        stay: "City hotel",
      },
      { day: 2, title: "Explore", description: "Explore the city" },
    ],
    inclusions: ["Breakfast"],
    exclusions: ["Flights"],
  } as PackageDetails;
  render(<PackagePreview pkg={pkg} />);
  fireEvent.click(screen.getByRole("button", { name: "View photo 2" }));
  expect(screen.getByAltText("Bali").getAttribute("src")).toBe(
    "https://photos.test/two.jpg",
  );
  const day = screen.getByRole("button", { name: "Day 1: Arrival" });
  expect(day.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(day);
  expect(day.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("region", { name: "Day 1: Arrival" }).hidden).toBe(
    false,
  );
  expect(screen.getByText("City hotel")).toBeTruthy();
  const secondDay = screen.getByRole("button", { name: "Day 2: Explore" });
  fireEvent.click(secondDay);
  expect(day.getAttribute("aria-expanded")).toBe("false");
  expect(secondDay.getAttribute("aria-expanded")).toBe("true");
  expect(screen.queryByRole("region", { name: "Day 1: Arrival" })).toBeNull();
  fireEvent.click(secondDay);
  expect(secondDay.getAttribute("aria-expanded")).toBe("false");
});
