# Responsive Screen Sizes

This document defines the viewport sizes used by the Nana Organics frontend.

> Responsive layouts react to the **viewport width**, not to a device name or brand. Device categories below are practical labels for design and testing.

## Project Breakpoints

The project does not define custom Tailwind screen breakpoints. It therefore uses Tailwind's default mobile-first breakpoints.

| Prefix | Starts at | CSS equivalent | Typical use |
| --- | ---: | --- | --- |
| Base | `0px` | Default styles, no media query | Phones and shared styles |
| `sm:` | `640px` (`40rem`) | `@media (width >= 40rem)` | Large phones and small tablets |
| `md:` | `768px` (`48rem`) | `@media (width >= 48rem)` | Tablets |
| `lg:` | `1024px` (`64rem`) | `@media (width >= 64rem)` | Landscape tablets and laptops |
| `xl:` | `1280px` (`80rem`) | `@media (width >= 80rem)` | Desktops |
| `2xl:` | `1536px` (`96rem`) | `@media (width >= 96rem)` | Large desktops |

Tailwind is mobile-first. For example:

```jsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl" />
```

- Below `640px`: `text-sm`
- From `640px`: `text-base`
- From `768px`: `text-lg`
- From `1024px`: `text-xl`

## Practical Device Ranges

Use these ranges when discussing layouts and reviewing designs.

| Viewport width | Device category | Tailwind tier |
| ---: | --- | --- |
| `0-359px` | Very small phone or narrow foldable | Base |
| `360-479px` | Standard phone | Base |
| `480-639px` | Large phone | Base |
| `640-767px` | Small tablet or very large phone | `sm` |
| `768-1023px` | Tablet | `md` |
| `1024-1279px` | Landscape tablet or small laptop | `lg` |
| `1280-1535px` | Laptop or desktop | `xl` |
| `1536px+` | Large desktop or high-resolution display | `2xl` |

These categories describe CSS layout widths. A high-resolution phone can still have a CSS viewport near `390px` because device pixels and CSS pixels are different.

## Recommended Test Viewports

Testing only at breakpoint boundaries can miss real-device layout issues. Use this set for routine responsive checks.

| Device type | Viewport (width × height) |
| --- | ---: |
| Narrow/foldable phone | `280 × 653` |
| Small phone | `320 × 568` |
| Android phone | `360 × 800` |
| Modern phone | `390 × 844` |
| Large phone | `412 × 915` |
| Small tablet | `640 × 960` |
| Tablet portrait | `768 × 1024` |
| Large tablet portrait | `820 × 1180` |
| Tablet landscape | `1024 × 768` |
| Small laptop | `1280 × 720` |
| Common laptop | `1366 × 768` |
| Desktop | `1440 × 900` |
| Large desktop | `1920 × 1080` |
| QHD display | `2560 × 1440` |

Also test phone and tablet viewports in both portrait and landscape orientations.

## Boundary Checks

For each Tailwind breakpoint, check one pixel below and the exact breakpoint:

| Transition | Check widths |
| --- | --- |
| Base → `sm` | `639px` and `640px` |
| `sm` → `md` | `767px` and `768px` |
| `md` → `lg` | `1023px` and `1024px` |
| `lg` → `xl` | `1279px` and `1280px` |
| `xl` → `2xl` | `1535px` and `1536px` |

## Additional Media Queries Already in the Project

Some component styles use direct CSS media queries in addition to Tailwind classes.

| Query | Current purpose/location |
| --- | --- |
| `max-width: 480px` | Extra-small adjustments in SearchBar, TopBanner, and ProductBreadcrumb |
| `max-width: 639px` | Mobile ProductImageGallery and ReviewCard styles |
| `min-width: 640px` | ReviewCard tablet-and-up styles |
| `max-width: 640px` | Gallery mobile styles |
| `max-width: 768px` | Mobile/tablet adjustments in Trending, TopBanner, ProductSlider, and ProductBreadcrumb |
| `max-width: 1024px` | SearchBar responsive styles |
| `min-width: 1200px` | Wide-screen Trending and ProductSlider styles |

Be careful at inclusive boundaries such as `640px` and `768px`: both a `max-width` rule and a Tailwind `min-width` rule can apply at the same width. Prefer `max-width: 639px` before `sm:` and `max-width: 767px` before `md:` when adding new CSS.

## Development Guidelines

1. Build the base layout for widths below `640px` first.
2. Add `sm:`, `md:`, `lg:`, `xl:`, or `2xl:` only when the layout needs to change.
3. Do not target device brands such as iPhone, Pixel, or iPad in CSS.
4. Avoid fixed widths when `w-full`, `max-w-*`, grid, or flex layouts can adapt naturally.
5. Check for horizontal overflow at `320px`, `360px`, and every breakpoint boundary.
6. Test content with longer text, empty states, loading states, and browser zoom.
7. Keep important content usable at `200%` zoom and respect reduced-motion preferences.

## Source of Truth

- Tailwind entry stylesheet: `src/assets/styles/globals.css`
- Tailwind configuration: `tailwind.config.js`
- Component-specific media queries: files under `src/components`

If custom breakpoints are added later, update this document at the same time.
