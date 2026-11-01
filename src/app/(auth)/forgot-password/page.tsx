import type { Metadata } from "next";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot-password" />;
}
