import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useLazyQuery, useQuery, useMutation } from "@apollo/client";
import debounce from "lodash.debounce";

import {
    QUERY_PRODUCT,
    PRODUCTS_BULK_OPERATION,
    PRODUCTS_LOCAL_QUERY,
} from "../../graphql/queries";
import {
    ADD_PRODUCT,
    UPDATE_PRODUCT,
    PRODUCTS_WEBHOOK,
    BULK_QUERY_PRODUCTS,
} from "../../graphql/mutations";

const DEFAULT_CONTEXT = {
    cursors: [],
    // getProducts: () => [],
    productCreate: () => null,
    productCreateData: {},
    productCreateError: false,
    productCreateLoading: false,
    productCreateReset: () => null,
    productUpdate: () => null,
    productUpdateData: {},
    productUpdateError: false,
    productUpdateLoading: false,
    productUpdateReset: () => null,
    products: [],
    productsError: null,
    productsHasNextPage: false,
    productsLoading: false,
    // productsData: [],
    productsHandleLoadMore: () => null,
    productListVariables: {
        cursor: undefined,
        first: +TOTAL_QUERY_ROWS,
        query: "status:draft",
        reverse: true,
        sortKey: "UPDATED_AT",
    },
    setProductListVariables: () => null,
};
const PRODUCT_MUTATIONS = {
    create: ADD_PRODUCT,
    update: UPDATE_PRODUCT,
};

export const ProductListContext = createContext(DEFAULT_CONTEXT);

