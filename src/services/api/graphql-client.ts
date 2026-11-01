import { GraphQLClient } from "graphql-request";

export function createStoreApiClient() {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_API_URL;

  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_VENDURE_API_URL must be set to connect to the store API.");
  }

  return new GraphQLClient(endpoint);
}
