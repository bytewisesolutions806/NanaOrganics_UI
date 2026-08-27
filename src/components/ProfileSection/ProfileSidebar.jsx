'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import profileMenu from '@/constants/menuItems/profileMenu';
import { useState } from 'react';
import useAuthStore from '@/store/AuthStore';
import useCartStore from '@/store/useCartStore';

export default function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);
  const logout = useAuthStore((state) => state.logout);
  const resetCart = useCartStore((state) => state.resetCart);

  const handleLogout = async () => {
    resetCart();
    await logout();
    router.push('/');
  };

  const menuItems = profileMenu.filter((item) => item.action !== 'logout');
  const logoutItem = profileMenu.find((item) => item.action === 'logout');

  // Helper to check active route
  const isRouteActive = (url) => pathname === url || pathname.startsWith(url + '/');

  return (
    <div className="w-[260px] bg-[#E6EFEF] rounded-2xl flex flex-col justify-between min-h-[650px] mb-10">
      {/* MENU SECTION */}
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = item.url && isRouteActive(item.url);

          const isChildActive = item.children?.some((child) => isRouteActive(child.url));

          const Icon = item.icon;

          return (
            <div key={index}>
              {/* Parent Menu */}
              {item.url ? (
                <Link
                  href={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                    ${isActive ? 'bg-[#2C665E] text-white' : 'hover:bg-[#2C665E]/10'}`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-[#1EA766]'} />
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => setOpenMenu(openMenu === index ? null : index)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition
                    ${isChildActive ? 'bg-[#2C665E] text-white' : 'hover:bg-[#2C665E]/10'}`}
                >
                  <Icon size={20} className={isChildActive ? 'text-white' : 'text-[#1EA766]'} />
                  {item.label}
                </button>
              )}

              {/* CHILD MENU */}
              {item.children && (openMenu === index || isChildActive) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child, i) => {
                    const isChildActive = isRouteActive(child.url);

                    return (
                      <Link
                        key={i}
                        href={child.url}
                        className={`block text-sm px-2 py-1 rounded
                          ${
                            isChildActive
                              ? 'text-[#2C665E] font-semibold'
                              : 'text-gray-600 hover:text-[#2C665E]'
                          }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LOGOUT SECTION */}
      <div className="bg-[#DCE7E7] px-4 py-4 rounded-b-2xl border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-[#2C665E] hover:text-red-500"
        >
          <i className={logoutItem.icon}></i>
          {logoutItem.label}
        </button>
      </div>
    </div>
  );
}
