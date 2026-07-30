export const ordersMock = [
  {
    id: 'ord_1',
    name: 'Organic Raw Honey',
    weight: '500g',
    price: 12.49,
    status: 'delivered',
    image: '/AppLogo.png',
    confirmedDate: 'Dec 04',
    deliveredDate: 'Dec 07',

    updates: [
      {
        status: 'Delivered',
        date: 'Sun, 7 December 2025, 12:40PM',
        description: 'Your order has been delivered.',
        completed: true,
      },
      {
        status: 'Out for Delivery',
        date: 'Sun, 7 December 2025, 10:04AM',
        description: 'Your order is out for delivery.',
        completed: true,
      },
      {
        status: 'Shipped',
        date: 'Thu, 5 December 2025, 5:32PM',
        description: 'Your item reached the nearest hub.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: 'Wed, 4 December 2025, 2:12PM',
        description: 'Your order has been confirmed.',
        completed: true,
      },
    ],
  },

  {
    id: 'ord_2',
    name: 'Wild Forest Honey',
    weight: '250g',
    price: 8.99,
    status: 'delivered',
    image: '/AppLogo.png',
    confirmedDate: 'Dec 02',
    deliveredDate: 'Dec 05',

    updates: [
      {
        status: 'Delivered',
        date: 'Fri, 5 December 2025, 1:10PM',
        description: 'Your order has been delivered.',
        completed: true,
      },
      {
        status: 'Out for Delivery',
        date: 'Fri, 5 December 2025, 9:15AM',
        description: 'Courier is delivering your package.',
        completed: true,
      },
      {
        status: 'Shipped',
        date: 'Wed, 3 December 2025, 4:40PM',
        description: 'Package shipped from warehouse.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: 'Tue, 2 December 2025, 11:20AM',
        description: 'Order confirmed successfully.',
        completed: true,
      },
    ],
  },

  {
    id: 'ord_7',
    name: 'Organic Coconut Oil',
    weight: '500ml',
    price: 9.49,
    status: 'on_the_way',
    image: '/AppLogo.png',
    confirmedDate: 'Dec 07',
    expectedDelivery: 'Dec 10',

    updates: [
      {
        status: 'Out for Delivery',
        date: 'Pending',
        description: 'Your order will soon be out for delivery.',
        completed: false,
      },
      {
        status: 'Shipped',
        date: 'Mon, 8 December 2025, 6:10PM',
        description: 'Package shipped from warehouse.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: 'Sun, 7 December 2025, 3:45PM',
        description: 'Your order has been confirmed.',
        completed: true,
      },
    ],
  },

  {
    id: 'ord_8',
    name: 'Cold Pressed Sesame Oil',
    weight: '500ml',
    price: 10.99,
    status: 'on_the_way',
    image: '/AppLogo.png',
    confirmedDate: 'Dec 08',
    expectedDelivery: 'Dec 11',

    updates: [
      {
        status: 'Out for Delivery',
        date: 'Pending',
        description: 'Package will soon be out for delivery.',
        completed: false,
      },
      {
        status: 'Shipped',
        date: 'Tue, 9 December 2025, 5:20PM',
        description: 'Package left the warehouse.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: 'Mon, 8 December 2025, 10:15AM',
        description: 'Order confirmed successfully.',
        completed: true,
      },
    ],
  },

  {
    id: 'ord_11',
    name: 'Organic Cardamom',
    weight: '50g',
    price: 6.99,
    status: 'cancelled',
    image: '/AppLogo.png',
    confirmedDate: 'Nov 28',
    cancelDate: 'Nov 30',

    updates: [
      {
        status: 'Cancelled',
        date: 'Sat, 30 November 2025, 2:40PM',
        description: 'Your order has been cancelled.',
        completed: true,
      },
      {
        status: 'Order Confirmed',
        date: 'Thu, 28 November 2025, 10:30AM',
        description: 'Your order was confirmed.',
        completed: true,
      },
    ],
  },

  {
    id: 'ord_14',
    name: 'Organic Red Chilli Powder',
    weight: '250g',
    price: 3.99,
    status: 'returned',
    image: '/AppLogo.png',
    confirmedDate: 'Nov 24',
    deliveredDate: 'Nov 25',
    returnDate: 'Nov 27',

    updates: [
      {
        status: 'Returned',
        date: 'Thu, 27 November 2025, 4:10PM',
        description: 'Your return request has been processed.',
        completed: true,
      },
      {
        status: 'Delivered',
        date: 'Tue, 25 November 2025, 11:20AM',
        description: 'Package delivered successfully.',
        completed: true,
      },
      {
        status: 'Shipped',
        date: 'Mon, 24 November 2025, 3:45PM',
        description: 'Item shipped from warehouse.',
        completed: true,
      },
    ],
  },
];
