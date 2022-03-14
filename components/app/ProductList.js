import React, { useCallback, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
    Card,
    IndexTable,
    Link,
    Modal,
    Spinner,
    TextStyle,
} from "@shopify/polaris";

import getClassName from "../../tools/getClassName";
import { getVariant, priceFormat } from "../../tools/dataHelpers";
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

export default function ProductList({ productApprove }) {
    const scrollerParent = useRef(null);
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
        return productApprove
            ? products.filter(({ node: { tags } }) => tags?.includes("ready"))
            : products.filter(({ node: { tags } }) => !tags?.includes("ready"));
    }, [productsLoading, products]);

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

    const [rootClassName, getChildClass] = getClassName({
        rootClass: "product-list",
        styles,
    });

    return (
        <div className={rootClassName}>
            <Card title={`Product List${productApprove ? " Approval" : ""}`}>
                <Modal
                    open={showEditModal}
                    onClose={handleEditOnClose}
                    large
                    title="Edit Product"
                >
                    <ProductForm
                        editData={editData}
                        closeParentModal={handleEditOnClose}
                    />
                </Modal>
                <section
                    className={getChildClass("scroll-container")}
                    ref={scrollerParent}
                >
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={productsHandleLoadMore}
                        getScrollParent={() => scrollerParent.current}
                        hasMore={productsHasNextPage}
                        loader={productsLoading && <Spinner key="spinner" />}
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
                                        }__${id.split("/").slice(-1).join("")}`}
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
                                            <p>{getVariant(variants, "sku")}</p>
                                            <p>{tags.join(", ")}</p>
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
                                                    />
                                                )}
                                            </div>
                                        </IndexTable.Cell>
                                    </IndexTable.Row>
                                )
                            )}
                        </IndexTable>
                    </InfiniteScroll>
                </section>
            </Card>
        </div>
    );
}
