'use client';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { loginUser } from '@/service/AuthService';
import { fetchProfileApi } from '@/service/ProfileService';
import useAuthStore from '@/store/AuthStore';
import useCartStore from '@/store/useCartStore';
import Link from 'next/link';
import Image from 'next/image';
import { Checkbox } from 'primereact/checkbox';
import './index.css';

const REMEMBERED_EMAIL_KEY = 'nana-remembered-login-email';

function getRememberedEmail() {
  try {
    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

function storeRememberedEmail(email) {
  try {
    if (email) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    // Login should continue if browser storage is unavailable.
  }
}

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const setPendingVerification = useAuthStore((state) => state.setPendingVerification);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e?.preventDefault();

    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
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
        if (res.errorCode === 'NOT_VERIFIED_ERROR') {
          setPendingVerification({ email: normalizedEmail });
          router.push('/verify-otp');
          return;
        }
        throw new Error(res.message || 'Login failed');
      }

      if (!res.token || !res.user) {
        throw new Error('Login succeeded without a valid session.');
      }

      if (remember) {
        storeRememberedEmail(normalizedEmail);
      } else {
        storeRememberedEmail('');
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
        console.warn('Could not refresh the customer profile after login', profileError);
      }

      // The new Vendure session can recover the customer's existing active
      // order even when logout cleared the browser's local cart identifier.
      await useCartStore.getState().fetchCart();

      const raw = new URLSearchParams(window.location.search).get('redirect');
      const safe =
        raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('://') ? raw : null;
      router.push(safe || '/');
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: err.message || 'Something went wrong',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRouteclick = () => {
    router.push('/signup');
  };

  const handleRedirectPasswordRoute = () => {
    router.push('/forgotpassword');
  };

  return (
    <form className="min-h-[100svh]" onSubmit={handleLogin}>
      <Toast ref={toast} position="top-right" />

      <div className="relative min-h-[100svh] overflow-x-hidden bg-white">
        {/* GRID WRAPPER (fixes layout) */}
        <div className="relative z-10 grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
          {/* LEFT SECTION */}
          <div className="relative flex w-full items-start justify-center px-5 py-8 sm:px-8 sm:py-10 lg:items-center lg:px-12">
            <div className="z-10 w-full max-w-md">
              {/* Logo */}
              <div className="mb-4 flex justify-center sm:mb-6">
                <Link href="/" aria-label="Go to home">
                  <Image
                    src="/AppLogo.svg"
                    width={150}
                    height={80}
                    alt="App Logo"
                    className="h-auto w-[130px] cursor-pointer sm:w-[150px]"
                  />
                </Link>
              </div>

              {/* Heading */}
              <h2 className="text-center text-xl font-bold sm:text-2xl">Start your Journey</h2>

              <p className="mb-5 mt-2 text-center text-sm leading-5 text-gray-600 sm:mb-6">
                Log in to access your orders, wishlist, profile, and more.
              </p>

              {/* Email */}
              <div className="mb-5 sm:mb-6">
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
                    className={`h-14 w-full rounded-[10px] border bg-[#F5FCFB] pl-10 sm:h-[60px] ${
                      emailError ? 'border-red-500' : 'border-[#cfe2e0]'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-5 sm:mb-6">
                <label className="text-sm font-medium">Password</label>

                <div className="relative w-full mt-3">
                  <div className="absolute inset-y-0 left-4 flex items-center">
                    <i className="pi pi-lock text-[#2c665e]" />
                  </div>

                  <InputText
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`h-14 w-full rounded-[10px] border bg-[#F5FCFB] pl-10 pr-10 sm:h-[60px] ${
                      passwordError ? 'border-red-500' : 'border-[#cfe2e0]'
                    }`}
                  />

                  <div
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} />
                  </div>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <div className="flex min-w-0 items-center gap-2">
                  <Checkbox
                    className="custom-remember-checkbox shrink-0"
                    inputId="remember"
                    checked={remember}
                    onChange={(e) => {
                      setRemember(e.checked);
                      if (!e.checked) {
                        storeRememberedEmail('');
                      }
                    }}
                  />
                  <label htmlFor="remember" className="cursor-pointer whitespace-nowrap text-xs">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="shrink-0 cursor-pointer whitespace-nowrap text-xs font-bold text-green-600 sm:text-sm"
                  onClick={handleRedirectPasswordRoute}
                >
                  Forgot Password ?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 px-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-wait disabled:opacity-75 sm:h-[46px]"
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <p className="text-sm text-center mt-4">
                Don{"'"}t have an account?
                <span
                  className="text-green-600 font-medium cursor-pointer"
                  onClick={handleSignupRouteclick}
                >
                  {' '}
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
    </form>
  );
}
