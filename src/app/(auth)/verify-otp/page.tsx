import type { Metadata } from "next";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyOtpPage() {
  return <AuthPage mode="verify-otp" />;
}
