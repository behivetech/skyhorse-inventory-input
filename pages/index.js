import React, { useCallback, useEffect, useState } from "react";
import { Modal, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import ProductForm from "../components/app/ProductForm";
import { ProductList } from "../components/app/product-list";
import useProducts from "../hooks/useProducts";

const Index = () => {
    // const {data: metafieldsData, loading: metafieldsLoading, error: metafieldsError} = useQuery(QUERY_METAFIELDS);
    const [showProductCreate, setShowProductCreate] = useState(false);
    const [productApproveMode, setProductApproveMode] = useState(true);
    const handleProductCreateChange = useCallback(
        () => setShowProductCreate(!showProductCreate),
        [showProductCreate]
    );
    const handleSwitchList = useCallback(() => {
        setProductApproveMode(!productApproveMode);
    }, [productApproveMode]);

    const titleBarProps = productApproveMode
        ? {
              primaryAction: {
                  content: "Add / Edit Products",
                  onAction: handleSwitchList,
              },
              title: "Approve Products",
          }
        : {
              primaryAction: {
                  content: "Approve Products",
                  onAction: handleSwitchList,
              },
              secondaryActions: [
                  {
                      content: "Create Product",
                      onAction: handleProductCreateChange,
                  },
              ],
              title: "Products",
          };

    return (
        <Page>
            <TitleBar {...titleBarProps} />
            <ProductList
                productApprove={productApproveMode}
                key={`productApprove__${productApproveMode}`}
            />
            <Modal
                open={showProductCreate}
                title="Create Product"
                onClose={handleProductCreateChange}
                large
            >
                <Modal.Section>
                    <ProductForm closeParentModal={handleProductCreateChange} />
                </Modal.Section>
            </Modal>
        </Page>
    );
};

export default Index;
