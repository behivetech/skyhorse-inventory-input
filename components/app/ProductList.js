import React, { useCallback, useState } from "react";
import {
    Card,
    IndexTable,
    Link,
    Modal,
    Pagination,
    TextStyle,
    useIndexResourceState,
} from "@shopify/polaris";

import ProductEditButton from "./ProductEditButton";
import ProductForm from "./ProductForm";
import NoImage from "../core/NoImage";
import TextAlign from "../core/TextAlign";
import ThumbnailWithZoom from "./ThumbnailWithZoom";
import useProductList from "../../hooks/useProductList";

export default function ProductList() {
    const {
        priceFormat,
        productData,
        productsLoading,
        productsHandleOnNext,
        productsHandleOnPrevious,
        productsHasNextPage,
        productsHasPreviousPage,
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
        <Card title="Product List">
            {/* <pre>{JSON.stringify(productData, undefined, 2)}</pre> */}
            <Modal open={showEditModal} onClose={handleEditOnClose}>
                <ProductForm
                    editData={editData}
                    closeParentModal={handleEditOnClose}
                />
            </Modal>
            <IndexTable
                resourceName={resourceName}
                itemCount={productData.length}
                headings={[
                    { title: `Count: ${productData.length}` },
                    { title: "Type/Mine/Sku" },
                    { title: "Carat" },
                    { title: "$/Carat" },
                    { title: "Price" },
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
                        <IndexTable.Row id={id} key={id} position={index}>
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
                                    alignment="center"
                                    padding="0 45% 0 0"
                                >
                                    {carat?.value}
                                </TextAlign>
                            </IndexTable.Cell>
                            <IndexTable.Cell>
                                <TextAlign
                                    alignment="center"
                                    padding="0 45% 0 0"
                                >
                                    ${priceFormat(pricePerCarat?.value)}
                                </TextAlign>
                            </IndexTable.Cell>
                            <IndexTable.Cell>
                                <TextAlign
                                    alignment="center"
                                    padding="0 45% 0 0"
                                >
                                    ${price}
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
            <Pagination
                hasNext={productsHasNextPage}
                hasPrevious={productsHasPreviousPage}
                onNext={productsHandleOnNext}
                onPrevious={productsHandleOnPrevious}
            />
        </Card>
    );
}
