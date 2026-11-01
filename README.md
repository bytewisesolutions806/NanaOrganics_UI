# Nana Organics UI

Blank Next.js App Router starter with TypeScript, Tailwind CSS, shadcn/ui configuration, and the
Vendure GraphQL client dependency. Storefront pages and components have intentionally been left
empty so implementation can start from scratch.

## Development

```bash
npm run dev
```

Set `NEXT_PUBLIC_VENDURE_API_URL` in `.env.local` to connect to the Vendure GraphQL API. See
`.env.example` for the variable name.

Use `createStoreApiClient` from `src/services/api/graphql-client.ts` to create the GraphQL client.

## Structure

```text
src/
  app/
    (store)/
      account/
      cart/
      categories/[slug]/
      checkout/
      products/[slug]/
  components/
    layout/
    ui/
  config/
  features/
    cart/components/
    products/components/
    products/data/
  hooks/
  lib/
  services/api/       GraphQL API client
  store/
  types/
```

Add shadcn components when needed with `npx shadcn@latest add <component>`.
