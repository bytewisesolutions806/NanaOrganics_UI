export const ordersFilterMock = {
  status: [
    { id: 'payment_pending', label: 'Payment pending' },
    { id: 'payment_failed', label: 'Payment not completed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'on_the_way', label: 'On the way' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned' },
  ],
  orderTime: [
    { id: 'this_week', label: 'This Week' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'year_2025', label: '2025' },
    { id: 'older', label: 'Older' },
  ],
};
