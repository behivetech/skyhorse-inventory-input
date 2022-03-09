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
    productsHasNextPage: () => null,
    productsHasPreviousPage: () => null,
    productsLoading: false,
    productData: [],
    productsHandleOnNext: () => null,
    productsHandleOnPrevious: () => null,
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

export default function ProductListProvider({ children }) {
    const cursors = useRef([undefined]);
    const [productListVariables, setProductListVariables] = useState({
        cursor: undefined,
        query: "status:draft",
    });
    const {
        data: {
            products: {
                edges: productRows,
                pageInfo: { hasNextPage, hasPreviousPage },
            },
        } = {
            products: {
                edges: [],
                pageInfo: { hasNextPage: false, hasPreviousPage: false },
            },
        },
        error,
        loading,
    } = useQuery(QUERY_PRODUCT, {
        variables: productListVariables,
    });

    const productData = productRows.map(
        ({ node: { id, title, variants, metafields } }) => ({
            id,
            barcode: getVariant(variants, "barcode"),
            bin: getMetafield(metafields, "bin"),
            carat: getMetafield(metafields, "carat"),
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
            width: getMetafield(metafields, "width"),
        })
    );

    function productsHandleOnNext() {
        const nextCursor = productRows[productRows.length - 1].cursor;
        const currentCursors = cursors.current;

        if (!currentCursors.includes(nextCursor)) {
            cursors.current = [...currentCursors, nextCursor];
        }

        setProductListVariables({
            ...productListVariables,
            cursor: nextCursor,
        });
    }

    function productsHandleOnPrevious() {
        const currentCursors = cursors.current;
        const previousCursorIndex =
            currentCursors.indexOf(productListVariables.cursor) - 1;

        setProductListVariables({
            ...productListVariables,
            cursor: currentCursors[previousCursorIndex],
        });
    }

    const context = {
        productsHandleOnNext,
        productsHandleOnPrevious,
        productsHasNextPage: hasNextPage,
        productsHasPreviousPage: hasPreviousPage,
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
