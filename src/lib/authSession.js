const AUTH_SESSION_KEY = 'nana-authenticated-session';

function browserSessionStorage() {
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

export function getStoredAccessToken() {
  const storage = browserSessionStorage();
  const token = storage?.getItem('accessToken') || null;
  if (!token || token.split('.').length !== 3) return token;

  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(paddedPayload));
    if (typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000)) {
      storage?.removeItem('accessToken');
      return null;
    }
  } catch {
    // Let the API validate malformed or non-standard bearer tokens.
  }

  return token;
}

export function getStoredCustomer() {
  const storage = browserSessionStorage();
  const value = storage?.getItem('customer');
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    storage?.removeItem('customer');
    return null;
  }
}

export function hasStoredAuthSession() {
  const storage = browserSessionStorage();
  return Boolean(
    storage?.getItem('accessToken') || storage?.getItem(AUTH_SESSION_KEY) === 'true',
  );
}

export function storeAuthSession({ token, customer }) {
  const storage = browserSessionStorage();
  if (!storage) return;

  if (token) storage.setItem('accessToken', token);
  else storage.removeItem('accessToken');

  if (customer) storage.setItem('customer', JSON.stringify(customer));
  else storage.removeItem('customer');

  storage.setItem(AUTH_SESSION_KEY, 'true');
}

export function clearStoredAuthSession() {
  const storage = browserSessionStorage();
  if (!storage) return;
  storage.removeItem('accessToken');
  storage.removeItem('customer');
  storage.removeItem(AUTH_SESSION_KEY);
}
