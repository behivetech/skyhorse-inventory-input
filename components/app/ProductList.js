import React, { useCallback, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  IndexTable,
  Modal,
  TextStyle,
  useIndexResourceState,
} from "@shopify/polaris";

import ProductEditButton from "./ProductEditButton";
import ProductForm from "./ProductForm";
import TextAlign from "../core/TextAlign";

import { QUERY_PRODUCT } from "../../graphql/queries";

function getVariant(variants, variantName) {
  return variants?.edges[0]?.node[variantName];
}

function getMetafield(metafields, metafieldKey) {
  return metafields?.edges?.find(({ node }) => node.key === metafieldKey)?.node;
}

function priceFormat(price) {
  return price ? Number.parseFloat(price).toFixed(2) : 0.0;
}

export default function ProductList() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const handleEditOnClose = useCallback(
    () => setShowEditModal(!showEditModal),
    [showEditModal]
  );
  const {
    data: { products: { edges: productRows } } = { products: { edges: [] } },
    error,
    loading,
  } = useQuery(QUERY_PRODUCT);
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(productRows);
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
  const resourceName = {
    singular: "product",
    plural: "products",
  };

  function handleEditClick(productId) {
    setEditData(productData.find(({ id }) => id === productId));
    setShowEditModal(true);
  }

  return (
    <>
      {/* <pre>{JSON.stringify(productData, undefined, 2)}</pre> */}
      <Modal open={showEditModal} onClose={handleEditOnClose}>
        <ProductForm editData={editData} closeParentModal={handleEditOnClose} />
      </Modal>
      <IndexTable
        resourceName={resourceName}
        itemCount={productData.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Title" },
          { title: "SKU Number" },
          { title: "$/Carat" },
          { title: "Price" },
          { title: "Action" },
        ]}
        loading={loading}
        selectable={false}
      >
        {productData.map(({ id, title, sku, pricePerCarat, price }, index) => (
          <IndexTable.Row
            id={id}
            key={id}
            selected={selectedResources.includes(id)}
            position={index}
          >
            <IndexTable.Cell>
              <TextStyle variation="strong">{title}</TextStyle>
            </IndexTable.Cell>
            <IndexTable.Cell>{sku}</IndexTable.Cell>
            <IndexTable.Cell>
              <TextAlign alignment="right" padding="0 2rem 0 0">
                ${priceFormat(pricePerCarat?.value)}
              </TextAlign>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <TextAlign alignment="right" padding="0 2rem 0 0">
                ${price}
              </TextAlign>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <ProductEditButton onClick={handleEditClick} productId={id} />
            </IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </IndexTable>
    </>
  );
}
