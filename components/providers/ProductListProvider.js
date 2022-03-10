import React, { createContext, useRef, useState } from "react";
import { useQuery } from "@apollo/client";

import { QUERY_PRODUCT } from "../../graphql/queries";

const DEFAULT_CONTEXT = {
    cursors: [],
    productListVariables: {
        cursor: undefined,
        query: "status:draft",
    },
    productsError: null,
    productsHasNextPage: false,
    productsLoading: false,
    productData: [],
    productsHandleLoadMore: () => null,
    priceFormat: () => null,
};

export const ProductListContext = createContext(DEFAULT_CONTEXT);

function getVariant(variants, variantName) {
    return variants?.edges[0]?.node[variantName];
}

function getMetafield(metafields, metafieldKey) {
    return metafields?.edges?.find(({ node }) => node.key === metafieldKey)
        ?.node;
}

function priceFormat(price) {
    return price ? Number.parseFloat(price).toFixed(2) : 0.0;
}

function getProductLink(id) {
    const linkArray = [`https://${SHOP}/admin/products/`];

    linkArray.push(id.split("/").slice(-1));
    return linkArray.join("");
}

export default function ProductListProvider({ children }) {
    const [productListVariables, setProductListVariables] = useState(
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

    const productData = productRows.map(
        ({ node: { id, featuredImage, title, variants, metafields } }) => ({
            id,
            barcode: getVariant(variants, "barcode"),
            bin: getMetafield(metafields, "bin"),
            carat: getMetafield(metafields, "carat"),
            featuredImage,
            height: getMetafield(metafields, "height"),
            length: getMetafield(metafields, "length"),
            mine: getMetafield(metafields, "mine"),
            otherLocation: getMetafield(metafields, "otherLocation"),
            price: getVariant(variants, "price") || "",
            priceApproved: getMetafield(metafields, "priceApproved"),
            pricePerCarat: getMetafield(metafields, "pricePerCarat"),
            sku: getVariant(variants, "sku"),
            title,
            type: getMetafield(metafields, "type"),
            url: getProductLink(id),
            width: getMetafield(metafields, "width"),
        })
    );

    function productsHandleLoadMore() {
        const rowLength = productRows.length;
        const lastProduct = productRows[rowLength - 1] || {};

        fetchMore({
            variables: {
                ...productListVariables,
                cursor: lastProduct.cursor,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
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
        productsHandleLoadMore,
        productsHasNextPage: hasNextPage,
        priceFormat,
        productData,
        productListVariables,
        productsError: error,
        productsLoading: loading,
    };

    return (
        <ProductListContext.Provider value={context}>
            {children}
        </ProductListContext.Provider>
    );
}
