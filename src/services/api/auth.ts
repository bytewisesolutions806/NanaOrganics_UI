interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface AuthRequestResult {
  success: boolean;
  message?: string;
  retryAfterSeconds: number;
}

export interface AuthActionResult {
  success: boolean;
  message?: string;
  token?: string;
  expiresAt?: string;
}

export interface AuthVerifyResult extends AuthActionResult {
  resetToken?: string;
}

interface SignupMutation {
  requestCustomerSignup: AuthRequestResult;
}

interface LoginMutation {
  loginWithJwt: AuthActionResult;
}

interface RequestPasswordResetMutation {
  requestCustomerPasswordReset: AuthRequestResult;
}

interface ResendSignupCodeMutation {
  resendCustomerSignupCode: AuthRequestResult;
}

interface ResendPasswordResetCodeMutation {
  resendCustomerPasswordResetCode: AuthRequestResult;
}

interface VerifySignupCodeMutation {
  verifyCustomerSignupCode: AuthActionResult;
}

interface VerifyPasswordResetCodeMutation {
  verifyCustomerPasswordResetCode: AuthVerifyResult;
}

interface ResetPasswordMutation {
  resetCustomerPassword: AuthActionResult;
}

export interface ActiveCustomer {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

interface ActiveCustomerQuery {
  activeCustomer: ActiveCustomer | null;
}

interface LogoutMutation {
  logout: { success: boolean };
}

export const AUTH_STATE_CHANGED_EVENT = "nana-auth-state-changed";
const SESSION_TOKEN_KEY = "nana-shop-session-token";
const SESSION_TOKEN_EXPIRY_KEY = "nana-shop-session-token-expiry";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
  const expiresAt = window.sessionStorage.getItem(SESSION_TOKEN_EXPIRY_KEY);
  if (!token) return {};

  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
    window.sessionStorage.removeItem(SESSION_TOKEN_EXPIRY_KEY);
    return {};
  }

  return { authorization: `Bearer ${token}` };
}

function saveAuthToken(result: AuthActionResult) {
  if (typeof window === "undefined") return;
  if (!result.token) {
    clearAuthToken();
    return;
  }

  window.sessionStorage.setItem(SESSION_TOKEN_KEY, result.token);
  if (result.expiresAt) {
    window.sessionStorage.setItem(SESSION_TOKEN_EXPIRY_KEY, result.expiresAt);
  } else {
    window.sessionStorage.removeItem(SESSION_TOKEN_EXPIRY_KEY);
  }
}

function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.sessionStorage.removeItem(SESSION_TOKEN_EXPIRY_KEY);
}

export function notifyAuthStateChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
  }
}

async function mutate<TData, TVariables>(
  query: string,
  variables: TVariables,
): Promise<TData> {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_API_URL;
  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_VENDURE_API_URL must be set to connect to the store API.",
    );
  }

  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(channelToken ? { "vendure-token": channelToken } : {}),
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ query, variables }),
  });
  const result = (await response.json()) as GraphQLResponse<TData>;

  if (!response.ok) {
    throw new Error(
      result.errors?.[0]?.message ??
        `The store API returned an error (${response.status}).`,
    );
  }
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }
  if (!result.data) {
    throw new Error("The store API returned an empty response.");
  }

  return result.data;
}

export async function getActiveCustomer() {
  const result = await mutate<ActiveCustomerQuery, Record<string, never>>(
    `query ActiveCustomer {
      activeCustomer {
        firstName
        lastName
        emailAddress
      }
    }`,
    {},
  );
  return result.activeCustomer;
}

export async function logout() {
  const result = await mutate<LogoutMutation, Record<string, never>>(
    `mutation Logout {
      logout {
        success
      }
    }`,
    {},
  );
  if (result.logout.success) {
    clearAuthToken();
    notifyAuthStateChanged();
  }
  return result.logout;
}

export function requestSignup(input: {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  password: string;
}) {
  return mutate<SignupMutation, { input: typeof input }>(
    `mutation RequestCustomerSignup($input: CustomerSignupInput!) {
      requestCustomerSignup(input: $input) {
        success message retryAfterSeconds
      }
    }`,
    { input },
  );
}

export function login(input: {
  emailAddress: string;
  password: string;
  rememberMe: boolean;
}) {
  return mutate<LoginMutation, typeof input>(
    `mutation LoginWithJwt(
      $emailAddress: String!
      $password: String!
      $rememberMe: Boolean!
    ) {
      loginWithJwt(
        emailAddress: $emailAddress
        password: $password
        rememberMe: $rememberMe
      ) {
        success message token expiresAt
      }
    }`,
    input,
  ).then((result) => {
    if (result.loginWithJwt.success) {
      saveAuthToken(result.loginWithJwt);
      notifyAuthStateChanged();
    }
    return result;
  });
}

export function requestPasswordReset(emailAddress: string) {
  return mutate<RequestPasswordResetMutation, { emailAddress: string }>(
    `mutation RequestCustomerPasswordReset($emailAddress: String!) {
      requestCustomerPasswordReset(emailAddress: $emailAddress) {
        success message retryAfterSeconds
      }
    }`,
    { emailAddress },
  );
}

export function resendSignupCode(emailAddress: string) {
  return mutate<ResendSignupCodeMutation, { emailAddress: string }>(
    `mutation ResendCustomerSignupCode($emailAddress: String!) {
      resendCustomerSignupCode(emailAddress: $emailAddress) {
        success message retryAfterSeconds
      }
    }`,
    { emailAddress },
  );
}

export function resendPasswordResetCode(emailAddress: string) {
  return mutate<ResendPasswordResetCodeMutation, { emailAddress: string }>(
    `mutation ResendCustomerPasswordResetCode($emailAddress: String!) {
      resendCustomerPasswordResetCode(emailAddress: $emailAddress) {
        success message retryAfterSeconds
      }
    }`,
    { emailAddress },
  );
}

export function verifySignupCode(emailAddress: string, code: string) {
  return mutate<
    VerifySignupCodeMutation,
    { emailAddress: string; code: string }
  >(
    `mutation VerifyCustomerSignupCode(
      $emailAddress: String!
      $code: String!
    ) {
      verifyCustomerSignupCode(emailAddress: $emailAddress, code: $code) {
        success message token expiresAt
      }
    }`,
    { emailAddress, code },
  ).then((result) => {
    if (result.verifyCustomerSignupCode.success) {
      saveAuthToken(result.verifyCustomerSignupCode);
      notifyAuthStateChanged();
    }
    return result;
  });
}

export function verifyPasswordResetCode(
  emailAddress: string,
  code: string,
) {
  return mutate<
    VerifyPasswordResetCodeMutation,
    { emailAddress: string; code: string }
  >(
    `mutation VerifyCustomerPasswordResetCode(
      $emailAddress: String!
      $code: String!
    ) {
      verifyCustomerPasswordResetCode(
        emailAddress: $emailAddress
        code: $code
      ) {
        success message resetToken
      }
    }`,
    { emailAddress, code },
  );
}

export function resetPassword(resetToken: string, newPassword: string) {
  return mutate<
    ResetPasswordMutation,
    { resetToken: string; newPassword: string }
  >(
    `mutation ResetCustomerPassword(
      $resetToken: String!
      $newPassword: String!
    ) {
      resetCustomerPassword(
        resetToken: $resetToken
        newPassword: $newPassword
      ) {
        success message
      }
    }`,
    { resetToken, newPassword },
  );
}
