"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import { submitContactForm } from "@/services/api/contact";

type ContactField = "name" | "email" | "phone" | "message";
type ContactFieldErrors = Partial<Record<ContactField, string>>;
type ContactFieldValues = Record<ContactField, string>;

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const PHONE_PATTERN = /^\+?[0-9 ()-]+$/;
const FORBIDDEN_CONTROL_CHARACTERS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

function validateField(field: ContactField, rawValue: string): string {
  const normalized = rawValue.normalize("NFKC");
  const singleLine = normalized.replace(/\s+/g, " ").trim();

  if (field === "name") {
    if (
      rawValue.length > 80 ||
      singleLine.length < 2 ||
      !NAME_PATTERN.test(singleLine)
    ) {
      return "Enter a valid name (2–80 characters, letters and common punctuation only).";
    }
    if (FORBIDDEN_CONTROL_CHARACTERS.test(singleLine)) {
      return "Your name contains unsupported characters.";
    }
    return "";
  }

  if (field === "email") {
    if (
      rawValue.length > 254 ||
      !singleLine ||
      !EMAIL_PATTERN.test(singleLine.toLowerCase())
    ) {
      return "Enter a valid email address (maximum 254 characters).";
    }
    if (FORBIDDEN_CONTROL_CHARACTERS.test(singleLine)) {
      return "Your email address contains unsupported characters.";
    }
    return "";
  }

  if (field === "phone") {
    if (!singleLine) return "";
    const digitCount = singleLine.replace(/\D/g, "").length;
    if (
      rawValue.length > 24 ||
      !PHONE_PATTERN.test(singleLine) ||
      digitCount < 7 ||
      digitCount > 15
    ) {
      return "Enter a phone number with 7–15 digits, or leave this optional field blank.";
    }
    if (FORBIDDEN_CONTROL_CHARACTERS.test(singleLine)) {
      return "Your phone number contains unsupported characters.";
    }
    return "";
  }

  const message = normalized.replace(/\r\n?/g, "\n").trim();
  if (rawValue.length > 2000 || message.length < 10 || message.length > 2000) {
    return "Your message must be between 10 and 2,000 characters.";
  }
  if (message.split("\n").length > 30) {
    return "Your message can contain no more than 30 lines.";
  }
  if (
    FORBIDDEN_CONTROL_CHARACTERS.test(message) ||
    HTML_TAG_PATTERN.test(message)
  ) {
    return "Please use plain text without HTML tags or control characters.";
  }
  return "";
}

