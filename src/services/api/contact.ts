import { createStoreApiClient } from "@/services/api/graphql-client";

export interface ContactFormInput {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  message: string;
  website?: string;
}

export interface ContactFormResult {
  success: boolean;
  errorCode?: string | null;
  message: string;
  reference?: string | null;
  retryAfterSeconds?: number | null;
}

const SUBMIT_CONTACT_FORM = /* GraphQL */ `
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

export async function submitContactForm(
  input: ContactFormInput,
): Promise<ContactFormResult> {
  const result = await createStoreApiClient().request<{
    submitContactForm: ContactFormResult;
  }>(SUBMIT_CONTACT_FORM, { input });

  return result.submitContactForm;
}
