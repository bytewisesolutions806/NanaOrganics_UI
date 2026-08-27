import { GraphQLClient } from 'graphql-request';
import { getStoredAccessToken, hasStoredAuthSession } from '@/lib/authSession';

const PUBLIC_QUERY_TTL_MS = 30_000;
const AUTHENTICATED_QUERY_TTL_MS = 3_000;
const MAX_CACHE_ENTRIES = 100;

let shopApiClient;
let cacheVersion = 0;
const inFlightQueries = new Map();
const queryCache = new Map();

export function getShopApiClient() {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
  if (!endpoint) {
    throw new Error(
      'NEXT_PUBLIC_VENDURE_SHOP_API_URL is not configured. Add the Vendure Shop API URL to .env.local.',
    );
  }

  if (!shopApiClient) {
    const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
    shopApiClient = new GraphQLClient(endpoint, {
      credentials: 'include',
      headers: {
        ...(channelToken ? { 'vendure-token': channelToken } : {}),
      },
    });
  }

  return shopApiClient;
}

function documentSource(document) {
  if (typeof document === 'string') return document;
  return document?.loc?.source?.body || JSON.stringify(document);
}

function stableSerialize(value) {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    .join(',')}}`;
}

function isMutation(document) {
  return /\bmutation\b/.test(documentSource(document));
}

function requestKey(document, variables, token, version) {
  return `${version}:${token || 'public'}:${documentSource(document)}:${stableSerialize(variables || {})}`;
}

function pruneCache(now = Date.now()) {
  for (const [key, entry] of queryCache) {
    if (entry.expiresAt <= now) queryCache.delete(key);
  }
  while (queryCache.size > MAX_CACHE_ENTRIES) {
    queryCache.delete(queryCache.keys().next().value);
  }
}

export function clearShopApiCache() {
  cacheVersion += 1;
  queryCache.clear();
  // Requests already on the wire are allowed to finish for their callers, but
  // their version prevents them from repopulating this new cache generation.
}

export function shopApiRequest(document, variables, options = {}) {
  const token = getStoredAccessToken();
  const authenticatedSession = hasStoredAuthSession();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  if (isMutation(document)) {
    clearShopApiCache();
    return getShopApiClient().request(document, variables, headers);
  }

  const version = cacheVersion;
  const key = requestKey(
    document,
    variables,
    token || (authenticatedSession ? 'cookie-session' : null),
    version,
  );
  const now = Date.now();
  const cached = queryCache.get(key);
  if (cached && cached.expiresAt > now) return Promise.resolve(cached.data);
  if (cached) queryCache.delete(key);
  if (inFlightQueries.has(key)) return inFlightQueries.get(key);

  const ttlMs = Math.max(
    0,
    options.cacheTtlMs ??
      (authenticatedSession ? AUTHENTICATED_QUERY_TTL_MS : PUBLIC_QUERY_TTL_MS),
  );
  const request = getShopApiClient()
    .request(document, variables, headers)
    .then((data) => {
      if (ttlMs > 0 && version === cacheVersion) {
        queryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
        pruneCache();
      }
      return data;
    })
    .finally(() => {
      inFlightQueries.delete(key);
    });

  inFlightQueries.set(key, request);
  return request;
}
