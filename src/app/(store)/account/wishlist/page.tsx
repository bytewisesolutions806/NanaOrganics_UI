import type { Metadata } from "next";
import { WishlistManager } from "@/features/account/components/wishlist-manager";
export const metadata: Metadata = { title: "My wishlist" };
export default function WishlistPage() { return <WishlistManager />; }
