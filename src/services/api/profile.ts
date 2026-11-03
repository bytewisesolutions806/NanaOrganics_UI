import {
  requestPasswordReset,
  resendPasswordResetCode,
  resetPassword,
  verifyPasswordResetCode,
  getAuthHeaders,
} from "@/services/api/auth";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface ProfilePhoto {
  id: string;
  name: string;
  mimeType: string;
  fileSize: number;
  source: string;
  preview: string;
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  profilePhoto: ProfilePhoto | null;
  profilePhotoUrl: string;
}

interface ProfilePayload {
  success: boolean;
  message?: string;
  profile: CustomerProfileResponse | null;
}

interface CustomerProfileResponse {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  phoneNumber: string | null;
  profilePhoto: ProfilePhoto | null;
}

interface CustomerProfileQuery {
  customerProfile: CustomerProfileResponse | null;
}

interface UpdateCustomerProfileMutation {
  updateCustomerProfile: ProfilePayload;
}

interface UploadCustomerProfilePhotoMutation {
  uploadCustomerProfilePhoto: ProfilePayload;
}

const PROFILE_FIELDS = `
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
`;

function getEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_API_URL;
  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_VENDURE_API_URL must be set to connect to the store API.",
    );
  }
  return endpoint;
}

function requestHeaders() {
  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  return {
    "content-type": "application/json",
    ...(channelToken ? { "vendure-token": channelToken } : {}),
    ...getAuthHeaders(),
  };
}

async function request<TData, TVariables>(
  query: string,
  variables: TVariables,
): Promise<TData> {
  const response = await fetch(getEndpoint(), {
    method: "POST",
    credentials: "include",
    headers: requestHeaders(),
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(
      payload.errors?.[0]?.message ??
        `The store API returned an error (${response.status}).`,
    );
  }
  if (!payload.data) throw new Error("The store API returned an empty response.");
  return payload.data;
}

function resolveAssetUrl(value?: string | null) {
  if (!value) return "";
  const normalized = value.replaceAll("\\", "/");
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;

  try {
    const origin = new URL(getEndpoint()).origin;
    const path = normalized.replace(/^\/+/, "");
    return `${origin}/${path.startsWith("assets/") ? path : `assets/${path}`}`;
  } catch {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
}

function normalizeProfile(profile: CustomerProfileResponse): CustomerProfile {
  return {
    id: profile.id,
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    emailAddress: profile.emailAddress,
    phoneNumber: profile.phoneNumber ?? "",
    profilePhoto: profile.profilePhoto,
    profilePhotoUrl: resolveAssetUrl(
      profile.profilePhoto?.preview || profile.profilePhoto?.source,
    ),
  };
}

export async function getCustomerProfile() {
  const data = await request<CustomerProfileQuery, Record<string, never>>(
    `query CustomerProfile {
      customerProfile { ${PROFILE_FIELDS} }
    }`,
    {},
  );
  if (!data.customerProfile) throw new Error("No customer profile was found.");
  return normalizeProfile(data.customerProfile);
}

export async function updateCustomerProfile(input: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}) {
  const data = await request<
    UpdateCustomerProfileMutation,
    { input: typeof input }
  >(
    `mutation UpdateCustomerProfile($input: UpdateCustomerProfileInput!) {
      updateCustomerProfile(input: $input) {
        success
        message
        profile { ${PROFILE_FIELDS} }
      }
    }`,
    { input },
  );
  const result = data.updateCustomerProfile;
  if (!result.success || !result.profile) {
    throw new Error(result.message || "Could not update your profile.");
  }
  return normalizeProfile(result.profile);
}

export async function uploadCustomerProfilePhoto(file: File) {
  const form = new FormData();
  form.append(
    "operations",
    JSON.stringify({
      query: `mutation UploadCustomerProfilePhoto($file: Upload!) {
        uploadCustomerProfilePhoto(file: $file) {
          success
          message
          profile { ${PROFILE_FIELDS} }
        }
      }`,
      variables: { file: null },
    }),
  );
  form.append("map", JSON.stringify({ 0: ["variables.file"] }));
  form.append("0", file, file.name);

  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(getEndpoint(), {
    method: "POST",
    credentials: "include",
    headers: {
      ...(channelToken ? { "vendure-token": channelToken } : {}),
      ...getAuthHeaders(),
    },
    body: form,
  });
  const payload =
    (await response.json()) as GraphQLResponse<UploadCustomerProfilePhotoMutation>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || "Could not upload the photo.");
  }
  const result = payload.data?.uploadCustomerProfilePhoto;
  if (!result?.success || !result.profile) {
    throw new Error(result?.message || "Could not upload the photo.");
  }
  return normalizeProfile(result.profile);
}

export async function requestProfilePasswordCode(emailAddress: string) {
  const result = await requestPasswordReset(emailAddress.trim().toLowerCase());
  return result.requestCustomerPasswordReset;
}

export async function resendProfilePasswordCode(emailAddress: string) {
  const result = await resendPasswordResetCode(
    emailAddress.trim().toLowerCase(),
  );
  return result.resendCustomerPasswordResetCode;
}

export async function verifyProfilePasswordCode(
  emailAddress: string,
  code: string,
) {
  const result = await verifyPasswordResetCode(
    emailAddress.trim().toLowerCase(),
    code,
  );
  return result.verifyCustomerPasswordResetCode;
}

export async function changeProfilePassword(
  resetToken: string,
  newPassword: string,
) {
  const result = await resetPassword(resetToken, newPassword);
  return result.resetCustomerPassword;
}
