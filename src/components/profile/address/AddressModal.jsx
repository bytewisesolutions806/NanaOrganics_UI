'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAddressStore from '@/store/useAddressStore';
import { emptyAddressForm } from '@/lib/addressAdapter';
import { SHIPPING_COUNTRY_OPTIONS } from '@/constants/shippingCountries';

export default function AddressModal() {
  const {
    addressModal,
    selectedAddress,
    closeAddressModal,
    addAddress,
    updateAddress,
    saving,
    mutationError,
  } = useAddressStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: emptyAddressForm(),
  });

  useEffect(() => {
    if (!addressModal) return;
    if (selectedAddress) {
      reset({
        first_name: selectedAddress.first_name || '',
        last_name: selectedAddress.last_name || '',
        phone: selectedAddress.phone || '',
        address: selectedAddress.address || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        pincode: selectedAddress.pincode || '',
        country_code: selectedAddress.country_code || 'de',
        isDefault: !!selectedAddress.isDefault,
      });
    } else {
      reset(emptyAddressForm());
    }
  }, [selectedAddress, reset, addressModal]);

  if (!addressModal) return null;

  const onSubmit = async (data) => {
    try {
      if (selectedAddress?.id) {
        await updateAddress(selectedAddress.id, data);
      } else {
        await addAddress(data);
      }
      reset(emptyAddressForm());
    } catch {
      /* mutationError set in store */
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-[650px] p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {selectedAddress ? 'Edit Address' : 'Add New Address'}
        </h3>

        {mutationError && (
          <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {mutationError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div>
            <input
              placeholder="First name"
              {...register('first_name', { required: 'First name required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.first_name && (
              <p className="text-xs text-red-500">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <input
              placeholder="Last name"
              {...register('last_name', { required: 'Last name required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.last_name && (
              <p className="text-xs text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <input
              placeholder="Phone"
              {...register('phone', { required: 'Phone required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <input
              placeholder="Postal / ZIP code"
              {...register('pincode', { required: 'Postal code required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.pincode && (
              <p className="text-xs text-red-500">{errors.pincode.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <textarea
              placeholder="Street address"
              {...register('address', { required: 'Address required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 min-h-[80px]"
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div>
            <input
              placeholder="City"
              {...register('city', { required: 'City required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
          </div>

          <div>
            <input
              placeholder="State / Province"
              {...register('state', { required: 'State required' })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2"
            />
            {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm text-gray-700">Country</label>
            <select
              {...register('country_code', { required: true })}
              className="w-full border border-[#CFE3DF] rounded-lg px-3 py-2 bg-white"
            >
              {SHIPPING_COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="addr-default" {...register('isDefault')} className="rounded" />
            <label htmlFor="addr-default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={closeAddressModal}
              disabled={saving}
              className="border px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#2C665E] text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : selectedAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
