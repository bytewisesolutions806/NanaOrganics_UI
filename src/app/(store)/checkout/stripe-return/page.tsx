import { Suspense } from "react";
import { StripeReturn } from "@/features/checkout/stripe-return";

type Props = { searchParams: Promise<{ payment_intent_client_secret?: string | string[]; order_code?: string | string[] }> };
function first(value?: string | string[]) { return Array.isArray(value) ? value[0] : value || ""; }

async function Content({ searchParams }: Props) {
  const query = await searchParams;
  return <StripeReturn clientSecret={first(query.payment_intent_client_secret)} queryOrderCode={first(query.order_code)} />;
}

export default function Page(props: Props) {
  return <Suspense fallback={<main className="grid min-h-[65vh] place-items-center text-sm text-[#66756c]">Confirming payment…</main>}><Content {...props} /></Suspense>;
}
