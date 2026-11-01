"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Eye, EyeOff, Lock, UserRound } from "lucide-react";

import {
  changeProfilePassword,
  type CustomerProfile,
  getCustomerProfile,
  requestProfilePasswordCode,
  resendProfilePasswordCode,
  updateCustomerProfile,
  uploadCustomerProfilePhoto,
  verifyProfilePasswordCode,
} from "@/services/api/profile";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type PasswordStage = "idle" | "code" | "password";

interface ProfileForm {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
}

const emptyForm: ProfileForm = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  phoneNumber: "",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-[#cfe3df] bg-[#f7f7f7] px-3 text-sm text-[#26322e] outline-none transition focus:border-[#2c665e] focus:ring-2 focus:ring-[#2c665e]/10 disabled:cursor-not-allowed disabled:bg-[#eeeeec] disabled:text-[#69716e]";
const outlineButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-[#698b81] px-5 text-sm font-semibold text-[#2c665e] transition hover:bg-[#f1f8f6] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2c665e] px-5 text-sm font-semibold text-white transition hover:bg-[#214f49] disabled:cursor-not-allowed disabled:opacity-50";

function ErrorMessage({ children }: { children: string }) {
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </p>
  );
}

function SuccessMessage({ children }: { children: string }) {
  return (
    <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      {children}
    </p>
  );
}

export function ProfileSettings() {
  const router = useRouter();
  const previewUrl = useRef("");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getCustomerProfile()
      .then((customer) => {
        if (!active) return;
        setProfile(customer);
        setForm({
          firstName: customer.firstName,
          lastName: customer.lastName,
          emailAddress: customer.emailAddress,
          phoneNumber: customer.phoneNumber,
        });
        setPhotoPreview(customer.profilePhotoUrl);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Could not load your profile.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) {
          router.replace("/login");
          return;
        }
        setProfileError(message);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, [router]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProfileError("");
    setProfileSuccess("");
    if (!file.type.startsWith("image/")) {
      setProfileError("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setProfileError("Profile photo must be 5 MB or smaller.");
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setPhotoPreview(previewUrl.current);
    setPendingPhoto(file);
  }

  function cancelEditing() {
    if (!profile) return;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = "";
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      emailAddress: profile.emailAddress,
      phoneNumber: profile.phoneNumber,
    });
    setPhotoPreview(profile.profilePhotoUrl);
    setPendingPhoto(null);
    setProfileError("");
    setEditing(false);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setProfileError("First name and last name are required.");
      return;
    }
    if (form.phoneNumber && form.phoneNumber.trim().length < 8) {
      setProfileError("Enter a valid phone number.");
      return;
    }

    setSaving(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      let customer = await updateCustomerProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      if (pendingPhoto) customer = await uploadCustomerProfilePhoto(pendingPhoto);

      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = "";
      setProfile(customer);
      setForm({
        firstName: customer.firstName,
        lastName: customer.lastName,
        emailAddress: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
      });
      setPhotoPreview(customer.profilePhotoUrl);
      setPendingPhoto(null);
      setEditing(false);
      setProfileSuccess("Profile updated successfully.");
      window.dispatchEvent(new Event("nana-auth-state-changed"));
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-2xl border border-[#cfe3df] bg-white">
        <div className="text-center">
          <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-[#cfe3df] border-t-[#2c665e]" />
          <p className="mt-3 text-sm text-[#66736e]">Loading your profile…</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="profile-heading">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2c665e]">My account</p>
        <h1 id="profile-heading" className="mt-1 text-3xl font-semibold text-[#1f2c27]">
          Profile Management
        </h1>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-[#cfe3df] bg-white lg:grid-cols-2">
        <div className="p-5 sm:p-7 lg:border-r lg:border-[#dce9e6]">
          <div className="mb-6 flex items-center gap-2 text-[#25332e]">
            <UserRound size={19} strokeWidth={1.8} />
            <h2 className="font-semibold">Personal Information</h2>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#cfe3df] bg-[#edf5f1] text-[#2c665e]">
              {photoPreview ? (
                // The profile photo can be hosted by the configured Vendure asset server.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Profile" className="size-full object-cover" />
              ) : (
                <UserRound aria-hidden="true" size={32} strokeWidth={1.5} />
              )}
            </div>
            <label
              className={`inline-flex items-center gap-2 text-sm font-semibold ${
                editing && !saving
                  ? "cursor-pointer text-[#2c665e] hover:text-[#1ea766]"
                  : "cursor-not-allowed text-[#9aa39f]"
              }`}
            >
              <Camera size={17} />
              {saving && pendingPhoto ? "Uploading…" : "Upload Photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={!editing || saving}
                onChange={choosePhoto}
                className="sr-only"
              />
            </label>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            {profileError ? <ErrorMessage>{profileError}</ErrorMessage> : null}
            {profileSuccess ? <SuccessMessage>{profileSuccess}</SuccessMessage> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
                First name
                <input
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  disabled={!editing || saving}
                  autoComplete="given-name"
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
                Last name
                <input
                  value={form.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  disabled={!editing || saving}
                  autoComplete="family-name"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
              Email
              <input
                value={form.emailAddress}
                disabled
                autoComplete="email"
                className={fieldClass}
              />
              <span className="font-normal text-[#9aa39f]">Email cannot be changed here.</span>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
              Phone
              <input
                value={form.phoneNumber}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
                disabled={!editing || saving}
                autoComplete="tel"
                className={fieldClass}
              />
            </label>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setProfileError("");
                  setProfileSuccess("");
                  setEditing(true);
                }}
                disabled={!profile}
                className={outlineButtonClass}
              >
                Edit Profile <span aria-hidden="true" className="ml-2">→</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-3 pt-1">
                <button type="button" onClick={cancelEditing} disabled={saving} className={outlineButtonClass}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={primaryButtonClass}>
                  {saving ? "Saving…" : "Save →"}
                </button>
              </div>
            )}
          </form>
        </div>

        <PasswordSettings emailAddress={form.emailAddress} />
      </div>
    </section>
  );
}

function PasswordSettings({ emailAddress }: { emailAddress: string }) {
  const [stage, setStage] = useState<PasswordStage>("idle");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const maskedEmail = emailAddress
    ? emailAddress.replace(/(.{1}).+(@.+)/, "$1***$2")
    : "your email";

  function resetFlow(clearMessage = true) {
    setStage("idle");
    setCode("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    if (clearMessage) setSuccess("");
  }

  async function sendCode(resend = false) {
    if (!emailAddress) {
      setError("Your account email is unavailable. Refresh the profile and try again.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = resend
        ? await resendProfilePasswordCode(emailAddress)
        : await requestProfilePasswordCode(emailAddress);
      if (!result.success) throw new Error(result.message || "Could not send the verification code.");
      setCode("");
      setResetToken("");
      setStage("code");
      setSuccess(`A six-digit verification code was sent to ${maskedEmail}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send the verification code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit verification code.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await verifyProfilePasswordCode(emailAddress, code);
      if (!result.success || !result.resetToken) throw new Error(result.message || "The code is invalid.");
      setResetToken(result.resetToken);
      setStage("password");
      setSuccess("Email verified. Enter your new password.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The code is invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!strongPassword.test(newPassword)) {
      setError("Use 8+ characters with uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await changeProfilePassword(resetToken, newPassword);
      if (!result.success) throw new Error(result.message || "Could not update the password.");
      resetFlow(false);
      setSuccess(result.message || "Password updated successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the password.");
    } finally {
      setSubmitting(false);
    }
  }

  const strength = [
    newPassword.length >= 8,
    /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^A-Za-z0-9]/.test(newPassword),
  ].filter(Boolean).length;

  return (
    <div className="border-t border-[#dce9e6] p-5 sm:p-7 lg:border-t-0">
      <div className="mb-6 flex items-center gap-2 text-[#25332e]">
        <Lock size={19} strokeWidth={1.8} />
        <h2 className="font-semibold">Update Password</h2>
      </div>

      <div className="space-y-4">
        {success ? <SuccessMessage>{success}</SuccessMessage> : null}
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        {stage === "idle" ? (
          <>
            <input value="••••••••••••••" disabled readOnly aria-label="Current password" className={fieldClass} />
            <p className="text-xs leading-5 text-[#66736e]">
              We’ll verify your account email before allowing a password change.
            </p>
            <button type="button" onClick={() => sendCode()} disabled={submitting || !emailAddress} className={outlineButtonClass}>
              {submitting ? "Sending code…" : "Change Password →"}
            </button>
          </>
        ) : null}

        {stage === "code" ? (
          <>
            <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
              Email verification code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                disabled={submitting}
                className={`${fieldClass} tracking-[0.25em]`}
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={verifyCode} disabled={submitting || code.length !== 6} className={primaryButtonClass}>
                {submitting ? "Verifying…" : "Verify Email →"}
              </button>
              <button type="button" onClick={() => sendCode(true)} disabled={submitting} className="text-sm font-semibold text-[#2c665e] underline disabled:opacity-50">
                Resend code
              </button>
              <button type="button" onClick={() => resetFlow()} disabled={submitting} className="text-sm text-[#66736e] underline disabled:opacity-50">
                Cancel
              </button>
            </div>
          </>
        ) : null}

        {stage === "password" ? (
          <form onSubmit={updatePassword} className="space-y-4">
            <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
              New password
              <span className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={submitting}
                  className={`${fieldClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#66736e] hover:text-[#2c665e]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <div aria-label={`Password strength: ${strength} of 4`} className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((level) => (
                <span key={level} className={`h-1.5 rounded-full ${strength >= level ? "bg-[#1ea766]" : "bg-[#dfe7e3]"}`} />
              ))}
            </div>
            <p className="text-xs leading-5 text-[#7a8581]">8+ characters with uppercase, lowercase, a number, and a symbol.</p>
            <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                className={fieldClass}
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="button" onClick={() => resetFlow()} disabled={submitting} className={outlineButtonClass}>Cancel</button>
              <button type="submit" disabled={submitting} className={primaryButtonClass}>{submitting ? "Updating…" : "Update Password →"}</button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
