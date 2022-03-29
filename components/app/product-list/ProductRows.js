import React, { useCallback } from "react";
import { IndexTable, Link, TextStyle } from "@shopify/polaris";

import {
    getProductId,
    getProductLink,
    getVariant,
    priceFormat,
} from "../../../tools/dataHelpers";
import getClassName from "../../../tools/getClassName";
import useProducts from "../../../hooks/useProducts";
import TextAlign from "../../core/TextAlign";
import ThumbnailWithZoom from "../ThumbnailWithZoom";
import IconButton from "../../core/IconButton";
import styles from "./ProductRows.module.scss";

function findProduct(products, productId) {
    return products.find(({ node: { id } }) => id === productId)?.node;
}

export default function ProductRows({
    productApprove,
    productsData,
    setEditData,
    setShowEditModal,
}) {
    const { productUpdate, productUpdateLoading } = useProducts();

    function handleEditClick(productId) {
        setEditData(findProduct(productsData, productId));
        setShowEditModal(true);
    }

    function handleReadyClick(productId) {
        const { id, tags } = findProduct(productsData, productId);

        productUpdate({
            variables: { input: { id, tags: [...tags, "ready"].join(", ") } },
        });
    }

    function handleApproveClick(productId) {
        const { id, priceApproved, tags } = findProduct(
            productsData,
            productId
        );
        const newTags = tags.filter((tag) => tag !== "ready");
        const priceApprovedMetafield = priceApproved
            ? {
                  id: priceApproved?.id,
                  value: "true",
              }
            : {
                  key: "priceApproved",
                  namespace: "my_fields",
                  value: "true",
              };

        productUpdate({
            variables: {
                input: {
                    id,
                    tags: [...newTags, "publishable"].join(", "),
                    metafields: [priceApprovedMetafield],
                },
            },
        });
    }

    const [_, getChildClass] = getClassName({
        rootClass: "product-rows",
        styles,
    });

    return productsData.map(
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
                    productApprove ? "productApprove" : "product"
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
                            <Link url={getProductLink(id)} external>
                                {title?.split(" - ")[0]}
                            </Link>
                        </TextStyle>
                    </p>
                    {mine && <p>{mine?.value}</p>}
                    <p>
                        <TextStyle variation="strong">sku:</TextStyle>{" "}
                        {getVariant(variants, "sku")}
                    </p>
                    <p>
                        <TextStyle variation="strong">barcode:</TextStyle>{" "}
                        {getVariant(variants, "barcode")}
                    </p>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <TextAlign alignment="right" padding="0 45% 0 0">
                        <p>{carat?.value}ct</p>
                        <p>${priceFormat(pricePerCarat?.value)} / ct</p>
                        <p>${getVariant(variants, "price") || "0.00"} Total</p>
                    </TextAlign>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <div className={getChildClass("actions")}>
                        <IconButton
                            key={`edit__${id}`}
                            onClick={handleEditClick}
                            productId={id}
                            icon="edit"
                        />
                    </div>
                    <div className={getChildClass("actions")}>
                        {productApprove ? (
                            <IconButton
                                key={`approve__${id}`}
                                onClick={handleApproveClick}
                                productId={id}
                                icon="approve"
                                loading={productUpdateLoading}
                            />
                        ) : (
                            <IconButton
                                key={`ready__${id}`}
                                onClick={handleReadyClick}
                                productId={id}
                                icon="ready"
                                disabled={tags.includes("publishable")}
                                loading={productUpdateLoading}
                            />
                        )}
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        )
    );
}
