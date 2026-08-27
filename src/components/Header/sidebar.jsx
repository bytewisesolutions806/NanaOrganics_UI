'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiChevronDown } from 'react-icons/fi';
import { useRouter, usePathname } from 'next/navigation';
import menuItems from '@/constants/menuItems/index';
import profileMenu from '@/constants/menuItems/profileMenu';
import useAuthStore from '@/store/AuthStore';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  dropdownOpenMobile,
  setDropdownOpenMobile,
  categories,
  fetchCategories,
  handleLogout,
}) {
  const { customer, isAuthenticated } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'auto';
  }, [sidebarOpen]);

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[998]" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[80%] bg-white shadow-xl z-[999]
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <Image src="/AppLogo.svg" width={112} height={64} alt="Nana Organics" />
          <FiX size={26} className="cursor-pointer" onClick={() => setSidebarOpen(false)} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-b pb-4">
              <img
                src={customer?.profile_photo_url || DEFAULT_IMAGE}
                alt="Profile photo"
                className="w-10 h-10 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_IMAGE;
                }}
              />
              <span className="font-semibold">{customer?.first_name}</span>
            </div>
          ) : (
            <Link
              href="/signup"
              onClick={() => setSidebarOpen(false)}
              className="block bg-[#1EA766] text-white text-center py-2 rounded-lg"
            >
              Login / Signup
            </Link>
          )}

          {/* MAIN NAVIGATION */}
          <ul className="space-y-4">
            {menuItems
              .filter((item) => !(item.showSidebarOnly && isAuthenticated))
              .map((item, index) => (
                <li key={index}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        className="flex justify-between items-center w-full font-medium text-[16px]"
                        onClick={() => {
                          if (item.isDynamic) fetchCategories();
                          setDropdownOpenMobile(dropdownOpenMobile === index ? null : index);
                        }}
                      >
                        {item.label}
                        <FiChevronDown
                          className={`transition-transform ${
                            dropdownOpenMobile === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {dropdownOpenMobile === index && (
                        <ul className="ml-3 mt-3 flex flex-col gap-3 border-l pl-3">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link
                                href={`/shop/${category.handle}`}
                                onClick={() => setSidebarOpen(false)}
                                className="font-semibold text-[#2C665E]"
                              >
                                {category.name}
                              </Link>

                              {category.subcategories?.length > 0 && (
                                <ul className="ml-3 mt-2 flex flex-col gap-2">
                                  {category.subcategories.map((sub) => (
                                    <li key={sub.id}>
                                      <Link
                                        href={`/shop/${category.handle}/${sub.handle}`}
                                        onClick={() => setSidebarOpen(false)}
                                        className="text-[14px] text-gray-700 hover:text-green-700"
                                      >
                                        {sub.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      onClick={() => setSidebarOpen(false)}
                      className="font-medium text-[16px] hover:text-green-700 block"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
          </ul>

          {/* ACCOUNT MENU */}
          {isAuthenticated && (
            <div className="border-t pt-4">
              <ul className="space-y-3">
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
                            isLogout ? 'text-red-500' : isActive ? 'text-white' : 'text-[#1EA766]'
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
      </aside>
    </>
  );
}
