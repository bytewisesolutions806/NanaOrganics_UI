'use client';

import useAddressStore from '@/store/useAddressStore';

export default function DeleteAddressModal() {
  const {
    deleteModal,
    selectedAddress,
    deleteAddress,
    closeDeleteModal,
    deleting,
    mutationError,
  } = useAddressStore();

  if (!deleteModal || !selectedAddress) return null;

  const handleDelete = async () => {
    try {
      await deleteAddress(selectedAddress.id);
    } catch {
      // mutationError in store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-[400px] p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Delete Address</h3>

        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete this address? This cannot be undone.
        </p>

        {mutationError && (
          <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {mutationError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={deleting}
            className="border px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
