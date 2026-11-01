"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountHeading, EmptyState, LoadingCards } from "./account-ui";
import {
  type AddressInput,
  type CustomerAddress,
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddresses,
  updateCustomerAddress,
} from "@/services/api/account";

const countries = [
  ["in", "India"], ["us", "United States"], ["gb", "United Kingdom"],
  ["de", "Germany"], ["dk", "Denmark"], ["se", "Sweden"],
  ["fr", "France"], ["es", "Spain"], ["it", "Italy"], ["my", "Malaysia"],
] as const;

const emptyAddress: AddressInput = {
  firstName: "", lastName: "", phoneNumber: "", streetLine1: "", streetLine2: "",
  city: "", province: "", postalCode: "", countryCode: "in", isDefault: false,
};

export function AddressManager() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CustomerAddress | null | undefined>();
  const [deleting, setDeleting] = useState<CustomerAddress | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAddresses(await getCustomerAddresses());
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load addresses.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
      else setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    getCustomerAddresses()
      .then((items) => { if (active) setAddresses(items); })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load addresses.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
        else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  return (
    <section>
      <AccountHeading
        title="Manage Address"
        count={addresses.length}
        action={<button type="button" onClick={() => setEditing(null)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2c665e] px-4 text-sm font-semibold text-white hover:bg-[#214f49]"><Plus size={18} /> Add Address</button>}
      />
      {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <LoadingCards /> : addresses.length === 0 ? (
        <EmptyState title="No saved addresses" message="Add a delivery address to make checkout faster." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="relative rounded-2xl border border-[#cfe3df] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf5f1] text-[#2c665e]"><MapPin size={19} /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#25332e]">{address.firstName} {address.lastName}</h2>
                      {address.isDefault ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"><Check size={12} /> Default</span> : null}
                    </div>
                    <address className="mt-2 text-sm not-italic leading-6 text-[#66736e]">
                      {address.streetLine1}{address.streetLine2 ? `, ${address.streetLine2}` : ""}<br />
                      {address.city}, {address.province} {address.postalCode}<br />
                      {address.countryName}<br />{address.phoneNumber}
                    </address>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setEditing(address)} aria-label={`Edit ${address.firstName}'s address`} className="grid size-9 place-items-center rounded-lg text-[#2c665e] hover:bg-[#edf6f3]"><Pencil size={17} /></button>
                  <button type="button" onClick={() => setDeleting(address)} aria-label={`Delete ${address.firstName}'s address`} className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing !== undefined ? <AddressDialog address={editing} onClose={() => setEditing(undefined)} onSaved={async () => { setEditing(undefined); await load(); }} /> : null}
      {deleting ? <DeleteAddressDialog address={deleting} onClose={() => setDeleting(null)} onDeleted={async () => { setDeleting(null); await load(); }} /> : null}
    </section>
  );
}

function AddressDialog({ address, onClose, onSaved }: { address: CustomerAddress | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<AddressInput>(() => address ? {
    firstName: address.firstName, lastName: address.lastName, phoneNumber: address.phoneNumber,
    streetLine1: address.streetLine1, streetLine2: address.streetLine2, city: address.city,
    province: address.province, postalCode: address.postalCode, countryCode: address.countryCode, isDefault: address.isDefault,
  } : emptyAddress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputClass = "h-11 w-full rounded-lg border border-[#cfe3df] px-3 text-sm outline-none focus:border-[#2c665e] focus:ring-2 focus:ring-[#2c665e]/10";
  const set = <K extends keyof AddressInput>(field: K, value: AddressInput[K]) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.streetLine1.trim() || !form.city.trim() || !form.province.trim() || !form.postalCode.trim() || !form.countryCode) {
      setError("Complete all required address fields."); return;
    }
    setSaving(true); setError("");
    try {
      if (address) await updateCustomerAddress(address.id, form); else await createCustomerAddress(form);
      await onSaved();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the address."); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="address-dialog-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 id="address-dialog-title" className="text-xl font-semibold">{address ? "Edit Address" : "Add Address"}</h2><button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-gray-100"><X size={19} /></button></div>
        {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name *"><input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" className={inputClass} /></Field>
          <Field label="Last name *"><input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" className={inputClass} /></Field>
          <Field label="Phone"><input value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} autoComplete="tel" className={inputClass} /></Field>
          <Field label="Country *"><select value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)} autoComplete="country" className={inputClass}>{countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></Field>
          <div className="sm:col-span-2"><Field label="Address line 1 *"><input value={form.streetLine1} onChange={(e) => set("streetLine1", e.target.value)} autoComplete="address-line1" className={inputClass} /></Field></div>
          <div className="sm:col-span-2"><Field label="Address line 2"><input value={form.streetLine2} onChange={(e) => set("streetLine2", e.target.value)} autoComplete="address-line2" className={inputClass} /></Field></div>
          <Field label="City *"><input value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" className={inputClass} /></Field>
          <Field label="State / Province *"><input value={form.province} onChange={(e) => set("province", e.target.value)} autoComplete="address-level1" className={inputClass} /></Field>
          <Field label="Postal code *"><input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} autoComplete="postal-code" className={inputClass} /></Field>
          <label className="flex items-end gap-2 pb-3 text-sm text-[#4e5b56]"><input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="size-4 accent-[#2c665e]" /> Set as default address</label>
          <div className="flex justify-end gap-3 pt-2 sm:col-span-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-10 rounded-lg border border-[#8aa9a2] px-5 text-sm font-semibold text-[#2c665e]">Cancel</button><button type="submit" disabled={saving} className="min-h-10 rounded-lg bg-[#2c665e] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : address ? "Update Address" : "Save Address"}</button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">{label}{children}</label>; }

function DeleteAddressDialog({ address, onClose, onDeleted }: { address: CustomerAddress; onClose: () => void; onDeleted: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function remove() { setBusy(true); setError(""); try { await deleteCustomerAddress(address.id); await onDeleted(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete the address."); setBusy(false); } }
  return <div className="fixed inset-0 z-[110] grid place-items-center bg-black/45 p-4"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="delete-address-title" className="text-xl font-semibold">Delete address?</h2><p className="mt-2 text-sm leading-6 text-[#68746f]">This will permanently remove the address for {address.firstName} {address.lastName}.</p>{error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={busy} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button type="button" onClick={remove} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete"}</button></div></div></div>;
}
