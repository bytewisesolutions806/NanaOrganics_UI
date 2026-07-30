import {
  loginWithJwt,
  resendCustomerSignupCode,
  verifyCustomerSignupCode,
} from "@/graphql/mutations/customer-auth";
import { requestCustomerSignup } from "@/graphql/mutations/customer-signup";

export const loginUser = async ({ email, password, rememberMe = false }) =>
  loginWithJwt({
    emailAddress: email.trim().toLowerCase(),
    password,
    rememberMe,
  });

export const signupUser = async (input) => requestCustomerSignup(input);

export const verifyOtp = async ({ email, confirmation_code }) =>
  verifyCustomerSignupCode({
    emailAddress: email.trim().toLowerCase(),
    code: confirmation_code,
  });

export const resendSignupOtp = async (email) =>
  resendCustomerSignupCode(email.trim().toLowerCase());

export const forgotPassword = async () => ({ success: true });
export const VerfiyResetOTP = async () => ({ success: true });
