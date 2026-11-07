"use client";

import { type RefObject, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import styles from "./ContactPage.module.css";

export function EnquirySuccessDialog({
  receipt,
  onConfirm,
  returnFocus,
}: {
  receipt: { name: string; id: string };
  onConfirm: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    // The submit button loses focus when disabled during the request.
    const trigger = returnFocus.current;
    element?.showModal();
    confirm.current?.focus();
    // Native modality keeps the background inert and traps keyboard focus.
    const previousOverflow = document.body.style.overflow;
    const previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousGutter;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  return (
    <dialog
      ref={dialog}
      className={styles.confirmation}
      aria-labelledby="contact-success-title"
      aria-describedby="contact-success-message"
      onKeyDown={(event) => {
        // This acknowledgement has one action; wrap Tab in both directions.
        if (event.key === "Tab") {
          event.preventDefault();
          confirm.current?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      <div className={styles.confirmationContent}>
        <span className={styles.successIcon}>
          <Check size={25} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <h2 id="contact-success-title">Enquiry received.</h2>
        <p id="contact-success-message">
          Thank you, {receipt.name.split(" ")[0]}. We’ll get in touch using the
          details you shared.
        </p>
        <p className={styles.reference}>
          Reference {receipt.id.slice(0, 8).toUpperCase()}
        </p>
        <button
          ref={confirm}
          type="button"
          onClick={onConfirm}
          className={styles.confirmationButton}
        >
          OK
        </button>
      </div>
    </dialog>
  );
}
