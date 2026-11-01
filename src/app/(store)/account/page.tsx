import type { Metadata } from "next";

import { ProfileSettings } from "@/features/account/components/profile-settings";

export const metadata: Metadata = {
  title: "My account",
  description: "Manage your Nana Organics profile and account security.",
};

export default function AccountPage() {
  return <ProfileSettings />;
}