export default function ProductsProvider({ children }) {
    const [skipProductOpPolling, setSkipProductOpPolling] = useState(false);
    const [productListVariables, setProductListVariablesState] = useState(
        DEFAULT_CONTEXT.productListVariables
    );
    const {
        data: {
            products: {
                edges: productRows,
                pageInfo: { hasNextPage },
            },
        } = {
            products: {
                edges: [],
                pageInfo: { hasNextPage: false, hasPreviousPage: false },
            },
        },
        error,
        fetchMore,
        loading,
    } = useQuery(QUERY_PRODUCT, {
        variables: productListVariables,
    });
    // const [
    //     productsWebhook,
    //     {
    //         data: productsWebhookData,
    //         error: productsWebhookError,
    //         loading: productsWebhookLoading,
    //     }
    // ] = useMutation(PRODUCTS_WEBHOOK, {
    //     onCompleted: (data) => console.log(data)
    // });

    // const [
    //     bulkProductsQuery,
    //     {
    //         data: bulkProductsData,
    //         error: bulkProductsError,
    //         loading: bulkProductsLoading,
    //     }
    // ] = useMutation(BULK_QUERY_PRODUCTS, {
    //     onCompleted: (data) => {
    //         console.log('BULK_QUERY_PRODUCTS', { data })
    //         setSkipProductOpPolling(false);
    //     }
    // });
    // const [productsQueryLocal, {
    //     data: productsLocalData,
    //     error: productsLocalError,
    //     loading: productsLocalLoading,
    // }] = useLazyQuery(PRODUCTS_LOCAL_QUERY, {
    //     context: { clientName: 'myEndpoint' },
    //     onCompleted: (data) => console.log(data)
    // })
    // const {
    //     data: productsOperationsData,
    //     error: productsOperationsError,
    //     loading: productsOperationsLoading,
    // } = useQuery(PRODUCTS_BULK_OPERATION, {
    //     fetchPolicy: "network-only",
    //     notifyOnNetworkStatusChange: true,
    //     pollInterval: 2000,
    //     skip: skipProductOpPolling,
    //     onCompleted: ({ currentBulkOperation }) => {
    //         console.log('PRODUCTS_BULK_OPERATION', { currentBulkOperation })

    //         if (currentBulkOperation?.status === 'COMPLETED') {
    //             const createdAt = currentBulkOperation?.createdAt
    //                 ? new Date(currentBulkOperation?.createdAt).getTime()
    //                 : 0;

    //             console.log(Math.floor((Date.now() - createdAt) / 60 / 1000))
    //             if (Math.floor((Date.now() - createdAt) / 60 / 1000) > 5) {
    //                 bulkProductsQuery();
    //             }

    //             if (currentBulkOperation?.url) {
    //                 productsQueryLocal({variables: {jsonlUrl: currentBulkOperation?.url}})
    //             }

    //             setSkipProductOpPolling(true);
    //         }

    //         if(!currentBulkOperation) {
    //             bulkProductsQuery()
    //             setSkipProductOpPolling(true);
    //         }
    //     }
    // });
    const [
        productCreate,
        {
            data: productCreateData,
            error: productCreateError,
            loading: productCreateLoading,
            reset: productCreateReset,
        },
    ] = useMutation(ADD_PRODUCT, {
        // refetchQueries: [
        //     { query: QUERY_PRODUCT, variables: productListVariables },
        // ],
        update(cache, { data }) {
            // We use an update function here to write the
            // new value of the GET_ALL_TODOS query.
            const newProductFromResponse = data?.productCreate.product;
            const existingProducts = cache.readQuery({
                query: QUERY_PRODUCT,
                variables: productListVariables,
            });

            console.log({
                createdData: data,
                lastProduct: existingProducts?.products?.edges.slice(-1)[0],
            });
            if (newProductFromResponse) {
                // const newProductRecord = {
                //     ...existingProducts?.products?.edges.find(({ node }) => newProductFromResponse.id === node.id),
                // }
                cache.writeQuery({
                    query: QUERY_PRODUCT,
                    data: {
                        products: {
                            edges: [
                                ...existingProducts?.products.edges,
                                {
                                    cursor: existingProducts?.products?.edges.slice(
                                        -1
                                    )[0].node?.defaultCursor,
                                    node: newProductFromResponse,
                                },
                            ],
                            pageInfo: {
                                hasNextPage: false,
                            },
                        },
                    },
                });
            }
        },
    });
    const [
        productUpdate,
        {
            data: productUpdateData,
            error: productUpdateError,
            loading: productUpdateLoading,
            reset: productUpdateReset,
        },
    ] = useMutation(UPDATE_PRODUCT); //, mutationOptions);
    const productsHandleLoadMore = debounce(() => {
        const rowLength = productRows.length;
        const lastProduct = productRows[rowLength - 1] || {};
        const fetchVariables = {
            ...productListVariables,
            cursor: lastProduct.cursor,
        };

        if (rowLength > TOTAL_QUERY_ROWS - 1) {
            fetchMore({
                variables: fetchVariables,
                updateQuery: (previousResult, { fetchMoreResult }) => {
                    const newEdges = fetchMoreResult.products.edges;
                    const pageInfo = fetchMoreResult.products.pageInfo;

                    return newEdges.length
                        ? {
                              products: {
                                  __typename:
                                      previousResult.products.__typename,
                                  edges: [
                                      ...previousResult.products.edges,
                                      ...newEdges,
                                  ],
                                  pageInfo,
                              },
                          }
                        : previousResult;
                },
            });
        }
    }, QUERY_DELAY);

    const context = {
        products: productRows,
        productsError: error,
        productsHandleLoadMore,
        productsHasNextPage: hasNextPage,
        productsLoading: loading,
        productCreate,
        productCreateData: productCreateData?.productCreate?.product,
        productCreateError,
        productCreateLoading,
        productCreateReset,
        productUpdate,
        productUpdateData: productUpdateData?.productUpdate?.product,
        productUpdateError,
        productUpdateLoading,
        productUpdateReset,
    };

    // fetch(`${HOST}/api/test`)
    //     .then(response => response.json())
    //     .then(data => console.log(data));

    return (
        <ProductListContext.Provider value={context}>
            {children}
        </ProductListContext.Provider>
    );
}
