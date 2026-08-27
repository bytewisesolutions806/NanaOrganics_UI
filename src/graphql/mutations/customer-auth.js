import { gql } from "graphql-request";
import { shopApiRequest } from "@/lib/graphql/client";

export const LOGIN_WITH_JWT = gql`
  mutation LoginWithJwt($emailAddress: String!, $password: String!, $rememberMe: Boolean!) {
    loginWithJwt(emailAddress: $emailAddress, password: $password, rememberMe: $rememberMe) {
      success
      errorCode
      message
      token
      expiresAt
      user {
        id
        identifier
      }
    }
  }
`;

export const LOGOUT_CUSTOMER = gql`
  mutation LogoutCustomer {
    logout {
      success
    }
  }
`;

export const VERIFY_CUSTOMER_SIGNUP_CODE = gql`
  mutation VerifyCustomerSignupCode($emailAddress: String!, $code: String!) {
    verifyCustomerSignupCode(emailAddress: $emailAddress, code: $code) {
      success
      errorCode
      message
      token
      expiresAt
      user {
        id
        identifier
      }
    }
  }
`;

export const RESEND_CUSTOMER_SIGNUP_CODE = gql`
  mutation ResendCustomerSignupCode($emailAddress: String!) {
    resendCustomerSignupCode(emailAddress: $emailAddress) {
      success
      errorCode
      message
      expiresInSeconds
      retryAfterSeconds
    }
  }
`;

export const REQUEST_CUSTOMER_PASSWORD_RESET = gql`
  mutation RequestCustomerPasswordReset($emailAddress: String!) {
    requestCustomerPasswordReset(emailAddress: $emailAddress) {
      success
      errorCode
      message
      expiresInSeconds
      retryAfterSeconds
    }
  }
`;

export const RESEND_CUSTOMER_PASSWORD_RESET_CODE = gql`
  mutation ResendCustomerPasswordResetCode($emailAddress: String!) {
    resendCustomerPasswordResetCode(emailAddress: $emailAddress) {
      success
      errorCode
      message
      expiresInSeconds
      retryAfterSeconds
    }
  }
`;

export const VERIFY_CUSTOMER_PASSWORD_RESET_CODE = gql`
  mutation VerifyCustomerPasswordResetCode($emailAddress: String!, $code: String!) {
    verifyCustomerPasswordResetCode(emailAddress: $emailAddress, code: $code) {
      success
      errorCode
      message
      resetToken
      expiresAt
    }
  }
`;

export const RESET_CUSTOMER_PASSWORD = gql`
  mutation ResetCustomerPassword($resetToken: String!, $newPassword: String!) {
    resetCustomerPassword(resetToken: $resetToken, newPassword: $newPassword) {
      success
      errorCode
      message
    }
  }
`;

export async function loginWithJwt(variables) {
  const data = await shopApiRequest(LOGIN_WITH_JWT, variables);
  return data.loginWithJwt;
}

export async function logoutCustomer() {
  const data = await shopApiRequest(LOGOUT_CUSTOMER);
  return data.logout;
}

export async function verifyCustomerSignupCode(variables) {
  const data = await shopApiRequest(VERIFY_CUSTOMER_SIGNUP_CODE, variables);
  return data.verifyCustomerSignupCode;
}

export async function resendCustomerSignupCode(emailAddress) {
  const data = await shopApiRequest(RESEND_CUSTOMER_SIGNUP_CODE, {
    emailAddress,
  });
  return data.resendCustomerSignupCode;
}

export async function requestCustomerPasswordReset(emailAddress) {
  const data = await shopApiRequest(REQUEST_CUSTOMER_PASSWORD_RESET, {
    emailAddress,
  });
  return data.requestCustomerPasswordReset;
}

export async function resendCustomerPasswordResetCode(emailAddress) {
  const data = await shopApiRequest(RESEND_CUSTOMER_PASSWORD_RESET_CODE, {
    emailAddress,
  });
  return data.resendCustomerPasswordResetCode;
}

export async function verifyCustomerPasswordResetCode(variables) {
  const data = await shopApiRequest(VERIFY_CUSTOMER_PASSWORD_RESET_CODE, variables);
  return data.verifyCustomerPasswordResetCode;
}

export async function resetCustomerPassword(variables) {
  const data = await shopApiRequest(RESET_CUSTOMER_PASSWORD, variables);
  return data.resetCustomerPassword;
}
