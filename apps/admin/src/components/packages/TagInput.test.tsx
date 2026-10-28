// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TagInput } from "./TagInput";
afterEach(cleanup);
it("adds a full comma-containing item and removes only the requested item", () => {
  const changed = vi.fn();
  render(<TagInput label="Included" tags={["Hotel"]} onChange={changed} />);
  const input = screen.getByRole("textbox", { name: "Add to included" });
  fireEvent.change(input, { target: { value: "Breakfast, lunch and dinner" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(changed).toHaveBeenCalledWith([
    "Hotel",
    "Breakfast, lunch and dinner",
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Remove Hotel" }));
  expect(changed).toHaveBeenLastCalledWith([]);
});
it("doesn't silently add suggested inclusions or case-variant duplicates", () => {
  const changed = vi.fn();
  render(
    <TagInput
      label="Included"
      tags={["Breakfast"]}
      presets={["Transfers"]}
      onChange={changed}
    />,
  );
  expect(changed).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("textbox", { name: "Add to included" }), {
    target: { value: "breakfast" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add to included" }));
  expect(changed).not.toHaveBeenCalled();
});
