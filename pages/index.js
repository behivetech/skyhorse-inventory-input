import React, { useCallback, useState } from "react";
import { Modal, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import ProductForm from "../components/app/ProductForm";
import ProductList from "../components/app/ProductList";
import ProductListProvider from "../components/providers/ProductListProvider";
import ProductListApproval from "../components/app/ProductListApproval";

const Index = () => {
    // const {data: metafieldsData, loading: metafieldsLoading, error: metafieldsError} = useQuery(QUERY_METAFIELDS);
    const [showProductCreate, setShowProductCreate] = useState(false);
    const [showProductApprove, setShowProductApprove] = useState(true);
    const handleProductCreateChange = useCallback(
        () => setShowProductCreate(!showProductCreate),
        [showProductCreate]
    );
    const handleSwitchList = useCallback(
        () => setShowProductApprove(!showProductApprove),
        [showProductApprove]
    );
    const titleBarProps = showProductApprove
        ? {
              primaryAction: {
                  content: "Product List",
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
        <ProductListProvider>
            <Page divider>
                <div style={{ paddingBottom: "4rem" }}>
                    <TitleBar {...titleBarProps} />
                    {showProductApprove && <ProductListApproval />}
                    {!showProductApprove && <ProductList />}
                    <Modal open={showProductCreate} title="Create Product">
                        <Modal.Section>
                            <ProductForm
                                closeParentModal={handleProductCreateChange}
                            />
                        </Modal.Section>
                    </Modal>
                </div>
            </Page>
        </ProductListProvider>
    );
};

export default Index;
