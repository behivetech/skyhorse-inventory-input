import { gql } from "@apollo/client";
import { CORE_PRODUCT_FIELDS } from "./fragments";

export const QUERY_PRODUCT = gql`
    ${CORE_PRODUCT_FIELDS}
    query Products(
        $cursor: String
        $first: Int
        $query: String!
        $reverse: Boolean
        $sortKey: ProductSortKeys
    ) {
        products(
            after: $cursor
            first: $first
            reverse: $reverse
            sortKey: $sortKey
            query: $query
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
