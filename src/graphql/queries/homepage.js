import { gql } from 'graphql-request';
import { shopApiRequest } from '@/lib/graphql/client';

export const GET_HOMEPAGE_PRODUCT_SECTIONS = gql`
  query GetHomepageProductSections($input: HomepageDiscoveryInput) {
    homepageProductSections(input: $input) {
      code
      title
      description
      productVariants {
        id
        product {
          id
          name
          slug
          description
          featuredAsset {
            id
            preview
            source
          }
          collections {
            id
            name
            slug
            breadcrumbs {
              id
              name
              slug
            }
          }
          variants {
            id
            name
            sku
            price
            priceWithTax
            currencyCode
            stockLevel
            customFields {
              isPopular
            }
            featuredAsset {
              id
              preview
              source
            }
            options {
              id
              name
              code
            }
          }
        }
      }
    }
  }
`;

export async function getHomepageProductSections({ take = 12, recentlyViewedSlugs = [] } = {}) {
  const data = await shopApiRequest(GET_HOMEPAGE_PRODUCT_SECTIONS, {
    input: { take, recentlyViewedSlugs },
  });
  return data.homepageProductSections || [];
}
