'use client';

import useReviewsStore from '@/store/useReviewsStore';

export default function DeleteReviewModal() {
  const {
    deleteModal,
    selectedReview,
    closeDeleteModal,
    deleteReview,
    actionLoading,
    actionError,
  } = useReviewsStore();

  if (!deleteModal) return null;

  const handleDelete = async () => {
    if (!selectedReview?.id || !selectedReview?.product_id) return;
    await deleteReview(selectedReview.id, selectedReview.product_id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-[360px] shadow-xl" role="dialog">
        <h3 className="text-lg font-semibold mb-4">Delete review</h3>

        {actionError ? (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {actionError}
          </p>
        ) : null}

        <p className="text-sm text-gray-500 mb-6">
          Remove this review permanently? This cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="text-gray-500 px-3 py-2"
            disabled={actionLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={actionLoading}
            className="text-white bg-red-500 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {actionLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
