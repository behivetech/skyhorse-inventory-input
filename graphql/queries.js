import { gql } from "@apollo/client";
import { CORE_PRODUCT_FIELDS } from "./fragments";

export const QUERY_PRODUCT = gql`
    ${CORE_PRODUCT_FIELDS}
    query Products(
        $cursor: String
        $first: Int
        $reverse: Boolean
        $sortKey: ProductSortKeys
    ) {
        products(
            after: $cursor
            first: $first
            reverse: $reverse
            sortKey: $sortKey
        ) {
            edges {
                cursor
                node {
                    ...CoreProductFields
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

export const PRODUCTS_LOCAL_QUERY = gql`
    query LocalProducts($jsonlUrl: String) {
        products(jsonlUrl: $jsonlUrl) {
            name
        }
    }
`;

export const PRODUCTS_BULK_OPERATION = gql`
    query {
        currentBulkOperation {
            id
            status
            errorCode
            createdAt
            completedAt
            objectCount
            fileSize
            url
            partialDataUrl
        }
    }
`;
