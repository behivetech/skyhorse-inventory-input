import React, { useCallback, useState } from "react";
import { Modal, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import ProductForm from "../components/app/ProductForm";
import ProductList from "../components/app/ProductList";

// const QUERY_METAFIELDS = gql`
//         query GetMetafields {
//                 metafieldDefinitions (
//                         ownerType: PRODUCT,
//                         first: 20,
//                         sortKey: PINNED_POSITION,
//                         reverse: true
//                         ){
//                         edges {
//                                 node {
//                                         namespace
//                                         key
//                                         name
//                                         type {
//                                                 name
//                                                 category
//                                         }
//                                         validationStatus
//                                 }
//                         }
//                 }
//         }
// `

const Index = () => {
  // const {data: metafieldsData, loading: metafieldsLoading, error: metafieldsError} = useQuery(QUERY_METAFIELDS);
  const [showProductCreate, setShowProductCreate] = useState(false);
  const handleProductCreateChange = useCallback(
    () => setShowProductCreate(!showProductCreate),
    [showProductCreate]
  );

  return (
    <Page divider>
      <TitleBar
        primaryAction={{
          content: "Create Product",
          onAction: handleProductCreateChange,
        }}
        title="Products"
      />
      <ProductList />
      <Modal open={showProductCreate} title="Create Product">
        <Modal.Section>
          <ProductForm closeParentModal={handleProductCreateChange} />
        </Modal.Section>
      </Modal>
      <div style={{ paddingBottom: "4rem" }} />
    </Page>
  );
};

export default Index;
