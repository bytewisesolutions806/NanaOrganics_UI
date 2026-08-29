'use client';
import Image from 'next/image';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { InputOtp } from 'primereact/inputotp';
import useAuthStore from '@/store/AuthStore';
import { resendSignupOtp, verifyOtp } from '@/service/AuthService';
import './index.css';

export default function Verifyotp() {
  const router = useRouter();

  const { hasHydrated, pendingVerification } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const toast = useRef(null);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setLoading(true);
      const res = await verifyOtp({
        email: pendingVerification.email,
        confirmation_code: otp,
      });

      if (!res.success) {
        throw new Error(res.message || 'Invalid OTP');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'OTP Verified',
        detail: 'Verification successful. Redirecting to login...',
        life: 2000,
      });

      // clear pending verification
      useAuthStore.getState().setPendingVerification(null);

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err) {
      setOtp('');

      toast.current?.show({
        severity: 'error',
        summary: 'Verification Failed',
        detail: err?.message || 'Invalid or expired OTP',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingVerification?.email || resending) return;
    try {
      setResending(true);
      const res = await resendSignupOtp(pendingVerification.email);
      if (!res.success) {
        throw new Error(res.message || 'Could not resend the code');
      }
      useAuthStore.getState().setPendingVerification({
        ...pendingVerification,
        expiresInSeconds: res.expiresInSeconds,
        retryAfterSeconds: res.retryAfterSeconds,
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Code Sent',
        detail: res.message || 'A new verification code was sent.',
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Resend Failed',
        detail: err?.message || 'Could not resend the code',
        life: 3000,
      });
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (hasHydrated && !pendingVerification) {
      router.replace('/signup');
    }
  }, [hasHydrated, pendingVerification, router]);

  if (!hasHydrated || !pendingVerification) return null;

  const maskedEmail =
    pendingVerification.verificationInfo?.destination ||
    pendingVerification.email.replace(/(.{1}).+(@.+)/, '$1***$2');

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
                    width={150}
                    height={80}
                    alt="App Logo"
                    className="cursor-pointer"
                  />
                </Link>
              </div>

              <h2 className="text-2xl font-bold text-center">Start your Journey</h2>

              <p className="text-sm text-gray-600 text-center mt-2 mb-6">
                We sent a 6 digit code to{' '}
                <span className="font-medium text-gray-800">{maskedEmail}</span>
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

              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                aria-busy={loading}
                className={`w-full h-[46px] rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  otp.length === 6 && !loading
                    ? 'bg-[#1EA766] text-white cursor-pointer'
                    : loading
                      ? 'bg-[#1EA766] text-white cursor-wait opacity-75'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify'
                )}
              </button>

              {/* Dont Get a Code Click to Resend */}

              <p className="text-sm text-center mt-4">
                Don{"'"}t get a code?
                <button
                  type="button"
                  className="text-[#21252C] font-semibold cursor-pointer disabled:cursor-wait disabled:text-gray-400"
                  onClick={handleResend}
                  disabled={resending}
                  aria-busy={resending}
                >
                  {resending ? (
                    <span className="inline-flex items-center gap-1.5">
                      <i className="pi pi-spinner pi-spin" aria-hidden="true" />
                      Sending...
                    </span>
                  ) : (
                    ' Click to Resend'
                  )}
                </button>
              </p>

              {/* Login Link */}
              <p className="text-sm text-center mt-4">
                Don{"'"}t have an account?
                <span
                  className="text-[#1EA766] font-medium cursor-pointer"
                  onClick={() => router.push('/signup')}
                >
                  {' '}
                  Sign up
                </span>
              </p>
            </div>
            {/* Mountain Image - Bottom Left */}
            <div className="hidden lg:block absolute bottom-0 left-0 z-0">
              <Image
                src="/AuthMountain.svg"
                width={460}
                height={260}
                alt=""
                className="w-[300px] lg:w-[460px] pointer-events-none select-none"
              />
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
