import { GET_SHOP_BRANDS } from '@/graphql/queries/brands';
import { shopApiRequest } from '@/lib/graphql/client';

export async function getShopBrands() {
  const data = await shopApiRequest(GET_SHOP_BRANDS);
  return data.shopBrands || [];
}
