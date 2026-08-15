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

export const GET_TOP_CUSTOMER_REVIEWS = gql`
  query GetTopCustomerReviews($take: Int!) {
    topCustomerReviews(take: $take) {
      totalItems
      items {
        id
        createdAt
        productId
        productName
        productSlug
        productPreview
        customerName
        rating
        title
        content
        images {
          id
          source
          preview
        }
        legacyImages
        verifiedPurchase
      }
    }
  }
`;

export async function getHomepageProductSections({
  take = 8,
  codes,
  recentlyViewedSlugs = [],
} = {}) {
  const data = await shopApiRequest(GET_HOMEPAGE_PRODUCT_SECTIONS, {
    input: { take, ...(codes?.length ? { codes } : {}), recentlyViewedSlugs },
  });
  return data.homepageProductSections || [];
}

export async function getTopCustomerReviews(take = 10) {
  const data = await shopApiRequest(GET_TOP_CUSTOMER_REVIEWS, { take });
  return data.topCustomerReviews?.items || [];
}
