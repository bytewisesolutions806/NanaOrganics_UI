"use client";
import { InputText } from "primereact/inputtext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import Link from "next/link";
import { forgotPassword } from "@/service/AuthService";
import useAuthStore from "@/store/AuthStore";

export default function ForgotPassword() {
  const { setPendingPasswordReset } = useAuthStore();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const res = await forgotPassword({ email });

      if (!res.success) {
        throw new Error(res.message || "Failed to send reset code");
      }

      // ✅ STORE RESET INFO IN ZUSTAND
      setPendingPasswordReset({
        email: email.trim().toLowerCase(),
        expiresInSeconds: res.expiresInSeconds,
        retryAfterSeconds: res.retryAfterSeconds,
        requestedAt: Date.now(),
      });

      // ✅ REDIRECT
      router.push("/reset-password");
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Request Failed",
        detail: err.message || "Something went wrong",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
                {/* <Image src={AppLogo} alt="Logo" width={150} height={150} /> */}
                <Link href="/" aria-label="Go to home">
                  <Image
                    src="/AppLogo.svg"
                    width="150"
                    height="80"
                    alt="App Logo"
                    className="cursor-pointer"
                  />
                </Link>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

              {/* <p className="text-sm text-gray-600 text-center mt-2 mb-6">
          Signup to get full access to your dashboard, tools, and resources in
          just a few clicks
        </p> */}

              {/* Email / Phone */}
              {/* Email / Phone */}
              <div className="mb-6">
                <label className="text-sm font-medium">Email</label>

                <div className="relative w-full mt-3">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <i className="pi pi-user text-[#2c665e]" />
                  </div>

                  <InputText
                    type="email"
                    value={email}
                    required
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    keyfilter="email"
                    placeholder="Enter your email address"
                    className={`
        w-full h-[60px] pl-10 rounded-[10px] bg-[#F5FCFB]
        border
        ${emailError ? "border-red-500 focus:border-red-500" : "border-[#cfe2e0]"}
      `}
                  />
                </div>

                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>

              {/* Checkbox */}

              {/* Create Account Button */}
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                aria-busy={loading}
                className="
    w-full bg-green-600 text-white py-2 rounded-lg font-semibold
    hover:bg-green-700 transition
    flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait disabled:opacity-75
  "
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset code</span>
                    <i className="pi pi-angle-right text-xl font-bold mt-0" aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Login Link */}
              <p
                onClick={() => router.push("/login")}
                className="text-sm mt-4 flex items-center justify-center gap-2 cursor-pointer text-green-600"
              >
                <i className="pi pi-angle-left text-base" />
                <span>Back to Login</span>
              </p>

              {/* Login Link */}
              <p className="text-sm text-center mt-4">
                Don{"'"}t have an account?
                <span
                  onClick={() => router.push("/signup")}
                  className="text-black font-semibold ml-2 cursor-pointer text-green-600"
                >
                  {" "}
                  Sign up
                </span>
              </p>
            </div>

          </div>

          {/* RIGHT SECTION (DESKTOP ONLY) */}
          <div className="relative hidden lg:block">
            <Image
              src="/LoginPageImage01.webp"
              alt="Organic spices and ingredients"
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