function validateContactForm(values: ContactFieldValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  for (const field of ["name", "email", "phone", "message"] as const) {
    const fieldError = validateField(field, values[field]);
    if (fieldError) errors[field] = fieldError;
  }
  return errors;
}

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>(
    {},
  );
  const [messageLength, setMessageLength] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: ContactFieldValues = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };
    const validationErrors = validateContactForm(values);
    setTouched({ name: true, email: true, phone: true, message: true });
    setFieldErrors(validationErrors);
    setError("");
    setStatus("");
    const firstInvalidField = (
      ["name", "email", "phone", "message"] as const
    ).find((field) => validationErrors[field]);
    if (firstInvalidField) {
      document.getElementById(`contact-${firstInvalidField}`)?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitContactForm({
        fullName: values.name,
        emailAddress: values.email,
        phoneNumber: values.phone,
        message: values.message,
        website: String(formData.get("website") ?? ""),
      });

      if (!result.success) {
        const fieldByErrorCode: Record<string, ContactField> = {
          INVALID_NAME: "name",
          INVALID_EMAIL: "email",
          INVALID_PHONE: "phone",
          INVALID_MESSAGE: "message",
          UNSAFE_MESSAGE: "message",
        };
        const invalidField = result.errorCode
          ? fieldByErrorCode[result.errorCode]
          : undefined;
        if (invalidField) {
          setFieldErrors((current) => ({
            ...current,
            [invalidField]: result.message,
          }));
          document.getElementById(`contact-${invalidField}`)?.focus();
          return;
        }
        setError(result.message);
        return;
      }

      setStatus(
        result.reference
          ? `${result.message} Reference: ${result.reference}`
          : result.message,
      );
      form.reset();
      setFieldErrors({});
      setTouched({});
      setMessageLength(0);
    } catch (reason) {
      console.error("Contact form submission failed.", reason);
      setError(
        "We could not send your message right now. Please try again shortly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      noValidate
      className="rounded-sm bg-[#f5f5f2] p-6 sm:p-8"
    >
      <header className="mb-6 text-center">
        <h2 className="font-serif text-2xl font-semibold text-[#252a2c]">
          Send Us a Message
        </h2>
        <p className="mt-2 text-xs leading-5 text-[#677169]">
          We&apos;d love to hear from you. Share your question and our team will
          be in touch.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-xs font-medium text-[#37453c]"
          >
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            required
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            onBlur={(event) => {
              setTouched((current) => ({ ...current, name: true }));
              const value = validateField("name", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, name: value }));
            }}
            onChange={(event) => {
              if (!touched.name) return;
              const value = validateField("name", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, name: value }));
            }}
            className={`h-10 w-full border bg-white px-3 text-sm text-[#27382d] outline-none transition focus:ring-2 focus:ring-[#315f48]/15 ${fieldErrors.name ? "border-red-500 focus:border-red-500" : "border-[#dfe4dc] focus:border-[#315f48]"}`}
          />
          {fieldErrors.name ? (
            <p id="contact-name-error" className="mt-1 text-xs text-red-700">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-xs font-medium text-[#37453c]"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            onBlur={(event) => {
              setTouched((current) => ({ ...current, email: true }));
              const value = validateField("email", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, email: value }));
            }}
            onChange={(event) => {
              if (!touched.email) return;
              const value = validateField("email", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, email: value }));
            }}
            className={`h-10 w-full border bg-white px-3 text-sm text-[#27382d] outline-none transition focus:ring-2 focus:ring-[#315f48]/15 ${fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-[#dfe4dc] focus:border-[#315f48]"}`}
          />
          {fieldErrors.email ? (
            <p id="contact-email-error" className="mt-1 text-xs text-red-700">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1.5 block text-xs font-medium text-[#37453c]"
          >
            Phone Number <span className="text-[#7a857c]">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            maxLength={24}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
            onBlur={(event) => {
              setTouched((current) => ({ ...current, phone: true }));
              const value = validateField("phone", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, phone: value }));
            }}
            onChange={(event) => {
              if (!touched.phone) return;
              const value = validateField("phone", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, phone: value }));
            }}
            className={`h-10 w-full border bg-white px-3 text-sm text-[#27382d] outline-none transition focus:ring-2 focus:ring-[#315f48]/15 ${fieldErrors.phone ? "border-red-500 focus:border-red-500" : "border-[#dfe4dc] focus:border-[#315f48]"}`}
          />
          {fieldErrors.phone ? (
            <p id="contact-phone-error" className="mt-1 text-xs text-red-700">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-xs font-medium text-[#37453c]"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="Type your message here"
            required
            maxLength={2000}
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message ? "contact-message-error" : "contact-message-hint"
            }
            onBlur={(event) => {
              setTouched((current) => ({ ...current, message: true }));
              const value = validateField("message", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, message: value }));
            }}
            onChange={(event) => {
              setMessageLength(event.currentTarget.value.length);
              if (!touched.message) return;
              const value = validateField("message", event.currentTarget.value);
              setFieldErrors((current) => ({ ...current, message: value }));
            }}
            className={`w-full resize-y border bg-white px-3 py-2.5 text-sm text-[#27382d] outline-none transition focus:ring-2 focus:ring-[#315f48]/15 ${fieldErrors.message ? "border-red-500 focus:border-red-500" : "border-[#dfe4dc] focus:border-[#315f48]"}`}
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            {fieldErrors.message ? (
              <p
                id="contact-message-error"
                className="text-xs text-red-700"
              >
                {fieldErrors.message}
              </p>
            ) : (
              <p id="contact-message-hint" className="text-xs text-[#7a857c]">
                10–2,000 characters; plain text, up to 30 lines.
              </p>
            )}
            <span aria-live="polite" className="shrink-0 text-xs text-[#7a857c]">
              {messageLength}/2000
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status ? (
        <p role="status" className="mt-3 text-xs text-[#315f48]">
          {status}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#285d43] px-5 text-sm font-medium text-white transition-colors hover:bg-[#214d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285d43] disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? "Sending…" : "Submit Message"}
        {!submitting ? (
          <ArrowRight aria-hidden="true" className="size-4" />
        ) : null}
      </button>
    </form>
  );
}
