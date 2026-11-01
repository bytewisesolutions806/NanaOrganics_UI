import type { Metadata } from "next";
import { AddressManager } from "@/features/account/components/address-manager";

export const metadata: Metadata = { title: "Manage addresses" };
export default function AddressesPage() { return <AddressManager />; }
