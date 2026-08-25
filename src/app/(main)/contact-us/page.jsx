'use client';

import { useState } from 'react';
import Image from 'next/image';
import Gallery from '@/components/Gallery';
import { MapPin, Phone, Mail, User, MessageSquare, LoaderCircle } from 'lucide-react';
import { submitContactForm } from '@/graphql/mutations/contact-form';

const EMPTY_FORM = {
  fullName: '',
  emailAddress: '',
  phoneNumber: '',
  message: '',
  website: '',
};

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const PHONE_PATTERN = /^\+?[0-9 ()-]+$/;
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function validate(values) {
  const errors = {};
  const fullName = values.fullName.normalize('NFKC').replace(/\s+/g, ' ').trim();
  const emailAddress = values.emailAddress.trim().toLowerCase();
  const phoneNumber = values.phoneNumber.trim();
  const message = values.message.normalize('NFKC').replace(/\r\n?/g, '\n').trim();

  if (fullName.length < 2 || fullName.length > 80 || !NAME_PATTERN.test(fullName)) {
    errors.fullName = 'Enter a valid full name using letters, spaces, apostrophes, or hyphens.';
  }
  if (emailAddress.length > 254 || !EMAIL_PATTERN.test(emailAddress)) {
    errors.emailAddress = 'Enter a valid email address.';
  }
  if (phoneNumber) {
    const digitCount = phoneNumber.replace(/\D/g, '').length;
    if (phoneNumber.length > 24 || !PHONE_PATTERN.test(phoneNumber) || digitCount < 7 || digitCount > 15) {
      errors.phoneNumber = 'Enter a valid phone number or leave it empty.';
    }
  }
  if (message.length < 10 || message.length > 2000) {
    errors.message = 'Message must be between 10 and 2,000 characters.';
  } else if (message.split('\n').length > 30) {
    errors.message = 'Message cannot contain more than 30 lines.';
  } else if (CONTROL_CHARACTER_PATTERN.test(message) || HTML_TAG_PATTERN.test(message)) {
    errors.message = 'Please send plain text without HTML or control characters.';
  }

  return {
    errors,
    normalized: { fullName, emailAddress, phoneNumber, message, website: values.website },
  };
}

const ERROR_FIELDS = {
  INVALID_NAME: 'fullName',
  INVALID_EMAIL: 'emailAddress',
  INVALID_PHONE: 'phoneNumber',
  INVALID_MESSAGE: 'message',
  UNSAFE_MESSAGE: 'message',
};

export default function ContactUs() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    if (status.type) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validation = validate(form);
    setErrors(validation.errors);
    setStatus({ type: '', message: '' });
    if (Object.keys(validation.errors).length) return;

    setIsSubmitting(true);
    try {
      const result = await submitContactForm({
        ...validation.normalized,
        phoneNumber: validation.normalized.phoneNumber || null,
      });

      if (!result?.success) {
        const field = ERROR_FIELDS[result?.errorCode];
        if (field) setErrors({ [field]: result.message });
        const retryMessage = result?.retryAfterSeconds
          ? ` Try again in about ${result.retryAfterSeconds} seconds.`
          : '';
        setStatus({
          type: 'error',
          message: `${result?.message || 'Your message could not be sent.'}${retryMessage}`,
        });
        return;
      }

      setForm(EMPTY_FORM);
      setErrors({});
      setStatus({
        type: 'success',
        message: result.reference
          ? `${result.message} Reference: ${result.reference}.`
          : result.message,
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'We could not send your message right now. Please try again shortly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="mb-10">
        <Gallery />
      </section>

      <section className="relative mt-2 overflow-visible">
        <div className="relative mx-auto w-full p-5 pb-28 md:p-10 md:pb-40 lg:max-w-7xl">
          <div className="grid grid-cols-1 gap-10 rounded-2xl p-6 md:grid-cols-2 md:p-10">
            <div className="order-1">
              <h2 className="mb-2 text-3xl font-semibold text-gray-900">Contact Information</h2>
              <p className="mb-8 text-gray-600">
                We&apos;re here to help. Whether you have a question or need support.
              </p>

              <div className="space-y-6">
                <InfoItem
                  icon={<MapPin />}
                  title="Address"
                  value="123 Street Name, City, State, ZIP"
                />
                <InfoItem icon={<Phone />} title="Phone" value="+91 98765 43210" />
                <InfoItem icon={<Mail />} title="Email" value="support@nanaorganics.co" />
              </div>
            </div>

            <div className="relative z-10 order-2 mt-6 rounded-2xl bg-[#E6F4F2] p-6 shadow-sm md:mt-0 md:p-8">
              <h3 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Send Us a Message
              </h3>
              <p className="mb-6 text-center text-gray-600">
                Have a question or request? Tell us a little about it below and our team will get
                back to you shortly.
              </p>

              {status.message ? (
                <div
                  role={status.type === 'error' ? 'alert' : 'status'}
                  className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                    status.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <form className="space-y-2" onSubmit={handleSubmit} noValidate>
                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  icon={<User size={18} />}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={updateField}
                  error={errors.fullName}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                <Input
                  id="emailAddress"
                  name="emailAddress"
                  type="email"
                  label="Email Address"
                  icon={<Mail size={18} />}
                  placeholder="Enter your email"
                  value={form.emailAddress}
                  onChange={updateField}
                  error={errors.emailAddress}
                  autoComplete="email"
                  maxLength={254}
                  required
                />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  label="Phone Number (Optional)"
                  icon={<Phone size={18} />}
                  placeholder="Enter your phone number"
                  value={form.phoneNumber}
                  onChange={updateField}
                  error={errors.phoneNumber}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={24}
                />
                <Textarea
                  id="message"
                  name="message"
                  label="Message"
                  icon={<MessageSquare size={18} />}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={updateField}
                  error={errors.message}
                  maxLength={2000}
                  required
                />

                <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    value={form.website}
                    onChange={updateField}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1EA766] py-3 font-medium text-white transition hover:bg-[#188f57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Submit Message →'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <Image
          src="/AuthMountain.svg"
          alt=""
          width={1200}
          height={320}
          className="pointer-events-none absolute bottom-0 left-0 z-0 max-h-[180px] w-[95%] object-contain md:max-h-[320px] md:w-[80%] lg:max-h-[420px]"
        />
      </section>
    </>
  );
}

function InfoItem({ icon, title, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg bg-[#E5F2F0] p-3 text-[#1EA766]">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{value}</p>
      </div>
    </div>
  );
}

function Input({ id, name, label, icon, error, type = 'text', required, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div className="mt-6">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}{required ? <span className="text-red-600"> *</span> : null}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          {...inputProps}
          id={id}
          name={name}
          type={type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-lg border bg-[#F5FCFB] py-3 pl-10 pr-4 outline-none transition focus:bg-white focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-200 focus:border-green-600 focus:ring-green-600/25'
          }`}
        />
      </div>
      {error ? <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function Textarea({ id, name, label, icon, error, required, value, ...textareaProps }) {
  const errorId = `${id}-error`;
  return (
    <div className="mt-6">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-gray-800">
          {label}{required ? <span className="text-red-600"> *</span> : null}
        </label>
        <span className="text-xs text-gray-500">{value.length}/2000</span>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3 text-gray-400">{icon}</span>
        <textarea
          {...textareaProps}
          id={id}
          name={name}
          value={value}
          rows={5}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full resize-none rounded-lg border bg-[#F5FCFB] py-3 pl-10 pr-4 outline-none transition focus:bg-white focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-200 focus:border-green-600 focus:ring-green-600/25'
          }`}
        />
      </div>
      {error ? <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
