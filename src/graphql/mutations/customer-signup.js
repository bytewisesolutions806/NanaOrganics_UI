import { gql } from "graphql-request";
import { shopApiRequest } from "@/lib/graphql/client";

export const REQUEST_CUSTOMER_SIGNUP = gql`
  mutation RequestCustomerSignup($input: CustomerSignupInput!) {
    requestCustomerSignup(input: $input) {
      success
      errorCode
      message
      expiresInSeconds
      retryAfterSeconds
    }
  }
`;

export async function requestCustomerSignup(input) {
  const data = await shopApiRequest(REQUEST_CUSTOMER_SIGNUP, { input });
  return data.requestCustomerSignup;
}
