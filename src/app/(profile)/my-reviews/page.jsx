'use client';

import { useEffect } from 'react';
import ReviewCard from './ReviewCard';
import useReviewsStore from '@/store/useReviewsStore';
import AccountListLayout from '@/components/profile/AccountListLayout';
import EditReviewModal from './EditReviewModal';
import DeleteReviewModal from './DeleteReviewModal';
import OrdersPagination from '../my-orders/components/OrdersPagination';

export default function MyReviewsPage() {
  const {
    reviews,
    loading,
    error,
    total,
    page,
    pageSize,
    fetchPage,
  } = useReviewsStore();

  useEffect(() => {
    useReviewsStore.getState().fetchPage(1);
  }, []);

  return (
    <>
      <AccountListLayout title="My Reviews" count={total}>
        {error ? (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && !error && reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-12 text-sm">
            You have not written any reviews yet. After you receive an order, use
            &quot;Write a Review&quot; from My Orders.
          </p>
        ) : null}

        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {loading && (
          <p className="text-sm text-gray-500 text-center py-4">Loading…</p>
        )}

        {!loading && reviews.length > 0 && (
          <OrdersPagination
            page={page}
            pageSize={pageSize}
            totalItems={total}
            itemLabel="reviews"
            onPageChange={(p) => fetchPage(p)}
          />
        )}
      </AccountListLayout>
      <EditReviewModal />
      <DeleteReviewModal />
    </>
  );
}
