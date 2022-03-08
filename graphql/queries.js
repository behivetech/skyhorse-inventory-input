import { gql } from "@apollo/client";

export const QUERY_PRODUCT = gql`
  query Products {
    products(first: 20, query: "status:draft tag_not:ready") {
      edges {
        node {
          id
          defaultCursor
          title
          variants(first: 1) {
            edges {
              node {
                barcode
                price
                sku
              }
            }
          }
          metafields(first: 10) {
            edges {
              node {
                id
                key
                namespace
                value
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
