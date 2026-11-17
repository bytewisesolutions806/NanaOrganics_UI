export const supportedCountries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
] as const;

export function isSupportedCountry(countryCode: string) {
  const code = countryCode.trim().toUpperCase();
  return supportedCountries.some((country) => country.code === code);
}

export function validatePostalCode(countryCode: string, postalCode: string) {
  const code = countryCode.trim().toUpperCase();
  const value = postalCode.trim();
  if (!isSupportedCountry(code)) return "Addresses are currently supported only in the United States and Canada.";
  if (code === "US" && !/^\d{5}(?:-\d{4})?$/.test(value)) return "Enter a valid US ZIP code (12345 or 12345-6789).";
  if (code === "CA" && !/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(value)) return "Enter a valid Canadian postal code (for example, A1A 1A1).";
  return "";
}

export function normalizePostalCode(countryCode: string, postalCode: string) {
  const value = postalCode.trim();
  if (countryCode.trim().toUpperCase() !== "CA") return value;
  const characters = value.replace(/[ -]/g, "").toUpperCase();
  return `${characters.slice(0, 3)} ${characters.slice(3)}`;
}
