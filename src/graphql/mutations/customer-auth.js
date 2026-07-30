import { gql } from "graphql-request";
import { shopApiRequest } from "@/lib/graphql/client";

export const LOGIN_WITH_JWT = gql`
  mutation LoginWithJwt(
    $emailAddress: String!
    $password: String!
    $rememberMe: Boolean!
  ) {
    loginWithJwt(
      emailAddress: $emailAddress
      password: $password
      rememberMe: $rememberMe
    ) {
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

export async function loginWithJwt(variables) {
  const data = await shopApiRequest(LOGIN_WITH_JWT, variables);
  return data.loginWithJwt;
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
