import { GraphQLClient } from "graphql-request";

let shopApiClient;

export function getShopApiClient() {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_VENDURE_SHOP_API_URL is not configured. Add the Vendure Shop API URL to .env.local."
    );
  }

  if (!shopApiClient) {
    const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
    shopApiClient = new GraphQLClient(endpoint, {
      // JWT is used for authenticated requests. The separate Shop cookie keeps
      // anonymous/public requests on one Vendure session without colliding with
      // the Dashboard cookie (configured separately by the backend).
      credentials: "include",
      headers: {
        ...(channelToken ? { "vendure-token": channelToken } : {}),
      },
    });
  }

  return shopApiClient;
}

export function shopApiRequest(document, variables) {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  return getShopApiClient().request(
    document,
    variables,
    token ? { Authorization: `Bearer ${token}` } : undefined,
  );
}
