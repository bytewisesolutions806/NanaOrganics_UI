import { gql } from 'graphql-request';
import { clearShopApiCache, shopApiRequest } from '@/lib/graphql/client';
import { resolveAssetUrl } from '@/lib/assetUrl';
import { getStoredAccessToken } from '@/lib/authSession';
import {
  requestCustomerPasswordReset,
  resendCustomerPasswordResetCode,
  resetCustomerPassword,
  verifyCustomerPasswordResetCode,
} from '@/graphql/mutations/customer-auth';

const PROFILE_FIELDS = gql`
  fragment CustomerProfileFields on CustomerProfile {
    id
    firstName
    lastName
    emailAddress
    phoneNumber
    profilePhoto {
      id
      name
      mimeType
      fileSize
      source
      preview
    }
  }
`;

const CUSTOMER_PROFILE = gql`
  ${PROFILE_FIELDS}
  query CustomerProfile {
    customerProfile {
      ...CustomerProfileFields
    }
  }
`;

const UPDATE_CUSTOMER_PROFILE = gql`
  ${PROFILE_FIELDS}
  mutation UpdateCustomerProfile($input: UpdateCustomerProfileInput!) {
    updateCustomerProfile(input: $input) {
      success
      errorCode
      message
      profile {
        ...CustomerProfileFields
      }
    }
  }
`;

const UPLOAD_CUSTOMER_PROFILE_PHOTO = `
  mutation UploadCustomerProfilePhoto($file: Upload!) {
    uploadCustomerProfilePhoto(file: $file) {
      success
      errorCode
      message
      profile {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        profilePhoto {
          id
          name
          mimeType
          fileSize
          source
          preview
        }
      }
    }
  }
`;

function toUiCustomer(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    first_name: profile.firstName || '',
    last_name: profile.lastName || '',
    email: profile.emailAddress || '',
    phone: profile.phoneNumber || '',
    profile_photo: profile.profilePhoto || null,
    profile_photo_url: resolveAssetUrl(
      profile.profilePhoto?.preview || profile.profilePhoto?.source,
    ),
  };
}

function apiError(error, fallback) {
  const graphQlMessage = error?.response?.errors?.[0]?.message;
  return new Error(graphQlMessage || error?.message || fallback);
}

export async function fetchProfileApi() {
  try {
    const data = await shopApiRequest(CUSTOMER_PROFILE, undefined, { cacheTtlMs: 0 });
    return { success: true, data: { customer: toUiCustomer(data.customerProfile) } };
  } catch (error) {
    throw apiError(error, 'Could not load profile.');
  }
}

export async function updateProfileApi(body) {
  try {
    const data = await shopApiRequest(UPDATE_CUSTOMER_PROFILE, {
      input: {
        firstName: body.first_name,
        lastName: body.last_name,
        phoneNumber: body.phone || '',
      },
    });
    const result = data.updateCustomerProfile;
    return {
      ...result,
      data: { customer: toUiCustomer(result.profile) },
    };
  } catch (error) {
    throw apiError(error, 'Could not update profile.');
  }
}

export async function uploadProfilePhotoApi(file) {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
  if (!endpoint) throw new Error('Vendure Shop API URL is not configured.');

  const form = new FormData();
  form.append(
    'operations',
    JSON.stringify({
      query: UPLOAD_CUSTOMER_PROFILE_PHOTO,
      variables: { file: null },
    }),
  );
  form.append('map', JSON.stringify({ 0: ['variables.file'] }));
  form.append('0', file, file.name);

  const token = getStoredAccessToken();
  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(channelToken ? { 'vendure-token': channelToken } : {}),
    },
    body: form,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length) {
    throw new Error(payload?.errors?.[0]?.message || 'Could not upload profile photo.');
  }

  const result = payload?.data?.uploadCustomerProfilePhoto;
  if (!result) throw new Error('The server returned an invalid upload response.');
  clearShopApiCache();
  return {
    ...result,
    data: { customer: toUiCustomer(result.profile) },
  };
}

export const requestProfilePasswordVerification = async (email) =>
  requestCustomerPasswordReset(email.trim().toLowerCase());

export const resendProfilePasswordVerification = async (email) =>
  resendCustomerPasswordResetCode(email.trim().toLowerCase());

export const verifyProfilePasswordCode = async ({ email, code }) =>
  verifyCustomerPasswordResetCode({
    emailAddress: email.trim().toLowerCase(),
    code,
  });

export const changePasswordApi = async ({ resetToken, newPassword }) =>
  resetCustomerPassword({ resetToken, newPassword });
