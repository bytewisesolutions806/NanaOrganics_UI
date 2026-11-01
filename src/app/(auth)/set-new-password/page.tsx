import type { Metadata } from "next";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = { title: "Set new password" };

export default function SetNewPasswordPage() {
  return <AuthPage mode="set-new-password" />;
}
