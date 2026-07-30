"use client";
import { InputText } from "primereact/inputtext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import Link from "next/link";
import useAuthStore from "@/store/AuthStore";
import { InputOtp } from "primereact/inputotp";
import { VerfiyResetOTP } from "@/service/AuthService";
import "./index.css";

export default function ResetPassword() {
  const router = useRouter();
  const { pendingPasswordReset } = useAuthStore();
 

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [otp, setOtp] = useState("");
  const toast = useRef(null);

  const isValidPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value);

  const handleVerify = async () => {
    let hasError = false;

    // ✅ OTP validation
    if (otp.length !== 6) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid Code",
        detail: "Please enter the 6-digit verification code",
        life: 3000,
      });
      return;
    }

    // ✅ Password validation
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!isValidPassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters with 1 uppercase, 1 number & 1 symbol"
      );
      hasError = true;
    } else {
      setPasswordError("");
    }

    // ✅ Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (hasError) return;

    try {
      const payload = {
        email: pendingPasswordReset.email, // ✅ from store
        confirmation_code: otp, // ✅ OTP
        new_password: password, // ✅ new password
        confirm_password: confirmPassword, // ✅ confirm password
      };

      const res = await VerfiyResetOTP(payload);

      if (!res.success) {
        throw new Error(res.message || "Password reset failed");
      }

      toast.current?.show({
        severity: "success",
        summary: "Password Reset Successful",
        detail: "You can now login with your new password",
        life: 2500,
      });

      // ✅ clear reset state
      // useAuthStore.getState().clearPendingPasswordReset();

      setTimeout(() => {
        router.replace("/login");
      }, 2500);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Reset Failed",
        detail: err?.message || "Invalid or expired code",
        life: 3000,
      });
    }
  };

   if (!pendingPasswordReset) {
    router.replace("/forgotpassword");
    return null;
  }

  // if (!pendingVerification) {
  //   router.replace("/signup");
  //   return null;
  // }

  return (
    <>
      <Toast ref={toast} position="top-right" className="h-[3rem]" />

      <div className="relative min-h-screen bg-white">
        {/* GRID WRAPPER (fixes layout) */}
        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT SECTION */}
          <div className="w-full flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                {/* <Image src="/AppLogo.png" alt="Logo" width={120} height={100} /> */}
                <Link href="/" aria-label="Go to home">
                  <img
                    src="/AppLogo.svg"
                    width="150"
                    height="80"
                    alt="App Logo"
                    className="cursor-pointer"
                  />
                </Link>
              </div>

              <h2 className="text-2xl font-bold text-center">
                Start your Journey
              </h2>

              <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                We sent a 6 digit code to{" "}
              </p>

              {/* OTP Input */}
              <div className="flex justify-center mb-6 ">
                <InputOtp
                  className=" border border-[#C4D7D5] "
                  value={otp}
                  onChange={(e) => setOtp(e.value)}
                  length={6}
                  integerOnly
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="text-sm font-medium">Password</label>

                {/* ✅ INPUT WRAPPER (relative ONLY here) */}
                <div className="relative w-full mt-3">
                  {/* Lock Icon */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <i className="pi pi-lock text-[#2c665e]" />
                  </div>

                  {/* Input */}
                  <InputText
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Strong Password"
                    className={`
                                 w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB]
                                 border
                                 ${
                                   passwordError
                                     ? "border-red-500 focus:border-red-500"
                                     : "border-[#cfe2e0]"
                                 }
                               `}
                  />

                  {/* Eye Icon */}
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`pi ${
                        showPassword ? "pi-eye-slash" : "pi-eye"
                      }`}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>

                {/* ✅ Helper text OUTSIDE relative container */}
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, 1 uppercase, 1 number, 1 symbol
                </p>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="text-sm font-medium">Confirm Password</label>

                <div className="relative w-full mt-3">
                  {/* Lock Icon */}
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <i className="pi pi-lock text-[#2c665e]" />
                  </div>

                  {/* Input */}
                  <InputText
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`
                                 w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB]
                                 border
                                 ${
                                   confirmPasswordError
                                     ? "border-red-500 focus:border-red-500"
                                     : "border-[#cfe2e0]"
                                 }
                               `}
                  />

                  {/* Eye Icon */}
                  <div
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`pi ${
                        showConfirmPassword ? "pi-eye-slash" : "pi-eye"
                      }`}
                    />
                  </div>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-500 mt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.length !== 6}
                className={`w-full h-[46px] rounded-lg font-semibold transition ${
                  otp.length === 6
                    ? "bg-[#1EA766] text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Verify
              </button>

              {/* Dont Get a Code Click to Resend */}

              <p className="text-sm text-center mt-4">
                Don{"'"}t get a code?
                <span
                  className="text-[#21252C] font-semibold cursor-pointer"
                  // onClick={router.push("/signup")}
                >
                  {" "}
                  Click to Resend
                </span>
              </p>

              {/* Login Link */}
              <p className="text-sm text-center mt-4">
                Don{"'"}t have an account?
                <span
                  className="text-[#1EA766] font-medium cursor-pointer"
                  onClick={() => router.push("/signup")}
                >
                  {" "}
                  Sign up
                </span>
              </p>
            </div>

            {/* Mountain Image - Bottom Left */}
            <div className="hidden lg:block absolute bottom-0 left-0 z-0">
              <Image
              fill
                src="/AuthMountain.svg"
                alt="Auth Mountain"
                className="w-[300px] lg:w-[460px] pointer-events-none select-none"
              />
            </div>
          </div>

          {/* RIGHT SECTION (DESKTOP ONLY) */}
          <div className="relative hidden lg:block">
            <Image
              src="/LoginPageImage01.png"
              alt="Overlay"
              fill
              className="object-cover w-full h-full rounded-2xl p-4"
            />
          </div>
        </div>
      </div>
    </>
  );
}
