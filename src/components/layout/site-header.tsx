"use client";
import React, { useState, useEffect, useCallback } from "react";
import TopBanner from "./TopBanner/TopBanner";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBasket,
  UserRound,
  X,
} from "lucide-react";

import { HeaderProductSearch } from "@/components/layout/header-product-search";
import { BrandSwitcher } from "@/features/home/components/brand-switcher";
import type { StoreBrand } from "@/types/storefront";
import {
  AUTH_STATE_CHANGED_EVENT,
  getActiveCustomer,
  logout,
  type ActiveCustomer,
} from "@/services/api/auth";
import { useWishlist } from "@/features/wishlist/wishlist-store";
import { useCart } from "@/features/cart/cart-store";

interface SiteHeaderProps {
  brands: StoreBrand[];
  activeBrandSlug: string;
  variant?: "overlay" | "solid";
}

const navigation = [
  {
    label: "Our Brands",
    href: "/brands",
    icon: "/images/navigation/our-brands.png",
  },
  {
    label: "Bundles & Gifts",
    href: "/categories/bundles",
    icon: "/images/navigation/bundles-and-gifts.png",
  },
  {
    label: "Ingredients & Provenance",
    href: "/ingredients",
    icon: "/images/navigation/ingridient-and-provenance.png",
  },
  {
    label: "Our Story",
    href: "/our-story",
    icon: "/images/navigation/our-story.png",
  },
  {
    label: "Natural Living",
    href: "/natural-living",
    icon: "/images/navigation/natural-living.png",
  },
  {
    label: "Journal",
    href: "/journal",
    icon: "/images/navigation/journal.png",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: "/images/navigation/contact-us.png",
  },
];

