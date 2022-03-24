import { gql } from "@apollo/client";

export const CORE_PRODUCT_FIELDS = gql`
    fragment CoreProductFields on Product {
        id
        featuredImage {
            originalSrc
        }
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
            value
        }
        carat: metafield(namespace: "my_fields", key: "carat") {
            id
            value
        }
        mine: metafield(namespace: "my_fields", key: "mine") {
            id
            value
        }
        priceApproved: metafield(namespace: "my_fields", key: "priceApproved") {
            id
            value
        }
        pricePerCarat: metafield(namespace: "my_fields", key: "pricePerCarat") {
            id
            value
        }
        type: metafield(namespace: "my_fields", key: "type") {
            id
            value
        }
        otherLocation: metafield(namespace: "my_fields", key: "otherLocation") {
            id
            value
        }
        length: metafield(namespace: "my_fields", key: "length") {
            id
            value
        }
        width: metafield(namespace: "my_fields", key: "width") {
            id
            value
        }
        height: metafield(namespace: "my_fields", key: "height") {
            id
            value
        }
    }
`;
