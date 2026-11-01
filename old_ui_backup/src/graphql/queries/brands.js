import { gql } from 'graphql-request';

export const GET_SHOP_BRANDS = gql`
  query GetShopBrands {
    shopBrands {
      id
      name
      slug
      heroEyebrow
      heroTitle
      heroDescription
      heroPrimaryLabel
      heroPrimaryLink
      heroSecondaryLabel
      heroSecondaryLink
      storyEyebrow
      storyTitle
      storyDescription
      storyLinkLabel
      storyLink
      bannerAsset {
        id
        name
        source
        mimeType
      }
      storyAsset {
        id
        name
        source
        mimeType
      }
      categories {
        id
        name
        slug
        position
        productVariantCount
        featuredAsset {
          id
          preview
          source
        }
        children {
          id
          name
          slug
          position
          productVariantCount
        }
      }
    }
  }
`;
