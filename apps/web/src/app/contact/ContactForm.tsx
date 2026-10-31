"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ArrowUpRight, ChevronDown, Loader2 } from "lucide-react";
import { enquiryFormSchema } from "../../lib/enquiry";
import { EnquirySuccessDialog } from "./EnquirySuccessDialog";
import styles from "./ContactPage.module.css";

type Service = { id: string; name: string; slug: string };
type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  serviceId: string;
  notes: string;
  travelDate: string;
  numberOfAdults: string;
  numberOfKids: string;
};
const initialValues: FormValues = {
  fullName: "",
  phone: "",
  email: "",
  serviceId: "",
  notes: "",
  travelDate: "",
  numberOfAdults: "1",
  numberOfKids: "0",
};
const serviceAliases: Record<string, string> = {
  "Custom Holidays": "holiday-packages",
  Holidays: "holiday-packages",
  Visas: "visa-assistance",
  Flights: "flight-booking",
  Hotels: "hotel-booking",
  "Umrah Packages": "umrah-hajj",
  "Hajj Packages": "umrah-hajj",
};
const api = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export type ContactFormHandle = { begin: (name?: string) => void };
export const ContactForm = forwardRef<ContactFormHandle>(
  function ContactForm(_, ref) {
    const [values, setValues] = useState(initialValues);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [servicesError, setServicesError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");
    const [uncertain, setUncertain] = useState(false);
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState<{ name: string; id: string } | null>(
      null,
    );
    const [feedbackAttempt, setFeedbackAttempt] = useState(0);
    const feedback = useRef<HTMLDivElement>(null);
    const submitting = useRef(false);
    const submission = useRef<AbortController | null>(null);
    const firstName = useRef<HTMLInputElement>(null);
    const submitButton = useRef<HTMLButtonElement>(null);
    const serviceField = useRef<HTMLFieldSetElement>(null);
    const travelDetails = useRef<HTMLDetailsElement>(null);
    const preferredService = useRef<string | undefined>(undefined);

    useEffect(() => {
      const controller = new AbortController();
      void (async () => {
        try {
          const res = await fetch(`${api}/services`, {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(15000),
            ]),
          });
          if (!res.ok) throw new Error();
          const body = await res.json();
          if (
            !Array.isArray(body.data) ||
            !body.data.length ||
            !body.data.every(
              (s: Service) =>
                s &&
                typeof s.id === "string" &&
                typeof s.name === "string" &&
                typeof s.slug === "string",
            )
          )
            throw new Error();
          if (!controller.signal.aborted) {
            setServices(body.data);
            if (preferredService.current) {
              const name = preferredService.current;
              const selected = (body.data as Service[]).find(
                (service) =>
                  service.id === name ||
                  service.name === name ||
                  service.slug === serviceAliases[name],
              );
              setValues((previous) => ({
                ...previous,
                serviceId: selected?.id || "",
              }));
            }
          }
        } catch {
          if (!controller.signal.aborted) {
            setServices([]);
            setServicesError(true);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();
      return () => controller.abort();
    }, [attempt]);
    useEffect(() => () => submission.current?.abort(), []);
    useEffect(() => {
      if (
        (errors.travelDate || errors.numberOfAdults || errors.numberOfKids) &&
        travelDetails.current
      )
        travelDetails.current.open = true;
    }, [errors]);
    useEffect(() => {
      if (feedbackAttempt) feedback.current?.focus();
    }, [feedbackAttempt]);
    useImperativeHandle(ref, () => ({
      begin(name?: string) {
        if (submitting.current) return;
        preferredService.current = name;
        if (success) return;
        if (name) {
          const selected = services.find(
            (service) =>
              service.id === name ||
              service.name === name ||
              service.slug === serviceAliases[name],
          );
          setValues((previous) => ({
            ...previous,
            serviceId: selected?.id || "",
          }));
          serviceField.current?.focus({ preventScroll: true });
        } else firstName.current?.focus({ preventScroll: true });
      },
    }));

    function update(key: keyof FormValues, value: string) {
      setValues((previous) => ({ ...previous, [key]: value }));
      setErrors((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
    }
    function fieldProps(key: keyof FormValues) {
      return {
        id: `contact-${key}`,
        name: key,
        value: values[key],
        onChange: (
          e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >,
        ) => update(key, e.target.value),
        "aria-invalid": Boolean(errors[key]),
        "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
      };
    }
    function error(key: keyof FormValues) {
      return errors[key] ? (
        <p id={`contact-${key}-error`} className={styles.fieldError}>
          {errors[key]}
        </p>
      ) : null;
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (
        submitting.current ||
        loading ||
        servicesError ||
        uncertain ||
        success
      )
        return;
      setServerError("");
      const compactPhone = values.phone.replace(/[\s()-]/g, "");
      const phone = /^(\+91|91)\d{10}$/.test(compactPhone)
        ? compactPhone.slice(-10)
        : compactPhone;
      const result = enquiryFormSchema.safeParse({
        ...values,
        phone,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        notes: values.notes.trim(),
        numberOfAdults: Number(values.numberOfAdults),
        numberOfKids: Number(values.numberOfKids),
      });
      const validation: Record<string, string> = {};
      if (!result.success) {
        const fieldMessages: Record<string, string> = {
          fullName: "Enter your full name.",
          phone: "Enter a 10-digit Indian mobile number.",
          email: "Enter a valid email address.",
          travelDate: "Enter a valid travel date.",
          numberOfAdults: "Enter between 1 and 50 adults.",
          numberOfKids: "Enter between 0 and 20 children.",
          notes: "Keep your message within 1,000 characters.",
        };
        for (const issue of result.error.errors) {
          const field = String(issue.path[0]);
          validation[field] =
            fieldMessages[field] || "Please check this field.";
        }
      }
      if (!values.notes.trim())
        validation.notes = "Tell us a little about what you need.";
      if (!services.some((service) => service.id === values.serviceId))
        validation.serviceId = "Choose an available service.";
      if (Object.keys(validation).length || !result.success) {
        setErrors(validation);
        setFeedbackAttempt((n) => n + 1);
        return;
      }
      setErrors({});
      submitting.current = true;
      setPending(true);
      const controller = new AbortController();
      submission.current = controller;
      try {
        const response = await fetch(`${api}/public/enquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(30000),
          ]),
          body: JSON.stringify(result.data),
        });
        if (!response.ok) {
          setServerError(
            response.status === 429
              ? "Please wait a few minutes before sending again, or call our team."
              : "We couldn’t send your enquiry. Your details are still here. Please try again.",
          );
          setFeedbackAttempt((n) => n + 1);
          return;
        }
        const body = await response.json();
        if (
          body.data?.success !== true ||
          typeof body.data.leadId !== "string" ||
          !body.data.leadId
        )
          throw new Error();
        setSuccess({ name: result.data.fullName, id: body.data.leadId });
      } catch {
        if (!controller.signal.aborted) {
          setUncertain(true);
          setServerError(
            "We couldn’t confirm delivery. Please call or email us before sending again so we can check your enquiry.",
          );
          setFeedbackAttempt((n) => n + 1);
        }
      } finally {
        submitting.current = false;
        if (!controller.signal.aborted) setPending(false);
      }
    }

    return (
      <>
        <form
          onSubmit={submit}
          noValidate
          className={styles.form}
          aria-labelledby="contact-form-title"
          aria-busy={pending}
        >
          <div className={styles.formHeading}>
            <h2 id="contact-form-title">Send us an enquiry.</h2>
            <p>All fields are required unless marked optional.</p>
          </div>
          {(Object.keys(errors).length > 0 || serverError) && (
            <div
              ref={feedback}
              tabIndex={-1}
              className={styles.errorSummary}
              role="alert"
            >
              <p>{serverError || "Please check the details below."}</p>
              {Object.keys(errors).length > 0 && (
                <ul>
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <a href={`#contact-${field}`}>{message}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {servicesError && (
            <div className={styles.errorSummary} role="alert">
              We can’t load our services right now.{" "}
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setServicesError(false);
                  setAttempt((n) => n + 1);
                }}
              >
                Try again
              </button>{" "}
              or call our team.
            </div>
          )}
          <fieldset disabled={pending}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="contact-fullName">Full name</label>
                <input
                  {...fieldProps("fullName")}
                  ref={firstName}
                  autoComplete="name"
                  required
                  maxLength={150}
                  placeholder="Your name"
                />
                {error("fullName")}
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-phone">Phone number</label>
                <div className={styles.phoneField}>
                  <span aria-hidden="true">+91</span>
                  <input
                    {...fieldProps("phone")}
                    aria-describedby={
                      errors.phone
                        ? "contact-phone-error contact-phone-hint"
                        : "contact-phone-hint"
                    }
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    required
                    maxLength={20}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <span id="contact-phone-hint" className={styles.srOnly}>
                  Indian mobile number, country code +91.
                </span>
                {error("phone")}
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email">
                Email <span>(optional)</span>
              </label>
              <input
                {...fieldProps("email")}
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="you@example.com"
              />
              {error("email")}
            </div>
            <fieldset
              ref={serviceField}
              id="contact-serviceId"
              className={styles.serviceChoices}
              disabled={loading || servicesError}
              tabIndex={-1}
              aria-invalid={Boolean(errors.serviceId)}
              aria-describedby={
                errors.serviceId ? "contact-serviceId-error" : undefined
              }
            >
              <legend>I’m interested in</legend>
              {loading && (
                <p className={styles.loadingServices} role="status">
                  Loading services…
                </p>
              )}
              <div className={styles.serviceOptions}>
                {services.map((service) => (
                  <label key={service.id} className={styles.serviceOption}>
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={values.serviceId === service.id}
                      onChange={() => update("serviceId", service.id)}
                      required
                      aria-describedby={
                        errors.serviceId ? "contact-serviceId-error" : undefined
                      }
                    />
                    <span>{service.name}</span>
                  </label>
                ))}
              </div>
              {error("serviceId")}
            </fieldset>
            <div className={styles.field}>
              <label htmlFor="contact-notes">Your message</label>
              <textarea
                {...fieldProps("notes")}
                rows={4}
                maxLength={1000}
                required
                placeholder="Where would you like to go? Share your ideas, questions or anything we should know."
              />
              <span className={styles.characterCount} aria-hidden="true">
                {values.notes.length}/1,000
              </span>
              {error("notes")}
            </div>
            <details ref={travelDetails} className={styles.optionalDetails}>
              <summary>
                Add travel details <span>(optional)</span>
                <ChevronDown size={15} aria-hidden="true" />
              </summary>
              <div className={styles.travelFields}>
                <div className={styles.field}>
                  <label htmlFor="contact-travelDate">Travel date</label>
                  <input {...fieldProps("travelDate")} type="date" />
                  {error("travelDate")}
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-numberOfAdults">Adults</label>
                  <input
                    {...fieldProps("numberOfAdults")}
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                  />
                  {error("numberOfAdults")}
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact-numberOfKids">Children</label>
                  <input
                    {...fieldProps("numberOfKids")}
                    type="number"
                    min="0"
                    max="20"
                    step="1"
                  />
                  {error("numberOfKids")}
                </div>
              </div>
            </details>
            <button
              ref={submitButton}
              className={styles.submit}
              type="submit"
              disabled={pending || loading || servicesError || uncertain}
            >
              {pending ? (
                <>
                  Sending…{" "}
                  <Loader2
                    className={styles.spinner}
                    size={18}
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  Send enquiry <ArrowUpRight size={20} aria-hidden="true" />
                </>
              )}
            </button>
          </fieldset>
          <p className={styles.privacy}>
            We’ll use these details to respond to your enquiry.
          </p>
        </form>
        {success && (
          <EnquirySuccessDialog
            receipt={success}
            returnFocus={submitButton}
            onConfirm={() => {
              setSuccess(null);
              setValues(initialValues);
              setErrors({});
              setServerError("");
              setUncertain(false);
              preferredService.current = undefined;
              if (travelDetails.current) travelDetails.current.open = false;
            }}
          />
        )}
      </>
    );
  },
);
