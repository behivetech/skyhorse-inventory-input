import { gql } from "@apollo/client";

export const ADD_PRODUCT = gql`
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        vendor
        variants(first: 1) {
          edges {
            node {
              barcode
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        vendor
        variants(first: 1) {
          edges {
            node {
              barcode
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
