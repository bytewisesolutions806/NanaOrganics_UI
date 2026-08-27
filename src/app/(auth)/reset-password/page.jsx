"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputOtp } from "primereact/inputotp";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import {
  completePasswordReset,
  resendPasswordResetOtp,
  verifyResetOtp,
} from "@/service/AuthService";
import useAuthStore from "@/store/AuthStore";
import "./index.css";

const isStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

export default function ResetPassword() {
  const router = useRouter();
  const { clearPendingPasswordReset, hasHydrated, pendingPasswordReset, setPendingPasswordReset } =
    useAuthStore();
  const toast = useRef(null);

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (hasHydrated && !pendingPasswordReset) {
      router.replace("/forgotpassword");
    }
  }, [hasHydrated, pendingPasswordReset, router]);

  const validate = () => {
    let valid = true;

    if (!isStrongPassword(password)) {
      setPasswordError("Use at least 8 characters with uppercase, lowercase, number, and symbol.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    return valid;
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (!pendingPasswordReset?.email || loading) return;

    if (!pendingPasswordReset.resetToken && otp.length !== 6) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid code",
        detail: "Enter the six-digit verification code.",
        life: 3000,
      });
      return;
    }
    if (!validate()) return;

    try {
      setLoading(true);
      let resetToken = pendingPasswordReset.resetToken;

      if (!resetToken) {
        const verification = await verifyResetOtp({
          email: pendingPasswordReset.email,
          confirmationCode: otp,
        });
        if (!verification.success || !verification.resetToken) {
          throw new Error(verification.message || "The verification code is invalid.");
        }

        resetToken = verification.resetToken;
        setPendingPasswordReset({
          ...pendingPasswordReset,
          resetToken,
          resetTokenExpiresAt: verification.expiresAt,
        });
      }

      const result = await completePasswordReset({
        resetToken,
        newPassword: password,
      });
      if (!result.success) {
        if (result.errorCode === "INVALID_RESET_TOKEN") {
          setPendingPasswordReset({
            email: pendingPasswordReset.email,
            requestedAt: pendingPasswordReset.requestedAt,
          });
          setOtp("");
        }
        throw new Error(result.message || "Password reset failed.");
      }

      toast.current?.show({
        severity: "success",
        summary: "Password reset successful",
        detail: result.message || "You can now log in with your new password.",
        life: 2000,
      });

      setTimeout(() => {
        clearPendingPasswordReset();
        router.replace("/login");
      }, 1500);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Reset failed",
        detail: error?.message || "The code is invalid or expired.",
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingPasswordReset?.email || resending) return;

    try {
      setResending(true);
      const result = await resendPasswordResetOtp(pendingPasswordReset.email);
      if (!result.success) {
        throw new Error(result.message || "Could not resend the code.");
      }

      setPendingPasswordReset({
        email: pendingPasswordReset.email,
        expiresInSeconds: result.expiresInSeconds,
        retryAfterSeconds: result.retryAfterSeconds,
        requestedAt: Date.now(),
      });
      setOtp("");
      toast.current?.show({
        severity: "success",
        summary: "Code requested",
        detail: result.message || "A new password reset code was requested.",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Resend failed",
        detail: error?.message || "Could not resend the code.",
        life: 3000,
      });
    } finally {
      setResending(false);
    }
  };

  if (!hasHydrated || !pendingPasswordReset) return null;

  const maskedEmail = pendingPasswordReset.email.replace(/(.{1}).+(@.+)/, "$1***$2");
  const hasResetToken = Boolean(pendingPasswordReset.resetToken);

  return (
    <>
      <Toast ref={toast} position="top-right" className="h-[3rem]" />

      <div className="relative min-h-screen bg-white">
        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
          <div className="w-full flex items-center justify-center px-6 py-10">
            <form className="w-full max-w-md" onSubmit={handleReset}>
              <div className="flex justify-center mb-6">
                <Link href="/" aria-label="Go to home">
                  <Image
                    src="/AppLogo.svg"
                    width={150}
                    height={80}
                    alt="App Logo"
                    className="cursor-pointer"
                  />
                </Link>
              </div>

              <h2 className="text-2xl font-bold text-center">Reset your password</h2>
              <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                {hasResetToken
                  ? "Your code is verified. Choose a new password."
                  : `We sent a six-digit code to ${maskedEmail}`}
              </p>

              {!hasResetToken && (
                <div className="flex justify-center mb-6">
                  <InputOtp
                    value={otp}
                    onChange={(event) => setOtp(event.value || "")}
                    length={6}
                    integerOnly
                  />
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New password
                </label>
                <div className="relative w-full mt-3">
                  <i className="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
                  <InputText
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError("");
                    }}
                    autoComplete="new-password"
                    placeholder="Enter a strong password"
                    className={`w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB] border ${
                      passwordError ? "border-red-500" : "border-[#cfe2e0]"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    <i className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`} />
                  </button>
                </div>
                {passwordError ? (
                  <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Min 8 characters with uppercase, lowercase, number, and symbol
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm password
                </label>
                <div className="relative w-full mt-3">
                  <i className="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
                  <InputText
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setConfirmPasswordError("");
                    }}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={`w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB] border ${
                      confirmPasswordError ? "border-red-500" : "border-[#cfe2e0]"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                  >
                    <i className={`pi ${showConfirmPassword ? "pi-eye-slash" : "pi-eye"}`} />
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (!hasResetToken && otp.length !== 6)}
                aria-busy={loading}
                className="w-full h-[46px] rounded-lg font-semibold transition bg-[#1EA766] text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  "Reset password"
                )}
              </button>

              {!hasResetToken && (
                <p className="text-sm text-center mt-4">
                  Didn{"'"}t get a code?{" "}
                  <button
                    type="button"
                    className="text-[#21252C] font-semibold disabled:text-gray-400"
                    disabled={resending}
                    onClick={handleResend}
                    aria-busy={resending}
                  >
                    {resending ? (
                      <span className="inline-flex items-center gap-1.5">
                        <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                        Sending...
                      </span>
                    ) : (
                      "Resend code"
                    )}
                  </button>
                </p>
              )}

              <p className="text-sm text-center mt-4">
                Remember your password?{" "}
                <Link href="/login" className="text-[#1EA766] font-medium">
                  Back to login
                </Link>
              </p>
            </form>

            <div className="hidden lg:block absolute bottom-0 left-0 z-0">
              <Image
                src="/AuthMountain.svg"
                width={460}
                height={260}
                alt=""
                className="pointer-events-none select-none"
              />
            </div>
          </div>

          <div className="relative hidden lg:block">
            <Image
              src="/LoginPageImage01.webp"
              alt="Organic products"
              fill
              className="object-cover w-full h-full rounded-2xl p-4"
              sizes="(min-width: 1024px) 50vw, 0px"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </>
  );
}
