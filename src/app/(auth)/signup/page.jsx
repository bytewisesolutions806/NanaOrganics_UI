'use client';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signupUser } from '@/service/AuthService';
import useAuthStore from '@/store/AuthStore';
import { Checkbox } from 'primereact/checkbox';
import './index.css';

export default function Signup() {
  const { setPendingVerification } = useAuthStore.getState();

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const isValidPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value);

  const handleSignup = async () => {
    let hasError = false;

    // ✅ RESET ERRORS
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFullNameError('');

    // ✅ FULL NAME
    if (!fullName.trim()) {
      setFullNameError('Name is Required');
      hasError = true;
    }

    // ✅ EMAIL
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email');
      hasError = true;
    }

    // ✅ PASSWORD
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!isValidPassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters with 1 uppercase & 1 lowercase letter'
      );
      hasError = true;
    }

    // ✅ CONFIRM PASSWORD
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    // ❌ STOP IF ANY ERROR
    if (hasError) return;

    try {
      setLoading(true);

      const res = await signupUser({
        fullName: fullName.trim(),
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      if (!res.success) {
        throw new Error(res.message || 'signup Failed');
      }

      if (res.success) {
        setPendingVerification({
          email: email.trim().toLowerCase(),
          expiresInSeconds: res.expiresInSeconds,
          retryAfterSeconds: res.retryAfterSeconds,
        });

        router.push('/verify-otp'); // ✅ redirect
        return;
      }

      // ✅ REDIRECT
      router.push('/');
    } catch (err) {
      console.log('Signup error:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'signup Failed',
        detail: err?.message || 'Something went wrong',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />

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
                  <Image
                    src="/AppLogo.svg"
                    width="150"
                    height="80"
                    alt="App Logo"
                    className="cursor-pointer"
                  />
                </Link>
              </div>

              <h2 className="text-2xl font-bold text-center">Start your Journey</h2>

              <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                Signup to get full access to your dashboard, tools, and resources
              </p>

              {/* Full Name */}
              <div className="mb-6">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative mt-3">
                  <i className="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
                  <InputText
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`
        w-full h-[60px] pl-10 rounded-[10px] bg-[#F5FCFB]
        border
        ${fullNameError ? 'border-red-500 focus:border-red-500' : 'border-[#cfe2e0]'}
      `}
                  />
                </div>
                {/* ✅ ERROR TEXT BELOW INPUT */}
                {fullNameError && <p className="text-xs text-red-500 mt-1">{fullNameError}</p>}
              </div>

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
                    required
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    keyfilter="email"
                    placeholder="Enter your email address"
                    className={`
        w-full h-[60px] pl-10 rounded-[10px] bg-[#F5FCFB]
        border
        ${emailError ? 'border-red-500 focus:border-red-500' : 'border-[#cfe2e0]'}
      `}
                  />
                </div>

                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Strong Password"
                    className={`
        w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB]
        border
        ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-[#cfe2e0]'}
      `}
                  />

                  {/* Eye Icon */}
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} />
                  </div>
                  {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`
        w-full h-[60px] pl-10 pr-10 rounded-[10px] bg-[#F5FCFB]
        border
        ${confirmPasswordError ? 'border-red-500 focus:border-red-500' : 'border-[#cfe2e0]'}
      `}
                  />

                  {/* Eye Icon */}
                  <div
                    className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`pi ${showConfirmPassword ? 'pi-eye-slash' : 'pi-eye'}`} />
                  </div>
                </div>
                {confirmPasswordError && (
                  <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>
                )}
              </div>

              {/* Checkbox */}
              <div className="flex gap-2 mb-6 text-xs items-start">
                <Checkbox
                  inputId="agree"
                  checked={agree}
                  onChange={(e) => setAgree(e.checked)}
                  className="custom-checkbox"
                />

                <label htmlFor="agree" className="cursor-pointer">
                  I agree with <span className="text-green-600">Terms</span> &
                  <span className="text-green-600"> Privacy Policy</span>
                </label>
              </div>

              <button
                onClick={handleSignup}
                disabled={!agree || loading}
                aria-busy={loading}
                className={`
    w-full h-[46px] rounded-lg font-semibold transition flex items-center justify-center gap-2
    ${
      agree && !loading
        ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
        : loading
          ? 'bg-green-600 text-white cursor-wait opacity-75'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
  `}
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <p className="text-sm text-center mt-4">
                Already have an account?
                <span
                  onClick={() => router.push('/login')}
                  className="text-green-600 font-medium cursor-pointer"
                >
                  {' '}
                  Login
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
              className="object-contain w-full h-full rounded-2xl p-4"
              sizes="(min-width: 1024px) 50vw, 0px"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </>
  );
}
