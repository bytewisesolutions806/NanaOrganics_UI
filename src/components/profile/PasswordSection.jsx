'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff } from 'lucide-react';
import PasswordStrength from './PasswordStrength';
import { changePasswordApi } from '@/service/ProfileService';

export default function PasswordSection() {
  const [passwordMode, setPasswordMode] = useState(false);
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

  const onSubmit = async (data) => {
    setFormError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const res = await changePasswordApi({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      if (!res?.success) {
        throw new Error(res?.message || 'Could not update password');
      }
      setSuccessMsg(res.message || 'Password updated successfully.');
      setPasswordMode(false);
      reset();
    } catch (e) {
      setFormError(
        e?.response?.data?.message ||
          e?.message ||
          'Could not update password. Check your current password and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormError('');
    setSuccessMsg('');
    setPasswordMode(false);
    reset();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Lock size={18} />
        <p className="font-medium">Update Password</p>
      </div>

      {successMsg && !passwordMode ? (
        <p className="text-sm text-green-700 mb-4" role="status">
          {successMsg}
        </p>
      ) : null}

      {!passwordMode ? (
        <div className="space-y-4">
          <input
            value="**************"
            disabled
            readOnly
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7]"
          />

          <button
            type="button"
            onClick={() => {
              setSuccessMsg('');
              setPasswordMode(true);
            }}
            className="border px-5 py-2 rounded-lg text-[#2C665E]"
          >
            Change Password →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Current Password"
              autoComplete="current-password"
              disabled={submitting}
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              className="w-full border rounded-lg px-3 py-2 bg-[#F7F7F7]"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              autoComplete="new-password"
              disabled={submitting}
              {...register('newPassword', {
                required: 'New password required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                  message: 'Must contain 1 uppercase, 1 number, 1 special character',
                },
              })}
              className="w-full border rounded-lg px-3 py-2 bg-[#F7F7F7]"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <PasswordStrength password={newPassword} />

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              disabled={submitting}
              {...register('confirmPassword', {
                required: 'Confirm password required',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
              className="w-full border rounded-lg px-3 py-2 bg-[#F7F7F7]"
            />

            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="border px-5 py-2 rounded-lg"
            >
              Cancel →
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2C665E] text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting ? 'Updating…' : 'Update Password →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
