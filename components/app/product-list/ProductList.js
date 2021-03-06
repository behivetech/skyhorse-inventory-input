import React, { useCallback, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
    Card,
    Filters,
    IndexTable,
    Modal,
    Spinner,
    TextField,
} from "@shopify/polaris";

import getClassName from "../../../tools/getClassName";
import { getVariant, priceFormat } from "../../../tools/dataHelpers";
import ProductForm from "../ProductForm";
import styles from "./ProductList.module.scss";
import useProducts from "../../../hooks/useProducts";
import ProductRows from "./ProductRows";

function disambiguateLabel(key, value) {
    const labels = {
        skuFilter: `SKU: ${value}`,
        barcodeFilter: `Barcode: ${value}`,
    };

    return labels[key];
}

export default function ProductList({ productApprove }) {
    const scrollerParent = useRef(null);
    const [barcodeFilter, setBarcodeFilter] = useState(null);
    const [skuFilter, setSkuFilter] = useState(null);
    const handleBarcodeRemove = useCallback(() => setBarcodeFilter(null), []);
    const handleSkuRemove = useCallback(() => setSkuFilter(null), []);
    const handleClearAll = useCallback(() => {
        handleBarcodeRemove();
        handleSkuRemove();
    }, [handleBarcodeRemove, handleSkuRemove]);
    const appliedFilters = useMemo(() => {
        const currentFilters = [];

        if (barcodeFilter) {
            currentFilters.push({
                key: "barcodeFilter",
                label: disambiguateLabel("barcodeFilter", barcodeFilter),
                onRemove: handleBarcodeRemove,
            });
        }

        if (skuFilter) {
            currentFilters.push({
                key: "skuFilter",
                label: disambiguateLabel("skuFilter", skuFilter),
                onRemove: handleSkuRemove,
            });
        }

        return currentFilters;
    }, [skuFilter, barcodeFilter]);
    const {
        logProducts,
        products,
        productsLoading,
        productsHandleLoadMore,
        productsHasNextPage,
    } = useProducts();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const handleEditOnClose = useCallback(
        () => setShowEditModal(!showEditModal),
        [showEditModal]
    );
    const productsData = useMemo(() => {
        let filteredData = productApprove
            ? products.filter(({ node: { tags } }) => tags?.includes("ready"))
            : products.filter(({ node: { tags } }) => !tags?.includes("ready"));

        if (barcodeFilter) {
            filteredData = filteredData.filter(({ node: { variants } }) =>
                getVariant(variants, "barcode").includes(barcodeFilter)
            );
        }

        if (skuFilter) {
            filteredData = filteredData.filter(({ node: { variants } }) =>
                getVariant(variants, "sku").includes(skuFilter)
            );
        }

        return filteredData;
    }, [barcodeFilter, productsLoading, products, skuFilter]);
    const totalPricing = useMemo(() => {
        let total = 0;

        if (!productsLoading && productsData && productsData?.length) {
            for (let pIndex in productsData) {
                const { variants } = productsData[pIndex].node || {
                    variants: [],
                };

                if (variants) {
                    total += +getVariant(variants, "price");
                }
            }
        }

        return total;
    }, [productsData, productsLoading]);

    const hasMore = useMemo(() => {
        return !productsLoading && productsHasNextPage;
    }, [productsLoading, productsHasNextPage]);
    const resourceName = {
        singular: "product",
        plural: "products",
    };

    function handleBarcodeChange(value) {
        setBarcodeFilter(value);
    }

    function handleSkuChange(value) {
        setSkuFilter(value);
    }

    const filters = [
        {
            key: "barcodeFilter",
            label: "Barcode",
            filter: (
                <TextField
                    label="Barcode"
                    value={barcodeFilter}
                    onChange={handleBarcodeChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: "skuFilter",
            label: "Sku",
            filter: (
                <TextField
                    label="Sku"
                    value={skuFilter}
                    onChange={handleSkuChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
    ];

    const [rootClassName, getChildClass] = getClassName({
        rootClass: "product-list",
        styles,
    });

    return (
        <div className={rootClassName}>
            <button onClick={logProducts}>Log Products</button>
            <Modal
                open={showEditModal}
                onClose={handleEditOnClose}
                large
                noScroll
                title="Edit Product"
            >
                <ProductForm
                    editData={editData}
                    closeParentModal={handleEditOnClose}
                />
            </Modal>
            <Card title="Filters">
                <div className={getChildClass("filters")}>
                    <Filters
                        queryValue={null}
                        filters={filters}
                        appliedFilters={appliedFilters}
                        onQueryChange={() => null}
                        onQueryClear={() => null}
                        onClearAll={handleClearAll}
                        hideQueryField
                    />
                </div>
            </Card>
            <section
                className={getChildClass("scroll-container")}
                ref={scrollerParent}
            >
                <Card
                    title={`Product List${
                        productApprove ? " Approval" : ""
                    } $${priceFormat(totalPricing)}`}
                >
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={productsHandleLoadMore}
                        getScrollParent={() => scrollerParent.current}
                        hasMore={hasMore}
                        loader={
                            <div key={`InfiniteScrollLoader__${Date.now()}`}>
                                <Spinner key="spinner" /> Loading more
                                products...
                            </div>
                        }
                        threshold={+INFINITE_SCROLL_THRESHOLD}
                        useWindow={false}
                    >
                        <IndexTable
                            emptyState={
                                productsLoading ? (
                                    <div>
                                        <Spinner />
                                        Loading...
                                    </div>
                                ) : (
                                    <div>No products found.</div>
                                )
                            }
                            headings={[
                                { title: `Count: ${productsData.length}` },
                                { title: "Type/Mine/Sku" },
                                { title: "Carat/Price" },
                                { title: "Action" },
                            ]}
                            hasMoreItems={hasMore}
                            itemCount={productsData.length}
                            loading={false}
                            resourceName={resourceName}
                            selectable={false}
                        >
                            <ProductRows
                                productApprove={productApprove}
                                productsData={productsData}
                                setEditData={setEditData}
                                setShowEditModal={setShowEditModal}
                            />
                        </IndexTable>
                    </InfiniteScroll>
                </Card>
            </section>
        </div>
    );
}
