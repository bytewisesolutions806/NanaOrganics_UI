"use client";
import { InputText } from "primereact/inputtext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import loginPageImage01 from "@/assets/images/LoginPage/loginpageLeaf.png";
import loginPageImage02 from "@/assets/images/LoginPage/loginPageTruck.png";
import loginPageImage03 from "@/assets/images/LoginPage/loginPageStar.png";
import loginPageImage from "@/assets/images/LoginTree.png";
import { loginUser } from "@/service/AuthService";
import { fetchProfileApi } from "@/service/ProfileService";
import useAuthStore from "@/store/AuthStore";
import useCartStore from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "primereact/checkbox";
import "./index.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setPendingVerification = useAuthStore(
    (state) => state.setPendingVerification
  );

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();

    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await loginUser({
        email: normalizedEmail,
        password,
        rememberMe: remember,
      });

      if (!res.success) {
        if (res.errorCode === "NOT_VERIFIED_ERROR") {
          setPendingVerification({ email: normalizedEmail });
          router.push("/verify-otp");
          return;
        }
        throw new Error(res.message || "Login failed");
      }

      if (!res.token || !res.user) {
        throw new Error("Login succeeded without a valid session.");
      }

      login(res.token, {
        id: res.user.id,
        identifier: res.user.identifier,
        email: res.user.identifier,
      });

      // Authentication returns a Vendure User, not the related Customer
      // profile. Load it before navigating so the global header immediately
      // receives the customer's name and resolved profile-photo URL.
      try {
        const profileResponse = await fetchProfileApi();
        if (profileResponse?.success && profileResponse.data?.customer) {
          setCustomer(profileResponse.data.customer);
        }
      } catch (profileError) {
        // A profile refresh must not invalidate an otherwise successful login.
        console.warn("Could not refresh the customer profile after login", profileError);
      }

      // The new Vendure session can recover the customer's existing active
      // order even when logout cleared the browser's local cart identifier.
      await useCartStore.getState().fetchCart();

      const raw = searchParams.get("redirect");
      const safe =
        raw &&
        raw.startsWith("/") &&
        !raw.startsWith("//") &&
        !raw.includes("://")
          ? raw
          : null;
      router.push(safe || "/");
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: err.message || "Something went wrong",
        life: 3000,
      });
      } finally {
        setLoading(false);
      }
};


  const handleSignupRouteclick = () => {
    router.push("/signup");
  };

  const handleRedirectPasswordRoute = () => {
    router.push("/forgotpassword");
  };

  return (
    <form onSubmit={handleLogin}>
      <Toast
          ref={toast}
          position="top-right"
          pt={{
            message: ({ props }) => ({
              className: `
                rounded-xl px-4 py-3 text-sm font-medium
                ${props.severity === "success" && "bg-[#E6F4F2] text-[#1EA766]"}
                ${props.severity === "error" && "bg-red-50 text-red-600"}
                ${props.severity === "warn" && "bg-yellow-50 text-yellow-700"}
                ${props.severity === "info" && "bg-blue-50 text-blue-600"}
              `,
            }),
          }}
        />


      <div className="relative min-h-screen  bg-white">
        {/* GRID WRAPPER (fixes layout) */}
        <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT SECTION */}
          <div className="relative w-full flex items-center justify-center">
            <div className="w-full max-w-md z-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
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
              <h2 className="text-2xl font-bold text-center">
                Start your Journey
              </h2>

              <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                Signup to get full access to your dashboard, tools, and
                resources.
              </p>

              {/* Email */}
              <div className="mb-6">
                <label className="text-sm font-medium">Email</label>

                <div className="relative w-full mt-3">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <i className="pi pi-user text-[#2c665e]" />
                  </div>

                  <InputText
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={`w-full h-[60px] pl-10 rounded-[10px] bg-[#F5FCFB] border ${
                      emailError ? "border-red-500" : "border-[#cfe2e0]"
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="text-sm font-medium">Password</label>

                <div className="relative w-full mt-3">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <i className="pi pi-lock text-[#2c665e]" />
                  </div>

                  <InputText
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB] border ${
                      passwordError ? "border-red-500" : "border-[#cfe2e0]"
                    }`}
                  />

                  <div
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`pi ${
                        showPassword ? "pi-eye-slash" : "pi-eye"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center gap-2 mb-6">
                <Checkbox
                  className="custom-remember-checkbox"
                  inputId="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.checked)}
                />
                <label htmlFor="remember" className="text-xs cursor-pointer">
                  Remember me
                </label>

                <span
                  className="ml-auto font-bold text-sm cursor-pointer text-green-600"
                  onClick={handleRedirectPasswordRoute}
                >
                  Forgot Password ?
                </span>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-sm text-center mt-4">
                Don{ "'"}t have an account?
                <span
                  className="text-green-600 font-medium cursor-pointer"
                  onClick={handleSignupRouteclick}
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
    </form>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
