'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';
import PasswordStrength from './PasswordStrength';
import {
  changePasswordApi,
  requestProfilePasswordVerification,
  resendProfilePasswordVerification,
  verifyProfilePasswordCode,
} from '@/service/ProfileService';
import useAuthStore from '@/store/AuthStore';

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function PasswordSection() {
  const email = useAuthStore((state) => state.customer?.email || '');
  const [stage, setStage] = useState('idle');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');
  const maskedEmail = email ? email.replace(/(.{1}).+(@.+)/, '$1***$2') : 'your email';

  const requestCode = async (resend = false) => {
    if (!email) {
      setFormError('Your account email is unavailable. Refresh the profile and try again.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    setSuccessMsg('');
    try {
      const result = resend
        ? await resendProfilePasswordVerification(email)
        : await requestProfilePasswordVerification(email);
      if (!result?.success) throw new Error(result?.message || 'Could not send verification code.');
      setCode('');
      setResetToken('');
      setStage('code');
      setSuccessMsg(`A six-digit verification code was sent to ${maskedEmail}.`);
    } catch (error) {
      setFormError(error?.message || 'Could not send verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!/^\d{6}$/.test(code)) {
      setFormError('Enter the six-digit verification code.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const result = await verifyProfilePasswordCode({ email, code });
      if (!result?.success || !result.resetToken) {
        throw new Error(result?.message || 'The verification code is invalid.');
      }
      setResetToken(result.resetToken);
      setSuccessMsg('Email verified. Enter your new password.');
      setStage('password');
    } catch (error) {
      setFormError(error?.message || 'The verification code is invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  };

  const updatePassword = async (data) => {
    if (!resetToken) {
      setStage('code');
      setFormError('Verify your email before changing the password.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const result = await changePasswordApi({
        resetToken,
        newPassword: data.newPassword,
      });
      if (!result?.success) throw new Error(result?.message || 'Could not update password.');
      reset();
      setCode('');
      setResetToken('');
      setStage('idle');
      setSuccessMsg(result.message || 'Password updated successfully.');
    } catch (error) {
      setFormError(error?.message || 'Could not update password. Request a new code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    reset();
    setCode('');
    setResetToken('');
    setFormError('');
    setSuccessMsg('');
    setStage('idle');
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Lock size={18} />
        <p className="font-medium">Update Password</p>
      </div>

      {successMsg && <p className="text-sm text-green-700 mb-4" role="status">{successMsg}</p>}
      {formError && <p className="text-sm text-red-600 mb-4" role="alert">{formError}</p>}

      {stage === 'idle' && (
        <div className="space-y-4">
          <input
            value="**************"
            disabled
            readOnly
            aria-label="Current password"
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7]"
          />
          <p className="text-xs text-gray-500">
            We will verify your account email before allowing a password change.
          </p>
          <button
            type="button"
            onClick={() => requestCode(false)}
            disabled={submitting || !email}
            className="border border-[#698B81] px-5 py-2 rounded-lg text-[#2C665E] disabled:opacity-50"
          >
            {submitting ? 'Sending code…' : 'Change Password →'}
          </button>
        </div>
      )}

      {stage === 'code' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-password-code" className="text-xs text-gray-500 block mb-1">
              Email verification code
            </label>
            <input
              id="profile-password-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              disabled={submitting}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7] tracking-[0.3em]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={verifyCode}
              disabled={submitting || code.length !== 6}
              className="bg-[#2C665E] text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Verifying…' : 'Verify Email →'}
            </button>
            <button type="button" onClick={() => requestCode(true)} disabled={submitting} className="text-sm text-[#2C665E] underline disabled:opacity-50">
              Resend code
            </button>
            <button type="button" onClick={cancel} disabled={submitting} className="text-sm text-gray-600 underline disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {stage === 'password' && (
        <form onSubmit={handleSubmit(updatePassword)} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                autoComplete="new-password"
                disabled={submitting}
                {...register('newPassword', {
                  required: 'New password is required',
                  pattern: {
                    value: strongPassword,
                    message: 'Use 8+ characters with uppercase, lowercase, number, and symbol',
                  },
                })}
                className="h-11 w-full rounded-lg border border-[#CFE3DF] bg-[#F7F7F7] px-3 pr-12 focus:border-[#2C665E] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-600 hover:text-[#2C665E] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2C665E]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          <PasswordStrength password={newPassword} />

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              disabled={submitting}
              {...register('confirmPassword', {
                required: 'Confirm password is required',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              className="h-11 w-full rounded-lg border border-[#CFE3DF] bg-[#F7F7F7] px-3 focus:border-[#2C665E] focus:outline-none"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={cancel} disabled={submitting} className="border border-[#698B81] px-5 py-2 rounded-lg disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-[#2C665E] text-white px-5 py-2 rounded-lg disabled:opacity-50">
              {submitting ? 'Updating…' : 'Update Password →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
