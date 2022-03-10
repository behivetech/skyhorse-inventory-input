import { gql } from "@apollo/client";

export const QUERY_PRODUCT = gql`
    query Products($cursor: String, $query: String!) {
        products(
            first: 5
            reverse: true
            sortKey: CREATED_AT
            after: $cursor
            query: $query
        ) {
            edges {
                cursor
                node {
                    id
                    defaultCursor
                    featuredImage {
                        originalSrc
                    }
                    handle
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
            }
        }
    }
`;

// export const QUERY_PRODUCT_APPROVAL = gql`
//     query ProductApprovals($cursor: String, $query: String!) {
//         productVariants(first: 10, after: $cursor, query: $query) {
//             pageInfo {
//                 hasNextPage
//             }
//             edges {
//                 cursor
//                 node {
//                     product {
//                         id
//                         title
//                         carat: metafield(namespace: "my_fields", key: "carat") {
//                             id
//                             key
//                             value
//                         }
//                         mine: metafield(namespace: "my_fields", key: "mine") {
//                             id
//                             key
//                             value
//                         }
//                         priceApproved: metafield(
//                             namespace: "my_fields"
//                             key: "priceApproved"
//                         ) {
//                             id
//                             key
//                             value
//                         }
//                         pricePerCarat: metafield(
//                             namespace: "my_fields"
//                             key: "pricePerCarat"
//                         ) {
//                             id
//                             key
//                             value
//                         }
//                         type: metafield(namespace: "my_fields", key: "type") {
//                             id
//                             key
//                             value
//                         }
//                     }
//                     price
//                 }
//             }
//         }
//     }
// `;

// const QUERY_METAFIELDS = gql`
//         query GetMetafields {
//                 metafieldDefinitions (
//                         ownerType: PRODUCT,
//                         first: 20,
//                         sortKey: PINNED_POSITION,
//                         reverse: true
//                         ){
//                         edges {
//                                 node {
//                                         namespace
//                                         key
//                                         name
//                                         type {
//                                                 name
//                                                 category
//                                         }
//                                         validationStatus
//                                 }
//                         }
//                 }
//         }
// `
