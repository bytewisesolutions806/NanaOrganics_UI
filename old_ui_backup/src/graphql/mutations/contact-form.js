import { gql } from 'graphql-request';
import { shopApiRequest } from '@/lib/graphql/client';

export const SUBMIT_CONTACT_FORM = gql`
  mutation SubmitContactForm($input: ContactFormInput!) {
    submitContactForm(input: $input) {
      success
      errorCode
      message
      reference
      retryAfterSeconds
    }
  }
`;

export async function submitContactForm(input) {
  const data = await shopApiRequest(SUBMIT_CONTACT_FORM, { input });
  return data.submitContactForm;
}
