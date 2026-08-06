import { gql } from 'graphql-request';
import { shopApiRequest } from '@/lib/graphql/client';

export const GET_HOMEPAGE_PRODUCT_SECTIONS = gql`
  query GetHomepageProductSections($input: HomepageDiscoveryInput) {
    homepageProductSections(input: $input) {
      code
      title
      description
      productVariants {
        product {
          id
          name
          slug
          featuredAsset {
            id
            preview
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
            priceWithTax
            stockLevel
            customFields {
              isPopular
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

export async function getHomepageProductSections({ take = 8, recentlyViewedSlugs = [] } = {}) {
  const data = await shopApiRequest(GET_HOMEPAGE_PRODUCT_SECTIONS, {
    input: { take, recentlyViewedSlugs },
  });
  return data.homepageProductSections || [];
}
