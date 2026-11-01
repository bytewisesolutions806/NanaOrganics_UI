'use client';

import { useEffect } from 'react';
import useAddressStore from '@/store/useAddressStore';
import AddressCard from '@/components/profile/address/AddressCard';
import AddressModal from '@/components/profile/address/AddressModal';
import DeleteAddressModal from '@/components/profile/address/DeleteAddressmodal';

export default function ManageAddressPage() {
  const { addresses, fetchAddresses, loading, listError, openAddressModal, clearErrors } =
    useAddressStore();

  useEffect(() => {
    clearErrors();
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- zustand actions are stable
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-xl font-semibold">Manage Address</h2>

        <button
          type="button"
          onClick={() => openAddressModal()}
          className="bg-[#2C665E] text-white px-4 py-2 rounded-lg cursor-pointer"
        >
          + Add New Address
        </button>
      </div>

      {listError && (
        <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {listError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
        {loading && <p className="text-gray-500 text-sm">Loading addresses...</p>}

        {!loading && addresses.length === 0 && !listError && (
          <p className="text-gray-400">No addresses saved yet.</p>
        )}

        {!loading && addresses.map((address) => <AddressCard key={address.id} address={address} />)}
      </div>

      <AddressModal />
      <DeleteAddressModal />
    </div>
  );
}
