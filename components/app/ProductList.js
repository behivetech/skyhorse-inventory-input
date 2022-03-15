import React, { useCallback, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
    Card,
    Filters,
    IndexTable,
    Link,
    Modal,
    Spinner,
    TextField,
    TextStyle,
} from "@shopify/polaris";

import getClassName from "../../tools/getClassName";
import { getProductId, getVariant, priceFormat } from "../../tools/dataHelpers";
import ProductForm from "./ProductForm";
import styles from "./ProductList.module.scss";
import TextAlign from "../core/TextAlign";
import ThumbnailWithZoom from "./ThumbnailWithZoom";
import useProducts from "../../hooks/useProducts";
import { getProductLink } from "../../tools/dataHelpers";
import IconButton from "../core/IconButton";

function findProduct(products, productId) {
    return products.find(({ node: { id } }) => id === productId)?.node;
}

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
        products,
        productsLoading,
        productsHandleLoadMore,
        productsHasNextPage,
        productUpdate,
        productUpdateLoading,
    } = useProducts();
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const handleEditOnClose = useCallback(
        () => setShowEditModal(!showEditModal),
        [showEditModal]
    );
    const resourceName = {
        singular: "product",
        plural: "products",
    };
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

    function handleEditClick(productId) {
        setEditData(findProduct(productsData, productId));
        setShowEditModal(true);
    }

    function handleApproveClick(productId) {
        const { id, tags } = findProduct(productsData, productId);
        const newTags = tags.filter((tag) => tag !== "ready");

        productUpdate({
            variables: {
                input: { id, tags: [...newTags, "publishable"].join(", ") },
            },
        });
    }

    function handleReadyClick(productId) {
        const { id, tags } = findProduct(productsData, productId);

        productUpdate({
            variables: { input: { id, tags: [...tags, "ready"].join(", ") } },
        });
    }

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
                    title={`Product List${productApprove ? " Approval" : ""}`}
                >
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={productsHandleLoadMore}
                        getScrollParent={() => scrollerParent.current}
                        hasMore={productsHasNextPage && productsData.length}
                        loader={productsLoading && <Spinner key="spinner" />}
                        threshold={1800}
                        useWindow={false}
                    >
                        <IndexTable
                            resourceName={resourceName}
                            itemCount={productsData.length}
                            headings={[
                                { title: `Count: ${productsData.length}` },
                                { title: "Type/Mine/Sku" },
                                { title: "Carat/Price" },
                                { title: "Action" },
                            ]}
                            loading={productsLoading}
                            selectable={false}
                        >
                            {productsData.map(
                                (
                                    {
                                        node: {
                                            id,
                                            featuredImage,
                                            title,
                                            mine,
                                            carat,
                                            pricePerCarat,
                                            tags,
                                            variants,
                                        },
                                    },
                                    index
                                ) => (
                                    <IndexTable.Row
                                        id={id}
                                        key={`${
                                            productApprove
                                                ? "productApprove"
                                                : "product"
                                        }__${getProductId(id)}`}
                                        position={index}
                                    >
                                        <IndexTable.Cell>
                                            <ThumbnailWithZoom
                                                src={featuredImage?.originalSrc}
                                                alt={featuredImage?.alt}
                                            />
                                        </IndexTable.Cell>
                                        <IndexTable.Cell>
                                            <p>
                                                <TextStyle variation="strong">
                                                    <Link
                                                        url={getProductLink(id)}
                                                        external
                                                    >
                                                        {title?.split(" - ")[0]}
                                                    </Link>
                                                </TextStyle>
                                            </p>
                                            {mine && <p>{mine?.value}</p>}
                                            <p>
                                                <TextStyle variation="strong">
                                                    sku:
                                                </TextStyle>{" "}
                                                {getVariant(variants, "sku")}
                                            </p>
                                            <p>
                                                <TextStyle variation="strong">
                                                    barcode:
                                                </TextStyle>{" "}
                                                {getVariant(
                                                    variants,
                                                    "barcode"
                                                )}
                                            </p>
                                        </IndexTable.Cell>
                                        <IndexTable.Cell>
                                            <TextAlign
                                                alignment="right"
                                                padding="0 45% 0 0"
                                            >
                                                <p>{carat?.value}ct</p>
                                                <p>
                                                    $
                                                    {priceFormat(
                                                        pricePerCarat?.value
                                                    )}{" "}
                                                    / ct
                                                </p>
                                                <p>
                                                    $
                                                    {getVariant(
                                                        variants,
                                                        "price"
                                                    ) || "0.00"}{" "}
                                                    Total
                                                </p>
                                            </TextAlign>
                                        </IndexTable.Cell>
                                        <IndexTable.Cell>
                                            <div
                                                className={getChildClass(
                                                    "actions"
                                                )}
                                            >
                                                <IconButton
                                                    onClick={handleEditClick}
                                                    productId={id}
                                                    icon="edit"
                                                />
                                            </div>
                                            <div
                                                className={getChildClass(
                                                    "actions"
                                                )}
                                            >
                                                {productApprove ? (
                                                    <IconButton
                                                        onClick={
                                                            handleApproveClick
                                                        }
                                                        productId={id}
                                                        icon="approve"
                                                        loading={
                                                            productUpdateLoading
                                                        }
                                                    />
                                                ) : (
                                                    <IconButton
                                                        onClick={
                                                            handleReadyClick
                                                        }
                                                        productId={id}
                                                        icon="ready"
                                                        disabled={tags.includes(
                                                            "publishable"
                                                        )}
                                                        loading={
                                                            productUpdateLoading
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </IndexTable.Cell>
                                    </IndexTable.Row>
                                )
                            )}
                        </IndexTable>
                    </InfiniteScroll>
                </Card>
            </section>
        </div>
    );
}
