import React, { createContext, useCallback, useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";

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
        first: 20,
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

let mutationType = "update";

export const ProductListContext = createContext(DEFAULT_CONTEXT);

export default function ProductsProvider({ children }) {
    const [productListVariables, setProductListVariablesState] = useState(
        DEFAULT_CONTEXT.productListVariables
    );
    // const mutationOptions = useMemo(() => {
    //     return {
    //         update(cache, { data }) {
    //             // We use an update function here to write the
    //             // new value of the GET_ALL_TODOS query.
    //             const newProductFromResponse = data?.productUpdate.product;
    //             const existingProducts = cache.readQuery({
    //                 query: QUERY_PRODUCT,
    //                 variables: productListVariables,
    //             });
    //             })
    //             // if (newProductFromResponse) {
    //             //     const newProductRecord = {
    //             //         ...existingProducts?.products?.edges.find(({node}) => newProductFromResponse.id === node.id),
    //             //     }
    //             //     cache.writeQuery({
    //             //         query: QUERY_PRODUCT,
    //             //         data: {
    //             //             products: {
    //             //                 edges: [
    //             //                     ...existingProducts?.products.edges,
    //             //                     newProductFromResponse,
    //             //                 ],
    //             //             },
    //             //         },
    //             //     });
    //             // }
    //         },
    //     }
    // }, [productListVariables]);
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

    function productsHandleLoadMore() {
        const rowLength = productRows.length;
        const lastProduct = productRows[rowLength - 1] || {};
        const fetchVariables = {
            ...productListVariables,
            cursor: lastProduct.cursor,
        };

        fetchMore({
            variables: fetchVariables,
            updateQuery: (previousResult, { fetchMoreResult, ...rest }) => {
                const newEdges = fetchMoreResult.products.edges;
                const pageInfo = fetchMoreResult.products.pageInfo;

                return newEdges.length
                    ? {
                          products: {
                              __typename: previousResult.products.__typename,
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
        productListVariables,
        setProductListVariables: (newVariables) =>
            setProductListVariablesState({
                ...productListVariables,
                ...newVariables,
            }),
    };

    return (
        <ProductListContext.Provider value={context}>
            {children}
        </ProductListContext.Provider>
    );
}
