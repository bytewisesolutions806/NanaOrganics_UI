'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../../assets/images/AppLogo.png';
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import menuItems from '../../constants/menuItems';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/AuthStore';
import useCategoryStore from '@/store/useCategotyStore';
import CartImage from '@/assets/images/CartIcon.png';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import HeaderSearch from '../HeaderSearch';
import profileMenu from '@/constants/menuItems/profileMenu';
import Sidebar from './sidebar';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import { fetchProfileApi } from '@/service/ProfileService';

const Header = () => {
  const { customer, isAuthenticated, hasHydrated, cartId: authCartId, setCustomer } = useAuthStore();
  const profileSyncCustomerId = useRef(null);
  const storeCartId = useCartStore((state) => state.cartId);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !customer?.id) {
      profileSyncCustomerId.current = null;
      return;
    }

    const hasProfileFields =
      Object.prototype.hasOwnProperty.call(customer, 'first_name') &&
      Object.prototype.hasOwnProperty.call(customer, 'profile_photo_url');
    if (hasProfileFields || profileSyncCustomerId.current === customer.id) return;

    profileSyncCustomerId.current = customer.id;
    let cancelled = false;
    fetchProfileApi()
      .then((response) => {
        if (!cancelled && response?.success && response.data?.customer) {
          setCustomer(response.data.customer);
        }
      })
      .catch((error) => {
        console.warn('Could not refresh the customer profile for the header', error);
      });

    return () => {
      cancelled = true;
    };
  }, [customer, hasHydrated, isAuthenticated, setCustomer]);

  const fetchCart = useCartStore((state) => state.fetchCart);
  const wishlistTotal = useWishlistStore((state) => state.wishlistTotal);
  const refreshWishlistCount = useWishlistStore((state) => state.refreshWishlistCount);
  const resetWishlist = useWishlistStore((state) => state.resetWishlist);

  // Refetch when auth cart id, cart-store id, or sessionStorage cart_id is available
  // (add-to-cart only updated the cart store + sessionStorage before; auth cartId could stay null)
  useEffect(() => {
    const fromStorage = typeof window !== 'undefined' ? sessionStorage.getItem('cart_id') : null;
    const id = storeCartId || authCartId || fromStorage;
    if (!hasHydrated) return;
    if (isAuthenticated || id) {
      // Vendure resolves activeOrder from the authenticated session/customer.
      // A local cart id is not required and may have been cleared on logout.
      fetchCart();
    }
  }, [authCartId, storeCartId, isAuthenticated, hasHydrated, fetchCart]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlistCount();
    } else {
      resetWishlist();
    }
  }, [isAuthenticated, refreshWishlistCount, resetWishlist]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpenDesktop, setDropdownOpenDesktop] = useState(null);
  const [dropdownOpenMobile, setDropdownOpenMobile] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.itemCount);

  // Load Categories for Dynamic Dropdown
  const categories = useCategoryStore((state) => state.categories);
  const loading = useCategoryStore((state) => state.loading);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  const handleShopByCategoryOpen = (index) => {
    if (dropdownOpenDesktop !== index) {
      // Category data is server state. Refresh it when the menu opens so removed
      // collections cannot linger in the header from an older browser session.
      fetchCategories(true);
    }
    setDropdownOpenDesktop(dropdownOpenDesktop === index ? null : index);
  };
  const megaMenuItems = categories.map((category) => ({
    id: category.id,
    name: category.name,
    handle: category.handle,
    image: category.image || DEFAULT_IMAGE,
  }));
  const logout = useAuthStore((state) => state.logout);
  const resetCart = useCartStore((state) => state.resetCart);

  const handleLogout = async () => {
    resetCart();
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('nav')) setDropdownOpenDesktop(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const handleToggle = () => {
    setOpen(!open);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white fixed top-[40px] md:top-[50px] left-0 z-50 w-full border-b border-[#1EA766]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* ================= DESKTOP (LG & XL) ================= */}
          <div className="hidden lg:flex items-center w-full px-8 py-4 gap-8">
            {/* LEFT – LOGO (25%) */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                {/* <Image src={Logo} width={120} height={90} alt="Logo" priority /> */}
                <Image src="/AppLogo.svg" width={130} height={80} alt="Nana Organics" priority />
              </Link>
            </div>

            {/* RIGHT – CONTENT (70%) */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                {/* LEFT: SEARCH + MENU (same width) */}
                <div className="w-full max-w-[900px]">
                  {/* SEARCH */}
                  <div className="relative w-full">
                    {/* <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
                  <InputText
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search"
                    className="w-full h-[46px] pl-10 rounded-[10px] border border-[#cfe2e0]"
                  /> */}
                    <HeaderSearch />
                  </div>

                  {/* MENU */}
                  <nav className="mt-6 w-full flex justify-between text-[15px] font-medium text-[#0D1D2C]">
                    {menuItems
                      .filter((item) => !item.showSidebarOnly)
                      .map((item, index) => (
                        <div key={index} className="relative">
                          {item.hasDropdown ? (
                            <>
                              <button
                                onClick={() => handleShopByCategoryOpen(index)}
                                className="flex items-center gap-1 hover:text-green-700 whitespace-nowrap"
                              >
                                {item.label}
                                <FiChevronDown
                                  className={`transition-transform ${
                                    dropdownOpenDesktop === index ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {dropdownOpenDesktop === index && item.isDynamic && (
                                <div
                                  className="
                              absolute top-full left-1/2 -translate-x-1/2 mt-5 z-50
                              bg-white shadow-xl rounded-2xl p-5
                              border border-[#CFE3DF] w-[980px] max-w-[92vw]
                            "
                                >
                                  <p className="text-sm font-semibold text-[#1F2937] text-center mb-4">
                                    All Categories
                                  </p>

                                  {loading ? (
                                    <div className="py-6 text-center text-sm text-gray-500">
                                      Loading categories...
                                    </div>
                                  ) : megaMenuItems.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-gray-500">
                                      Categories are not available.
                                    </div>
                                  ) : (
                                    <div className="category-scrollbar grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-2 sm:grid-cols-3 lg:grid-cols-5">
                                      {megaMenuItems.map((entry) => (
                                        <Link
                                          key={entry.id}
                                          href={`/shop/${entry.handle}`}
                                          onClick={() => setDropdownOpenDesktop(null)}
                                          className="flex items-center gap-2 p-2 border border-[#E4ECEA] rounded-lg hover:border-[#1EA766] hover:bg-[#F8FDFC] transition-colors"
                                        >
                                          <img
                                            src={entry.image || DEFAULT_IMAGE}
                                            alt={entry.name}
                                            className="w-8 h-8 rounded-md object-cover border border-[#E4ECEA] shrink-0"
                                          />
                                          <span className="text-[11px] leading-4 text-[#1F2937] line-clamp-2">
                                            {entry.name}
                                          </span>
                                        </Link>
                                      ))}
                                    </div>
                                  )}

                                  <div className="mt-4 text-right">
                                    <Link
                                      href="/shop"
                                      onClick={() => setDropdownOpenDesktop(null)}
                                      className="text-xs font-semibold text-[#1EA766] hover:underline"
                                    >
                                      Browse full catalog
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <Link href={item.url} className="hover:text-green-700">
                              {item.label}
                            </Link>
                          )}
                        </div>
                      ))}
                  </nav>
                </div>

                {/* RIGHT: ICONS / BADGES (fixed area) Desktop */}
                <div className="flex gap-6 shrink-0 ">
                  <Link href="/wishlist" className="relative cursor-pointer block">
                    <div className="w-10 h-10 bg-[#E6F4F2] rounded-xl flex items-center justify-center">
                      <span className="pi pi-heart text-[18px]  text-[#2C665E]" />
                    </div>
                    {wishlistTotal > 0 && (
                      <Badge
                        value={wishlistTotal > 99 ? '99+' : wishlistTotal}
                        className="absolute -top-3 -right-3 bg-[#1EA766]"
                      />
                    )}
                  </Link>

                  <div className="relative  cursor-pointer" onClick={() => router.push('/cart')}>
                    <div className="w-10 h-10 bg-[#E6F4F2] rounded-xl flex items-center justify-center">
                      <Image
                        src={CartImage}
                        alt="Cart"
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    {cartCount > 0 && (
                      <Badge value={cartCount} className="absolute -top-3 -right-3 bg-[#1EA766]" />
                    )}
                  </div>
                  {/* <button
                  onClick={() => router.push("/signup")}
                  className="hidden xl:flex items-center text-sm font-semibold bg-[#1EA766] text-white px-4 py-2 rounded-lg  transition cursor-pointer"
                >
                  Login/Signup
                </button> */}

                  {!hasHydrated ? (
                    <div className="hidden h-10 w-[116px] xl:block" aria-hidden="true" />
                  ) : !isAuthenticated ? (
                    <button
                      onClick={() => router.push('/signup')}
                      className="hidden xl:flex items-center text-sm font-semibold bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition cursor-pointer"
                    >
                      Login/Signup
                    </button>
                  ) : (
                    <div className="relative" ref={menuRef}>
                      {/* Profile Button */}
                      <div
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3 bg-[#E6F4F2] px-3 py-1 rounded-xl cursor-pointer"
                      >
                        <img
                          src={customer?.profile_photo_url || DEFAULT_IMAGE}
                          alt="profile"
                          className="w-9 h-9 rounded-full object-cover border"
                          onError={(event) => {
                            event.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />

                        <span className="font-medium text-gray-700">{customer?.first_name}</span>

                        <i
                          className={`pi pi-chevron-down text-[#1EA766] transition-transform ${
                            open ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {/* Dropdown */}
                      {open && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg p-3 border-1 border-[#1EA766]">
                          <ul className="space-y-1">
                            {profileMenu.map((item, index) => {
                              const isLogout = item.action === 'logout';
                              const isActive = pathname === item.url;
                              const Icon = item.icon;

                              return (
                                <li key={index}>
                                  {/* Main Menu */}
                                  <div
                                    onClick={() => {
                                      if (isLogout) handleLogout();
                                      else if (item.url) router.push(item.url);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
                ${
                  isLogout
                    ? 'hover:bg-red-50 text-red-500'
                    : isActive
                      ? 'bg-[#1EA766] text-white'
                      : 'hover:bg-gray-100'
                }
              `}
                                  >
                                    <Icon
                                      size={20}
                                      className={
                                        isLogout
                                          ? 'text-red-500'
                                          : isActive
                                            ? 'text-white'
                                            : 'text-[#1EA766]'
                                      }
                                    />

                                    <span>{item.label}</span>
                                  </div>

                                  {/* Sub Menu */}
                                  {item.children && (
                                    <ul className="ml-8 space-y-1 mt-1">
                                      {item.children.map((sub, subIndex) => {
                                        const isSubActive = pathname === sub.url;

                                        return (
                                          <li
                                            key={subIndex}
                                            onClick={() => router.push(sub.url)}
                                            className={`text-sm cursor-pointer px-2 py-1 rounded
                        ${
                          isSubActive
                            ? 'text-[#1EA766] font-semibold'
                            : 'text-gray-600 hover:text-[#1EA766]'
                        }
                      `}
                                          >
                                            {sub.label}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= TABLET (MD) ================= */}
          <div className="hidden md:flex lg:hidden items-center gap-4 px-4 py-3">
            {/* SIDEBAR / HAMBURGER */}
            <button onClick={() => setSidebarOpen(true)}>
              <FiMenu size={30} color="#1EA766" />
            </button>

            {/* SEARCH */}
            <div className="relative flex-1">
              {/* <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#2c665e]" />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              className="w-full h-[40px] pl-9 rounded-lg border border-[#cfe2e0]"
            /> */}
              <HeaderSearch />
            </div>

            {/* CART */}
            <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
              <div className="w-12 h-12 bg-[#E6F4F2] rounded-xl flex items-center justify-center">
                <Image
                  src={CartImage}
                  alt="Cart"
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </div>

              {cartCount > 0 && (
                <Badge value={cartCount} className="absolute -top-3 -right-3 bg-[#1EA766]" />
              )}
            </div>
          </div>

          {/* ================= MOBILE (SM & XS) ================= */}
          <div className="md:hidden px-4 py-3 space-y-3">
            {/* TOP ROW (Logo + Icons + Menu) */}
            <div className="flex items-center justify-between">
              {/* LEFT: LOGO (2 rows feel) */}
              <div className="flex items-center ml-4">
                {/* <Image src={Logo} alt="Logo" width={90} height={30} priority /> */}
                <Image src="/AppLogo.svg" width={100} height={80} alt="Nana Organics" priority />
              </div>

              {/* RIGHT: ICONS + MENU */}
              <div className="flex items-center gap-4">
                {/* Wishlist */}
                <Link href="/wishlist" className="relative block">
                  <div className="w-12 h-12 bg-[#E6F4F2] rounded-xl flex items-center justify-center">
                    <span className="pi pi-heart text-[#1EA766]" />
                  </div>
                  {wishlistTotal > 0 && (
                    <Badge
                      value={wishlistTotal > 99 ? '99+' : wishlistTotal}
                      className="absolute -top-3 -right-3 bg-[#1EA766]"
                    />
                  )}
                </Link>

                {/* Cart */}
                <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
                  <div className="w-12 h-12 bg-[#E6F4F2] rounded-xl flex items-center justify-center">
                    <Image
                      src={CartImage}
                      alt="Cart"
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                  </div>
                  {cartCount > 0 && (
                    <Badge value={cartCount} className="absolute -top-3 -right-3 bg-[#1EA766]" />
                  )}
                </div>

                {/* Menu Toggle */}
                <button onClick={() => setSidebarOpen(true)}>
                  <FiMenu size={30} color="green" />
                </button>
              </div>
            </div>

            {/* SEARCH – FULL WIDTH */}
            <div className="relative w-full">
              {/* <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#2c665e]" />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              className="w-full h-[40px] pl-9 rounded-lg border border-[#cfe2e0]"
            /> */}
              <HeaderSearch />
            </div>
          </div>
        </div>
      </header>
      {/* <hr className="text-red border " /> */}

      {/* ================= MOBILE SIDEBAR ================= */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        dropdownOpenMobile={dropdownOpenMobile}
        setDropdownOpenMobile={setDropdownOpenMobile}
        categories={categories}
        fetchCategories={fetchCategories}
        handleLogout={handleLogout}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[998]" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default Header;
