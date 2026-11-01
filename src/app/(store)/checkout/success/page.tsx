import { Suspense } from "react";
import { OrderSuccess } from "@/features/checkout/order-success";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
function first(value?: string | string[]) { return Array.isArray(value) ? value[0] : value || ""; }

async function Content({ searchParams }: Props) {
  const query = await searchParams;
  return <OrderSuccess displayId={first(query.display_id)} total={Number(first(query.total)) || 0} currency={first(query.currency) || "INR"} paymentMethod={first(query.payment_method)} paymentStatus={first(query.payment_status)} />;
}

export default function Page(props: Props) {
  return <Suspense fallback={<main className="grid min-h-[70vh] place-items-center text-sm text-[#66756c]">Loading order confirmation…</main>}><Content {...props} /></Suspense>;
}
