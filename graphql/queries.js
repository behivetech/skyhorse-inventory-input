import { gql } from "@apollo/client";

export const QUERY_PRODUCT = gql`
  query Products($cursor: String) {
    products(first: 10, after: $cursor) {
      edges {
        cursor
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
