"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Heart,
  LogOut,
  MapPin,
  Star,
  UserPen,
} from "lucide-react";

import { logout } from "@/services/api/auth";

const accountItems = [
  { label: "My Orders", href: "/account/orders", icon: Box },
  { label: "Profile Info", href: "/account", icon: UserPen },
  { label: "Manage Address", href: "/account/addresses", icon: MapPin },
  { label: "My Reviews & Ratings", href: "/account/reviews", icon: Star },
  { label: "My Wishlist", href: "/account/wishlist", icon: Heart },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Could not log out.", error);
    }
  }

  return (
    <aside
      aria-label="Account navigation"
      className="flex overflow-hidden rounded-[22px] bg-[#f2f9f8] lg:min-h-[650px] lg:flex-col"
    >
      <nav className="flex flex-1 gap-2 overflow-x-auto p-3 lg:flex-col lg:gap-3 lg:p-4">
        {accountItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/account"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-14 shrink-0 items-center gap-3 rounded-[17px] px-4 text-sm font-medium transition-colors lg:min-h-[64px] lg:text-base ${
              active
                ? "bg-[#2c665e] font-semibold text-white"
                : "text-[#28352f] hover:bg-[#e6f4f2]"
            }`}
          >
            <Icon
              aria-hidden="true"
              size={22}
              strokeWidth={1.75}
              className={active ? "text-white" : "text-[#1ea766]"}
            />
            <span>{label}</span>
          </Link>
        )})}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="hidden min-h-[70px] items-center gap-3 bg-[#e6f4f2] px-8 text-left text-base font-medium text-[#21252c] transition-colors hover:bg-[#d9eeea] hover:text-[#2c665e] lg:flex"
      >
        <LogOut
          aria-hidden="true"
          size={22}
          strokeWidth={1.75}
          className="text-[#1ea766]"
        />
        Logout
      </button>
    </aside>
  );
}
