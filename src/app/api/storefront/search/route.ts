import { NextResponse } from "next/server";

import { searchStorefrontProducts } from "@/services/api/storefront";

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (term.length < 2) {
    return NextResponse.json({ items: [] });
  }

  if (term.length > 100) {
    return NextResponse.json(
      { error: "Search terms must be 100 characters or fewer." },
      { status: 400 },
    );
  }

  try {
    const items = await searchStorefrontProducts(term);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to search storefront products.", error);
    return NextResponse.json(
      { error: "Product search is temporarily unavailable." },
      { status: 502 },
    );
  }
}
