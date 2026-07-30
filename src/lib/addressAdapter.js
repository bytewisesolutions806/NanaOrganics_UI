/**
 * Maps customer.metadata.addresses API shape ↔ profile UI / checkout.
 * API: first_name, last_name, address_1, province, postal_code, country_code, is_default
 */

export function apiAddressToView(addr) {
  if (!addr || typeof addr !== "object") return null;
  const first = String(addr.first_name || "").trim();
  const last = String(addr.last_name || "").trim();
  const displayName = [first, last].filter(Boolean).join(" ").trim() || "—";
  return {
    id: addr.id,
    first_name: first,
    last_name: last,
    displayName,
    phone: addr.phone != null ? String(addr.phone) : "",
    address: String(addr.address_1 || "").trim(),
    city: String(addr.city || "").trim(),
    state: String(addr.province || "").trim(),
    pincode: String(addr.postal_code || "").trim(),
    country_code: String(addr.country_code || "de")
      .trim()
      .toLowerCase(),
    isDefault: !!(addr.is_default === true || addr.isDefault === true),
  };
}

export function emptyAddressForm() {
  return {
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country_code: "de",
    isDefault: false,
  };
}

/** Modal / form values → POST body */
export function formToCreateBody(form) {
  return {
    first_name: String(form.first_name || "").trim(),
    last_name: String(form.last_name || "").trim(),
    address_1: String(form.address || "").trim(),
    city: String(form.city || "").trim(),
    province: String(form.state || "").trim(),
    postal_code: String(form.pincode || "").trim(),
    country_code: String(form.country_code || "de")
      .trim()
      .toLowerCase(),
    phone: String(form.phone || "").trim() || undefined,
    is_default: !!form.isDefault,
  };
}

/** Modal values → PATCH body (only defined fields sent for partial updates) */
export function formToPatchBody(form) {
  const body = {};
  if (form.first_name !== undefined)
    body.first_name = String(form.first_name || "").trim();
  if (form.last_name !== undefined)
    body.last_name = String(form.last_name || "").trim();
  if (form.address !== undefined)
    body.address_1 = String(form.address || "").trim();
  if (form.city !== undefined) body.city = String(form.city || "").trim();
  if (form.state !== undefined)
    body.province = String(form.state || "").trim();
  if (form.pincode !== undefined)
    body.postal_code = String(form.pincode || "").trim();
  if (form.country_code !== undefined)
    body.country_code = String(form.country_code || "")
      .trim()
      .toLowerCase();
  if (form.phone !== undefined) {
    const p = String(form.phone || "").trim();
    body.phone = p || null;
  }
  if (form.isDefault !== undefined) body.is_default = !!form.isDefault;
  return body;
}

/** Saved address (API row) → checkout shipping form state */
export function apiAddressToCheckout(address, emailFallback = "") {
  if (!address) return null;
  return {
    firstName: String(address.first_name || "").trim(),
    lastName: String(address.last_name || "").trim(),
    email: emailFallback,
    phone: address.phone != null ? String(address.phone).trim() : "",
    street: String(address.address_1 || "").trim(),
    city: String(address.city || "").trim(),
    state: String(address.province || "").trim(),
    zip: String(address.postal_code || "").trim(),
    country: String(address.country_code || "de")
      .trim()
      .toLowerCase(),
  };
}

export function pickDefaultAddress(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) return null;
  const def = addresses.find(
    (a) => a?.is_default === true || a?.isDefault === true
  );
  return def || addresses[0];
}
