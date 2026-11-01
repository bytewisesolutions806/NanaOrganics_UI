const STORAGE_KEY = 'recentlyViewedProductSlugs';
const MAX_ITEMS = 12;

export function getRecentlyViewedProductSlugs() {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((slug) => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewedProduct(slug) {
  if (typeof window === 'undefined' || !slug) return;
  const current = getRecentlyViewedProductSlugs();
  const updated = [slug, ...current.filter((item) => item !== slug)].slice(0, MAX_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
