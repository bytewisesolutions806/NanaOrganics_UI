import {
  loginWithJwt,
  logoutCustomer,
  requestCustomerPasswordReset,
  resendCustomerPasswordResetCode,
  resetCustomerPassword,
  resendCustomerSignupCode,
  verifyCustomerPasswordResetCode,
  verifyCustomerSignupCode,
} from "@/graphql/mutations/customer-auth";
import { requestCustomerSignup } from "@/graphql/mutations/customer-signup";

export const loginUser = async ({ email, password, rememberMe = false }) =>
  loginWithJwt({
    emailAddress: email.trim().toLowerCase(),
    password,
    rememberMe,
  });

export const logoutUser = async () => logoutCustomer();

export const signupUser = async (input) => requestCustomerSignup(input);

export const verifyOtp = async ({ email, confirmation_code }) =>
  verifyCustomerSignupCode({
    emailAddress: email.trim().toLowerCase(),
    code: confirmation_code,
  });

export const resendSignupOtp = async (email) =>
  resendCustomerSignupCode(email.trim().toLowerCase());

export const forgotPassword = async ({ email }) =>
  requestCustomerPasswordReset(email.trim().toLowerCase());

export const resendPasswordResetOtp = async (email) =>
  resendCustomerPasswordResetCode(email.trim().toLowerCase());

export const verifyResetOtp = async ({ email, confirmationCode }) =>
  verifyCustomerPasswordResetCode({
    emailAddress: email.trim().toLowerCase(),
    code: confirmationCode,
  });

export const completePasswordReset = async ({ resetToken, newPassword }) =>
  resetCustomerPassword({ resetToken, newPassword });
