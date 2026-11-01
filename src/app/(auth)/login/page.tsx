import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPage } from "@/features/auth/components/auth-page";

export const metadata: Metadata = { title: "Log in" };

interface LoginPageProps {
  searchParams: Promise<{ passwordReset?: string | string[] }>;
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  return <AuthPage mode="login" passwordReset={query.passwordReset === "1"} />;
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <Suspense fallback={<AuthPage mode="login" />}>
      <LoginContent {...props} />
    </Suspense>
  );
}
