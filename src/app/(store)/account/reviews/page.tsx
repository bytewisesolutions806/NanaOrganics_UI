import type { Metadata } from "next";
import { ReviewsManager } from "@/features/account/components/reviews-manager";
export const metadata: Metadata = { title: "My reviews and ratings" };
export default function ReviewsPage() { return <ReviewsManager />; }
