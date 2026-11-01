import { Box, UserPen, Star, Heart, LogOut } from 'lucide-react';

const profileMenu = [
  {
    label: 'My Orders',
    url: '/my-orders',
    icon: Box,
  },
  {
    label: 'Profile Management',
    icon: UserPen,
    children: [
      {
        label: 'Profile Info',
        url: '/info',
      },
      {
        label: 'Manage Address',
        url: '/address',
      },
    ],
  },
  {
    label: 'My Reviews & Ratings',
    url: '/my-reviews',
    icon: Star,
  },
  {
    label: 'My Wishlist',
    url: '/wishlist',
    icon: Heart,
  },
  {
    label: 'Logout',
    icon: LogOut,
    action: 'logout',
  },
];

export default profileMenu;
