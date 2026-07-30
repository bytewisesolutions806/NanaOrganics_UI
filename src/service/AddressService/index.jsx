import { shopApiRequest } from '@/lib/graphql/client';

const ADDRESS_FIELDS = `
  fragment CustomerAddressFields on Address {
    id
    fullName
    streetLine1
    streetLine2
    city
    province
    postalCode
    phoneNumber
    defaultShippingAddress
    defaultBillingAddress
    country { id code name }
  }
`;

const CUSTOMER_ADDRESSES = `
  ${ADDRESS_FIELDS}
  query CustomerAddresses {
    activeCustomer { id emailAddress addresses { ...CustomerAddressFields } }
  }
`;

const CREATE_ADDRESS = `
  ${ADDRESS_FIELDS}
  mutation CreateCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) { ...CustomerAddressFields }
  }
`;

const UPDATE_ADDRESS = `
  ${ADDRESS_FIELDS}
  mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) { ...CustomerAddressFields }
  }
`;

const DELETE_ADDRESS = `
  mutation DeleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) { success }
  }
`;

function splitName(fullName) {
  const names = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  return { first_name: names.shift() || '', last_name: names.join(' ') };
}

function fromVendure(address) {
  const names = splitName(address.fullName);
  return {
    id: address.id,
    ...names,
    phone: address.phoneNumber || '',
    address_1: address.streetLine1 || '',
    address_2: address.streetLine2 || '',
    city: address.city || '',
    province: address.province || '',
    postal_code: address.postalCode || '',
    country_code: String(address.country?.code || '').toLowerCase(),
    is_default: Boolean(address.defaultShippingAddress || address.defaultBillingAddress),
    default_shipping_address: Boolean(address.defaultShippingAddress),
    default_billing_address: Boolean(address.defaultBillingAddress),
  };
}

function toVendure(body, includeId) {
  const result = {
    ...(includeId ? { id: includeId } : {}),
  };
  if (body.first_name !== undefined || body.last_name !== undefined) {
    result.fullName = [body.first_name, body.last_name].filter(Boolean).join(' ');
  }
  if (body.address_1 !== undefined) result.streetLine1 = body.address_1;
  if (body.city !== undefined) result.city = body.city;
  if (body.province !== undefined) result.province = body.province;
  if (body.postal_code !== undefined) result.postalCode = body.postal_code;
  if (body.country_code !== undefined) {
    result.countryCode = String(body.country_code).toUpperCase();
  }
  if (body.phone !== undefined) result.phoneNumber = body.phone || null;
  if (body.is_default !== undefined) {
    result.defaultShippingAddress = Boolean(body.is_default);
    result.defaultBillingAddress = Boolean(body.is_default);
  }
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value !== undefined));
}

export const fetchAddressesApi = async () => {
  const data = await shopApiRequest(CUSTOMER_ADDRESSES);
  return {
    success: true,
    data: {
      addresses: (data.activeCustomer?.addresses || []).map(fromVendure),
      email: data.activeCustomer?.emailAddress || '',
    },
  };
};

export const createAddressApi = async (body) => {
  const data = await shopApiRequest(CREATE_ADDRESS, { input: toVendure(body) });
  return { success: true, data: { address: fromVendure(data.createCustomerAddress) } };
};

export const updateAddressApi = async (id, body) => {
  const data = await shopApiRequest(UPDATE_ADDRESS, { input: toVendure(body, id) });
  return { success: true, data: { address: fromVendure(data.updateCustomerAddress) } };
};

export const deleteAddressApi = async (id) => {
  const data = await shopApiRequest(DELETE_ADDRESS, { id });
  return { success: Boolean(data.deleteCustomerAddress?.success) };
};
