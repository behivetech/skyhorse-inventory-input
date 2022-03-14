import { gql } from "@apollo/client";
import { CORE_PRODUCT_FIELDS } from "./fragments";

export const ADD_PRODUCT = gql`
    ${CORE_PRODUCT_FIELDS}
    mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
            product {
                ...CoreProductFields
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    ${CORE_PRODUCT_FIELDS}
    mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
            product {
                ...CoreProductFields
            }
            userErrors {
                field
                message
            }
        }
    }
`;
