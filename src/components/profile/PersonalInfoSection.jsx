'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import ProfileAvatarUpload from './ProfileAvatarUpload';
import { fetchProfileApi, updateProfileApi } from '@/service/ProfileService';
import useAuthStore from '@/store/AuthStore';

export default function PersonalInfoSection() {
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const storedCustomer = useAuthStore((s) => s.customer);

  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState('/AppLogo.png');
  const [loadError, setLoadError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPageLoading(true);
      setLoadError('');
      try {
        const res = await fetchProfileApi();
        if (cancelled) return;
        if (!res?.success || !res.data?.customer) {
          throw new Error(res?.message || 'Could not load profile');
        }
        const c = res.data.customer;
        reset({
          first_name: c.first_name || '',
          last_name: c.last_name || '',
          email: c.email || '',
          phone: c.phone || '',
        });
        setCustomer({
          id: c.id,
          email: c.email,
          first_name: c.first_name,
          last_name: c.last_name,
          phone: c.phone,
        });
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e?.response?.data?.message ||
              e?.message ||
              'Could not load profile.'
          );
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset, setCustomer]);

  const onSubmit = async (data) => {
    setSaveError('');
    try {
      const res = await updateProfileApi({
        first_name: data.first_name?.trim() ?? '',
        last_name: data.last_name?.trim() ?? '',
        phone: data.phone?.trim() ?? '',
      });
      if (!res?.success) {
        throw new Error(res?.message || 'Update failed');
      }
      const c = res.data?.customer;
      if (c) {
        reset({
          first_name: c.first_name || '',
          last_name: c.last_name || '',
          email: c.email || '',
          phone: c.phone || '',
        });
        setCustomer({
          id: c.id,
          email: c.email,
          first_name: c.first_name,
          last_name: c.last_name,
          phone: c.phone,
        });
      }
      setEditMode(false);
    } catch (e) {
      setSaveError(
        e?.response?.data?.message || e?.message || 'Could not save profile.'
      );
    }
  };

  const handleCancel = () => {
    setSaveError('');
    const c = storedCustomer;
    if (c) {
      reset({
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        email: c.email || '',
        phone: c.phone || '',
      });
    }
    setEditMode(false);
  };

  if (pageLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-5">
          <User size={18} />
          <p className="font-medium">Personal Information</p>
        </div>
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <User size={18} />
        <p className="font-medium">Personal Information</p>
      </div>

      {loadError ? (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {loadError}
        </p>
      ) : null}

      <ProfileAvatarUpload image={image} setImage={setImage} editMode={editMode} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">First name</label>
          <input
            disabled={!editMode}
            {...register('first_name', { required: 'First name is required' })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7]"
          />
          {editMode && errors.first_name && (
            <p className="text-xs text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Last name</label>
          <input
            disabled={!editMode}
            {...register('last_name', { required: 'Last name is required' })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7]"
          />
          {editMode && errors.last_name && (
            <p className="text-xs text-red-500">{errors.last_name.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Email</label>
          <input
            disabled
            {...register('email')}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#ECECEC] text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed here. Contact support if you need to update it.
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Phone</label>
          <input
            disabled={!editMode}
            {...register('phone', {
              validate: (v) =>
                !v ||
                String(v).trim().length >= 8 ||
                'Enter a valid phone number',
            })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7]"
          />
          {editMode && errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {saveError ? (
          <p className="text-sm text-red-600" role="alert">
            {saveError}
          </p>
        ) : null}

        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="border border-[#698B81] px-5 py-2 rounded-lg text-[#2C665E] cursor-pointer"
          >
            Edit Profile →
          </button>
        ) : (
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="border border-[#698B81] px-5 py-2 rounded-lg cursor-pointer"
            >
              Cancel →
            </button>

            <button
              type="submit"
              className="bg-[#2C665E] text-white px-5 py-2 rounded-lg cursor-pointer"
            >
              Save →
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
