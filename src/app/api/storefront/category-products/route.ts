import { NextResponse } from "next/server";

import { getStorefrontCategoryProducts } from "@/services/api/storefront";

const PAGE_SIZE = 12;
const MAX_SKIP = 1_000_000;

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const collectionSlug = searchParams.get("collectionSlug")?.trim() ?? "";
  const rawSkip = searchParams.get("skip") ?? "0";
  const skip = Number(rawSkip);

  if (!collectionSlug || collectionSlug.length > 255) {
    return NextResponse.json(
      { error: "A valid category is required." },
      { status: 400 },
    );
  }

  if (
    !/^(0|[1-9]\d*)$/.test(rawSkip) ||
    !Number.isSafeInteger(skip) ||
    skip > MAX_SKIP
  ) {
    return NextResponse.json(
      { error: "The product offset is invalid." },
      { status: 400 },
    );
  }

  try {
    const result = await getStorefrontCategoryProducts(
      collectionSlug,
      skip,
      PAGE_SIZE,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to load more category products.", error);
    return NextResponse.json(
      { error: "Category products are temporarily unavailable." },
      { status: 502 },
    );
  }
}
