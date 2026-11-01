const menuItems = [
  { label: 'Home', url: '/' },
  { label: 'Shop Now', url: '/shop' },
  {
    label: 'Shop by Category',
    hasDropdown: true,
    isDynamic: true, // 👈 important
  },

  { label: 'Deal of the Week', url: '/deals' },
  // { label: "Our Story", url: "/our-story" },
  { label: 'Contact', url: '/contact-us' },
  // 👉 Show this only in sidebar
  { label: 'Login / Signup', url: '/signup', showSidebarOnly: true },
];

export default menuItems;
