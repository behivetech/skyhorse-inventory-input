// import { gql } from "@apollo/client";
import { CORE_PRODUCT_FIELDS } from "./fragments";
import { gql } from "@apollo/client";

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

export const BULK_QUERY_PRODUCTS = gql`
    mutation BulkQueryProducts {
        bulkOperationRunQuery(
            query: """
                ${CORE_PRODUCT_FIELDS}
                {
                    products(
                        reverse: true
                        sortKey: UPDATED_AT
                        query: "status:draft"
                    ) {
                        edges {
                            node {
                                ...CoreProductFields
                            }
                        }
                    }
                }
            """
        ) {
            bulkOperation {
                id
                status
            }
            userErrors {
                field
                message
            }
        }
    }
`;

export const PRODUCTS_WEBHOOK = gql`
    mutation ProductsWebhook {
        webhookSubscriptionCreate(
            topic: BULK_OPERATIONS_FINISH
            webhookSubscription: {
                format: JSON,
                callbackUrl: "${HOST}"
            }
        ) {
            userErrors {
                field
                message
            }
            webhookSubscription {
                id
            }
        }
    }
`;
