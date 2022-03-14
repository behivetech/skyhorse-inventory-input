import { gql } from "@apollo/client";

export const CORE_PRODUCT_FIELDS = gql`
    fragment CoreProductFields on Product {
        id
        defaultCursor
        featuredImage {
            originalSrc
        }
        handle
        title
        tags
        variants(first: 1) {
            edges {
                node {
                    barcode
                    price
                    sku
                }
            }
        }
        bin: metafield(namespace: "my_fields", key: "bin") {
            id
            key
            value
        }
        carat: metafield(namespace: "my_fields", key: "carat") {
            id
            key
            value
        }
        mine: metafield(namespace: "my_fields", key: "mine") {
            id
            key
            value
        }
        priceApproved: metafield(namespace: "my_fields", key: "priceApproved") {
            id
            key
            value
        }
        pricePerCarat: metafield(namespace: "my_fields", key: "pricePerCarat") {
            id
            key
            value
        }
        type: metafield(namespace: "my_fields", key: "type") {
            id
            key
            value
        }
        otherLocation: metafield(namespace: "my_fields", key: "otherLocation") {
            id
            key
            value
        }
        length: metafield(namespace: "my_fields", key: "length") {
            id
            key
            value
        }
        width: metafield(namespace: "my_fields", key: "width") {
            id
            key
            value
        }
        height: metafield(namespace: "my_fields", key: "height") {
            id
            key
            value
        }
    }
`;