function CircleAction({
  label,
  children,
  count,
  className = "",
  onClick,
  ariaExpanded,
  ariaControls,
  href,
}: {
  label: string;
  children: React.ReactNode;
  count?: number;
  className?: string;
  onClick?: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
  href?: string;
}) {
  const actionClass = `relative grid size-11 shrink-0 place-items-center overflow-visible rounded-full border border-[#d8e4da] bg-white text-[#24573C] shadow-[0_2px_8px_rgba(36,87,60,0.08)] transition hover:border-[#8eae96] hover:bg-[#eff5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] ${className}`;
  const content = <>{children}{count !== undefined ? (
    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-[#eceb62] text-[10px] font-bold leading-none text-[#173e2a] shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  ) : null}</>;
  return href ? (
    <Link href={href} aria-label={label} className={actionClass}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      data-search-toggle={ariaControls ? "" : undefined}
      onClick={onClick}
      className={actionClass}
    >
      {content}
    </button>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="group inline-flex min-h-11 items-center justify-start gap-1.5 whitespace-nowrap rounded-md px-1 text-sm font-medium leading-none text-[#27382d] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] xl:h-full xl:min-h-0 xl:justify-center xl:text-base"
        >
          <span className="grid size-8 shrink-0 place-items-center">
            <Image
              src={item.icon}
              alt=""
              width={10}
              height={10}
              className="h-5 w-5 object-contain"
              aria-hidden="true"
            />
          </span>
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </>
  );
}

function CustomerAccountButton({
  customer,
  onLogout,
  compact = false,
}: {
  customer: ActiveCustomer;
  onLogout: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const firstName = customer.firstName.trim();
  const initials = [customer.firstName, customer.lastName]
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Account menu for ${firstName || customer.emailAddress}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 max-w-[190px] items-center gap-2 rounded-full text-[#252a30] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43] ${
          compact
            ? "h-10 w-10 gap-0 bg-transparent p-1 hover:bg-transparent sm:h-11 sm:w-auto sm:max-w-[190px] sm:gap-2 sm:bg-[#e6f4f2] sm:py-0 sm:pl-2 sm:pr-3 sm:hover:bg-[#d9efec]"
            : "bg-[#e6f4f2] pl-2 pr-3 hover:bg-[#d9efec]"
        }`}
      >
        <span
          className={`grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-[#d6e8e4] text-xs font-semibold text-[#2c5d43] shadow-sm ${
            compact ? "size-8 sm:size-9" : ""
          }`}
        >
          {initials || <UserRound aria-hidden="true" size={17} />}
        </span>
        <span
          className={`truncate text-sm font-medium sm:text-base ${
            compact ? "hidden sm:block sm:max-w-[100px]" : ""
          }`}
        >
          {firstName || customer.emailAddress}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 text-[#169b68] transition-transform ${
            compact ? "hidden size-4 sm:block sm:size-5" : ""
          } ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.7}
        />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Customer account"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] w-48 overflow-hidden rounded-lg border border-[#dce7df] bg-white py-1 shadow-lg"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-[#27382d] hover:bg-[#f1f7f2]"
          >
            My account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#27382d] hover:bg-[#f1f7f2]"
          >
            <LogOut aria-hidden="true" size={16} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({
  brands,
  activeBrandSlug,
  variant = "solid",
}: SiteHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState<ActiveCustomer | null>(null);
  const wishlist = useWishlist();
  const cart = useCart();
  const overlay = variant === "overlay";
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleSearch = useCallback(
    () => setSearchOpen((isOpen) => !isOpen),
    [],
  );
  const refreshCustomer = useCallback(async () => {
    try {
      setCustomer(await getActiveCustomer());
    } catch (error) {
      console.error("Failed to load the active storefront customer.", error);
      setCustomer(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout();
      if (!result.success) {
        throw new Error("The storefront API could not end the customer session.");
      }
      setCustomer(null);
    } catch (error) {
      console.error("Failed to log out the active storefront customer.", error);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshCustomer();
    }, 0);
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, refreshCustomer);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, refreshCustomer);
    };
  }, [refreshCustomer]);

  useEffect(() => {
    if (!drawerOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-50"
          : "relative z-50 w-full bg-white"
      }
    >
      <TopBanner />
      <header className="relative w-full">
        <div
          className={
            overlay
              ? " bg-transparent"
              : "border-b border-[#dbe4dc] bg-white shadow-[0_4px_18px_rgba(24,54,35,0.07)]"
          }
        >
          <div className="mx-auto max-w-[1280px] px-3 sm:px-5 lg:px-6">
            <div className="relative flex min-h-[76px] w-full min-w-0 items-center gap-3 sm:gap-5 xl:grid xl:min-h-0 xl:grid-cols-[160px_minmax(0,1fr)] xl:grid-rows-[82px_48px] xl:gap-x-6">
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                aria-controls="mobile-navigation-drawer"
                onClick={() => setDrawerOpen(true)}
                className="grid size-10 shrink-0 place-items-center rounded-full text-[#2C5D43] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] xl:hidden"
              >
                <Menu aria-hidden="true" className="size-6" />
              </button>

              <Link
                href={{ pathname: "/", query: { brand: activeBrandSlug } }}
                className="shrink-0 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:flex xl:h-full xl:items-center xl:justify-center"
                aria-label="Nana Organics home"
              >
                <Image
                  src="/images/AppLogo.svg"
                  alt="Nana Organics"
                  width={160}
                  height={120}
                  priority
                  unoptimized
                  className="h-[58px] w-auto object-contain sm:h-[68px] xl:h-[120px] xl:w-[140px]"
                />
              </Link>

              <div className="hidden min-w-0 flex-1 xl:col-start-2 xl:row-start-1 xl:block">
                <div className="flex min-h-[82px] items-center justify-between gap-5">
                  <BrandSwitcher
                    brands={brands}
                    activeBrandSlug={activeBrandSlug}
                  />
                  <div className="flex shrink-0 items-center gap-6">
                    {searchOpen ? (
                      <HeaderProductSearch
                        activeBrandSlug={activeBrandSlug}
                        searchId="desktop-product-search"
                        onClose={closeSearch}
                      />
                    ) : (
                      <CircleAction
                        label="Search"
                        ariaExpanded={false}
                        ariaControls="desktop-product-search-panel"
                        onClick={toggleSearch}
                      >
                        <Search
                          aria-hidden="true"
                          className="size-[22px]"
                          strokeWidth={2.25}
                        />
                      </CircleAction>
                    )}
                    <CircleAction
                      label="Wishlist"
                      count={wishlist.count}
                      href="/account/wishlist"
                      className="hidden sm:grid"
                    >
                      <Heart
                        aria-hidden="true"
                        className="size-[23px]"
                        strokeWidth={2.35}
                      />
                    </CircleAction>
                    <CircleAction label="Shopping cart" count={cart.count} href="/cart">
                      <ShoppingBasket
                        aria-hidden="true"
                        className="size-[23px]"
                        strokeWidth={2.35}
                      />
                    </CircleAction>
                    {customer ? (
                      <CustomerAccountButton
                        customer={customer}
                        onLogout={handleLogout}
                      />
                    ) : (
                      <Link
                        href="/login"
                        className="hidden min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#2C5D43] px-5 text-sm font-semibold text-white transition hover:bg-[#234d37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] md:inline-flex"
                      >
                        Login / Sign up
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2 xl:hidden">
                {searchOpen ? (
                  <HeaderProductSearch
                    activeBrandSlug={activeBrandSlug}
                    searchId="mobile-product-search"
                    onClose={closeSearch}
                  />
                ) : (
                  <CircleAction
                    label="Search"
                    ariaExpanded={false}
                    ariaControls="mobile-product-search-panel"
                    onClick={toggleSearch}
                    className="grid"
                  >
                    <Search
                      aria-hidden="true"
                      className="size-[22px]"
                      strokeWidth={2.25}
                    />
                  </CircleAction>
                )}
                <CircleAction
                  label="Wishlist"
                  count={wishlist.count}
                  href="/account/wishlist"
                  className="hidden sm:grid"
                >
                  <Heart
                    aria-hidden="true"
                    className="size-[23px]"
                    strokeWidth={2.35}
                  />
                </CircleAction>
                <CircleAction label="Shopping cart" count={cart.count} href="/cart">
                  <ShoppingBasket
                    aria-hidden="true"
                    className="size-[23px]"
                    strokeWidth={2.35}
                  />
                </CircleAction>
                {customer ? (
                  <CustomerAccountButton
                    customer={customer}
                    onLogout={handleLogout}
                    compact
                  />
                ) : (
                  <Link
                    href="/login"
                    className="hidden min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#2C5D43] px-5 text-sm font-semibold text-white transition hover:bg-[#234d37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] md:inline-flex"
                  >
                    Login / Sign up
                  </Link>
                )}
              </div>

              <nav
                aria-label="Main navigation"
                className="hidden h-12 items-stretch justify-between gap-1 xl:col-start-2 xl:row-start-2 xl:flex"
              >
                <NavigationLinks />
              </nav>
            </div>
          </div>
        </div>

        {drawerOpen ? (
          <div className="fixed inset-0 z-[60] xl:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 size-full cursor-default bg-black/40"
            />
            <aside
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="relative flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto bg-[#fbfcf9] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e1e9e0] px-5 py-4">
                <Link
                  href={{ pathname: "/", query: { brand: activeBrandSlug } }}
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Nana Organics home"
                >
                  <Image
                    src="/images/AppLogo.svg"
                    alt="Nana Organics"
                    width={140}
                    height={120}
                    unoptimized
                    className="h-[60px] w-auto object-contain"
                  />
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setDrawerOpen(false)}
                  className="grid size-10 place-items-center rounded-full text-[#2C5D43] transition hover:bg-[#eef4ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43]"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>

              <div className="border-b border-[#e1e9e0] px-5 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#67766b]">
                  Choose a brand
                </p>
                <BrandSwitcher
                  brands={brands}
                  activeBrandSlug={activeBrandSlug}
                  onBrandSelect={() => setDrawerOpen(false)}
                />
              </div>

              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 px-4 py-4"
              >
                <NavigationLinks onNavigate={() => setDrawerOpen(false)} />
              </nav>

              <div className="mt-auto border-t border-[#e1e9e0] p-5">
                {customer ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account"
                      onClick={() => setDrawerOpen(false)}
                      className="flex min-h-11 w-full items-center justify-center rounded-md bg-[#2C5D43] px-4 text-sm font-semibold text-white transition hover:bg-[#234d37]"
                    >
                      My account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        void handleLogout();
                      }}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#dbe4dc] px-4 text-sm font-semibold text-[#2c5d43]"
                    >
                      <LogOut aria-hidden="true" size={16} />
                      Log out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="flex min-h-11 w-full items-center justify-center rounded-md bg-[#2C5D43] px-4 text-sm font-semibold text-white transition hover:bg-[#234d37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43]"
                  >
                    Login / Sign up
                  </Link>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </header>
    </div>
  );
}
