"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  UserRound,
} from "lucide-react";
import {
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useState,
  useRef,
  useSyncExternalStore,
  useEffect,
} from "react";

import {
  login,
  requestPasswordReset,
  requestSignup,
  resendPasswordResetCode,
  resendSignupCode,
  resetPassword,
  verifyPasswordResetCode,
  verifySignupCode,
  getActiveCustomer,
} from "@/services/api/auth";

type AuthPageMode =
  | "signup"
  | "login"
  | "forgot-password"
  | "verify-otp"
  | "set-new-password";
type AuthFlow = "signup" | "password-reset";
type AuthField = "fullName" | "email" | "password" | "confirmPassword" | "otp";
type AuthFieldErrors = Partial<Record<AuthField, string>>;

const STORAGE_KEYS = {
  email: "nana-auth-email",
  flow: "nana-auth-flow",
  resetToken: "nana-auth-reset-token",
  resendAt: "nana-auth-resend-at",
} as const;
const AUTH_STORAGE_EVENT = "nana-auth-storage-change";

const passwordRequirements =
  "Use at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a symbol.";

function passwordError(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/\d/.test(password)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one symbol.";
  return null;
}

function saveAuthFlow(email: string, flow: AuthFlow, retryAfterSeconds = 60) {
  sessionStorage.setItem(STORAGE_KEYS.email, email);
  sessionStorage.setItem(STORAGE_KEYS.flow, flow);
  sessionStorage.setItem(
    STORAGE_KEYS.resendAt,
    String(Date.now() + retryAfterSeconds * 1000),
  );
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

function clearAuthFlow() {
  Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

function subscribeToAuthStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_STORAGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_STORAGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function useAuthStorageValue(key: string) {
  return useSyncExternalStore(
    subscribeToAuthStorage,
    () => sessionStorage.getItem(key) ?? "",
    () => "",
  );
}

function subscribeToCooldown(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_STORAGE_EVENT, callback);
  const timer = window.setInterval(callback, 1000);
  return () => {
    window.removeEventListener(AUTH_STORAGE_EVENT, callback);
    window.clearInterval(timer);
  };
}

function getCooldownSnapshot() {
  const resendAt = Number(sessionStorage.getItem(STORAGE_KEYS.resendAt));
  return Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
}

function AuthInput({
  label,
  icon,
  type = "text",
  errorMessage,
  ...props
}: {
  label: string;
  icon: ReactNode;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  errorMessage?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;
  const errorId =
    errorMessage && props.name ? `${props.name}-error` : undefined;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#35443a]">
        {label}
        {props.required ? (
          <span aria-hidden="true" className="ml-1 text-[#ed3947]">
            *
          </span>
        ) : null}
      </span>
      <span className="relative flex items-center">
        <span className="pointer-events-none absolute left-3.5 text-[#738078]">
          {icon}
        </span>
        <input
          {...props}
          type={inputType}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorId}
          className={`h-[60px] w-full rounded-[10px] border pl-11 pr-12 text-base text-[#27382d] outline-none transition placeholder:text-[#75827b] focus:ring-2 ${
            errorMessage
              ? "border-[#ff3b47] bg-[#f4fbfa] focus:border-[#ff3b47] focus:ring-[#ff3b47]/15"
              : "border-[#d9e0db] bg-white focus:border-[#2c5d43] focus:ring-[#2c5d43]/15"
          }`}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((current) => !current)}
            className="absolute right-3.5 text-[#738078] hover:text-[#2c5d43]"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      {errorMessage ? (
        <span
          id={errorId}
          className="mt-1.5 block text-xs font-medium text-[#d52f3d]"
        >
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
}

function AuthButton({
  children,
  disabled,
  type = "submit",
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#2c5d43] px-5 text-sm font-semibold text-white transition hover:bg-[#234b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AuthPage({
  mode,
  passwordReset = false,
}: {
  mode: AuthPageMode;
  passwordReset?: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const storedEmail = useAuthStorageValue(STORAGE_KEYS.email);
  const [emailInput, setEmailInput] = useState("");
  const email = mode === "verify-otp" ? storedEmail : emailInput;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const storedFlow = useAuthStorageValue(STORAGE_KEYS.flow);
  const flow: AuthFlow | null =
    storedFlow === "signup" || storedFlow === "password-reset"
      ? storedFlow
      : null;
  const resetToken = useAuthStorageValue(STORAGE_KEYS.resetToken);
  const cooldown = useSyncExternalStore(
    subscribeToCooldown,
    getCooldownSnapshot,
    () => 0,
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState(
    passwordReset ? "Your password has been updated. You can now log in." : "",
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getActiveCustomer()
      .then((customer) => {
        if (active && customer) router.replace("/account");
      })
      .catch((error: unknown) => {
        console.error("Could not check the current customer session.", error);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const setResendCooldown = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    sessionStorage.setItem(
      STORAGE_KEYS.resendAt,
      String(Date.now() + safeSeconds * 1000),
    );
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
  };

  const clearFieldError = (field: AuthField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = otp.replace(/\D/g, "");
    const validationErrors: AuthFieldErrors = {};
    if (mode !== "verify-otp" && mode !== "set-new-password") {
      if (!normalizedEmail) {
        validationErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        validationErrors.email = "Enter a valid email address.";
      }
    }
    if (mode === "signup") {
      if (!fullName.trim()) {
        validationErrors.fullName = "Full name is required.";
      }
      if (!password) {
        validationErrors.password = "Password is required.";
      } else {
        const validationError = passwordError(password);
        if (validationError) validationErrors.password = validationError;
      }
      if (!confirmPassword) {
        validationErrors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        validationErrors.confirmPassword = "Your passwords do not match.";
      }
    }
    if (mode === "login" && !password) {
      validationErrors.password = "Password is required.";
    }
    if (mode === "verify-otp" && !/^\d{5}$/.test(otpCode)) {
      validationErrors.otp = "Enter the 5-digit verification code.";
    }
    if (mode === "set-new-password") {
      if (!password) {
        validationErrors.password = "Password is required.";
      } else {
        const validationError = passwordError(password);
        if (validationError) validationErrors.password = validationError;
      }
      if (!confirmPassword) {
        validationErrors.confirmPassword = "Please confirm your password.";
      } else if (password !== confirmPassword) {
        validationErrors.confirmPassword = "Your passwords do not match.";
      }
    }
    setFieldErrors(validationErrors);
    if (mode === "set-new-password" && !resetToken) {
      setError("Your password reset session has expired. Request a new code.");
      return;
    }
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { requestCustomerSignup } = await requestSignup({
          fullName: fullName.trim(),
          emailAddress: normalizedEmail,
          ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
          password,
        });
        if (!requestCustomerSignup.success) {
          throw new Error(
            requestCustomerSignup.message ?? "Unable to create your account.",
          );
        }
        saveAuthFlow(
          normalizedEmail,
          "signup",
          requestCustomerSignup.retryAfterSeconds,
        );
        router.push("/verify-otp");
      } else if (mode === "login") {
        const { loginWithJwt } = await login({
          emailAddress: normalizedEmail,
          password,
          rememberMe,
        });
        if (!loginWithJwt.success) {
          throw new Error(loginWithJwt.message ?? "Unable to log in.");
        }
        clearAuthFlow();
        router.push("/account");
      } else if (mode === "forgot-password") {
        const { requestCustomerPasswordReset: result } =
          await requestPasswordReset(normalizedEmail);
        if (!result.success) {
          throw new Error(result.message ?? "Unable to request a reset code.");
        }
        saveAuthFlow(
          normalizedEmail,
          "password-reset",
          result.retryAfterSeconds,
        );
        router.push("/verify-otp");
      } else if (mode === "verify-otp") {
        if (!flow || !normalizedEmail) {
          throw new Error(
            "Start again from the signup or forgot-password page.",
          );
        }
        if (flow === "signup") {
          const { verifyCustomerSignupCode: result } = await verifySignupCode(
            normalizedEmail,
            otpCode,
          );
          if (!result.success) {
            throw new Error(
              result.message ?? "The verification code was not accepted.",
            );
          }
          clearAuthFlow();
          router.push("/account");
        } else {
          const { verifyCustomerPasswordResetCode: result } =
            await verifyPasswordResetCode(normalizedEmail, otpCode);
          if (!result.success || !result.resetToken) {
            throw new Error(
              result.message ?? "The verification code was not accepted.",
            );
          }
          sessionStorage.setItem(STORAGE_KEYS.resetToken, result.resetToken);
          window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
          router.push("/set-new-password");
        }
      } else {
        const { resetCustomerPassword: result } = await resetPassword(
          resetToken,
          password,
        );
        if (!result.success) {
          throw new Error(result.message ?? "Unable to reset your password.");
        }
        clearAuthFlow();
        router.push("/login?passwordReset=1");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!email || !flow || cooldown > 0) return;
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const result =
        flow === "signup"
          ? (await resendSignupCode(email)).resendCustomerSignupCode
          : (await resendPasswordResetCode(email))
              .resendCustomerPasswordResetCode;
      if (!result.success) {
        throw new Error(result.message ?? "Unable to resend the code.");
      }
      setResendCooldown(result.retryAfterSeconds);
      setNotice("A new code has been sent if the account is eligible.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to resend the code. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const heading = {
    signup: "Create your account",
    login: "Welcome back",
    "forgot-password": "Forgot password?",
    "verify-otp": "Check Your Email",
    "set-new-password": "Set a new password",
  }[mode];
  const description = {
    signup: "Join Nana Organics for a more thoughtful everyday.",
    login: "Sign in to continue to your Nana Organics account.",
    "forgot-password": "Enter your email and we’ll send you a reset code.",
    "verify-otp": "We sent a 5 digit code to",
    "set-new-password": "Choose a strong password for your account.",
  }[mode];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6">
      <Image
        src="/images/Auth-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-white/55" aria-hidden="true" />
      <section
        className={`relative z-10 w-full px-5 py-8 sm:px-8 ${
          mode === "verify-otp" ? "max-w-[600px]" : "max-w-[520px]"
        }`}
      >
        <Link
          href="/"
          aria-label="Nana Organics home"
          className={`mx-auto flex w-fit ${
            mode === "verify-otp" ? "mb-2" : "mb-6"
          }`}
        >
          <Image
            src="/images/AppLogo.svg"
            alt="Nana Organics"
            width={180}
            height={110}
            unoptimized
            className={`w-auto object-contain ${
              mode === "verify-otp" ? "h-[105px] sm:h-[115px]" : "h-33"
            }`}
          />
        </Link>
        <div
          className={`text-center ${mode === "verify-otp" ? "mb-8" : "mb-7"}`}
        >
          <h1 className="font-serif text-3xl font-semibold text-[#252a30] sm:text-[34px]">
            {heading}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#596168] sm:text-base">
            {mode === "verify-otp" ? (
              <>
                {description}{" "}
                <strong className="font-semibold">
                  {email || "your email"}
                </strong>
              </>
            ) : (
              description
            )}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="mb-5 rounded-md border border-[#cbdccd] bg-[#f1f7f2] px-3.5 py-3 text-sm text-[#2c5d43]"
          >
            {notice}
          </p>
        ) : null}

        <form
          className={mode === "verify-otp" ? "space-y-0" : "space-y-4"}
          noValidate
          onSubmit={handleSubmit}
        >
          {mode === "signup" ? (
            <>
              <AuthInput
                label="Full name"
                name="name"
                autoComplete="name"
                required
                value={fullName}
                errorMessage={fieldErrors.fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError("fullName");
                }}
                placeholder="Your full name"
                icon={<UserRound size={18} />}
              />
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                errorMessage={fieldErrors.email}
                onChange={(event) => {
                  setEmailInput(event.target.value);
                  clearFieldError("email");
                }}
                placeholder="Enter your email address"
                icon={<UserRound size={18} />}
              />
              <AuthInput
                label="Phone number (optional)"
                name="tel"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Your phone number"
                icon={<Phone size={18} />}
              />
              <AuthInput
                label="Password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                errorMessage={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                placeholder="Create a password"
                icon={<KeyRound size={18} />}
              />
              <AuthInput
                label="Confirm password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                errorMessage={fieldErrors.confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  clearFieldError("confirmPassword");
                }}
                placeholder="Enter your password again"
                icon={<KeyRound size={18} />}
              />
              <p className="text-xs leading-5 text-[#748078]">
                {passwordRequirements}
              </p>
            </>
          ) : null}

          {mode === "login" ? (
            <>
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                errorMessage={fieldErrors.email}
                onChange={(event) => {
                  setEmailInput(event.target.value);
                  clearFieldError("email");
                }}
                placeholder="Enter your email address"
                icon={<UserRound size={18} />}
              />
              <AuthInput
                label="Password"
                name="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                errorMessage={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                placeholder="Enter your password"
                icon={<KeyRound size={18} />}
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#58645c]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 accent-[#2c5d43]"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="font-medium text-[#2c5d43] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          ) : null}

          {mode === "forgot-password" ? (
            <AuthInput
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              errorMessage={fieldErrors.email}
              onChange={(event) => {
                setEmailInput(event.target.value);
                clearFieldError("email");
              }}
              placeholder="Enter your email address"
              icon={<UserRound size={18} />}
            />
          ) : null}

          {mode === "verify-otp" ? (
            <>
              <div
                role="group"
                aria-label="5-digit verification code"
                aria-describedby={fieldErrors.otp ? "otp-error" : undefined}
                className="mx-auto flex max-w-[360px] justify-center gap-3 sm:gap-[18px]"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpInputRefs.current[index] = element;
                    }}
                    aria-label={`Digit ${index + 1}`}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]"
                    value={otp[index]?.trim() ?? ""}
                    onChange={(event) => {
                      const digit = event.target.value
                        .replace(/\D/g, "")
                        .slice(-1);
                      const next = otp.padEnd(5, " ").split("");
                      next[index] = digit || " ";
                      setOtp(next.join(""));
                      clearFieldError("otp");
                      if (digit && index < 4) {
                        otpInputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Backspace" &&
                        !otp[index]?.trim() &&
                        index > 0
                      ) {
                        otpInputRefs.current[index - 1]?.focus();
                      }
                    }}
                    onPaste={(event) => {
                      const pasted = event.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 5);
                      if (!pasted) return;
                      event.preventDefault();
                      setOtp(pasted.padEnd(5, " "));
                      clearFieldError("otp");
                      otpInputRefs.current[Math.min(pasted.length, 4)]?.focus();
                    }}
                    className={`h-16 min-w-0 flex-1 rounded-md border bg-white text-center text-2xl font-medium text-[#27382d] outline-none transition focus:ring-2 sm:h-16 sm:max-w-[56px] ${
                      fieldErrors.otp
                        ? "border-[#ff3b47] focus:border-[#ff3b47] focus:ring-[#ff3b47]/15"
                        : "border-[#cbd8d7] focus:border-[#2c5d43] focus:ring-[#2c5d43]/15"
                    }`}
                  />
                ))}
              </div>
              {fieldErrors.otp ? (
                <p
                  id="otp-error"
                  className="mt-2 text-center text-xs font-medium text-[#d52f3d]"
                >
                  {fieldErrors.otp}
                </p>
              ) : null}
              <div className="mx-auto mt-6 max-w-[355px]">
                <AuthButton disabled={submitting}>
                  {submitting ? "Please wait..." : "Verify"}
                  {!submitting ? <ArrowRight size={17} /> : null}
                </AuthButton>
              </div>
              <div className="mt-4 text-center text-sm">
                {cooldown > 0 ? (
                  <span className="text-[#748078]">
                    Resend code in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={submitting || !flow || !email}
                    className="font-semibold text-[#2c5d43] hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </>
          ) : null}

          {mode === "set-new-password" ? (
            <>
              <AuthInput
                label="New password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                errorMessage={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                placeholder="Create a new password"
                icon={<KeyRound size={18} />}
              />
              <AuthInput
                label="Confirm new password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                errorMessage={fieldErrors.confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  clearFieldError("confirmPassword");
                }}
                placeholder="Enter your new password again"
                icon={<KeyRound size={18} />}
              />
              <p className="text-xs leading-5 text-[#748078]">
                {passwordRequirements}
              </p>
            </>
          ) : null}

          {mode !== "verify-otp" ? (
            <AuthButton disabled={submitting}>
              {submitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : mode === "login"
                    ? "Log in"
                    : mode === "forgot-password"
                      ? "Send reset code"
                      : "Save new password"}
              {!submitting ? <ArrowRight size={17} /> : null}
            </AuthButton>
          ) : null}
        </form>

        <div
          className={`text-center text-sm text-[#424a50] ${
            mode === "verify-otp" ? "mt-16 space-y-7" : "mt-6"
          }`}
        >
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#2c5d43] hover:underline"
              >
                Log in
              </Link>
            </>
          ) : mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#2c5d43] hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : mode === "forgot-password" ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-[#2c5d43] hover:underline"
            >
              <ArrowLeft size={15} /> Back to login
            </Link>
          ) : mode === "verify-otp" ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 hover:text-[#2c5d43]"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
              <p>
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#35443a] hover:text-[#2c5d43] hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <Link
              href="/login"
              className="font-semibold text-[#2c5d43] hover:underline"
            >
              Back to login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
