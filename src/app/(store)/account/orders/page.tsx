import type { Metadata } from "next";
import { OrdersList } from "@/features/account/components/orders";
export const metadata: Metadata = { title: "My orders" };
export default function OrdersPage() { return <OrdersList />; }
