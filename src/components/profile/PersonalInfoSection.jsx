'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import ProfileAvatarUpload from './ProfileAvatarUpload';
import {
  fetchProfileApi,
  updateProfileApi,
  uploadProfilePhotoApi,
} from '@/service/ProfileService';
import useAuthStore from '@/store/AuthStore';

const FALLBACK_AVATAR = '/AppLogo.png';
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

function authCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    profile_photo_url: customer.profile_photo_url || '',
  };
}

export default function PersonalInfoSection() {
  const setCustomer = useAuthStore((state) => state.setCustomer);
  const storedCustomer = useAuthStore((state) => state.customer);
  const previewUrl = useRef('');

  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState(FALLBACK_AVATAR);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

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
        const response = await fetchProfileApi();
        if (cancelled) return;
        if (!response?.success || !response.data?.customer) {
          throw new Error(response?.message || 'Could not load profile');
        }
        const customer = response.data.customer;
        reset({
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
        });
        setImage(customer.profile_photo_url || FALLBACK_AVATAR);
        setCustomer(authCustomer(customer));
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Could not load profile.');
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, [reset, setCustomer]);

  const selectPhoto = (file) => {
    setSaveError('');
    setSaveMessage('');
    if (!file.type.startsWith('image/')) {
      setSaveError('Choose a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setSaveError('Profile photo must be 5 MB or smaller.');
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setImage(previewUrl.current);
    setPendingPhoto(file);
  };

  const onSubmit = async (data) => {
    setSaveError('');
    setSaveMessage('');
    setSaving(true);
    try {
      const updated = await updateProfileApi({
        first_name: data.first_name?.trim() || '',
        last_name: data.last_name?.trim() || '',
        phone: data.phone?.trim() || '',
      });
      if (!updated?.success) throw new Error(updated?.message || 'Update failed');

      let customer = updated.data?.customer;
      if (pendingPhoto) {
        const upload = await uploadProfilePhotoApi(pendingPhoto);
        if (!upload?.success) throw new Error(upload?.message || 'Photo upload failed');
        customer = upload.data?.customer || customer;
      }

      if (customer) {
        reset({
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
        });
        setImage(customer.profile_photo_url || FALLBACK_AVATAR);
        setCustomer(authCustomer(customer));
      }
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = '';
      setPendingPhoto(null);
      setEditMode(false);
      setSaveMessage('Profile updated successfully.');
    } catch (error) {
      setSaveError(error?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError('');
    setSaveMessage('');
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = '';
    setPendingPhoto(null);
    setImage(storedCustomer?.profile_photo_url || FALLBACK_AVATAR);
    if (storedCustomer) {
      reset({
        first_name: storedCustomer.first_name || '',
        last_name: storedCustomer.last_name || '',
        email: storedCustomer.email || '',
        phone: storedCustomer.phone || '',
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

      {loadError && <p className="text-sm text-red-600 mb-4" role="alert">{loadError}</p>}
      {saveMessage && <p className="text-sm text-green-700 mb-4" role="status">{saveMessage}</p>}

      <ProfileAvatarUpload
        image={image}
        editMode={editMode}
        uploading={saving && Boolean(pendingPhoto)}
        onFileSelected={selectPhoto}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">First name</label>
          <input
            disabled={!editMode || saving}
            {...register('first_name', { required: 'First name is required' })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7] disabled:text-gray-600"
          />
          {editMode && errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Last name</label>
          <input
            disabled={!editMode || saving}
            {...register('last_name', { required: 'Last name is required' })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7] disabled:text-gray-600"
          />
          {editMode && errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Email</label>
          <input
            disabled
            {...register('email')}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#ECECEC] text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Phone</label>
          <input
            disabled={!editMode || saving}
            {...register('phone', {
              maxLength: { value: 30, message: 'Phone number is too long' },
              validate: (value) => !value || String(value).trim().length >= 8 || 'Enter a valid phone number',
            })}
            className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-[#F7F7F7] disabled:text-gray-600"
          />
          {editMode && errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {saveError && <p className="text-sm text-red-600" role="alert">{saveError}</p>}

        {!editMode ? (
          <button
            type="button"
            onClick={() => {
              setSaveMessage('');
              setEditMode(true);
            }}
            disabled={Boolean(loadError)}
            className="border border-[#698B81] px-5 py-2 rounded-lg text-[#2C665E] disabled:opacity-50"
          >
            Edit Profile →
          </button>
        ) : (
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={handleCancel} disabled={saving} className="border border-[#698B81] px-5 py-2 rounded-lg disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="bg-[#2C665E] text-white px-5 py-2 rounded-lg disabled:opacity-50">
              {saving ? 'Saving…' : 'Save →'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
