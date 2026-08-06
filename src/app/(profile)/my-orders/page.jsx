'use client';
import './index.css';
import { useEffect, useMemo, useState } from 'react';
import useOrdersStore from '@/store/useOrdersStore';
import OrderCard from './components/OrderCard';
import MyOrdersFilter from './components/MyOrdersFilter';
import useOrdersFilterStore from '@/store/useOrdersFilterStore';
import OrderCardSkeleton from './components/OrderSkeleton';
import OrdersPagination from './components/OrdersPagination';
import { filterOrdersBySelections } from '@/lib/orderAdapter';
import { loadOrderReviewLookup } from '@/lib/userReviewedProducts';

const PAGE_SIZE = 10;

export default function MyOrdersPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(() => new Set());
  const [legacyReviewedProductIds, setLegacyReviewedProductIds] = useState(() => new Set());
  const { filters, fetchFilters, selectedFilters } = useOrdersFilterStore();
  const activeFilterCount =
    selectedFilters.status.length + selectedFilters.orderTime.length;

  const { orders, fetchOrders, refreshOrders, loading, error } = useOrdersStore();

  useEffect(() => {
    fetchOrders();
    fetchFilters();
  }, [fetchOrders, fetchFilters]);

  useEffect(() => {
    const refresh = () => refreshOrders();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshOrders]);

  const refreshReviewedProducts = () => {
    loadOrderReviewLookup().then(({ orderIds, legacyProductIds }) => {
      setReviewedOrderIds(orderIds);
      setLegacyReviewedProductIds(legacyProductIds);
    });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { orderIds, legacyProductIds } = await loadOrderReviewLookup();
      if (!cancelled) {
        setReviewedOrderIds(orderIds);
        setLegacyReviewedProductIds(legacyProductIds);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orders.length]);

  useEffect(() => {
    const onFocus = () => refreshReviewedProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const filteredOrders = useMemo(() => {
    const filtered = filterOrdersBySelections(orders, selectedFilters);

    return [...filtered].sort((a, b) => {
      const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [orders, selectedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE) || 1);

  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-[400px] lg:h-[650px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">My Orders</h2>
              <button
                type="button"
                onClick={refreshOrders}
                disabled={loading}
                className="text-sm font-medium text-[#2C665E] hover:underline disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="lg:hidden px-3 py-2 bg-[#2C665E] text-white rounded-lg text-sm"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loading && Array.from({ length: 6 }).map((_, i) => <OrderCardSkeleton key={i} />)}

            {!loading &&
              filteredOrders.length === 0 &&
              !error &&
              (orders.length === 0 ? (
                <p className="text-gray-600 text-center py-12">You have no orders yet.</p>
              ) : (
                <p className="text-gray-600 text-center py-12">
                  No orders match the selected filters.
                </p>
              ))}

            {!loading &&
              pagedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  reviewedOrderIds={reviewedOrderIds}
                  legacyReviewedProductIds={legacyReviewedProductIds}
                />
              ))}

            {!loading && filteredOrders.length > 0 && (
              <OrdersPagination
                page={currentPage}
                pageSize={PAGE_SIZE}
                totalItems={filteredOrders.length}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>

        {filters && (
          <MyOrdersFilter
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            filters={filters}
            onFiltersChanged={() => setPage(1)}
          />
        )}
      </div>
    </>
  );
}
