import React, { createContext, useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import debounce from "lodash.debounce";

import { QUERY_PRODUCT } from "../../graphql/queries";
import { ADD_PRODUCT, UPDATE_PRODUCT } from "../../graphql/mutations";

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
        refetch,
    } = useQuery(QUERY_PRODUCT, {
        variables: productListVariables,
    });
    const [
        productCreate,
        {
            data: productCreateData,
            error: productCreateError,
            loading: productCreateLoading,
            reset: productCreateReset,
        },
    ] = useMutation(ADD_PRODUCT, {
        refetchQueries: [
            { query: QUERY_PRODUCT, variables: productListVariables },
        ],
        awaitRefetchQueries: true,
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

    return (
        <ProductListContext.Provider value={context}>
            {children}
        </ProductListContext.Provider>
    );
}
