import useAddressStore from '@/store/useAddressStore';
import { SHIPPING_COUNTRY_OPTIONS } from '@/constants/shippingCountries';

function countryLabel(code) {
  const c = SHIPPING_COUNTRY_OPTIONS.find((x) => x.code === code);
  return c?.label || (code ? String(code).toUpperCase() : '');
}

export default function AddressCard({ address }) {
  const { openAddressModal, openDeleteModal, setDefaultAddress, saving } = useAddressStore();

  return (
    <div className="border border-[#CFE3DF] rounded-xl p-4 relative">
      {address.isDefault && (
        <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          Default
        </span>
      )}

      <p className="font-medium">{address.displayName}</p>
      <p className="text-sm text-gray-600">{address.phone}</p>

      <p className="text-sm mt-2 text-gray-700">
        {address.address}, {address.city}, {address.state} - {address.pincode}
      </p>
      <p className="text-xs text-gray-500 mt-1">{countryLabel(address.country_code)}</p>

      <div className="flex gap-4 mt-4 text-sm flex-wrap">
        <button
          type="button"
          onClick={() => openAddressModal(address)}
          className="text-[#2C665E] cursor-pointer"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => openDeleteModal(address)}
          className="text-red-500 cursor-pointer"
        >
          Delete
        </button>

        {!address.isDefault && (
          <button
            type="button"
            disabled={saving}
            onClick={() => setDefaultAddress(address.id)}
            className="text-gray-500 cursor-pointer disabled:opacity-50"
          >
            Set Default
          </button>
        )}
      </div>
    </div>
  );
}
