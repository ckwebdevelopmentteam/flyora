// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { Modal, Steps } from "./Modal";
afterEach(cleanup);
it("labels the dialog, locks background scroll, wraps keyboard focus and restores focus", () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const close = vi.fn();
  const { unmount } = render(
    <Modal
      title="Example"
      description="Helpful text"
      onClose={close}
      footer={<button>Save</button>}
    >
      <input aria-label="Name" />
    </Modal>,
  );
  const dialog = screen.getByRole("dialog", { name: "Example" });
  expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
  expect(document.body.style.overflow).toBe("hidden");
  const save = within(dialog).getByRole("button", { name: "Save" });
  save.focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close Example" }),
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
  unmount();
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).not.toBe("hidden");
  trigger.remove();
});
it("blocks dismissal while saving", () => {
  const close = vi.fn();
  render(
    <Modal title="Saving" onClose={close} busy>
      <p>Content</p>
    </Modal>,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Close Saving" }));
  expect(close).not.toHaveBeenCalled();
});
it("only exposes the uppermost nested dialog and restores its parent", () => {
  const parent = vi.fn(),
    child = vi.fn();
  const { rerender } = render(
    <Modal title="Parent" onClose={parent}>
      <Modal title="Child" onClose={child}>
        Child content
      </Modal>
    </Modal>,
  );
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name: "Child" })).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(child).toHaveBeenCalledOnce();
  expect(parent).not.toHaveBeenCalled();
  rerender(
    <Modal title="Parent" onClose={parent}>
      Parent content
    </Modal>,
  );
  expect(screen.getByRole("dialog", { name: "Parent" })).toBeTruthy();
});

it("restores the trigger after a stepper moves focus inside its dialog", () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const { unmount } = render(
    <Modal title="Wizard" onClose={vi.fn()}>
      <Steps labels={["Details", "Review"]} current={0} />
    </Modal>,
  );
  expect(screen.getByText("Details").closest("li")).toBe(
    document.activeElement,
  );
  unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});
