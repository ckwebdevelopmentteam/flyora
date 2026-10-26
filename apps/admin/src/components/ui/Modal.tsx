import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const dialogs: string[] = [];
const DialogDepth = createContext(0);
const levels = new Map<string, number>();
const panels = new Map<string, HTMLDivElement>();
function activateTopDialog() {
  for (const [id, element] of panels) {
    const inactive = id !== dialogs.at(-1);
    element.toggleAttribute("inert", inactive);
    element.parentElement?.classList.toggle("is-covered", inactive);
    if (inactive) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  }
}
let previousOverflow = "";
const focusable =
  'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

export function Modal({
  title,
  description,
  onClose,
  busy = false,
  children,
  footer,
  wide = false,
  drawer = false,
  hideHeader = false,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  drawer?: boolean;
  hideHeader?: boolean;
}) {
  const id = useId();
  const depth = useContext(DialogDepth);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const locked = useRef(busy);
  close.current = onClose;
  locked.current = busy;
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    if (!dialogs.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.getElementById("root")?.setAttribute("inert", "");
    }
    dialogs.push(id);
    levels.set(id, depth);
    dialogs.sort(
      (first, second) => (levels.get(first) || 0) - (levels.get(second) || 0),
    );
    if (panel.current) panels.set(id, panel.current);
    activateTopDialog();
    if (dialogs.at(-1) === id) panel.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (dialogs.at(-1) !== id) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (!locked.current) close.current();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(focusable) || [],
      ).filter((control) => !control.closest('[hidden], [aria-hidden="true"]'));
      const first = controls[0],
        last = controls.at(-1);
      if (!first) {
        event.preventDefault();
        panel.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      dialogs.splice(dialogs.indexOf(id), 1);
      panels.delete(id);
      levels.delete(id);
      activateTopDialog();
      if (!dialogs.length) {
        document.body.style.overflow = previousOverflow;
        document.getElementById("root")?.removeAttribute("inert");
      }
      if (previous?.isConnected && !previous.closest("[inert]"))
        previous.focus();
      else panels.get(dialogs.at(-1) || "")?.focus();
    };
  }, [id, depth]);
  return createPortal(
    <DialogDepth.Provider value={depth + 1}>
      <div
        className={`modal-layer ${drawer ? "drawer-layer" : ""}`}
        style={{ zIndex: 100 + depth * 10 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) onClose();
        }}
      >
        <div
          ref={panel}
          className={`modal-panel ${wide ? "modal-wide" : ""} ${drawer ? "drawer-panel" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-title`}
          aria-describedby={
            description && !hideHeader ? `${id}-description` : undefined
          }
          tabIndex={-1}
        >
          {hideHeader ? (
            <h2 id={`${id}-title`} className="sr-only">
              {title}
            </h2>
          ) : (
            <>
              <header className="modal-header">
                <div>
                  <h2 id={`${id}-title`}>{title}</h2>
                  {description && <p id={`${id}-description`}>{description}</p>}
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={onClose}
                  disabled={busy}
                  aria-label={`Close ${title}`}
                >
                  <X size={19} />
                </button>
              </header>
            </>
          )}
          <div className="modal-content">{children}</div>
          {footer && <footer className="modal-footer">{footer}</footer>}
        </div>
      </div>
    </DialogDepth.Provider>,
    document.body,
  );
}

export function Steps({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  const active = useRef<HTMLLIElement>(null);
  useEffect(() => {
    active.current?.focus();
  }, [current]);
  return (
    <ol className="form-steps" aria-label="Progress">
      {labels.map((label, index) => (
        <li
          key={label}
          ref={index === current ? active : undefined}
          tabIndex={-1}
          aria-current={index === current ? "step" : undefined}
          className={index < current ? "is-complete" : ""}
        >
          <span>{index + 1}</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (children) alert.current?.focus();
  }, [children]);
  return children ? (
    <div ref={alert} className="form-error" role="alert" tabIndex={-1}>
      {children}
    </div>
  ) : null;
}
