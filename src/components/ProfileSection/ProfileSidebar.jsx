'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import profileMenu from '@/constants/menuItems/profileMenu';
import useAuthStore from '@/store/AuthStore';
import useCartStore from '@/store/useCartStore';

const menuItemClass =
  'flex min-h-[66px] w-full items-center gap-3 rounded-[20px] px-5 text-left text-base font-medium transition-colors';

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

  const isRouteActive = (url) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <aside
      className="mb-10 flex min-h-[708px] w-full max-w-[280px] flex-col overflow-hidden rounded-[24px] bg-[#F2F9F8]"
      aria-label="Profile navigation"
    >
      <nav className="flex flex-1 flex-col gap-3 p-4">
        {menuItems.map((item) => {
          const isActive = Boolean(item.url && isRouteActive(item.url));
          const isChildActive = Boolean(
            item.children?.some((child) => isRouteActive(child.url)),
          );
          const isExpanded = openMenu === item.label || isChildActive;
          const isHighlighted = isActive || isChildActive;
          const Icon = item.icon;

          return (
            <div key={item.label}>
              {item.url ? (
                <Link
                  href={item.url}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${menuItemClass} ${
                    isActive
                      ? 'bg-[#2C665E] text-white'
                      : 'text-[#21252C] hover:bg-[#E6F4F2]'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={24}
                    strokeWidth={1.75}
                    className={isActive ? 'shrink-0 text-white' : 'shrink-0 text-[#1EA766]'}
                  />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setOpenMenu(isExpanded && !isChildActive ? null : item.label)}
                  className={`${menuItemClass} ${
                    isHighlighted
                      ? 'bg-[#2C665E] text-white'
                      : 'text-[#21252C] hover:bg-[#E6F4F2]'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={24}
                    strokeWidth={1.75}
                    className={
                      isHighlighted ? 'shrink-0 text-white' : 'shrink-0 text-[#1EA766]'
                    }
                  />
                  <span>{item.label}</span>
                </button>
              )}

              {item.children && isExpanded ? (
                <div className="mx-5 mt-2 grid gap-1 rounded-2xl bg-[#E6F4F2] p-2">
                  {item.children.map((child) => {
                    const childIsActive = isRouteActive(child.url);

                    return (
                      <Link
                        key={child.url}
                        href={child.url}
                        aria-current={childIsActive ? 'page' : undefined}
                        className={`flex min-h-9 items-center rounded-xl px-3 text-sm transition-colors ${
                          childIsActive
                            ? 'bg-white font-semibold text-[#2C665E]'
                            : 'font-medium text-[#53605D] hover:bg-white/70 hover:text-[#2C665E]'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="min-h-[70px] bg-[#E6F4F2]">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-[70px] w-full items-center gap-3 px-9 text-left text-base font-medium text-[#21252C] transition-colors hover:bg-[#D9EEEA] hover:text-[#2C665E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#2C665E]"
        >
          <LogIn
            aria-hidden="true"
            size={24}
            strokeWidth={1.75}
            className="shrink-0 text-[#1EA766]"
          />
          <span>{logoutItem?.label || 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
