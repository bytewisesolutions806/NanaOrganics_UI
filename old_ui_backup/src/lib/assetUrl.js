export function resolveAssetUrl(value) {
  if (!value) return '';

  const normalized = String(value).replaceAll('\\', '/');
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;

  const path = normalized.replace(/^\/+/, '');
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;

  if (endpoint) {
    try {
      const origin = new URL(endpoint).origin;
      return `${origin}/${path.startsWith('assets/') ? path : `assets/${path}`}`;
    } catch {
      // Fall through to a same-origin URL when the configured endpoint is invalid.
    }
  }

  return `/${path.startsWith('assets/') ? path : `assets/${path}`}`;
}
