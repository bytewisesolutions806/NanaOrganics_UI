import { create } from "zustand";
import {
  fetchAddressesApi,
  createAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from "@/service/AddressService";
import {
  apiAddressToView,
  formToCreateBody,
  formToPatchBody,
} from "@/lib/addressAdapter";

function getErrorMessage(err) {
  const d = err?.response?.data;
  if (typeof d?.error === "string") return d.error;
  if (typeof d?.message === "string") return d.message;
  if (err?.message) return err.message;
  return "Something went wrong";
}

function hasSessionToken() {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("accessToken");
}

const useAddressStore = create((set, get) => ({
  addresses: [],
  loading: false,
  listError: null,
  mutationError: null,
  saving: false,
  deleting: false,

  addressModal: false,
  deleteModal: false,
  selectedAddress: null,

  clearErrors: () => set({ listError: null, mutationError: null }),

  fetchAddresses: async () => {
    if (!hasSessionToken()) {
      set({ addresses: [], loading: false, listError: null });
      return;
    }
    set({ loading: true, listError: null });
    try {
      const res = await fetchAddressesApi();
      const raw = res?.data?.addresses;
      const list = Array.isArray(raw)
        ? raw.map(apiAddressToView).filter(Boolean)
        : [];
      set({ addresses: list, loading: false });
    } catch (err) {
      set({
        addresses: [],
        loading: false,
        listError: getErrorMessage(err),
      });
    }
  },

  addAddress: async (form) => {
    set({ saving: true, mutationError: null });
    try {
      const body = formToCreateBody(form);
      const res = await createAddressApi(body);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to save address");
      }
      await get().fetchAddresses();
      set({ addressModal: false, selectedAddress: null, saving: false });
    } catch (err) {
      set({
        saving: false,
        mutationError: getErrorMessage(err),
      });
      throw err;
    }
  },

  updateAddress: async (id, form) => {
    if (!id) return;
    set({ saving: true, mutationError: null });
    try {
      const body = formToPatchBody(form);
      if (Object.keys(body).length === 0) {
        set({ saving: false });
        return;
      }
      const res = await updateAddressApi(id, body);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to update address");
      }
      await get().fetchAddresses();
      set({ addressModal: false, selectedAddress: null, saving: false });
    } catch (err) {
      set({
        saving: false,
        mutationError: getErrorMessage(err),
      });
      throw err;
    }
  },

  deleteAddress: async (id) => {
    if (!id) return;
    set({ deleting: true, mutationError: null });
    try {
      const res = await deleteAddressApi(id);
      if (!res?.success) {
        throw new Error(res?.error || "Failed to delete address");
      }
      await get().fetchAddresses();
      set({
        deleteModal: false,
        selectedAddress: null,
        deleting: false,
      });
    } catch (err) {
      set({
        deleting: false,
        mutationError: getErrorMessage(err),
      });
      throw err;
    }
  },

  setDefaultAddress: async (id) => {
    if (!id) return;
    set({ saving: true, mutationError: null });
    try {
      const res = await updateAddressApi(id, { is_default: true });
      if (!res?.success) {
        throw new Error(res?.error || "Failed to set default");
      }
      await get().fetchAddresses();
      set({ saving: false });
    } catch (err) {
      set({
        saving: false,
        mutationError: getErrorMessage(err),
      });
    }
  },

  openAddressModal: (address = null) =>
    set({
      addressModal: true,
      selectedAddress: address,
      mutationError: null,
    }),

  closeAddressModal: () =>
    set({
      addressModal: false,
      selectedAddress: null,
      mutationError: null,
    }),

  openDeleteModal: (address) =>
    set({
      deleteModal: true,
      selectedAddress: address,
      mutationError: null,
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: false,
      selectedAddress: null,
      mutationError: null,
    }),
}));

export default useAddressStore;
