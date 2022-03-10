import React, { useCallback, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
    Card,
    IndexTable,
    Link,
    Modal,
    Spinner,
    TextStyle,
} from "@shopify/polaris";

import ProductEditButton from "./ProductEditButton";
import ProductForm from "./ProductForm";
import NoImage from "../core/NoImage";
import TextAlign from "../core/TextAlign";
import ThumbnailWithZoom from "./ThumbnailWithZoom";
import useProductList from "../../hooks/useProductList";

export default function ProductList({ productApprove }) {
    const scrollerParent = useRef(null);
    const {
        priceFormat,
        productData,
        productsLoading,
        productsHandleLoadMore,
        productsHasNextPage,
    } = useProductList();
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

    function handleEditClick(productId) {
        setEditData(productData.find(({ id }) => id === productId));
        setShowEditModal(true);
    }

    return (
        <Card title={`Product List${productApprove ? " Approval" : ""}`}>
            {/* <pre>{JSON.stringify(productData, undefined, 2)}</pre> */}
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
            <div
                style={{ height: "30%", overflow: "auto" }}
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
                        itemCount={productData.length}
                        headings={[
                            { title: `Count: ${productData.length}` },
                            { title: "Type/Mine/Sku" },
                            { title: "Carat/Price" },
                            { title: "Action" },
                        ]}
                        loading={productsLoading}
                        selectable={false}
                    >
                        {productData.map(
                            (
                                {
                                    id,
                                    featuredImage,
                                    type,
                                    mine,
                                    carat,
                                    sku,
                                    pricePerCarat,
                                    price,
                                    url,
                                },
                                index
                            ) => (
                                <IndexTable.Row
                                    id={id}
                                    key={id}
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
                                                <Link url={url} external>
                                                    {type?.value}
                                                </Link>
                                            </TextStyle>
                                        </p>
                                        {mine && <p>{mine?.value}</p>}
                                        <p>{sku}</p>
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
                                            <p>${price} Total</p>
                                        </TextAlign>
                                    </IndexTable.Cell>
                                    <IndexTable.Cell>
                                        <TextAlign
                                            alignment="center"
                                            padding="0 45% 0 0"
                                        >
                                            <ProductEditButton
                                                onClick={handleEditClick}
                                                productId={id}
                                            />
                                        </TextAlign>
                                    </IndexTable.Cell>
                                </IndexTable.Row>
                            )
                        )}
                    </IndexTable>
                </InfiniteScroll>
            </div>
        </Card>
    );
}
